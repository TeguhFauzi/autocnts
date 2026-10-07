"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { today } from "@/lib/utils";
import { recordReceipt } from "../actions";
import { addNotification } from "@/lib/notifications";

export function ReceiptForm({
    eid,
    outstanding,
}: {
    eid: string;
    outstanding: number;
}) {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("CASH");
    const [payDate, setPayDate] = useState(today());
    const [err, setErr] = useState("");
    const [saving, setSaving] = useState(false);

    async function save() {
        setErr("");
        const amt = Number(amount || 0);
        if (amt <= 0) {
            setErr("Enter an amount");
            return;
        }
        setSaving(true);
        const res = await recordReceipt(eid, {
            amount: amt,
            method,
            date: payDate,
        });
        setSaving(false);
        if (!res.ok) {
            setErr(res.error ?? "Failed");
            return;
        }
        setAmount("");
        addNotification("admin", "Penerimaan Kas", `Penerimaan dari customer sebesar Rp ${amt} tercatat.`);
        addNotification("customer", "Pembayaran Tercatat", "Pembayaran Anda telah tercatat.");
        router.refresh();
    }

    return (
        <>
            <div>
                <label className="label">Date</label>
                <input
                    type="date"
                    className="input"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                />
            </div>
            <div>
                <label className="label">Amount</label>
                <input
                    type="number"
                    className="input text-right"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={String(outstanding)}
                />
            </div>
            <div>
                <label className="label">Method</label>
                <select
                    className="input"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CARD">Card</option>
                </select>
            </div>
            {err && <div className="text-sm text-red-600">{err}</div>}
            <button className="btn-primary w-full" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Record Receipt"}
            </button>
        </>
    );
}
