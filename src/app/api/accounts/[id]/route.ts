import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptId, encryptId } from "@/lib/crypto";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = decryptId((await params).id);
    if (Number.isNaN(id))
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const [row] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.id, id))
        .limit(1);
    if (!row)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...row, eid: encryptId(row.id) });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = decryptId((await params).id);
    if (Number.isNaN(id))
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const b = await req.json();
    const [row] = await db
        .update(accounts)
        .set({
            ...(b.code !== undefined && { code: b.code }),
            ...(b.name !== undefined && { name: b.name }),
            ...(b.type !== undefined && { type: b.type }),
            ...(b.isActive !== undefined && { isActive: b.isActive }),
        })
        .where(eq(accounts.id, id))
        .returning();
    if (!row)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...row, eid: encryptId(row.id) });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = decryptId((await params).id);
    if (Number.isNaN(id))
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await db.delete(accounts).where(eq(accounts.id, id));
    return NextResponse.json({ ok: true });
}
