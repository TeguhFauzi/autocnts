import { recordNotification } from "@/lib/notifyStore";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { invoices, journals, journalLines, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const sessionCustomerId = (session?.user as any)?.customerId;

        const body = await req.json().catch(() => ({}));
        const { invoiceId } = body;
        if (!invoiceId) {
            return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
        }

        const [inv] = await db
            .select()
            .from(invoices)
            .where(eq(invoices.id, Number(invoiceId)))
            .limit(1);

        if (!inv) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Customer hanya boleh melunasi faktur miliknya sendiri
        if ((session?.user as any)?.role === "customer" && inv.customerId !== sessionCustomerId) {
            return NextResponse.json({ error: "Forbidden: bukan faktur milik Anda" }, { status: 403 });
        }

        const remaining = Number(inv.total) - Number(inv.paid);
        if (remaining <= 0) {
            return NextResponse.json({ error: "Faktur sudah lunas" }, { status: 400 });
        }
        const requested = body.amount ? Number(body.amount) : remaining;
        if (!requested || requested <= 0) {
            return NextResponse.json({ error: "amount tidak valid" }, { status: 400 });
        }
        const paidAmountNum = Math.min(requested, remaining);
        const paidAmount = String(paidAmountNum);
        const newPaid = Number(inv.paid) + paidAmountNum;
        const newStatus = newPaid >= Number(inv.total) ? "PAID" : "PARTIAL";

        // 1. Update invoice
        await db
            .update(invoices)
            .set({ paid: String(newPaid), status: newStatus })
            .where(eq(invoices.id, inv.id));

        // 2. Create automatic Journal Entry for Customer Settlement
        const refNo = `JV-PAY-${inv.docNo}-${Date.now()}`;
        let [jnl] = await db
            .select()
            .from(journals)
            .where(eq(journals.refNo, refNo))
            .limit(1);

        if (!jnl) {
            const accts = await db.select().from(accounts);
            const bankAcct = accts.find((a) => a.code === "1100") || accts[0];
            const salesAcct = accts.find((a) => a.code === "4000") || accts[0];

            [jnl] = await db
                .insert(journals)
                .values({
                    refNo,
                    date: new Date().toISOString().split("T")[0],
                    description: `Pelunasan Mandiri Faktur ${inv.docNo} via Customer Portal`,
                    source: "AR",
                })
                .returning();

            await db.insert(journalLines).values([
                {
                    journalId: jnl.id,
                    accountId: bankAcct.id,
                    debit: paidAmount,
                    credit: "0",
                    memo: `Penerimaan Pembayaran Customer ${inv.docNo}`,
                },
                {
                    journalId: jnl.id,
                    accountId: salesAcct.id,
                    debit: "0",
                    credit: paidAmount,
                    memo: `Pelunasan Faktur ${inv.docNo}`,
                },
            ]);
        }

        recordNotification("admin", "Pembayaran Masuk", `Faktur ${inv.docNo} sebesar ${paidAmount} dilunasi.`);
        recordNotification("accountant", "Penerimaan Kas", `Pembayaran faktur ${inv.docNo} tercatat.`);
        recordNotification("sales", "Pembayaran Customer", `Faktur ${inv.docNo} telah dilunasi.`);
        return NextResponse.json({
            success: true,
            docNo: inv.docNo,
            paidAmount,
            status: newStatus,
        });
    } catch (err: any) {
        console.error("Portal Pay error:", err);
        return NextResponse.json({ error: err.message || "Payment processing failed" }, { status: 500 });
    }
}
