import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { IconArrowLeft } from "@/components/icons";
import { decryptId } from "@/lib/crypto";
import { updateItem } from "../../actions";

export default async function EditItemPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const eid = (await params).id;
    const id = decryptId(eid);
    if (Number.isNaN(id)) notFound();
    const [it] = await db.select().from(items).where(eq(items.id, id));
    if (!it) notFound();

    const action = updateItem.bind(null, eid);

    return (
        <div>
            <PageHeader
                title="Edit Item"
                subtitle="Update inventory item"
                action={
                    <Link href="/items" className="btn-ghost">
                        <IconArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Link>
                }
            />
            <form action={action} className="card space-y-4 max-w-xl">
                <div>
                    <label className="label">Code</label>
                    <input
                        name="code"
                        className="input font-mono"
                        defaultValue={it.code}
                        required
                    />
                </div>
                <div>
                    <label className="label">Name</label>
                    <input
                        name="name"
                        className="input"
                        defaultValue={it.name}
                        required
                    />
                </div>
                <div>
                    <label className="label">UOM</label>
                    <input name="uom" className="input" defaultValue={it.uom} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="label">Price</label>
                        <input
                            name="price"
                            type="number"
                            step="any"
                            className="input text-right"
                            defaultValue={it.price}
                        />
                    </div>
                    <div>
                        <label className="label">Cost</label>
                        <input
                            name="cost"
                            type="number"
                            step="any"
                            className="input text-right"
                            defaultValue={it.cost}
                        />
                    </div>
                </div>
                <div>
                    <label className="label">Qty On Hand</label>
                    <input
                        name="qtyOnHand"
                        type="number"
                        step="any"
                        className="input text-right"
                        defaultValue={it.qtyOnHand}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary">Update</button>
                    <Link href="/items" className="btn-ghost">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
