"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { money } from "@/lib/utils";
import { useLang } from "@/lib/context";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Pagination } from "@/components/Pagination";

export default function CustomerPaymentHistoryPage() {
    const { t } = useLang();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE = 5;

    const loadCustomerInvoices = async (p?: number) => {
        setLoading(true);
        try {
            const targetPage = p ?? page;
            const res = await fetch(`/api/portal/invoices?status=PAID&page=${targetPage}&limit=${PAGE}`);
            const data = await res.json();
            setInvoices(data.invoices || []);
            setTotal(data.total ?? 0);
            setTotalPages(data.totalPages || 1);
            setPage(targetPage);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomerInvoices(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const paidInvoices = invoices;
    const pagedInvoices = invoices;

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("paymentHistory") || "Riwayat Pembayaran"}
                subtitle="Daftar faktur dan transaksi pembayaran yang telah berhasil dilunasi."
            />

            <div className="card p-0 overflow-hidden">
                <div className="p-4 font-bold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <span>📋 {t("paymentHistory") || "Riwayat Pembayaran Pelanggan"}</span>
                    <button
                        onClick={() => loadCustomerInvoices()}
                        disabled={loading}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium cursor-pointer"
                    >
                        {loading ? "⏳" : "🔄"} {t("refresh") || "Refresh"}
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800/60">
                        <tr>
                            <th className="th">{t("invoiceNo") || "No. Faktur"}</th>
                            <th className="th">{t("date") || "Tanggal"}</th>
                            <th className="th text-right">{t("total") || "Total Transaksi"}</th>
                            <th className="th">{t("status") || "Status Pembayaran"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={4} cols={4} />
                        ) : paidInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="td text-center text-gray-400 py-6">
                                    Belum ada riwayat pelunasan transaksi.
                                </td>
                            </tr>
                        ) : (
                            pagedInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                    <td className="td font-mono font-semibold text-brand-600">{inv.docNo}</td>
                                    <td className="td">{inv.date}</td>
                                    <td className="td text-right font-medium">{money(inv.total)}</td>
                                    <td className="td">
                                        <span className="badge bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold">
                                            {t("paidTag")}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Pagination currentPage={page} totalPages={totalPages} totalItems={total} pageSize={PAGE} onPageChange={(p) => loadCustomerInvoices(p)} />
            </div>
        </div>
    );
}
