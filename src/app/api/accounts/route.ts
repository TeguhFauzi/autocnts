import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { sql } from "drizzle-orm";
import { encryptId } from "@/lib/crypto";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(accounts);

    const rows = await db
        .select()
        .from(accounts)
        .orderBy(accounts.code)
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
    if (!b.code || !b.name || !b.type) {
        return NextResponse.json(
            { error: "code, name, and type are required" },
            { status: 400 }
        );
    }
    const [row] = await db
        .insert(accounts)
        .values({
            code: b.code,
            name: b.name,
            type: b.type,
            isActive: b.isActive ?? true,
        })
        .returning();
    return NextResponse.json({ ...row, eid: encryptId(row.id) }, { status: 201 });
}
