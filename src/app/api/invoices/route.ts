import { recordNotification } from "@/lib/notifyStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceLines, customers } from "@/db/schema";
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
        .from(invoices);

    const rows = await db
        .select({
            id: invoices.id,
            docNo: invoices.docNo,
            date: invoices.date,
            dueDate: invoices.dueDate,
            total: invoices.total,
            paid: invoices.paid,
            status: invoices.status,
            customerName: customers.name,
        })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .orderBy(desc(invoices.date), desc(invoices.id))
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
    // b: { customerId, date, dueDate, notes, lines:[{itemId, description, qty, price}] }
    const lines = (b.lines ?? []).filter((l: any) => l.description);
    if (!b.customerId || lines.length === 0) {
        return NextResponse.json(
            { error: "Customer and at least 1 line required" },
            { status: 400 }
        );
    }
    const computed = lines.map((l: any) => {
        const amount = Number(l.qty || 0) * Number(l.price || 0);
        return { ...l, amount };
    });
    const total = computed.reduce((s: number, l: any) => s + l.amount, 0);

    const [inv] = await db
        .insert(invoices)
        .values({
            docNo: b.docNo || genDocNo("INV"),
            customerId: Number(b.customerId),
            date: b.date,
            dueDate: b.dueDate || null,
            total: String(total),
            paid: "0",
            status: "UNPAID",
            notes: b.notes ?? null,
        })
        .returning();

    await db.insert(invoiceLines).values(
        computed.map((l: any) => ({
            invoiceId: inv.id,
            itemId: l.itemId ? Number(l.itemId) : null,
            description: l.description,
            qty: String(l.qty || 0),
            price: String(l.price || 0),
            amount: String(l.amount),
        }))
    );

    recordNotification("accountant", "Faktur Baru", `Invoice ${inv.docNo} dibuat.`);
    recordNotification("customer", "Faktur Baru", `Faktur ${inv.docNo} menunggu pembayaran Anda.`);
    recordNotification("sales", "Invoice Tersimpan", `Invoice ${inv.docNo} berhasil dibuat.`);
    return NextResponse.json(inv, { status: 201 });
}
