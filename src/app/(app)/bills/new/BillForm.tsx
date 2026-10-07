"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { money, today } from "@/lib/utils";
import { createBill } from "./actions";
import { addNotification } from "@/lib/notifications";

type Supplier = { eid: string; code: string; name: string };
type Item = { eid: string; code: string; name: string; cost: string };
type Line = {
    itemId: string;
    description: string;
    qty: string;
    price: string;
};

const emptyLine = (): Line => ({
    itemId: "",
    description: "",
    qty: "1",
    price: "",
});

export function BillForm({
    suppliers,
    items,
}: {
    suppliers: Supplier[];
    items: Item[];
}) {
    const router = useRouter();
    const [supplierId, setSupplierId] = useState("");
    const [date, setDate] = useState(today());
    const [dueDate, setDueDate] = useState("");
    const [notes, setNotes] = useState("");
    const [lines, setLines] = useState<Line[]>([emptyLine()]);
    const [err, setErr] = useState("");
    const [saving, setSaving] = useState(false);

    const total = lines.reduce(
        (s, l) => s + Number(l.qty || 0) * Number(l.price || 0),
        0
    );

    function update(i: number, patch: Partial<Line>) {
        setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
    }
    function pickItem(i: number, itemId: string) {
        const it = items.find((x) => x.eid === itemId);
        update(i, {
            itemId,
            description: it ? it.name : lines[i].description,
            price: it ? it.cost : lines[i].price,
        });
    }
    function addLine() {
        setLines((ls) => [...ls, emptyLine()]);
    }
    function removeLine(i: number) {
        setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls));
    }

    async function save() {
        setErr("");
        if (!supplierId) {
            setErr("Select a supplier");
            return;
        }
        setSaving(true);
        const res = await createBill({
            supplierId,
            date,
            dueDate,
            notes,
            lines,
        });
        setSaving(false);
        if (!res.ok) {
            setErr(res.error ?? "Failed");
            return;
        }
        addNotification("accountant", "Bill Baru", "Tagihan pembelian baru dibuat. Pastikan hutang tercatat.");
        addNotification("warehouse", "Barang Masuk", "Bill baru dibuat — cek penerimaan barang.");
        router.push("/bills");
        router.refresh();
    }

    return (
        <div>
            <PageHeader title="New Bill" subtitle="Create purchase bill" />
            <div className="card space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label">Supplier</label>
                        <select
                            className="input"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                        >
                            <option value="">Select supplier…</option>
                            {suppliers.map((s) => (
                                <option key={s.eid} value={s.eid}>
                                    {s.code} — {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
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
                        <label className="label">Due Date</label>
                        <input
                            type="date"
                            className="input"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th w-1/4">Item</th>
                                <th className="th">Description</th>
                                <th className="th text-right">Qty</th>
                                <th className="th text-right">Price</th>
                                <th className="th text-right">Amount</th>
                                <th className="th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((l, i) => (
                                <tr key={i}>
                                    <td className="td">
                                        <select
                                            className="input"
                                            value={l.itemId}
                                            onChange={(e) => pickItem(i, e.target.value)}
                                        >
                                            <option value="">—</option>
                                            {items.map((it) => (
                                                <option key={it.eid} value={it.eid}>
                                                    {it.code}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="td">
                                        <input
                                            className="input"
                                            value={l.description}
                                            onChange={(e) =>
                                                update(i, { description: e.target.value })
                                            }
                                        />
                                    </td>
                                    <td className="td">
                                        <input
                                            type="number"
                                            className="input text-right"
                                            value={l.qty}
                                            onChange={(e) => update(i, { qty: e.target.value })}
                                        />
                                    </td>
                                    <td className="td">
                                        <input
                                            type="number"
                                            className="input text-right"
                                            value={l.price}
                                            onChange={(e) => update(i, { price: e.target.value })}
                                        />
                                    </td>
                                    <td className="td text-right">
                                        {money(Number(l.qty || 0) * Number(l.price || 0))}
                                    </td>
                                    <td className="td">
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => removeLine(i)}
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-semibold">
                                <td className="td text-right" colSpan={4}>
                                    Total
                                </td>
                                <td className="td text-right">{money(total)}</td>
                                <td className="td"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <button className="btn-ghost" onClick={addLine}>
                    + Add line
                </button>

                <div>
                    <label className="label">Notes</label>
                    <textarea
                        className="input"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {err && <div className="text-sm text-red-600">{err}</div>}

                <div className="flex gap-2">
                    <button className="btn-primary" onClick={save} disabled={saving}>
                        {saving ? "Saving..." : "Save Bill"}
                    </button>
                    <button className="btn-ghost" onClick={() => router.push("/bills")}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
