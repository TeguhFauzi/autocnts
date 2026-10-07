import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { IconArrowLeft } from "@/components/icons";
import { createItem } from "../actions";

export default function NewItemPage() {
    return (
        <div>
            <PageHeader
                title="New Item"
                subtitle="Create an inventory item"
                action={
                    <Link href="/items" className="btn-ghost">
                        <IconArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Link>
                }
            />
            <form action={createItem} className="card space-y-4 max-w-xl">
                <div>
                    <label className="label">Code</label>
                    <input name="code" className="input font-mono" required />
                </div>
                <div>
                    <label className="label">Name</label>
                    <input name="name" className="input" required />
                </div>
                <div>
                    <label className="label">UOM</label>
                    <input name="uom" className="input" defaultValue="UNIT" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="label">Price</label>
                        <input
                            name="price"
                            type="number"
                            step="any"
                            className="input text-right"
                        />
                    </div>
                    <div>
                        <label className="label">Cost</label>
                        <input
                            name="cost"
                            type="number"
                            step="any"
                            className="input text-right"
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
                    />
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary">Create</button>
                    <Link href="/items" className="btn-ghost">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
