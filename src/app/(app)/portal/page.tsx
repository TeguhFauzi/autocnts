"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/PageHeader";
import { money } from "@/lib/utils";
import { useLang } from "@/lib/context";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Pagination } from "@/components/Pagination";
import { addNotification } from "@/lib/notifications";

export default function CustomerPortalPage() {
    const { data: session } = useSession();
    const { t } = useLang();
    const role = (session?.user as any)?.role as string | undefined;
    const isCustomer = role === "customer";

    const [customerCode, setCustomerCode] = useState("C-1001");
    const [invoices, setInvoices] = useState<any[]>([]);
    const [paidInvoices, setPaidInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [payingId, setPayingId] = useState<number | null>(null);
    const [paySuccess, setPaySuccess] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [invPage, setInvPage] = useState(1);
    const [invTotal, setInvTotal] = useState(0);
    const [invTotalPages, setInvTotalPages] = useState(1);
    const [unpaidCount, setUnpaidCount] = useState(0);
    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const PAGE = 5;

    const loadCustomerInvoices = async (code?: string, p?: number) => {
        setLoading(true);
        setPaySuccess(null);
        try {
            const c = code ?? customerCode;
            const targetPage = p ?? invPage;
            const base = isCustomer ? "/api/portal/invoices" : `/api/portal/invoices?code=${c}`;
            const sep = base.includes("?") ? "&" : "?";
            const res = await fetch(`${base}${sep}page=${targetPage}&limit=${PAGE}`);
            if (res.ok) {
                const data = await res.json();
                setInvoices(data.invoices || []);
                setInvTotal(data.total ?? 0);
                setInvTotalPages(data.totalPages || 1);
                setInvPage(targetPage);
                setUnpaidCount(data.unpaidCount ?? 0);
                setTotalOutstanding(Number(data.totalOutstanding ?? 0));
            } else {
                setInvoices([]);
            }
            const paidRes = await fetch(`${base}${sep}status=PAID&page=1&limit=100`);
            if (paidRes.ok) {
                const paidData = await paidRes.json();
                setPaidInvoices(paidData.invoices || []);
            }
            setHasLoaded(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // For customer role, auto-load invoices
    useEffect(() => {
        if (isCustomer && !hasLoaded) {
            loadCustomerInvoices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCustomer]);

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
                    isCustomer
                        ? `✅ ${t("paymentSuccess") || "Pembayaran"} Faktur #${json.docNo} ${t("amountOf") || "sebesar"} ${money(json.paidAmount)} ${t("successPaid") || "berhasil dilunasi!"}`
                        : `Pembayaran Faktur #${json.docNo} sebesar ${money(json.paidAmount)} BERHASIL dilunasi oleh Customer!`
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
                title={
                    isCustomer
                        ? t("customerPortal") || "Customer Portal"
                        : "Customer Self-Service Portal (Point of View Customer)"
                }
                subtitle={
                    isCustomer
                        ? t("portalSubtitle") || "Cek tagihan, status faktur, dan lakukan pelunasan mandiri"
                        : "Portal Mandiri Pelanggan: Cek Tagihan, Status Faktur, & Transfer Pelunasan"
                }
            />

            {/* Customer Info Card */}
            <div className="card border border-brand-100 dark:border-slate-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-slate-800 dark:to-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
                            👤 {isCustomer ? (t("welcomeCustomer") || "Selamat Datang, Pelanggan") : "Customer Login Mode"}
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base">
                            {isCustomer ? session?.user?.name : "PT Mitra Sejahtera (Pelanggan)"}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                            {isCustomer
                                ? <>Email: <code className="font-mono text-brand-600">{session?.user?.email}</code></>
                                : <>ID Kode: <code className="font-mono text-brand-600">{customerCode}</code> | Email: finance@mitrasejahtera.co.id</>
                            }
                        </p>
                    </div>
                    {!isCustomer && (
                        <button
                            onClick={() => loadCustomerInvoices()}
                            disabled={loading}
                            className="btn-primary whitespace-nowrap cursor-pointer shadow-sm"
                        >
                            {loading ? "Memuat Faktur..." : "🔍 Cek Faktur Penagihan Saya"}
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Summary Cards for Customer */}
            {isCustomer && hasLoaded && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-brand-600">{invTotal}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {t("totalInvoices") || "Total Faktur"}
                        </div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-amber-600">{unpaidCount}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {t("unpaidInvoices") || "Belum Dibayar"}
                        </div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-red-600">{money(totalOutstanding)}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {t("outstandingAmount") || "Sisa Tagihan"}
                        </div>
                    </div>
                </div>
            )}

            {paySuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm font-medium flex items-center justify-between">
                    <span>{paySuccess}</span>
                    <span className="text-xs bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">{t("paidBadgeText")}</span>
                </div>
            )}

            {/* Invoices List */}
            <div className="card p-0 overflow-hidden">
                <div className="p-4 font-bold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <span>{t("invoiceList") || "Daftar Faktur Penagihan Anda"}</span>
                    {isCustomer && (
                        <button
                            onClick={() => loadCustomerInvoices()}
                            disabled={loading}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium cursor-pointer"
                        >
                            {loading ? "⏳" : "🔄"} {t("refresh") || "Refresh"}
                        </button>
                    )}
                    {!isCustomer && (
                        <span className="text-xs text-gray-400 font-normal">Tampilan Sudut Pandang Pelanggan</span>
                    )}
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
                                    {hasLoaded
                                        ? (t("noInvoicesFound") || "Tidak ada faktur ditemukan.")
                                        : (t("clickToLoad") || 'Klik "Cek Faktur Penagihan Saya" di atas untuk memuat tagihan.')
                                    }
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv) => {
                                const isPaid = inv.status === "PAID";
                                const outstanding = Number(inv.total) - Number(inv.paid);
                                return (
                                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                        <td className="td font-mono font-semibold text-brand-600">{inv.docNo}</td>
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
                <Pagination currentPage={invPage} totalPages={invTotalPages} totalItems={invTotal} pageSize={PAGE} onPageChange={(p) => loadCustomerInvoices(undefined, p)} />
            </div>

            {/* Payment History (Customer Only) */}
            {isCustomer && hasLoaded && paidInvoices.length > 0 && (
                <div className="card p-0 overflow-hidden">
                    <div className="p-4 font-bold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700">
                        📋 {t("paymentHistory") || "Riwayat Pembayaran"}
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/60">
                            <tr>
                                <th className="th">{t("invoiceNo") || "No. Faktur"}</th>
                                <th className="th">{t("date") || "Tanggal"}</th>
                                <th className="th text-right">{t("total") || "Total"}</th>
                                <th className="th">{t("status") || "Status"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paidInvoices.map((inv) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
