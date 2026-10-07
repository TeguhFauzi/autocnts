import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { IconArrowLeft } from "@/components/icons";
import { createAccount } from "../actions";

const TYPES = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"];

export default function NewAccountPage() {
    return (
        <div>
            <PageHeader
                title="New Account"
                subtitle="Create a general ledger account"
                action={
                    <Link href="/accounts" className="btn-ghost">
                        <IconArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Link>
                }
            />
            <form action={createAccount} className="card space-y-4 max-w-xl">
                <div>
                    <label className="label">Code</label>
                    <input name="code" className="input font-mono" required />
                </div>
                <div>
                    <label className="label">Name</label>
                    <input name="name" className="input" required />
                </div>
                <div>
                    <label className="label">Type</label>
                    <select name="type" className="input" defaultValue="ASSET">
                        {TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary">Create</button>
                    <Link href="/accounts" className="btn-ghost">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
