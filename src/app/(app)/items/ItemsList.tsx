"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { money, cls } from "@/lib/utils";
import { IconEdit, IconPlus, IconBan } from "@/components/icons";
import { DeleteButton } from "@/components/DeleteButton";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { useLang } from "@/lib/context";

const PAGE_SIZE = 10;

export type ItemRow = {
    id: number;
    eid: string;
    code: string;
    name: string;
    uom: string;
    price: string;
    cost: string;
    qtyOnHand: number;
};

type PageResult = {
    data: ItemRow[];
    total: number;
    page: number;
    totalPages: number;
};

export function ItemsList({
    deleteAction,
}: {
    deleteAction: (eid: string) => Promise<void>;
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

    const fetchPage = (p: number) => {
        setLoading(true);
        fetch(`/api/items?page=${p}&limit=${PAGE_SIZE}`)
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                return r.json();
            })
            .then((res: PageResult) => {
                setResult(res);
                setPage(p);
            })
            .catch((err) => {
                console.error("Failed to fetch items:", err);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPage(1);
    }, []);

    const toggleItem = (id: number) => {
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
                title={t("items")}
                subtitle={t("itemsSubtitle")}
                action={
                    <Link href="/items/new" className="btn-primary">
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
                            <th className="th text-right">{t("price")}</th>
                            <th className="th text-right">{t("cost")}</th>
                            <th className="th text-right">{t("stock")}</th>
                            <th className="th text-right">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={PAGE_SIZE} cols={6} />
                        ) : result.data.length === 0 ? (
                            <tr>
                                <td className="td text-gray-400" colSpan={6}>
                                    {t("noItems")}
                                </td>
                            </tr>
                        ) : (
                            result.data.map((it) => {
                                const isInactive = disabledIds[it.id];
                                return (
                                    <tr
                                        key={it.id}
                                        className={cls(
                                            "hover:bg-gray-50 transition-opacity",
                                            isInactive && "opacity-50"
                                        )}
                                    >
                                        <td className="td font-mono">{it.code}</td>
                                        <td className="td">
                                            <div className="font-medium flex items-center gap-2">
                                                {it.name}
                                                {isInactive && (
                                                    <span className="badge bg-gray-100 text-gray-500 text-[10px]">
                                                        {t("inactive")}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {it.uom}
                                            </div>
                                        </td>
                                        <td className="td text-right">{money(it.price)}</td>
                                        <td className="td text-right">{money(it.cost)}</td>
                                        <td className="td text-right">{it.qtyOnHand}</td>
                                        <td className="td text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleItem(it.id)}
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
                                                    href={`/items/${it.eid}/edit`}
                                                    className="icon-btn icon-btn-brand tip"
                                                    data-tip={t("edit")}
                                                >
                                                    <IconEdit className="w-4 h-4" />
                                                </Link>
                                                <DeleteButton
                                                    action={() => handleDelete(it.eid)}
                                                    label={t("deleteItem")}
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
