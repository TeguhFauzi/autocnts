"use client";

import { useState } from "react";
import { money } from "@/lib/utils";
import { useLang } from "@/lib/context";

interface SmartPlannerProps {
    currentIncome: number;
    currentExpense: number;
    currentAssets: number;
    currentLiabs: number;
}

export function SmartPlanner({
    currentIncome,
    currentExpense,
    currentAssets,
    currentLiabs,
}: SmartPlannerProps) {
    const { t } = useLang();
    const currentProfit = currentIncome - currentExpense;

    // Inputs
    const [targetProfit, setTargetProfit] = useState<number>(
        currentProfit > 0 ? Math.round(currentProfit * 1.25) : 50000000
    );
    const [targetMonths, setTargetMonths] = useState<number>(3);
    const [expenseReductionPct, setExpenseReductionPct] = useState<number>(10);

    // Smart calculation logic
    const profitShortfall = Math.max(0, targetProfit - currentProfit);
    
    const neededIncomeNoCostChange = currentExpense + targetProfit;
    const incomeIncreaseNeeded = Math.max(0, neededIncomeNoCostChange - currentIncome);

    const optimizedExpense = currentExpense * (1 - expenseReductionPct / 100);
    const neededIncomeOptimized = optimizedExpense + targetProfit;
    const monthlyExtraSalesNeeded =
        targetMonths > 0 ? Math.ceil(incomeIncreaseNeeded / targetMonths) : incomeIncreaseNeeded;

    // Financial Health Indicators
    const currentRatio = currentLiabs > 0 ? (currentAssets / currentLiabs).toFixed(2) : "N/A";
    const profitMargin = currentIncome > 0 ? ((currentProfit / currentIncome) * 100).toFixed(1) : "0";

    // Chart max height generator
    const maxVal = Math.max(currentIncome, neededIncomeNoCostChange, neededIncomeOptimized, 1);
    const getBarHeight = (val: number) => `${Math.min(100, Math.max(10, Math.round((val / maxVal) * 100)))}%`;

    return (
        <div className="card mb-8 border border-brand-100 dark:border-brand-900/40 bg-gradient-to-br from-white via-brand-50/10 to-indigo-50/20 dark:from-slate-800 dark:to-slate-900 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-slate-700 gap-2">
                <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 mb-1">
                        <span>✨ {t("smartPlannerTitle")}</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                        {t("smartPlannerSub")}
                    </h2>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xs">
                        <span className="text-gray-400 block">Current Ratio</span>
                        <span className="font-bold text-gray-700 dark:text-slate-200">{currentRatio}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xs">
                        <span className="text-gray-400 block">Profit Margin</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{profitMargin}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Control Panel (Target Parameters) */}
                <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {t("financialParams")}
                    </h3>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                            {t("targetNetProfit")}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={targetProfit}
                                onChange={(e) => setTargetProfit(Number(e.target.value) || 0)}
                                className="input font-semibold text-brand-600 text-base pl-8"
                            />
                            <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">Rp</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                                {t("timeframeMonths")}
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={24}
                                value={targetMonths}
                                onChange={(e) => setTargetMonths(Number(e.target.value) || 1)}
                                className="input font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-slate-300 mb-1">
                                {t("expenseEfficiency")}
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={50}
                                value={expenseReductionPct}
                                onChange={(e) => setExpenseReductionPct(Number(e.target.value) || 0)}
                                className="input font-semibold"
                            />
                        </div>
                    </div>

                    {/* Recommendations Box */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-brand-100 dark:border-slate-700/80 shadow-xs space-y-3">
                        <div className="text-xs font-bold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                            <span className="text-amber-500">💡</span> {t("strategicRecs")}
                        </div>
                        <ul className="text-xs space-y-2 text-gray-600 dark:text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-brand-500 font-bold">•</span>
                                <span>
                                    {t("addSalesNeeded")} <strong>{money(monthlyExtraSalesNeeded)}{t("perMonth")}</strong> {t("overNext")} {targetMonths} {t("months")}
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>
                                    {t("costEfficiencyNote")} <strong>{money(optimizedExpense)}</strong>.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Visual Analysis Chart & Comparisons */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                            {t("visualAnalysisTitle")}
                        </h3>

                        {/* Custom Animated Bar Chart */}
                        <div className="h-44 flex items-end justify-around border-b border-gray-200 dark:border-slate-700 pb-2 px-4 gap-4">
                            {/* Bar 1: Current Income */}
                            <div className="flex-1 flex flex-col items-center h-full justify-end group">
                                <div className="text-[11px] font-bold text-gray-500 mb-1">
                                    {money(currentIncome)}
                                </div>
                                <div
                                    className="w-full max-w-[56px] bg-slate-300 dark:bg-slate-600 rounded-t-lg transition-all duration-300 group-hover:opacity-90"
                                    style={{ height: getBarHeight(currentIncome) }}
                                />
                                <span className="text-[11px] font-medium text-gray-500 mt-2 text-center">
                                    {t("currentIncomeLabel")}
                                </span>
                            </div>

                            {/* Bar 2: Target (Standard) */}
                            <div className="flex-1 flex flex-col items-center h-full justify-end group">
                                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                    {money(neededIncomeNoCostChange)}
                                </div>
                                <div
                                    className="w-full max-w-[56px] bg-indigo-500 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-600"
                                    style={{ height: getBarHeight(neededIncomeNoCostChange) }}
                                />
                                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-2 text-center">
                                    {t("targetStandardLabel")}
                                </span>
                            </div>

                            {/* Bar 3: Target (Optimized) */}
                            <div className="flex-1 flex flex-col items-center h-full justify-end group">
                                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                    {money(neededIncomeOptimized)}
                                </div>
                                <div
                                    className="w-full max-w-[56px] bg-emerald-500 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600"
                                    style={{ height: getBarHeight(neededIncomeOptimized) }}
                                />
                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-2 text-center">
                                    {t("targetOptimizedLabel")} ({expenseReductionPct}%)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                            {t("profitGap")}: <strong className="text-gray-700 dark:text-slate-200">{money(profitShortfall)}</strong>
                        </span>
                        <span className="text-brand-600 dark:text-brand-400 font-semibold">
                            {t("targetProfitLabel")}: {money(targetProfit)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
