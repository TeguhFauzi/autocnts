"use server";

import { recordNotification } from "@/lib/notifyStore";
import { db } from "@/db";
import { bills, billLines, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptId } from "@/lib/crypto";
import { genDocNo } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type LineInput = {
    itemId: string; // encrypted eid or ""
    description: string;
    qty: string;
    price: string;
};

export async function createBill(payload: {
    supplierId: string; // encrypted eid
    date: string;
    dueDate: string;
    notes: string;
    lines: LineInput[];
}): Promise<{ ok: boolean; error?: string }> {
    const supplierId = decryptId(payload.supplierId);
    if (Number.isNaN(supplierId)) {
        return { ok: false, error: "Select a supplier" };
    }
    const lines = (payload.lines ?? []).filter((l) => l.description);
    if (lines.length === 0) {
        return { ok: false, error: "At least 1 line required" };
    }
    const computed = lines.map((l) => {
        const itemId = l.itemId ? decryptId(l.itemId) : null;
        const amount = Number(l.qty || 0) * Number(l.price || 0);
        return { ...l, itemId, amount };
    });
    if (computed.some((l) => l.itemId !== null && Number.isNaN(l.itemId))) {
        return { ok: false, error: "Invalid item selected" };
    }
    const total = computed.reduce((s, l) => s + l.amount, 0);

    const [bill] = await db
        .insert(bills)
        .values({
            docNo: genDocNo("BILL"),
            supplierId,
            date: payload.date,
            dueDate: payload.dueDate || null,
            total: String(total),
            paid: "0",
            status: "UNPAID",
            notes: payload.notes || null,
        })
        .returning();

    await db.insert(billLines).values(
        computed.map((l) => ({
            billId: bill.id,
            itemId: l.itemId,
            description: l.description,
            qty: String(l.qty || 0),
            price: String(l.price || 0),
            amount: String(l.amount),
        }))
    );

    recordNotification("accountant", "Bill Baru", "Bill baru dibuat.");
    recordNotification("warehouse", "Barang Masuk", "Bill baru — cek penerimaan barang.");
    recordNotification("purchase", "Bill Tercatat", "Bill baru tersimpan.");
    revalidatePath("/bills");
    return { ok: true };
}

export async function recordPayment(
    eid: string,
    payload: { amount: number; method: string; date: string }
): Promise<{ ok: boolean; error?: string }> {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return { ok: false, error: "Invalid bill" };
    const amount = Number(payload.amount || 0);
    if (amount <= 0) return { ok: false, error: "Amount must be > 0" };

    const [bill] = await db
        .select()
        .from(bills)
        .where(eq(bills.id, id))
        .limit(1);
    if (!bill) return { ok: false, error: "Not found" };

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
        date: payload.date || bill.date,
        partyId: bill.supplierId,
        docRefId: bill.id,
        amount: String(amount),
        method: payload.method || "CASH",
        notes: null,
    });

    recordNotification("admin", "Pembayaran Bill", `Pembayaran bill sebesar ${amount}.`);
    recordNotification("accountant", "Pembayaran Hutang", "Pembayaran bill tercatat.");
    recordNotification("purchase", "Bill Dibayar", "Pembayaran bill tercatat.");
    revalidatePath(`/bills/${eid}`);
    revalidatePath("/bills");
    return { ok: true };
}

export async function deleteBill(eid: string) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.delete(bills).where(eq(bills.id, id));
    revalidatePath("/bills");
}
