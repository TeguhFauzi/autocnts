"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useLang } from "@/lib/context";

export default function CustomerProfilePage() {
    const { t } = useLang();
    const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", code: "" });
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/portal/profile")
            .then((r) => r.json())
            .then((d) => { if (d.customer) setForm({ name: d.customer.name, email: d.customer.email ?? "", phone: d.customer.phone ?? "", address: d.customer.address ?? "", code: d.customer.code }); })
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setMsg(null);
        const res = await fetch("/api/portal/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const d = await res.json();
        setMsg(res.ok ? `✅ ${t("profileSaved")}` : `✕ ${d.error}`);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <PageHeader title={t("profileTitle")} subtitle={t("profileSubtitle")} />
            <div className="card p-6 space-y-4">
                {loading ? (
                    <p className="text-sm text-gray-400">{t("loading")}</p>
                ) : (
                    <>
                        <div>
                            <label className="label">{t("customerCode")}</label>
                            <input className="input bg-gray-50" value={form.code} disabled />
                        </div>
                        {(["name", "email", "phone", "address"] as const).map((k) => (
                            <div key={k}>
                                <label className="label">{k === "name" ? t("companyName") : k === "email" ? t("email") : k === "phone" ? t("phone") : t("address")}</label>
                                <input className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                            </div>
                        ))}
                        <button onClick={save} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-colors">{t("saveChanges")}</button>
                        {msg && <p className="text-sm font-medium text-gray-600">{msg}</p>}
                    </>
                )}
            </div>
        </div>
    );
}
