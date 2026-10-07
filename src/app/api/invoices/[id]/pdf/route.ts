import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, invoiceLines, customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptId } from "@/lib/crypto";
import { money } from "@/lib/utils";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eid } = await context.params;
        const id = decryptId(eid);
        if (Number.isNaN(id)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }

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
                customerEmail: customers.email,
                customerPhone: customers.phone,
                customerAddress: customers.address,
            })
            .from(invoices)
            .leftJoin(customers, eq(invoices.customerId, customers.id))
            .where(eq(invoices.id, id))
            .limit(1);

        if (!header) {
            return new NextResponse("Invoice Not Found", { status: 404 });
        }

        const lines = await db
            .select()
            .from(invoiceLines)
            .where(eq(invoiceLines.invoiceId, id));

        const outstanding = Number(header.total) - Number(header.paid);
        const isPaid = header.status === "PAID";

        const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>FAKTUR / INVOICE ${header.docNo}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #fff;
            padding: 40px;
            font-size: 13px;
            line-height: 1.5;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 24px;
            border-bottom: 2px solid #4f46e5;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #4f46e5;
            letter-spacing: -0.5px;
        }
        .company-info {
            text-align: right;
            font-size: 12px;
            color: #64748b;
        }
        .inv-title {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .inv-title h1 {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
        }
        .badge {
            display: inline-block;
            padding: 6px 14px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 9999px;
            text-transform: uppercase;
        }
        .badge-paid { background: #d1fae5; color: #047857; }
        .badge-partial { background: #fef3c7; color: #b45309; }
        .badge-unpaid { background: #fee2e2; color: #b91c1c; }
        .details-grid {
            display: flex;
            justify-content: space-between;
            margin-top: 32px;
            gap: 24px;
        }
        .detail-card {
            flex: 1;
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px 20px;
            border: 1px solid #f1f5f9;
        }
        .detail-card h4 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 8px;
            font-weight: 700;
        }
        .table-container {
            margin-top: 32px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: #4f46e5;
            color: #fff;
            text-align: left;
            padding: 12px 16px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }
        th:first-child { border-top-left-radius: 8px; }
        th:last-child { border-top-right-radius: 8px; text-align: right; }
        td {
            padding: 14px 16px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }
        td.text-right { text-align: right; }
        .summary-container {
            margin-top: 24px;
            display: flex;
            justify-content: flex-end;
        }
        .summary-box {
            width: 300px;
            background: #f8fafc;
            border-radius: 12px;
            padding: 16px 20px;
            border: 1px solid #e2e8f0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
        }
        .summary-total {
            border-top: 2px solid #cbd5e1;
            margin-top: 8px;
            padding-top: 10px;
            font-weight: 800;
            font-size: 15px;
            color: #4f46e5;
        }
        .footer {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #94a3b8;
            font-size: 11px;
        }
        .signature-box {
            margin-top: 32px;
            display: flex;
            justify-content: space-between;
            text-align: center;
        }
        .sig-space {
            height: 60px;
        }
        @media print {
            body { padding: 0; background: #fff; }
            .invoice-box { border: none; box-shadow: none; padding: 0; max-width: 100%; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div className="no-print" style="max-width: 800px; margin: 0 auto 20px auto; display: flex; justify-content: space-between; align-items: center;">
        <button onclick="window.history.back()" style="padding: 10px 18px; background: #e2e8f0; color: #334155; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
            ← Kembali
        </button>
        <button onclick="downloadPDF()" style="padding: 10px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
            📥 Download File .PDF
        </button>
    </div>

    <div class="invoice-box">
        <div class="header">
            <div>
                <div class="logo">⚡ AutoCount Pro</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Sistem Akuntansi & Pembukuan Digital</div>
            </div>
            <div class="company-info">
                <strong>PT AUTOCOUNT SOFTWARE INDONESIA</strong><br>
                Gedung Cyber Tower Lt. 12, Jakarta Selatan<br>
                Email: support@autocount.co.id | Telp: (021) 555-8899
            </div>
        </div>

        <div class="inv-title">
            <div>
                <h1>FAKTUR PENJUALAN</h1>
                <div style="font-family: monospace; font-size: 14px; font-weight: bold; color: #4f46e5; margin-top: 2px;">
                    #${header.docNo}
                </div>
            </div>
            <div>
                <span class="badge ${header.status === 'PAID' ? 'badge-paid' : header.status === 'PARTIAL' ? 'badge-partial' : 'badge-unpaid'}">
                    ${header.status === 'PAID' ? '✅ LUNAS' : header.status === 'PARTIAL' ? '⏳ DIBAYAR SEBAGIAN' : '⚠️ BELUM DIBAYAR'}
                </span>
            </div>
        </div>

        <div class="details-grid">
            <div class="detail-card">
                <h4>Ditujukan Kepada Pelanggan:</h4>
                <div style="font-size: 14px; font-weight: bold; color: #0f172a;">${header.customerName || 'Pelanggan Umum'}</div>
                <div style="color: #64748b; font-size: 12px; margin-top: 4px;">
                    ${header.customerAddress || 'Alamat tidak tertera'}<br>
                    Email: ${header.customerEmail || '-'}<br>
                    Telp: ${header.customerPhone || '-'}
                </div>
            </div>
            <div class="detail-card">
                <h4>Informasi Transaksi:</h4>
                <div class="summary-row"><span>Tanggal Faktur:</span> <strong>${header.date}</strong></div>
                <div class="summary-row"><span>Jatuh Tempo:</span> <strong>${header.dueDate || '-'}</strong></div>
                <div class="summary-row"><span>Metode:</span> <strong>Transfer Bank / Portal</strong></div>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Deskripsi Barang / Jasa</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Harga Satuan</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${lines.map(l => `
                        <tr>
                            <td><strong>${l.description}</strong></td>
                            <td style="text-align: center;">${l.qty}</td>
                            <td style="text-align: right;">${money(l.price)}</td>
                            <td class="text-right"><strong>${money(l.amount)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="summary-container">
            <div class="summary-box">
                <div class="summary-row">
                    <span>Total Tagihan:</span>
                    <strong>${money(header.total)}</strong>
                </div>
                <div class="summary-row" style="color: #059669;">
                    <span>Telah Dibayar:</span>
                    <strong>${money(header.paid)}</strong>
                </div>
                <div class="summary-row summary-total">
                    <span>Sisa Tagihan:</span>
                    <span>${money(outstanding)}</span>
                </div>
            </div>
        </div>

        ${header.notes ? `
            <div style="margin-top: 24px; padding: 12px 16px; background: #fffbebfb; border: 1px solid #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e;">
                <strong>Catatan / Keterangan:</strong> ${header.notes}
            </div>
        ` : ''}

        <div class="signature-box">
            <div>
                <div style="font-size: 12px; color: #64748b;">Diterima Oleh,</div>
                <div class="sig-space"></div>
                <div style="font-weight: bold; border-top: 1px solid #cbd5e1; padding-top: 4px; width: 150px; margin: auto;">
                    ${header.customerName || 'Pelanggan'}
                </div>
            </div>
            <div>
                <div style="font-size: 12px; color: #64748b;">Hormat Kami,</div>
                <div class="sig-space"></div>
                <div style="font-weight: bold; border-top: 1px solid #cbd5e1; padding-top: 4px; width: 150px; margin: auto;">
                    Finance Department
                </div>
            </div>
        </div>

        <div class="footer">
            <div>Faktur resmi ini diterbitkan secara otomatis oleh AutoCount Accounting.</div>
            <div>Halaman 1 dari 1</div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script>
        function downloadPDF() {
            const element = document.querySelector('.invoice-box');
            const opt = {
                margin:       10,
                filename:     'Invoice-${header.docNo}.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('pdf') === 'true' || urlParams.get('download') === 'true') {
            window.onload = () => {
                downloadPDF();
            };
        } else if (urlParams.get('print') === 'true') {
            window.onload = () => window.print();
        }
    </script>
</body>
</html>
        `;

        const headers: Record<string, string> = {
            "Content-Type": "text/html; charset=utf-8",
        };

        return new NextResponse(html, { headers });
    } catch (err: any) {
        return new NextResponse("Server Error", { status: 500 });
    }
}
