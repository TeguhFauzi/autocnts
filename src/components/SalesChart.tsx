"use client";

import { money } from "@/lib/utils";

export type SalesPoint = { label: string; value: number };

export function SalesChart({ data }: { data: SalesPoint[] }) {
    const chartData = data ?? [];
    const hasData = Array.isArray(chartData) && chartData.length > 0 && chartData.some((d) => d && d.value > 0);

    if (!hasData) {
        return (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                Belum ada data penjualan.
            </div>
        );
    }

    const maxValue = Math.max(...chartData.map((d) => d.value), 1);

    return (
        <div className="h-64 flex flex-col justify-end pt-6">
            <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {chartData.map((item, idx) => {
                    const heightPercent = Math.max(12, Math.round((item.value / maxValue) * 100));
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Hover tooltip */}
                            <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[11px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap shadow-md z-10">
                                {money(item.value)}
                            </div>
                            {/* Bar */}
                            <div
                                style={{ height: `${heightPercent}%` }}
                                className="w-full max-w-[42px] bg-gradient-to-t from-brand-600 to-brand-400 dark:from-brand-700 dark:to-brand-500 rounded-t-lg group-hover:from-indigo-500 group-hover:to-brand-400 transition-all duration-300 shadow-xs"
                            />
                            {/* Label */}
                            <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
