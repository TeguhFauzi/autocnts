"use server";

import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptId } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAccount(formData: FormData) {
    const code = String(formData.get("code") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const type = String(formData.get("type") ?? "ASSET");
    if (!code || !name || !type) return;
    await db.insert(accounts).values({ code, name, type, isActive: true });
    revalidatePath("/accounts");
    redirect("/accounts");
}

export async function updateAccount(eid: string, formData: FormData) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    const code = String(formData.get("code") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const type = String(formData.get("type") ?? "ASSET");
    await db
        .update(accounts)
        .set({ code, name, type })
        .where(eq(accounts.id, id));
    revalidatePath("/accounts");
    redirect("/accounts");
}

export async function deleteAccount(eid: string) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.delete(accounts).where(eq(accounts.id, id));
    revalidatePath("/accounts");
}

export async function toggleAccountActive(eid: string) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    const [existing] = await db
        .select({ isActive: accounts.isActive })
        .from(accounts)
        .where(eq(accounts.id, id));
    if (!existing) return;
    await db
        .update(accounts)
        .set({ isActive: !existing.isActive })
        .where(eq(accounts.id, id));
    revalidatePath("/accounts");
}
