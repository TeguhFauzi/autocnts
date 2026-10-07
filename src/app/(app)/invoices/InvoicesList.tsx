"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DeleteButton } from "@/components/DeleteButton";
import { money } from "@/lib/utils";
import { IconPlus, IconEye, IconDownload } from "@/components/icons";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { useLang } from "@/lib/context";
import { PDFDownloadButton } from "@/components/PDFDownloadButton";

const PAGE_SIZE = 10;

const statusColor: Record<string, string> = {
    PAID: "bg-emerald-50 text-emerald-700",
    PARTIAL: "bg-amber-50 text-amber-700",
    UNPAID: "bg-red-50 text-red-700",
};

export type InvoiceRow = {
    id: number;
    docNo: string;
    date: string;
    dueDate: string;
    total: string;
    paid: string;
    status: string;
    customerName: string | null;
    eid: string;
};

type PageResult = {
    data: InvoiceRow[];
    total: number;
    page: number;
    totalPages: number;
};

export function InvoicesList({
    deleteAction,
}: {
    deleteAction: (eid: string) => Promise<void>;
}) {
    const { t } = useLang();
    const [isPending, startTransition] = useTransition();
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<PageResult>({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);

    const fetchPage = (p: number) => {
        setLoading(true);
        fetch(`/api/invoices?page=${p}&limit=${PAGE_SIZE}`)
            .then((r) => r.json())
            .then((res: PageResult) => {
                setResult(res);
                setPage(p);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPage(1);
    }, []);

    const handleDelete = (eid: string) => {
        startTransition(async () => {
            await deleteAction(eid);
            fetchPage(page);
        });
    };

    return (
        <div>
            <PageHeader
                title={t("invoices")}
                subtitle={t("invoicesSubtitle")}
                action={
                    <Link href="/invoices/new" className="btn-primary">
                        <IconPlus className="w-4 h-4 mr-1" />
                        {t("new")}
                    </Link>
                }
            />
            <div className="card p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="th">{t("number")}</th>
                            <th className="th">{t("customer")}</th>
                            <th className="th">{t("date")}</th>
                            <th className="th text-right">{t("total")}</th>
                            <th className="th text-right">{t("paid")}</th>
                            <th className="th">{t("status")}</th>
                            <th className="th text-right">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={PAGE_SIZE} cols={7} />
                        ) : result.data.length === 0 ? (
                            <tr>
                                <td className="td text-gray-400" colSpan={7}>
                                    {t("noInvoices")}
                                </td>
                            </tr>
                        ) : (
                            result.data.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50">
                                    <td className="td font-mono">
                                        <Link
                                            href={`/invoices/${inv.eid}`}
                                            className="text-brand-600 hover:underline"
                                        >
                                            {inv.docNo}
                                        </Link>
                                    </td>
                                    <td className="td">{inv.customerName ?? "-"}</td>
                                    <td className="td">{inv.date}</td>
                                    <td className="td text-right">{money(inv.total)}</td>
                                    <td className="td text-right">{money(inv.paid)}</td>
                                    <td className="td">
                                        <span className={`badge ${statusColor[inv.status]}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="td text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <Link
                                                href={`/invoices/${inv.eid}`}
                                                className="icon-btn icon-btn-brand tip"
                                                data-tip={t("view") ?? "View"}
                                            >
                                                <IconEye className="w-4 h-4" />
                                            </Link>
                                            <PDFDownloadButton
                                                eid={inv.eid}
                                                docNo={inv.docNo}
                                                className="icon-btn text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 tip"
                                                tip={t("downloadPdf")}
                                            >
                                                <IconDownload className="w-4 h-4" />
                                            </PDFDownloadButton>
                                            <DeleteButton
                                                action={() => handleDelete(inv.eid)}
                                                label={t("deleteInvoice")}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Pagination
                    currentPage={page}
                    totalPages={result.totalPages}
                    totalItems={result.total}
                    pageSize={PAGE_SIZE}
                    onPageChange={fetchPage}
                />
            </div>
        </div>
    );
}
