"use client";

import { useLang } from "@/lib/context";

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize = 10,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
}) {
    const { t } = useLang();

    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 text-xs">
            <div className="text-gray-500 dark:text-slate-400">
                {t("showing")} <span className="font-semibold text-gray-700 dark:text-slate-200">{from}</span> - <span className="font-semibold text-gray-700 dark:text-slate-200">{to}</span> {t("of")} <span className="font-semibold text-gray-700 dark:text-slate-200">{totalItems}</span> {t("entries")}
            </div>
            <div className="flex items-center gap-1.5">
                <button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                    {t("previous")}
                </button>
                <div className="px-3 py-1.5 font-medium text-gray-600 dark:text-slate-300">
                    {t("page")} {currentPage} {t("of")} {totalPages}
                </div>
                <button
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                    {t("next")}
                </button>
            </div>
        </div>
    );
}
