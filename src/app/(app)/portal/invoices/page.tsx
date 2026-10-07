"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/PageHeader";
import { money } from "@/lib/utils";
import { useLang } from "@/lib/context";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Pagination } from "@/components/Pagination";
import { addNotification } from "@/lib/notifications";

export default function CustomerInvoicesPage() {
    const { data: session } = useSession();
    const { t } = useLang();
    const role = (session?.user as any)?.role as string | undefined;
    const isCustomer = role === "customer";

    const [customerCode, setCustomerCode] = useState("C-1001");
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [payingId, setPayingId] = useState<number | null>(null);
    const [paySuccess, setPaySuccess] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE = 5;

    const loadCustomerInvoices = async (code?: string, p?: number) => {
        setLoading(true);
        setPaySuccess(null);
        try {
            const targetPage = p ?? page;
            const res = await fetch(`/api/portal/invoices?page=${targetPage}&limit=${PAGE}`);
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
        loadCustomerInvoices(undefined, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCustomerPay = async (invoiceId: number) => {
        setPayingId(invoiceId);
        try {
            const res = await fetch(`/api/portal/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceId }),
            });
            const json = await res.json();
            if (res.ok) {
                setPaySuccess(
                    `✅ ${t("paymentSuccess") || "Pembayaran"} Faktur #${json.docNo} ${t("amountOf") || "sebesar"} ${money(json.paidAmount)} ${t("successPaid") || "berhasil dilunasi!"}`
                );
                loadCustomerInvoices();
                addNotification("admin", "Pembayaran Masuk", `Faktur #${json.docNo} sebesar ${money(json.paidAmount)} telah dilunasi customer.`);
                addNotification("accountant", "Penerimaan Kas", `Pembayaran faktur #${json.docNo} diterima.`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setPayingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("myInvoices") || "Faktur Saya & Bayar"}
                subtitle="Kelola tagihan berjalan Anda dan lakukan pelunasan mandiri secara langsung."
            />

            {paySuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm font-medium flex items-center justify-between">
                    <span>{paySuccess}</span>
                    <span className="text-xs bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">{t("paidBadgeText")}</span>
                </div>
            )}

            <div className="card p-0 overflow-hidden">
                <div className="p-4 font-bold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <span>{t("invoiceList") || "Daftar Faktur Penagihan Anda"}</span>
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
                            <th className="th">{t("dueDate") || "Jatuh Tempo"}</th>
                            <th className="th text-right">{t("totalBill") || "Total Tagihan"}</th>
                            <th className="th text-right">{t("paidAmount") || "Telah Dibayar"}</th>
                            <th className="th">{t("billingStatus") || "Status Penagihan"}</th>
                            <th className="th text-right">{t("customerAction") || "Aksi Pelanggan"}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={5} cols={7} />
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="td text-center text-gray-400 py-6">
                                    {t("noInvoicesFound") || "Tidak ada faktur ditemukan."}
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv) => {
                                const isPaid = inv.status === "PAID";
                                const outstanding = Number(inv.total) - Number(inv.paid);
                                return (
                                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                        <td className="td font-mono font-semibold text-brand-600"><Link href={`/portal/invoices/${inv.id}`} className="hover:underline">{inv.docNo}</Link></td>
                                        <td className="td">{inv.date}</td>
                                        <td className="td">{inv.dueDate ?? "-"}</td>
                                        <td className="td text-right font-medium">{money(inv.total)}</td>
                                        <td className="td text-right text-emerald-600">{money(inv.paid)}</td>
                                        <td className="td">
                                            {isPaid ? (
                                                <span className="badge bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold">
                                                    {t("paidStatus")}
                                                </span>
                                            ) : (
                                                <span className="badge bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold">
                                                    {t("unpaidStatus")} ({money(outstanding)})
                                                </span>
                                            )}
                                        </td>
                                        <td className="td text-right">
                                            {isPaid ? (
                                                <span className="text-xs text-emerald-600 font-medium">{t("paidDone")}</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleCustomerPay(inv.id)}
                                                    disabled={payingId === inv.id}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    {payingId === inv.id ? t("processing") : t("payNow")}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                <Pagination currentPage={page} totalPages={totalPages} totalItems={total} pageSize={PAGE} onPageChange={(p) => loadCustomerInvoices(undefined, p)} />
            </div>
        </div>
    );
}
