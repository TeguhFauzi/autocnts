import { notFound } from "next/navigation";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PartyFormServer } from "@/components/PartyFormServer";
import { decryptId } from "@/lib/crypto";
import { updateSupplier } from "../../actions";

export default async function EditSupplierPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const eid = (await params).id;
    const id = decryptId(eid);
    if (Number.isNaN(id)) notFound();
    const [s] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    if (!s) notFound();

    return (
        <PartyFormServer
            title="Edit Supplier"
            subtitle="Update supplier"
            basePath="/suppliers"
            action={updateSupplier.bind(null, eid)}
            defaults={s}
            submitLabel="Update"
        />
    );
}
