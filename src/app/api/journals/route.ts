import { recordNotification } from "@/lib/notifyStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { journals, journalLines, accounts } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { genDocNo } from "@/lib/utils";
import { encryptId } from "@/lib/crypto";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(journals);

    const rows = await db
        .select()
        .from(journals)
        .orderBy(desc(journals.date), desc(journals.id))
        .limit(limit)
        .offset(offset);

    return NextResponse.json({
        data: rows.map((r) => ({ ...r, eid: encryptId(r.id) })),
        total: count,
        page,
        totalPages: Math.ceil(count / limit) || 1,
    });
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    // b: { date, description, lines: [{accountId, debit, credit, memo}] }
    const lines = (b.lines ?? []).filter(
        (l: any) => Number(l.debit) > 0 || Number(l.credit) > 0
    );
    if (lines.length < 2) {
        return NextResponse.json(
            { error: "At least 2 lines required" },
            { status: 400 }
        );
    }
    const totalDebit = lines.reduce(
        (s: number, l: any) => s + Number(l.debit || 0),
        0
    );
    const totalCredit = lines.reduce(
        (s: number, l: any) => s + Number(l.credit || 0),
        0
    );
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
        return NextResponse.json(
            { error: "Debit and Credit must balance" },
            { status: 400 }
        );
    }

    const [jr] = await db
        .insert(journals)
        .values({
            refNo: b.refNo || genDocNo("JV"),
            date: b.date,
            description: b.description ?? null,
            source: "GL",
        })
        .returning();

    await db.insert(journalLines).values(
        lines.map((l: any) => ({
            journalId: jr.id,
            accountId: Number(l.accountId),
            debit: String(l.debit || 0),
            credit: String(l.credit || 0),
            memo: l.memo ?? null,
        }))
    );

    recordNotification("admin", "Jurnal Baru", `Jurnal ${jr.refNo} diposting.`);
    recordNotification("accountant", "Jurnal Baru", `Jurnal ${jr.refNo} siap ditinjau.`);
    return NextResponse.json(jr, { status: 201 });
}
