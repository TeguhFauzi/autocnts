import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { IconArrowLeft } from "@/components/icons";

export function PartyFormServer({
    title,
    subtitle,
    basePath,
    action,
    defaults,
    submitLabel,
}: {
    title: string;
    subtitle: string;
    basePath: string;
    action: (formData: FormData) => void | Promise<void>;
    defaults?: {
        code?: string;
        name?: string;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
    };
    submitLabel: string;
}) {
    const d = defaults ?? {};
    return (
        <div>
            <PageHeader
                title={title}
                subtitle={subtitle}
                action={
                    <Link href={basePath} className="btn-ghost">
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
                        defaultValue={d.code ?? ""}
                        required
                    />
                </div>
                <div>
                    <label className="label">Name</label>
                    <input
                        name="name"
                        className="input"
                        defaultValue={d.name ?? ""}
                        required
                    />
                </div>
                <div>
                    <label className="label">Email</label>
                    <input
                        name="email"
                        type="email"
                        className="input"
                        defaultValue={d.email ?? ""}
                    />
                </div>
                <div>
                    <label className="label">Phone</label>
                    <input
                        name="phone"
                        className="input"
                        defaultValue={d.phone ?? ""}
                    />
                </div>
                <div>
                    <label className="label">Address</label>
                    <textarea
                        name="address"
                        className="input"
                        rows={2}
                        defaultValue={d.address ?? ""}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary">{submitLabel}</button>
                    <Link href={basePath} className="btn-ghost">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
