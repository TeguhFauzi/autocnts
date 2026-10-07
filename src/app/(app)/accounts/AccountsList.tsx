"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { IconEdit, IconPlus, IconPower } from "@/components/icons";
import { DeleteButton } from "@/components/DeleteButton";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { useLang } from "@/lib/context";
import { cls } from "@/lib/utils";

const PAGE_SIZE = 10;

const typeColor: Record<string, string> = {
    ASSET: "bg-emerald-50 text-emerald-700",
    LIABILITY: "bg-red-50 text-red-700",
    EQUITY: "bg-blue-50 text-blue-700",
    INCOME: "bg-brand-50 text-brand-700",
    EXPENSE: "bg-amber-50 text-amber-700",
};

export type AccountRow = {
    id: number;
    eid: string;
    code: string;
    name: string;
    type: string;
    isActive: boolean;
};

type PageResult = {
    data: AccountRow[];
    total: number;
    page: number;
    totalPages: number;
};

export function AccountsList({
    deleteAction,
    toggleAction,
}: {
    deleteAction: (eid: string) => Promise<void>;
    toggleAction: (eid: string) => Promise<void>;
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
        fetch(`/api/accounts?page=${p}&limit=${PAGE_SIZE}`)
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

    const handleToggle = (eid: string) => {
        startTransition(async () => {
            await toggleAction(eid);
            fetchPage(page);
        });
    };

    return (
        <div>
            <PageHeader
                title={t("accounts")}
                subtitle={t("accountsSubtitle")}
                action={
                    <Link href="/accounts/new" className="btn-primary">
                        <IconPlus className="w-4 h-4 mr-1" />
                        {t("new")}
                    </Link>
                }
            />
            <div className="card p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="th">{t("code")}</th>
                            <th className="th">{t("name")}</th>
                            <th className="th">{t("type")}</th>
                            <th className="th">{t("status")}</th>
                            <th className="th text-right">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={PAGE_SIZE} cols={5} />
                        ) : result.data.length === 0 ? (
                            <tr>
                                <td className="td text-gray-400" colSpan={5}>
                                    {t("noAccounts")}
                                </td>
                            </tr>
                        ) : (
                            result.data.map((a) => (
                                <tr key={a.id} className="hover:bg-gray-50">
                                    <td className="td font-mono">{a.code}</td>
                                    <td className="td">{a.name}</td>
                                    <td className="td">
                                        <span className={`badge ${typeColor[a.type]}`}>
                                            {a.type}
                                        </span>
                                    </td>
                                    <td className="td">
                                        <button
                                            disabled={isPending}
                                            onClick={() => handleToggle(a.eid)}
                                            className="cursor-pointer"
                                            title={t("toggleStatus")}
                                        >
                                            {a.isActive ? (
                                                <span className="badge bg-emerald-50 text-emerald-700 hover:opacity-80">
                                                    {t("active")}
                                                </span>
                                            ) : (
                                                <span className="badge bg-gray-100 text-gray-500 hover:opacity-80">
                                                    {t("inactive")}
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="td text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <button
                                                disabled={isPending}
                                                onClick={() => handleToggle(a.eid)}
                                                className={cls(
                                                    "icon-btn tip",
                                                    a.isActive
                                                        ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                )}
                                                data-tip={a.isActive ? t("inactive") : t("active")}
                                            >
                                                <IconPower className="w-4 h-4" />
                                            </button>
                                            <Link
                                                href={`/accounts/${a.eid}/edit`}
                                                className="icon-btn icon-btn-brand tip"
                                                data-tip={t("edit")}
                                            >
                                                <IconEdit className="w-4 h-4" />
                                            </Link>
                                            <DeleteButton
                                                action={() => handleDelete(a.eid)}
                                                label={t("deleteAccount")}
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
