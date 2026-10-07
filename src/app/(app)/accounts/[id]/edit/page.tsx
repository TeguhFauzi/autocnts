import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { IconArrowLeft } from "@/components/icons";
import { decryptId } from "@/lib/crypto";
import { updateAccount } from "../../actions";

const TYPES = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];

export default async function EditAccountPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const eid = (await params).id;
    const id = decryptId(eid);
    if (Number.isNaN(id)) notFound();
    const [a] = await db.select().from(accounts).where(eq(accounts.id, id));
    if (!a) notFound();

    const action = updateAccount.bind(null, eid);

    return (
        <div>
            <PageHeader
                title="Edit Account"
                subtitle="Update general ledger account"
                action={
                    <Link href="/accounts" className="btn-ghost">
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
                        defaultValue={a.code}
                        required
                    />
                </div>
                <div>
                    <label className="label">Name</label>
                    <input
                        name="name"
                        className="input"
                        defaultValue={a.name}
                        required
                    />
                </div>
                <div>
                    <label className="label">Type</label>
                    <select name="type" className="input" defaultValue={a.type}>
                        {TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary">Update</button>
                    <Link href="/accounts" className="btn-ghost">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
