import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bills, billLines, suppliers, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { genDocNo } from "@/lib/utils";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    const [header] = await db
        .select({
            id: bills.id,
            docNo: bills.docNo,
            date: bills.date,
            dueDate: bills.dueDate,
            total: bills.total,
            paid: bills.paid,
            status: bills.status,
            notes: bills.notes,
            supplierId: bills.supplierId,
            supplierName: suppliers.name,
        })
        .from(bills)
        .leftJoin(suppliers, eq(bills.supplierId, suppliers.id))
        .where(eq(bills.id, id))
        .limit(1);
    if (!header)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    const lines = await db
        .select()
        .from(billLines)
        .where(eq(billLines.billId, id));
    return NextResponse.json({ ...header, lines });
}

// Record a payment against bill
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    const b = await req.json();
    const amount = Number(b.amount || 0);
    if (amount <= 0)
        return NextResponse.json({ error: "Amount must be > 0" }, { status: 400 });

    const [bill] = await db
        .select()
        .from(bills)
        .where(eq(bills.id, id))
        .limit(1);
    if (!bill) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newPaid = Number(bill.paid) + amount;
    const total = Number(bill.total);
    const status =
        newPaid >= total ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";

    await db
        .update(bills)
        .set({ paid: String(newPaid), status })
        .where(eq(bills.id, id));

    await db.insert(payments).values({
        docNo: genDocNo("PAY"),
        kind: "PAYMENT",
        date: b.date || bill.date,
        partyId: bill.supplierId,
        docRefId: bill.id,
        amount: String(amount),
        method: b.method || "CASH",
        notes: b.notes ?? null,
    });

    return NextResponse.json({ ok: true, paid: newPaid, status });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    await db.delete(bills).where(eq(bills.id, id));
    return NextResponse.json({ ok: true });
}
