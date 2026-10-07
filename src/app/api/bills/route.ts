import { recordNotification } from "@/lib/notifyStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bills, billLines, suppliers } from "@/db/schema";
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
        .from(bills);

    const rows = await db
        .select({
            id: bills.id,
            docNo: bills.docNo,
            date: bills.date,
            dueDate: bills.dueDate,
            total: bills.total,
            paid: bills.paid,
            status: bills.status,
            supplierName: suppliers.name,
        })
        .from(bills)
        .leftJoin(suppliers, eq(bills.supplierId, suppliers.id))
        .orderBy(desc(bills.date), desc(bills.id))
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
    const lines = (b.lines ?? []).filter((l: any) => l.description);
    if (!b.supplierId || lines.length === 0) {
        return NextResponse.json(
            { error: "Supplier and at least 1 line required" },
            { status: 400 }
        );
    }
    const computed = lines.map((l: any) => ({
        ...l,
        amount: Number(l.qty || 0) * Number(l.price || 0),
    }));
    const total = computed.reduce((s: number, l: any) => s + l.amount, 0);

    const [bill] = await db
        .insert(bills)
        .values({
            docNo: b.docNo || genDocNo("BILL"),
            supplierId: Number(b.supplierId),
            date: b.date,
            dueDate: b.dueDate || null,
            total: String(total),
            paid: "0",
            status: "UNPAID",
            notes: b.notes ?? null,
        })
        .returning();

    await db.insert(billLines).values(
        computed.map((l: any) => ({
            billId: bill.id,
            itemId: l.itemId ? Number(l.itemId) : null,
            description: l.description,
            qty: String(l.qty || 0),
            price: String(l.price || 0),
            amount: String(l.amount),
        }))
    );

    recordNotification("accountant", "Bill Baru", `Bill ${bill.docNo} dibuat.`);
    recordNotification("warehouse", "Barang Masuk", `Bill ${bill.docNo} — cek penerimaan barang.`);
    recordNotification("purchase", "Bill Tercatat", `Bill ${bill.docNo} tersimpan.`);
    return NextResponse.json(bill, { status: 201 });
}
