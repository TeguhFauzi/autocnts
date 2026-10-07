import { db } from "@/db";
import { suppliers, items } from "@/db/schema";
import { asc } from "drizzle-orm";
import { encryptId } from "@/lib/crypto";
import { BillForm } from "./BillForm";

export const dynamic = "force-dynamic";

export default async function NewBillPage() {
    const [supRows, itemRows] = await Promise.all([
        db
            .select({ id: suppliers.id, code: suppliers.code, name: suppliers.name })
            .from(suppliers)
            .orderBy(asc(suppliers.code)),
        db
            .select({
                id: items.id,
                code: items.code,
                name: items.name,
                cost: items.cost,
            })
            .from(items)
            .orderBy(asc(items.code)),
    ]);

    const supplierList = supRows.map((s) => ({
        eid: encryptId(s.id),
        code: s.code,
        name: s.name,
    }));
    const itemList = itemRows.map((it) => ({
        eid: encryptId(it.id),
        code: it.code,
        name: it.name,
        cost: it.cost,
    }));

    return <BillForm suppliers={supplierList} items={itemList} />;
}
