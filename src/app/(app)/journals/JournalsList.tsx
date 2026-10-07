"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DeleteButton } from "@/components/DeleteButton";
import { IconPlus } from "@/components/icons";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { useLang } from "@/lib/context";

const PAGE_SIZE = 10;

export type JournalRow = {
    id: number;
    refNo: string;
    date: string;
    description: string | null;
    source: string;
    eid: string;
};

type PageResult = {
    data: JournalRow[];
    total: number;
    page: number;
    totalPages: number;
};

export function JournalsList({
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
        fetch(`/api/journals?page=${p}&limit=${PAGE_SIZE}`)
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
                title={t("journals")}
                subtitle={t("journalsSubtitle")}
                action={
                    <Link href="/journals/new" className="btn-primary">
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
                            <th className="th">{t("date")}</th>
                            <th className="th">{t("description")}</th>
                            <th className="th">Source</th>
                            <th className="th text-right">{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableSkeleton rows={PAGE_SIZE} cols={5} />
                        ) : result.data.length === 0 ? (
                            <tr>
                                <td className="td text-gray-400" colSpan={5}>
                                    {t("noJournals")}
                                </td>
                            </tr>
                        ) : (
                            result.data.map((j) => (
                                <tr key={j.id} className="hover:bg-gray-50">
                                    <td className="td font-mono">{j.refNo}</td>
                                    <td className="td">{j.date}</td>
                                    <td className="td">{j.description ?? "-"}</td>
                                    <td className="td">
                                        <span className="badge bg-gray-100 text-gray-600">
                                            {j.source}
                                        </span>
                                    </td>
                                    <td className="td text-right">
                                        <div className="inline-flex items-center justify-end">
                                            <DeleteButton
                                                action={() => handleDelete(j.eid)}
                                                label={t("deleteJournal")}
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
