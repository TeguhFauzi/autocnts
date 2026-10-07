import { db } from "@/db";
import { customers, items } from "@/db/schema";
import { asc } from "drizzle-orm";
import { encryptId } from "@/lib/crypto";
import { InvoiceForm } from "./InvoiceForm";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
    const [custRows, itemRows] = await Promise.all([
        db
            .select({ id: customers.id, code: customers.code, name: customers.name })
            .from(customers)
            .orderBy(asc(customers.code)),
        db
            .select({
                id: items.id,
                code: items.code,
                name: items.name,
                price: items.price,
            })
            .from(items)
            .orderBy(asc(items.code)),
    ]);

    const customerList = custRows.map((c) => ({
        eid: encryptId(c.id),
        code: c.code,
        name: c.name,
    }));
    const itemList = itemRows.map((it) => ({
        eid: encryptId(it.id),
        code: it.code,
        name: it.name,
        price: it.price,
    }));

    return <InvoiceForm customers={customerList} items={itemList} />;
}
