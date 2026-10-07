import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { invoices, invoiceLines, customers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const sessionCustomerId = (session?.user as any)?.customerId;

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
        .where(eq(invoices.id, Number(id)))
        .limit(1);

    if (!header) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if ((session?.user as any)?.role === "customer" && header.customerId !== sessionCustomerId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const lines = await db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, Number(id)));
    return NextResponse.json({ ...header, lines });
}
