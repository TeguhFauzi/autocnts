"use server";

import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptId } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function fields(formData: FormData) {
    return {
        code: String(formData.get("code") ?? "").trim(),
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim() || null,
        address: String(formData.get("address") ?? "").trim() || null,
    };
}

export async function createSupplier(formData: FormData) {
    const f = fields(formData);
    if (!f.code || !f.name) return;
    await db.insert(suppliers).values(f);
    revalidatePath("/suppliers");
    redirect("/suppliers");
}

export async function updateSupplier(eid: string, formData: FormData) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.update(suppliers).set(fields(formData)).where(eq(suppliers.id, id));
    revalidatePath("/suppliers");
    redirect("/suppliers");
}

export async function deleteSupplier(eid: string) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.delete(suppliers).where(eq(suppliers.id, id));
    revalidatePath("/suppliers");
}
