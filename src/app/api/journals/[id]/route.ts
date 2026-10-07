import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { journals, journalLines, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    const [header] = await db
        .select()
        .from(journals)
        .where(eq(journals.id, id))
        .limit(1);
    if (!header)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    const lines = await db
        .select({
            id: journalLines.id,
            accountId: journalLines.accountId,
            accountCode: accounts.code,
            accountName: accounts.name,
            debit: journalLines.debit,
            credit: journalLines.credit,
            memo: journalLines.memo,
        })
        .from(journalLines)
        .leftJoin(accounts, eq(journalLines.accountId, accounts.id))
        .where(eq(journalLines.journalId, id));
    return NextResponse.json({ ...header, lines });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    await db.delete(journals).where(eq(journals.id, id));
    return NextResponse.json({ ok: true });
}
