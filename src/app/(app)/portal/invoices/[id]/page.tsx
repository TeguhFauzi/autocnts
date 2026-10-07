"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { money } from "@/lib/utils";

export default function PortalInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [inv, setInv] = useState<any>(null);
    const [err, setErr] = useState<string | null>(null);
    const [amount, setAmount] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

    const load = () =>
        fetch(`/api/portal/invoices/${id}`)
            .then((r) => r.json())
            .then((d) => (d.error ? setErr(d.error) : setInv(d)));

    useEffect(() => { load(); }, [id]);

    const pay = async () => {
        setMsg(null);
        const res = await fetch("/api/portal/pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invoiceId: Number(id), amount: amount ? Number(amount) : undefined }),
        });
        const d = await res.json();
        setMsg(res.ok ? `✅ Pembayaran ${money(d.paidAmount)} berhasil (${d.status})` : `✕ ${d.error}`);
        if (res.ok) { setAmount(""); load(); }
    };

    if (err) return <p className="text-red-500 text-sm">{err}</p>;
    if (!inv) return <p className="text-sm text-gray-400">Memuat...</p>;

    const remaining = Number(inv.total) - Number(inv.paid);

    return (
        <div className="space-y-6 max-w-4xl">
            <PageHeader title={`Detail Faktur ${inv.docNo}`} subtitle={`${inv.customerName ?? ""} • ${inv.date} • jatuh tempo ${inv.dueDate ?? "-"}`} />
            <div className="card p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800/60">
                        <tr><th className="th">Deskripsi</th><th className="th text-right">Qty</th><th className="th text-right">Harga</th><th className="th text-right">Jumlah</th></tr>
                    </thead>
                    <tbody>
                        {inv.lines?.map((l: any) => (
                            <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                <td className="td">{l.description}</td>
                                <td className="td text-right">{l.qty}</td>
                                <td className="td text-right">{money(l.price)}</td>
                                <td className="td text-right">{money(l.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 text-sm space-y-1">
                    <div className="flex justify-between"><span>Total</span><b>{money(inv.total)}</b></div>
                    <div className="flex justify-between"><span>Sudah Dibayar</span><b className="text-emerald-600">{money(inv.paid)}</b></div>
                    <div className="flex justify-between"><span>Sisa</span><b className="text-red-500">{money(remaining)}</b></div>
                    <div className="flex justify-between"><span>Status</span><b>{inv.status}</b></div>
                </div>
            </div>

            {inv.status !== "PAID" && (
                <div className="card p-6 space-y-3">
                    <h3 className="font-bold text-gray-800">Bayar Faktur</h3>
                    <input className="input" type="number" placeholder={`Kosongkan = bayar penuh (${money(remaining)})`} value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <button onClick={pay} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">💳 Bayar Sekarang</button>
                    {msg && <p className="text-sm font-medium text-gray-600">{msg}</p>}
                </div>
            )}
            <Link href="/portal/invoices" className="text-sm text-brand-600 hover:underline">← Kembali ke daftar faktur</Link>
        </div>
    );
}
