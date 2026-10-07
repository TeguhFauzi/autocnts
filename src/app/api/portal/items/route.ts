import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 10)));
        const offset = (page - 1) * limit;

        const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(items);
        const rows = await db.select().from(items).orderBy(items.code).limit(limit).offset(offset);

        return NextResponse.json({
            items: rows,
            data: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit) || 1,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
    }
}
