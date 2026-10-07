"use server";

import { db } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptId } from "@/lib/crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function num(v: FormDataEntryValue | null): string {
    const n = String(v ?? "").trim();
    return n === "" ? "0" : n;
}

export async function createItem(formData: FormData) {
    const code = String(formData.get("code") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const uom = String(formData.get("uom") ?? "UNIT").trim() || "UNIT";
    if (!code || !name) return;
    await db.insert(items).values({
        code,
        name,
        uom,
        price: num(formData.get("price")),
        cost: num(formData.get("cost")),
        qtyOnHand: num(formData.get("qtyOnHand")),
    });
    revalidatePath("/items");
    redirect("/items");
}

export async function updateItem(eid: string, formData: FormData) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    const code = String(formData.get("code") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const uom = String(formData.get("uom") ?? "UNIT").trim() || "UNIT";
    await db
        .update(items)
        .set({
            code,
            name,
            uom,
            price: num(formData.get("price")),
            cost: num(formData.get("cost")),
            qtyOnHand: num(formData.get("qtyOnHand")),
        })
        .where(eq(items.id, id));
    revalidatePath("/items");
    redirect("/items");
}

export async function deleteItem(eid: string) {
    const id = decryptId(eid);
    if (Number.isNaN(id)) return;
    await db.delete(items).where(eq(items.id, id));
    revalidatePath("/items");
}
