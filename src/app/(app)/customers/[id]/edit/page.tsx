import { notFound } from "next/navigation";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PartyFormServer } from "@/components/PartyFormServer";
import { decryptId } from "@/lib/crypto";
import { updateCustomer } from "../../actions";

export default async function EditCustomerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const eid = (await params).id;
    const id = decryptId(eid);
    if (Number.isNaN(id)) notFound();
    const [c] = await db.select().from(customers).where(eq(customers.id, id));
    if (!c) notFound();

    return (
        <PartyFormServer
            title="Edit Customer"
            subtitle="Update customer"
            basePath="/customers"
            action={updateCustomer.bind(null, eid)}
            defaults={c}
            submitLabel="Update"
        />
    );
}
