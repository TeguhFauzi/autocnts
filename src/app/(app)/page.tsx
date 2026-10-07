import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import {
    invoices,
    bills,
    customers,
    suppliers,
    items,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

async function getStats() {
    const [arRows] = await db
        .select({ v: sql<string>`coalesce(sum(${invoices.total}::numeric - ${invoices.paid}::numeric),0)` })
        .from(invoices);
    const [apRows] = await db
        .select({ v: sql<string>`coalesce(sum(${bills.total}::numeric - ${bills.paid}::numeric),0)` })
        .from(bills);
    const [salesRows] = await db
        .select({ v: sql<string>`coalesce(sum(${invoices.total}::numeric),0)` })
        .from(invoices);
    const [custCount] = await db
        .select({ v: sql<number>`count(*)::int` })
        .from(customers);
    const [suppCount] = await db
        .select({ v: sql<number>`count(*)::int` })
        .from(suppliers);
    const [itemCount] = await db
        .select({ v: sql<number>`count(*)::int` })
        .from(items);

    const monthly = await db
        .select({
            m: sql<string>`to_char(${invoices.date}::date, 'YYYY-MM')`,
            v: sql<string>`coalesce(sum(${invoices.total}),0)`,
        })
        .from(invoices)
        .groupBy(sql`to_char(${invoices.date}::date, 'YYYY-MM')`)
        .orderBy(sql`to_char(${invoices.date}::date, 'YYYY-MM')`);

    const chart = (monthly || []).map((r) => ({
        label: r.m,
        value: Number(r.v),
    }));

    return {
        ar: arRows?.v ?? "0",
        ap: apRows?.v ?? "0",
        sales: salesRows?.v ?? "0",
        customers: custCount?.v ?? 0,
        suppliers: suppCount?.v ?? 0,
        items: itemCount?.v ?? 0,
        chart: chart ?? [],
    };
}

export default async function Dashboard() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role === "customer") {
        redirect("/portal");
    }

    let s;
    try {
        s = await getStats();
    } catch (e) {
        console.error("Dashboard getStats error:", e);
        s = {
            ar: "0",
            ap: "0",
            sales: "0",
            customers: 0,
            suppliers: 0,
            items: 0,
            chart: [],
        };
    }
    return <DashboardView s={s} />;
}

