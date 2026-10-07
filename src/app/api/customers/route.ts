import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { sql } from "drizzle-orm";
import { encryptId } from "@/lib/crypto";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const offset = (page - 1) * limit;

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers);

    const rows = await db
        .select()
        .from(customers)
        .orderBy(customers.code)
        .limit(limit)
        .offset(offset);

    return NextResponse.json({
        data: rows.map((r) => ({ ...r, eid: encryptId(r.id) })),
        total: count,
        page,
        totalPages: Math.ceil(count / limit) || 1,
    });
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    if (!b.code || !b.name) {
        return NextResponse.json(
            { error: "code and name are required" },
            { status: 400 }
        );
    }
    const [row] = await db
        .insert(customers)
        .values({
            code: b.code,
            name: b.name,
            email: b.email ?? null,
            phone: b.phone ?? null,
            address: b.address ?? null,
        })
        .returning();
    return NextResponse.json({ ...row, eid: encryptId(row.id) }, { status: 201 });
}
