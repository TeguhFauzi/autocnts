import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceLines, customers, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { genDocNo } from "@/lib/utils";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    const [header] = await db
        .select({
            id: invoices.id,
            docNo: invoices.docNo,
            date: invoices.date,
            dueDate: invoices.dueDate,
            total: invoices.total,
            paid: invoices.paid,
            status: invoices.status,
            notes: invoices.notes,
            customerId: invoices.customerId,
            customerName: customers.name,
        })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(eq(invoices.id, id))
        .limit(1);
    if (!header)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    const lines = await db
        .select()
        .from(invoiceLines)
        .where(eq(invoiceLines.invoiceId, id));
    return NextResponse.json({ ...header, lines });
}

// Record a receipt (payment) against invoice
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    const b = await req.json();
    const amount = Number(b.amount || 0);
    if (amount <= 0)
        return NextResponse.json({ error: "Amount must be > 0" }, { status: 400 });

    const [inv] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, id))
        .limit(1);
    if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newPaid = Number(inv.paid) + amount;
    const total = Number(inv.total);
    const status =
        newPaid >= total ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";

    await db
        .update(invoices)
        .set({ paid: String(newPaid), status })
        .where(eq(invoices.id, id));

    await db.insert(payments).values({
        docNo: genDocNo("RCPT"),
        kind: "RECEIPT",
        date: b.date || inv.date,
        partyId: inv.customerId,
        docRefId: inv.id,
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
    await db.delete(invoices).where(eq(invoices.id, id));
    return NextResponse.json({ ok: true });
}
