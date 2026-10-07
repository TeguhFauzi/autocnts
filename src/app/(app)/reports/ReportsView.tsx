"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { TableSkeleton } from "@/components/TableSkeleton";
import { SmartPlanner } from "@/components/SmartPlanner";
import { money } from "@/lib/utils";
import { useLang } from "@/lib/context";

const PAGE_SIZE = 5;

export type AcctBalance = {
    id: number;
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
    balance: number;
};

interface SectionState {
    data: AcctBalance[];
    page: number;
    totalPages: number;
    totalItems: number;
    loading: boolean;
}

export function ReportsView() {
    const { t } = useLang();

    const [tb, setTb] = useState<SectionState>({ data: [], page: 1, totalPages: 1, totalItems: 0, loading: true });
    const [inc, setInc] = useState<SectionState>({ data: [], page: 1, totalPages: 1, totalItems: 0, loading: true });
    const [exp, setExp] = useState<SectionState>({ data: [], page: 1, totalPages: 1, totalItems: 0, loading: true });
    const [ast, setAst] = useState<SectionState>({ data: [], page: 1, totalPages: 1, totalItems: 0, loading: true });
    const [lib, setLib] = useState<SectionState>({ data: [], page: 1, totalPages: 1, totalItems: 0, loading: true });
    const [eq, setEq] = useState<SectionState>({ data: [], page: 1, totalPages: 1, totalItems: 0, loading: true });

    // Totals/Summary state
    const [summary, setSummary] = useState({
        totalDebit: 0,
        totalCredit: 0,
        totalIncome: 0,
        totalExpense: 0,
        totalAssets: 0,
        totalLiabs: 0,
        totalEquity: 0,
    });

    const fetchSection = useCallback(async (section: string, page: number) => {
        const res = await fetch(`/api/reports?section=${section}&page=1&limit=500`);
        const json = await res.json();
        return json;
    }, []);

    const fetchSummary = useCallback(async () => {
        const res = await fetch(`/api/reports?section=all&limit=500`);
        const json = await res.json();
        const balances: AcctBalance[] = json.data || [];

        const totalDebit = balances.reduce((s, b) => s + b.debit, 0);
        const totalCredit = balances.reduce((s, b) => s + b.credit, 0);
        const totalIncome = balances.filter((b) => b.type === "INCOME").reduce((s, b) => s + b.balance, 0);
        const totalExpense = balances.filter((b) => b.type === "EXPENSE").reduce((s, b) => s + b.balance, 0);
        const totalAssets = balances.filter((b) => b.type === "ASSET").reduce((s, b) => s + b.balance, 0);
        const totalLiabs = balances.filter((b) => b.type === "LIABILITY").reduce((s, b) => s + b.balance, 0);
        const totalEquity = balances.filter((b) => b.type === "EQUITY").reduce((s, b) => s + b.balance, 0);

        setSummary({
            totalDebit,
            totalCredit,
            totalIncome,
            totalExpense,
            totalAssets,
            totalLiabs,
            totalEquity,
        });
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // Fetch Trial Balance
    useEffect(() => {
        setTb((prev) => ({ ...prev, loading: true }));
        fetch(`/api/reports?section=all&page=${tb.page}&limit=${PAGE_SIZE}`)
            .then((r) => r.json())
            .then((res) => {
                setTb((prev) => ({
                    ...prev,
                    data: res.data || [],
                    totalPages: res.totalPages || 1,
                    totalItems: res.total || 0,
                    loading: false,
                }));
            });
    }, [tb.page, fetchSection]);

    // Fetch Income
    useEffect(() => {
        setInc((prev) => ({ ...prev, loading: true }));
        fetchSection("income", inc.page).then((res) => {
            setInc((prev) => ({
                ...prev,
                data: res.data || [],
                totalPages: res.totalPages || 1,
                totalItems: res.total || 0,
                loading: false,
            }));
        });
    }, [inc.page, fetchSection]);

    // Fetch Expense
    useEffect(() => {
        setExp((prev) => ({ ...prev, loading: true }));
        fetchSection("expense", exp.page).then((res) => {
            setExp((prev) => ({
                ...prev,
                data: res.data || [],
                totalPages: res.totalPages || 1,
                totalItems: res.total || 0,
                loading: false,
            }));
        });
    }, [exp.page, fetchSection]);

    // Fetch Asset
    useEffect(() => {
        setAst((prev) => ({ ...prev, loading: true }));
        fetchSection("asset", ast.page).then((res) => {
            setAst((prev) => ({
                ...prev,
                data: res.data || [],
                totalPages: res.totalPages || 1,
                totalItems: res.total || 0,
                loading: false,
            }));
        });
    }, [ast.page, fetchSection]);

    // Fetch Liability
    useEffect(() => {
        setLib((prev) => ({ ...prev, loading: true }));
        fetchSection("liability", lib.page).then((res) => {
            setLib((prev) => ({
                ...prev,
                data: res.data || [],
                totalPages: res.totalPages || 1,
                totalItems: res.total || 0,
                loading: false,
            }));
        });
    }, [lib.page, fetchSection]);

    // Fetch Equity
    useEffect(() => {
        setEq((prev) => ({ ...prev, loading: true }));
        fetchSection("equity", eq.page).then((res) => {
            setEq((prev) => ({
                ...prev,
                data: res.data || [],
                totalPages: res.totalPages || 1,
                totalItems: res.total || 0,
                loading: false,
            }));
        });
    }, [eq.page, fetchSection]);

    const netProfit = summary.totalIncome - summary.totalExpense;

    return (
        <div>
            <PageHeader
                title={t("reports")}
                subtitle={t("reportsSubtitle")}
            />

            {/* ── Smart Planner & Advisor ─────────────────────────────────── */}
            <SmartPlanner
                currentIncome={summary.totalIncome}
                currentExpense={summary.totalExpense}
                currentAssets={summary.totalAssets}
                currentLiabs={summary.totalLiabs}
            />

            {/* ── Trial Balance ──────────────────────────────────────────── */}
            <div className="card p-0 overflow-hidden mb-6">
                <div className="p-4 font-semibold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700">
                    {t("trialBalance")}
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-800/60">
                        <tr>
                            <th className="th">{t("code")}</th>
                            <th className="th">{t("name")}</th>
                            <th className="th text-right">{t("debit")}</th>
                            <th className="th text-right">{t("credit")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tb.loading ? (
                            <TableSkeleton rows={PAGE_SIZE} cols={4} />
                        ) : tb.data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="td text-center text-gray-400 py-4">
                                    -
                                </td>
                            </tr>
                        ) : (
                            tb.data.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                    <td className="td font-mono">{b.code}</td>
                                    <td className="td">{b.name}</td>
                                    <td className="td text-right">
                                        {b.debit ? money(b.debit) : "-"}
                                    </td>
                                    <td className="td text-right">
                                        {b.credit ? money(b.credit) : "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="font-semibold bg-gray-50 dark:bg-slate-800/60">
                            <td className="td" colSpan={2}>Total</td>
                            <td className="td text-right">{money(summary.totalDebit)}</td>
                            <td className="td text-right">{money(summary.totalCredit)}</td>
                        </tr>
                    </tfoot>
                </table>
                <Pagination
                    currentPage={tb.page}
                    totalPages={tb.totalPages}
                    totalItems={tb.totalItems}
                    pageSize={PAGE_SIZE}
                    onPageChange={(p) => setTb((prev) => ({ ...prev, page: p }))}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── Profit & Loss ─────────────────────────────────────── */}
                <div className="card p-0 overflow-hidden">
                    <div className="p-4 font-semibold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700">
                        {t("profitAndLoss")}
                    </div>
                    <table className="w-full">
                        <tbody>
                            {/* Income section */}
                            <tr className="bg-gray-50 dark:bg-slate-800/60">
                                <td className="td font-semibold" colSpan={2}>
                                    {t("income")}
                                </td>
                            </tr>
                            {inc.loading ? (
                                <TableSkeleton rows={3} cols={2} />
                            ) : (
                                inc.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                        <td className="td pl-6">{b.name}</td>
                                        <td className="td text-right">{money(b.balance)}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="font-medium">
                                <td className="td pl-6">{t("totalIncome")}</td>
                                <td className="td text-right text-emerald-600">
                                    {money(summary.totalIncome)}
                                </td>
                            </tr>

                            {/* Expense section */}
                            <tr className="bg-gray-50 dark:bg-slate-800/60">
                                <td className="td font-semibold" colSpan={2}>
                                    {t("expenses")}
                                </td>
                            </tr>
                            {exp.loading ? (
                                <TableSkeleton rows={3} cols={2} />
                            ) : (
                                exp.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                        <td className="td pl-6">{b.name}</td>
                                        <td className="td text-right">{money(b.balance)}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="font-medium">
                                <td className="td pl-6">{t("totalExpenses")}</td>
                                <td className="td text-right text-red-600">
                                    {money(summary.totalExpense)}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-brand-50 dark:bg-brand-900/20">
                                <td className="td">{t("netProfit")}</td>
                                <td className={`td text-right ${netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                    {money(netProfit)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                </div>

                {/* ── Balance Sheet ─────────────────────────────────────── */}
                <div className="card p-0 overflow-hidden">
                    <div className="p-4 font-semibold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700">
                        {t("balanceSheet")}
                    </div>
                    <table className="w-full">
                        <tbody>
                            {/* Assets */}
                            <tr className="bg-gray-50 dark:bg-slate-800/60">
                                <td className="td font-semibold" colSpan={2}>{t("assets")}</td>
                            </tr>
                            {ast.loading ? (
                                <TableSkeleton rows={3} cols={2} />
                            ) : (
                                ast.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                        <td className="td pl-6">{b.name}</td>
                                        <td className="td text-right">{money(b.balance)}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="font-medium">
                                <td className="td pl-6">{t("totalAssets")}</td>
                                <td className="td text-right">{money(summary.totalAssets)}</td>
                            </tr>

                            {/* Liabilities */}
                            <tr className="bg-gray-50 dark:bg-slate-800/60">
                                <td className="td font-semibold" colSpan={2}>{t("liabilities")}</td>
                            </tr>
                            {lib.loading ? (
                                <TableSkeleton rows={3} cols={2} />
                            ) : (
                                lib.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                        <td className="td pl-6">{b.name}</td>
                                        <td className="td text-right">{money(b.balance)}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="font-medium">
                                <td className="td pl-6">{t("totalLiabilities")}</td>
                                <td className="td text-right">{money(summary.totalLiabs)}</td>
                            </tr>

                            {/* Equity */}
                            <tr className="bg-gray-50 dark:bg-slate-800/60">
                                <td className="td font-semibold" colSpan={2}>{t("equity")}</td>
                            </tr>
                            {eq.loading ? (
                                <TableSkeleton rows={3} cols={2} />
                            ) : (
                                eq.data.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                        <td className="td pl-6">{b.name}</td>
                                        <td className="td text-right">{money(b.balance)}</td>
                                    </tr>
                                ))
                            )}
                            <tr>
                                <td className="td pl-6">{t("currentEarnings")}</td>
                                <td className="td text-right">{money(netProfit)}</td>
                            </tr>
                            <tr className="font-medium">
                                <td className="td pl-6">{t("totalEquity")}</td>
                                <td className="td text-right">{money(summary.totalEquity + netProfit)}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-brand-50 dark:bg-brand-900/20">
                                <td className="td">{t("liabilitiesAndEquity")}</td>
                                <td className="td text-right">
                                    {money(summary.totalLiabs + summary.totalEquity + netProfit)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                </div>
            </div>
        </div>
    );
}

