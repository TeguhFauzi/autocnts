"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { money } from "@/lib/utils";
import {
    IconInvoice,
    IconBill,
    IconJournal,
    IconReports,
    IconCustomers,
    IconSupplier,
    IconStock,
    IconTrend,
} from "@/components/icons";
import { SalesChart, type SalesPoint } from "@/components/SalesChart";
import { useLang } from "@/lib/context";

type Stats = {
    ar: string;
    ap: string;
    sales: string;
    customers: number;
    suppliers: number;
    items: number;
    chart: SalesPoint[];
};

type Tone = "brand" | "green" | "red" | "amber";

const toneMap: Record<
    Tone,
    { icon: string; ring: string; value: string }
> = {
    brand: {
        icon: "bg-brand-50 text-brand-600",
        ring: "ring-brand-100",
        value: "text-gray-800",
    },
    green: {
        icon: "bg-emerald-50 text-emerald-600",
        ring: "ring-emerald-100",
        value: "text-gray-800",
    },
    red: {
        icon: "bg-red-50 text-red-600",
        ring: "ring-red-100",
        value: "text-gray-800",
    },
    amber: {
        icon: "bg-amber-50 text-amber-600",
        ring: "ring-amber-100",
        value: "text-gray-800",
    },
};

function StatCard({
    label,
    value,
    tone = "brand",
    Icon,
}: {
    label: string;
    value: string;
    tone?: Tone;
    Icon: (props: { className?: string }) => JSX.Element;
}) {
    const t = toneMap[tone];
    return (
        <div className="card flex items-start justify-between">
            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    {label}
                </div>
                <div className={`text-2xl font-bold mt-2 ${t.value}`}>
                    {value}
                </div>
            </div>
            <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ring-4 ${t.icon} ${t.ring}`}
            >
                <Icon className="w-5 h-5" />
            </div>
        </div>
    );
}

export function DashboardView({ s }: { s?: Stats }) {
    const { t } = useLang();

    const stats = s ?? {
        ar: "0",
        ap: "0",
        sales: "0",
        customers: 0,
        suppliers: 0,
        items: 0,
        chart: [],
    };

    const quick = [
        { href: "/invoices/new", label: t("newInvoice"), Icon: IconInvoice },
        { href: "/bills/new", label: t("newBill"), Icon: IconBill },
        { href: "/journals/new", label: t("newJournal"), Icon: IconJournal },
        { href: "/reports", label: t("viewReports"), Icon: IconReports },
    ];

    return (
        <div className="animate-in">
            <PageHeader title={t("dashboard")} subtitle={t("financialOverview")} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    label={t("totalSales")}
                    value={money(stats.sales)}
                    tone="brand"
                    Icon={IconTrend}
                />
                <StatCard
                    label={t("receivable")}
                    value={money(stats.ar)}
                    tone="green"
                    Icon={IconInvoice}
                />
                <StatCard
                    label={t("payable")}
                    value={money(stats.ap)}
                    tone="red"
                    Icon={IconBill}
                />
                <StatCard
                    label={t("customers")}
                    value={String(stats.customers)}
                    tone="brand"
                    Icon={IconCustomers}
                />
                <StatCard
                    label={t("suppliers")}
                    value={String(stats.suppliers)}
                    tone="amber"
                    Icon={IconSupplier}
                />
                <StatCard
                    label={t("stockItems")}
                    value={String(stats.items)}
                    tone="brand"
                    Icon={IconStock}
                />
            </div>

            <div className="mt-8 card">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-700">
                            {t("salesTrend")}
                        </h3>
                        <p className="text-xs text-gray-400">
                            {t("monthlyInvoicedSales")}
                        </p>
                    </div>
                    <span className="badge bg-brand-50 text-brand-600">
                        <IconTrend className="w-3.5 h-3.5" />
                        {t("totalSales")}
                    </span>
                </div>
                <SalesChart data={stats.chart || []} />
            </div>

            <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                    {t("quickActions")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quick.map((q) => {
                        const Icon = q.Icon;
                        return (
                            <Link
                                key={q.href}
                                href={q.href}
                                className="card group flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-150"
                                style={{ transitionProperty: "transform, box-shadow" }}
                            >
                                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-700">
                                        {q.label}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
