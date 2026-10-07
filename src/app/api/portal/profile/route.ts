import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    const session = await getServerSession(authOptions);
    const customerId = (session?.user as any)?.customerId;
    if (!customerId) return NextResponse.json({ error: "No customer linked" }, { status: 404 });
    const [cust] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (!cust) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ customer: cust });
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const customerId = (session?.user as any)?.customerId;
    if (!customerId) return NextResponse.json({ error: "No customer linked" }, { status: 404 });
    const b = await req.json();
    const [cust] = await db
        .update(customers)
        .set({
            name: b.name,
            email: b.email,
            phone: b.phone,
            address: b.address,
        })
        .where(eq(customers.id, customerId))
        .returning();
    return NextResponse.json({ customer: cust });
}
