"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { money, today } from "@/lib/utils";
import { createJournal } from "./actions";
import { addNotification } from "@/lib/notifications";

type Account = { eid: string; code: string; name: string; type: string };
type Line = { accountId: string; debit: string; credit: string; memo: string };

const emptyLine = (): Line => ({
    accountId: "",
    debit: "",
    credit: "",
    memo: "",
});

export function JournalForm({ accounts }: { accounts: Account[] }) {
    const router = useRouter();
    const [date, setDate] = useState(today());
    const [description, setDescription] = useState("");
    const [lines, setLines] = useState<Line[]>([emptyLine(), emptyLine()]);
    const [err, setErr] = useState("");
    const [saving, setSaving] = useState(false);

    const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    const balanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

    function update(i: number, patch: Partial<Line>) {
        setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
    }
    function addLine() {
        setLines((ls) => [...ls, emptyLine()]);
    }
    function removeLine(i: number) {
        setLines((ls) => (ls.length > 2 ? ls.filter((_, idx) => idx !== i) : ls));
    }

    async function save() {
        setErr("");
        if (!balanced) {
            setErr("Debit and Credit must balance and be greater than 0");
            return;
        }
        setSaving(true);
        const res = await createJournal({ date, description, lines });
        setSaving(false);
        if (!res.ok) {
            setErr(res.error ?? "Failed");
            return;
        }
        addNotification("admin", "Jurnal Baru", "Entri jurnal berpasangan berhasil diposting.");
        addNotification("accountant", "Jurnal Baru", "Jurnal baru siap ditinjau di laporan.");
        router.push("/journals");
        router.refresh();
    }

    return (
        <div>
            <PageHeader title="New Journal Entry" subtitle="Double-entry posting" />
            <div className="card space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Date</label>
                        <input
                            type="date"
                            className="input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <input
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Monthly rent payment"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th w-2/5">Account</th>
                                <th className="th text-right">Debit</th>
                                <th className="th text-right">Credit</th>
                                <th className="th">Memo</th>
                                <th className="th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((l, i) => (
                                <tr key={i}>
                                    <td className="td">
                                        <select
                                            className="input"
                                            value={l.accountId}
                                            onChange={(e) =>
                                                update(i, { accountId: e.target.value })
                                            }
                                        >
                                            <option value="">Select account…</option>
                                            {accounts.map((a) => (
                                                <option key={a.eid} value={a.eid}>
                                                    {a.code} — {a.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="td">
                                        <input
                                            type="number"
                                            className="input text-right"
                                            value={l.debit}
                                            onChange={(e) =>
                                                update(i, { debit: e.target.value, credit: "" })
                                            }
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="td">
                                        <input
                                            type="number"
                                            className="input text-right"
                                            value={l.credit}
                                            onChange={(e) =>
                                                update(i, { credit: e.target.value, debit: "" })
                                            }
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="td">
                                        <input
                                            className="input"
                                            value={l.memo}
                                            onChange={(e) => update(i, { memo: e.target.value })}
                                        />
                                    </td>
                                    <td className="td">
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => removeLine(i)}
                                            title="Remove line"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-semibold">
                                <td className="td text-right">Totals</td>
                                <td className="td text-right">{money(totalDebit)}</td>
                                <td className="td text-right">{money(totalCredit)}</td>
                                <td className="td" colSpan={2}>
                                    <span
                                        className={
                                            balanced ? "text-emerald-600" : "text-red-600"
                                        }
                                    >
                                        {balanced ? "Balanced ✓" : "Not balanced"}
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <button className="btn-ghost" onClick={addLine}>
                    + Add line
                </button>

                {err && <div className="text-sm text-red-600">{err}</div>}

                <div className="flex gap-2">
                    <button
                        className="btn-primary"
                        onClick={save}
                        disabled={saving || !balanced}
                    >
                        {saving ? "Saving..." : "Post Journal"}
                    </button>
                    <button
                        className="btn-ghost"
                        onClick={() => router.push("/journals")}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
