"use server";

import { recordNotification } from "@/lib/notifyStore";
import { db } from "@/db";
import { invoices, invoiceLines, payments } from "@/db/schema";
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

export async function createInvoice(payload: {
    customerId: string; // encrypted eid
    date: string;
    dueDate: string;
    notes: string;
    lines: LineInput[];
}): Promise<{ ok: boolean; error?: string }> {
    const customerId = decryptId(payload.customerId);
    if (Number.isNaN(customerId)) {
        return { ok: false, error: "Select a customer" };
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

    const [inv] = await db
        .insert(invoices)
        .values({
            docNo: genDocNo("INV"),
            customerId,
            date: payload.date,
            dueDate: payload.dueDate || null,
            total: String(total),
            paid: "0",
            status: "UNPAID",
            notes: payload.notes || null,
        })
        .returning();

    await db.insert(invoiceLines).values(
        computed.map((l) => ({
            invoiceId: inv.id,
            itemId: l.itemId,
            description: l.description,
            qty: String(l.qty || 0),
            price: String(l.price || 0),
            amount: String(l.amount),
        }))
    );

    recordNotification("accountant", "Faktur Baru", "Invoice baru dibuat.");
    recordNotification("customer", "Faktur Baru", "Faktur baru untuk Anda telah dibuat.");
    recordNotification("sales", "Invoice Tersimpan", "Invoice baru berhasil dibuat.");
    revalidatePath("/invoices");
    return { ok: true };
}

export async function recordReceipt(
    eid: string,
    payload: { amount: number; method: string; date: string }
): Promise<{ ok: boolean; error?: string }> {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return { ok: false, error: "Invalid invoice" };
    const amount = Number(payload.amount || 0);
    if (amount <= 0) return { ok: false, error: "Amount must be > 0" };

    const [inv] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, id))
        .limit(1);
    if (!inv) return { ok: false, error: "Not found" };

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
        date: payload.date || inv.date,
        partyId: inv.customerId,
        docRefId: inv.id,
        amount: String(amount),
        method: payload.method || "CASH",
        notes: null,
    });

    recordNotification("admin", "Penerimaan Kas", `Penerimaan dari customer sebesar ${amount}.`);
    recordNotification("customer", "Pembayaran Tercatat", "Pembayaran Anda telah tercatat.");
    recordNotification("sales", "Penerimaan Customer", "Penerimaan pembayaran faktur tercatat.");
    revalidatePath(`/invoices/${eid}`);
    revalidatePath("/invoices");
    return { ok: true };
}

export async function deleteInvoice(eid: string) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.delete(invoices).where(eq(invoices.id, id));
    revalidatePath("/invoices");
}
