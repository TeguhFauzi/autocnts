import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptId, encryptId } from "@/lib/crypto";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = decryptId(params.id);
    if (Number.isNaN(id))
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const [row] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, id))
        .limit(1);
    if (!row)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...row, eid: encryptId(row.id) });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = decryptId(params.id);
    if (Number.isNaN(id))
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const b = await req.json();
    const [row] = await db
        .update(customers)
        .set({
            ...(b.code !== undefined && { code: b.code }),
            ...(b.name !== undefined && { name: b.name }),
            ...(b.email !== undefined && { email: b.email }),
            ...(b.phone !== undefined && { phone: b.phone }),
            ...(b.address !== undefined && { address: b.address }),
        })
        .where(eq(customers.id, id))
        .returning();
    if (!row)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...row, eid: encryptId(row.id) });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = decryptId(params.id);
    if (Number.isNaN(id))
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    await db.delete(customers).where(eq(customers.id, id));
    return NextResponse.json({ ok: true });
}
