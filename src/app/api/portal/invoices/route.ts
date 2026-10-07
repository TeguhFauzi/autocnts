import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { customers, invoices } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const sessionCustomerId = (session?.user as any)?.customerId;

    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 10)));
    const status = req.nextUrl.searchParams.get("status");
    const offset = (page - 1) * limit;

    let cust;
    if (role === "customer") {
        if (!sessionCustomerId) return NextResponse.json({ invoices: [], data: [], total: 0, page, totalPages: 1 });
        [cust] = await db.select().from(customers).where(eq(customers.id, sessionCustomerId)).limit(1);
    } else {
        const code = req.nextUrl.searchParams.get("code");
        if (code) {
            [cust] = await db.select().from(customers).where(eq(customers.code, code)).limit(1);
        }
    }

    if (!cust) {
        return NextResponse.json({ invoices: [], data: [], total: 0, page, totalPages: 1, customer: null });
    }

    const where = status
        ? and(eq(invoices.customerId, cust.id), eq(invoices.status, status))
        : eq(invoices.customerId, cust.id);

    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(invoices).where(where);
    const rows = await db.select().from(invoices).where(where).orderBy(invoices.id).limit(limit).offset(offset);

    const [summary] = await db
        .select({
            unpaidCount: sql<number>`count(*) filter (where ${invoices.status} <> 'PAID')::int`,
            totalOutstanding: sql<string>`coalesce(sum(${invoices.total} - ${invoices.paid}) filter (where ${invoices.status} <> 'PAID'), 0)`,
        })
        .from(invoices)
        .where(eq(invoices.customerId, cust.id));

    return NextResponse.json({
        invoices: rows,
        data: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit) || 1,
        unpaidCount: summary?.unpaidCount ?? 0,
        totalOutstanding: Number(summary?.totalOutstanding ?? 0),
        customer: { code: cust.code, name: cust.name },
    });
}
