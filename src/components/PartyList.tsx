"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { IconEdit, IconPlus, IconBan } from "@/components/icons";
import { DeleteButton } from "@/components/DeleteButton";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { useLang } from "@/lib/context";
import { cls } from "@/lib/utils";

const PAGE_SIZE = 10;

export type PartyRow = {
    id: number;
    eid: string;
    code: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
};

type PageResult = {
    data: PartyRow[];
    total: number;
    page: number;
    totalPages: number;
};

export function PartyList({
    title,
    subtitle,
    basePath,
    apiPath,
    deleteAction,
    deleteLabelKey,
}: {
    title: string;
    subtitle: string;
    basePath: string;
    apiPath: string;
    deleteAction: (eid: string) => Promise<void>;
    deleteLabelKey: string;
}) {
    const { t } = useLang();
    const [isPending, startTransition] = useTransition();
    const [disabledIds, setDisabledIds] = useState<Record<number, boolean>>({});
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<PageResult>({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);

    const isCustomer = basePath.includes("customers");
    const displayTitle = isCustomer ? t("customers") : t("suppliers");
    const displaySubtitle = isCustomer ? t("customersSubtitle") : t("suppliersSubtitle");

    const fetchPage = (p: number) => {
        setLoading(true);
        fetch(`${apiPath}?page=${p}&limit=${PAGE_SIZE}`)
            .then((r) => r.json())
            .then((res: PageResult) => {
                setResult(res);
                setPage(p);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPage(1);
    }, [apiPath]);

    const toggleParty = (id: number) => {
        setDisabledIds((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = (eid: string) => {
        startTransition(async () => {
            await deleteAction(eid);
            fetchPage(page);
        });
    };

    return (
        <div>
            <PageHeader
                title={displayTitle}
                subtitle={displaySubtitle}
                action={
                    <Link href={`${basePath}/new`} className="btn-primary">
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
                            <th className="th">{t("contact")}</th>
                            <th className="th text-right">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={PAGE_SIZE} cols={4} />
                        ) : result.data.length === 0 ? (
                            <tr>
                                <td className="td text-gray-400" colSpan={4}>
                                    {t("noRecords")}
                                </td>
                            </tr>
                        ) : (
                            result.data.map((p) => {
                                const isInactive = disabledIds[p.id];
                                return (
                                    <tr
                                        key={p.id}
                                        className={cls(
                                            "hover:bg-gray-50 transition-opacity",
                                            isInactive && "opacity-50"
                                        )}
                                    >
                                        <td className="td font-mono">{p.code}</td>
                                        <td className="td">
                                            <div className="font-medium flex items-center gap-2">
                                                {p.name}
                                                {isInactive && (
                                                    <span className="badge bg-gray-100 text-gray-500 text-[10px]">
                                                        {t("inactive")}
                                                    </span>
                                                )}
                                            </div>
                                            {p.address && (
                                                <div className="text-xs text-gray-400">
                                                    {p.address}
                                                </div>
                                            )}
                                        </td>
                                        <td className="td text-sm text-gray-500">
                                            {p.email && <div>{p.email}</div>}
                                            {p.phone && <div>{p.phone}</div>}
                                        </td>
                                        <td className="td text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleParty(p.id)}
                                                    className={cls(
                                                        "icon-btn tip",
                                                        isInactive
                                                            ? "text-amber-500 hover:bg-amber-50"
                                                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                    )}
                                                    data-tip={isInactive ? t("active") : t("inactive")}
                                                >
                                                    <IconBan className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`${basePath}/${p.eid}/edit`}
                                                    className="icon-btn icon-btn-brand tip"
                                                    data-tip={t("edit")}
                                                >
                                                    <IconEdit className="w-4 h-4" />
                                                </Link>
                                                <DeleteButton
                                                    action={() => handleDelete(p.eid)}
                                                    label={t(deleteLabelKey)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
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
