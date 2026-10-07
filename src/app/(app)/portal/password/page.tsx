"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useLang } from "@/lib/context";

export default function ChangePasswordPage() {
    const { t } = useLang();
    const [currentPassword, setCurrent] = useState("");
    const [newPassword, setNew] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

    const submit = async () => {
        setMsg(null);
        const res = await fetch("/api/portal/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const d = await res.json();
        setMsg(res.ok ? `✅ ${t("passwordChanged")}` : `✕ ${d.error}`);
        if (res.ok) { setCurrent(""); setNew(""); }
    };

    return (
        <div className="space-y-6 max-w-xl">
            <PageHeader title={t("changePasswordTitle")} subtitle={t("changePasswordSubtitle")} />
            <div className="card p-6 space-y-4">
                <div>
                    <label className="label">{t("currentPassword")}</label>
                    <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
                </div>
                <div>
                    <label className="label">{t("newPassword")}</label>
                    <input className="input" type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} />
                </div>
                <button onClick={submit} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-colors">{t("updatePassword")}</button>
                {msg && <p className="text-sm font-medium text-gray-600">{msg}</p>}
            </div>
        </div>
    );
}
