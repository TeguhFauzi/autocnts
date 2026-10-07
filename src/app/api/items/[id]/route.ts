import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
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
        .from(items)
        .where(eq(items.id, id))
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
        .update(items)
        .set({
            ...(b.code !== undefined && { code: b.code }),
            ...(b.name !== undefined && { name: b.name }),
            ...(b.uom !== undefined && { uom: b.uom }),
            ...(b.price !== undefined && { price: String(b.price) }),
            ...(b.cost !== undefined && { cost: String(b.cost) }),
            ...(b.qtyOnHand !== undefined && { qtyOnHand: String(b.qtyOnHand) }),
        })
        .where(eq(items.id, id))
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
    await db.delete(items).where(eq(items.id, id));
    return NextResponse.json({ ok: true });
}
