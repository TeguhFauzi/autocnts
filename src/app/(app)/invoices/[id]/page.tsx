import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { invoices, invoiceLines, customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { money } from "@/lib/utils";
import { decryptId } from "@/lib/crypto";
import { ReceiptForm } from "./ReceiptForm";

import { PDFDownloadButton } from "@/components/PDFDownloadButton";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
    PAID: "bg-emerald-50 text-emerald-700",
    PARTIAL: "bg-amber-50 text-amber-700",
    UNPAID: "bg-red-50 text-red-700",
};

export default async function InvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: eid } = await params;
    const id = decryptId(eid);
    if (Number.isNaN(id)) notFound();

    const [header] = await db
        .select({
            id: invoices.id,
            docNo: invoices.docNo,
            date: invoices.date,
            dueDate: invoices.dueDate,
            total: invoices.total,
            paid: invoices.paid,
            status: invoices.status,
            notes: invoices.notes,
            customerName: customers.name,
        })
        .from(invoices)
        .leftJoin(customers, eq(invoices.customerId, customers.id))
        .where(eq(invoices.id, id))
        .limit(1);
    if (!header) notFound();

    const lines = await db
        .select()
        .from(invoiceLines)
        .where(eq(invoiceLines.invoiceId, id));

    const outstanding = Number(header.total) - Number(header.paid);

    return (
        <div>
            <PageHeader
                title={`Invoice ${header.docNo}`}
                subtitle={header.customerName ?? ""}
                action={
                    <div className="flex items-center gap-2">
                        <PDFDownloadButton eid={eid} docNo={header.docNo} />
                        <Link href="/invoices" className="btn-ghost">
                            ← Kembali
                        </Link>
                    </div>
                }
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-0 overflow-hidden">
                    <div className="p-5 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            <div>Date: {header.date}</div>
                            {header.dueDate && <div>Due: {header.dueDate}</div>}
                        </div>
                        <span className={`badge ${statusColor[header.status]}`}>
                            {header.status}
                        </span>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th">Description</th>
                                <th className="th text-right">Qty</th>
                                <th className="th text-right">Price</th>
                                <th className="th text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((l) => (
                                <tr key={l.id}>
                                    <td className="td">{l.description}</td>
                                    <td className="td text-right">{l.qty}</td>
                                    <td className="td text-right">{money(l.price)}</td>
                                    <td className="td text-right">{money(l.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-semibold">
                                <td className="td text-right" colSpan={3}>
                                    Total
                                </td>
                                <td className="td text-right">{money(header.total)}</td>
                            </tr>
                            <tr>
                                <td className="td text-right text-gray-500" colSpan={3}>
                                    Paid
                                </td>
                                <td className="td text-right text-emerald-600">
                                    {money(header.paid)}
                                </td>
                            </tr>
                            <tr className="font-semibold">
                                <td className="td text-right" colSpan={3}>
                                    Outstanding
                                </td>
                                <td className="td text-right text-red-600">
                                    {money(outstanding)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    {header.notes && (
                        <div className="p-5 text-sm text-gray-500 border-t border-gray-100">
                            Notes: {header.notes}
                        </div>
                    )}
                </div>

                <div>
                    <div className="card space-y-3">
                        <div className="font-semibold text-gray-700">Record Receipt</div>
                        {header.status === "PAID" ? (
                            <div className="text-sm text-emerald-600">
                                Invoice fully paid ✓
                            </div>
                        ) : (
                            <ReceiptForm eid={eid} outstanding={outstanding} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
