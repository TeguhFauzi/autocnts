"use server";

import { recordNotification } from "@/lib/notifyStore";
import { db } from "@/db";
import { journals, journalLines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptId } from "@/lib/crypto";
import { genDocNo } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type LineInput = {
    accountId: string; // encrypted eid
    debit: string;
    credit: string;
    memo: string;
};

export async function createJournal(payload: {
    date: string;
    description: string;
    lines: LineInput[];
}): Promise<{ ok: boolean; error?: string }> {
    const lines = (payload.lines ?? []).filter(
        (l) => Number(l.debit) > 0 || Number(l.credit) > 0
    );
    if (lines.length < 2) {
        return { ok: false, error: "At least 2 lines required" };
    }
    const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
        return { ok: false, error: "Debit and Credit must balance" };
    }

    const resolved = lines.map((l) => {
        const accountId = decryptId(l.accountId);
        return { ...l, accountId };
    });
    if (resolved.some((l) => Number.isNaN(l.accountId))) {
        return { ok: false, error: "Invalid account selected" };
    }

    const [jr] = await db
        .insert(journals)
        .values({
            refNo: genDocNo("JV"),
            date: payload.date,
            description: payload.description || null,
            source: "GL",
        })
        .returning();

    await db.insert(journalLines).values(
        resolved.map((l) => ({
            journalId: jr.id,
            accountId: l.accountId,
            debit: String(l.debit || 0),
            credit: String(l.credit || 0),
            memo: l.memo || null,
        }))
    );

    recordNotification("admin", "Jurnal Baru", "Jurnal baru diposting.");
    recordNotification("accountant", "Jurnal Baru", "Jurnal baru siap ditinjau.");
    revalidatePath("/journals");
    return { ok: true };
}

export async function deleteJournal(eid: string) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.delete(journals).where(eq(journals.id, id));
    revalidatePath("/journals");
}
