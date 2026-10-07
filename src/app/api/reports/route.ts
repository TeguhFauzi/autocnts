import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, journalLines } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const section = searchParams.get("section") || "all";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") || "5", 10)));
        const offset = (page - 1) * limit;

        let typeFilter = undefined;
        if (section === "income") typeFilter = eq(accounts.type, "INCOME");
        else if (section === "expense") typeFilter = eq(accounts.type, "EXPENSE");
        else if (section === "asset") typeFilter = eq(accounts.type, "ASSET");
        else if (section === "liability") typeFilter = eq(accounts.type, "LIABILITY");
        else if (section === "equity") typeFilter = eq(accounts.type, "EQUITY");

        const rows = await db
            .select({
                id: accounts.id,
                code: accounts.code,
                name: accounts.name,
                type: accounts.type,
                debit: sql<string>`coalesce(sum(${journalLines.debit}),0)`,
                credit: sql<string>`coalesce(sum(${journalLines.credit}),0)`,
            })
            .from(accounts)
            .leftJoin(journalLines, eq(journalLines.accountId, accounts.id))
            .where(typeFilter)
            .groupBy(accounts.id, accounts.code, accounts.name, accounts.type)
            .orderBy(accounts.code)
            .limit(limit)
            .offset(offset);

        const [countRes] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(accounts)
            .where(typeFilter);

        const count = countRes?.count ?? 0;

        const data = rows.map((r) => {
            const debit = Number(r.debit);
            const credit = Number(r.credit);
            const normalDebit = r.type === "ASSET" || r.type === "EXPENSE";
            const balance = normalDebit ? debit - credit : credit - debit;
            return { id: r.id, code: r.code, name: r.name, type: r.type, debit, credit, balance };
        });

        return NextResponse.json({
            data,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit) || 1,
        });
    } catch (err: any) {
        console.error("GET /api/reports error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
