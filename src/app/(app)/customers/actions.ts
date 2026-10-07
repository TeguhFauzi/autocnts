"use server";

import { db } from "@/db";
import { customers } from "@/db/schema";
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

export async function createCustomer(formData: FormData) {
    const f = fields(formData);
    if (!f.code || !f.name) return;
    await db.insert(customers).values(f);
    revalidatePath("/customers");
    redirect("/customers");
}

export async function updateCustomer(eid: string, formData: FormData) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.update(customers).set(fields(formData)).where(eq(customers.id, id));
    revalidatePath("/customers");
    redirect("/customers");
}

export async function deleteCustomer(eid: string) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.delete(customers).where(eq(customers.id, id));
    revalidatePath("/customers");
}
