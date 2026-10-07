import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, items, invoices, invoiceLines, journals, journalLines, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { genDocNo } from "@/lib/utils";


export async function POST() {
    try {
        // 1. Clear previous test scenario invoices & lines
        await db.delete(invoiceLines);
        await db.delete(invoices);

        // 2. Ensure default Customers exist
        let allCustomers = await db.select().from(customers);
        if (allCustomers.length < 3) {
            await db.insert(customers).values([
                { code: "C-1001", name: "PT Mitra Sejahtera", email: "finance@mitrasejahtera.co.id", phone: "0812-3456-7890", address: "Jakarta" },
                { code: "C-1002", name: "CV Berkah Mandiri", email: "sales@berkahmandiri.co.id", phone: "0813-9876-5432", address: "Bandung" },
                { code: "C-1003", name: "PT Solusi Teknologi", email: "accounting@solusitek.co.id", phone: "0811-2233-4455", address: "Surabaya" },
            ]).onConflictDoNothing();
            allCustomers = await db.select().from(customers);
        }

        // Pastikan cukup data customer agar pagination tabel Customers aktif (demo)
        if (allCustomers.length < 25) {
            const extra = Array.from({ length: 25 - allCustomers.length }, (_, i) => ({
                code: `C-${String(1004 + i).padStart(4, "0")}`,
                name: `Customer Demo ${i + 4}`,
                email: `customer${1004 + i}@demo.co.id`,
                phone: `0812-0000-${String(1000 + i)}`,
                address: "Jakarta",
            }));
            await db.insert(customers).values(extra).onConflictDoNothing();
            allCustomers = await db.select().from(customers);
        }

        const c1 = allCustomers[0];
        const c2 = allCustomers[1] || c1;
        const c3 = allCustomers[2] || c1;

        // 3. Ensure default Items exist
        let allItems = await db.select().from(items);
        if (allItems.length === 0) {
            await db.insert(items).values([
                { code: "ITM-001", name: "Laptop Business Pro", uom: "UNIT", price: "12500000", cost: "10000000", qtyOnHand: "50" },
                { code: "ITM-002", name: "Monitor Ergonomis 4K", uom: "UNIT", price: "4500000", cost: "3500000", qtyOnHand: "30" },
                { code: "ITM-003", name: "Paket Lisensi Software Enterprise", uom: "PAKET", price: "15000000", cost: "5000000", qtyOnHand: "99" },
            ]).onConflictDoNothing();
            allItems = await db.select().from(items);
        }

        // ===============================================
        // 🟢 SCENARIO 1: SUCCESS (3 Data Executions)
        // ===============================================
        const channels = ["Transfer Bank BCA", "Mandiri Direct Debit", "Portal Pelanggan Self-Service", "QRIS", "Virtual Account BRI", "Kartu Kredit", "Tunai di Kasir", "Cek", "Credit Card Online", "ShopeePay"];
        const successData = Array.from({ length: 10 }, (_, i) => ({
            docNo: `INV-SUC-${String(i + 1).padStart(3, "0")}`,
            customerId: [c1.id, c2.id, c3.id][i % 3],
            date: `2026-09-${String(i + 1).padStart(2, "0")}`,
            dueDate: `2026-09-${String(i + 15).padStart(2, "0")}`,
            total: String(5000000 + i * 2500000),
            paid: String(5000000 + i * 2500000),
            status: "PAID",
            notes: `✅ [SUCCESS #${i + 1}] Lunas 100% via ${channels[i]}`,
        }));

        for (const s of successData) {
            const [inv] = await db.insert(invoices).values(s).returning();
            await db.insert(invoiceLines).values({
                invoiceId: inv.id,
                itemId: allItems[0]?.id,
                description: s.notes,
                qty: "1",
                price: s.total,
                amount: s.total,
            });
        }

        // ===============================================
        // 🟡 SCENARIO 2: ON-PROGRESS (3 Data Executions)
        // ===============================================
        const progNotes = ["Pembayaran DP 50% diterima, menunggu termin ke-2", "Faktur terbit, proses verifikasi departemen keuangan", "Cicilan tahap 1 terbayar sebagian", "Menunggu persetujuan manajer", "DP 30% lunas, jadwal termin berikutnya", "Menunggu konfirmasi transfer", "Invoice dikirim, buyer review", "Cicilan ke-2 dari 4 termin", "DP 75% dibayar", "Verifikasi dokumen pajak"];
        const onProgressData = Array.from({ length: 10 }, (_, i) => ({
            docNo: `INV-PROG-${String(i + 1).padStart(3, "0")}`,
            customerId: [c1.id, c2.id, c3.id][i % 3],
            date: `2026-10-${String(i + 1).padStart(2, "0")}`,
            dueDate: `2026-10-${String(i + 15).padStart(2, "0")}`,
            total: String(8000000 + i * 1500000),
            paid: i % 2 === 0 ? String((8000000 + i * 1500000) / 2) : "0",
            status: i % 2 === 0 ? "PARTIAL" : "UNPAID",
            notes: `⏳ [ON-PROGRESS #${i + 1}] ${progNotes[i]}`,
        }));

        for (const p of onProgressData) {
            const [inv] = await db.insert(invoices).values(p).returning();
            await db.insert(invoiceLines).values({
                invoiceId: inv.id,
                itemId: allItems[1]?.id,
                description: p.notes,
                qty: "1",
                price: p.total,
                amount: p.total,
            });
        }

        // ===============================================
        // 🔴 SCENARIO 3: FAILED / CANCELLED (3 Data Executions)
        // ===============================================
        const failNotes = ["Gagal bayar / Overdue jatuh tempo & pesanan dibatalkan", "Transaksi ditolak - Pembatalan total oleh pembeli", "Cek Bilyet Kosong / Gagal Kliring Perbankan", "Refund penuh karena barang cacat", "Duplikat faktur dibatalkan", "Customer bangkrut, piutang dihapus buku", "Pembayaran gagal via gateway", "Sengketa transaksi / chargeback", "Pesanan dibatalkan sebelum pengiriman", "Faktur dikredit penuh (retur total)"];
        const failedData = Array.from({ length: 10 }, (_, i) => ({
            docNo: `INV-FAIL-${String(i + 1).padStart(3, "0")}`,
            customerId: [c1.id, c2.id, c3.id][i % 3],
            date: `2026-08-${String(i + 1).padStart(2, "0")}`,
            dueDate: `2026-08-${String(i + 15).padStart(2, "0")}`,
            total: String(3000000 + i * 1700000),
            paid: "0",
            status: "UNPAID",
            notes: `❌ [FAILED #${i + 1}] ${failNotes[i]}`,
        }));

        for (const f of failedData) {
            const [inv] = await db.insert(invoices).values(f).returning();
            await db.insert(invoiceLines).values({
                invoiceId: inv.id,
                itemId: allItems[2]?.id,
                description: f.notes,
                qty: "1",
                price: f.total,
                amount: f.total,
            });
        }

        return NextResponse.json({
            success: true,
            message: "Otomatisasi 30 data transaksi (10 Success, 10 On-Progress, 10 Failed) berhasil dieksekusi!",
            summary: {
                successCount: 10,
                onProgressCount: 10,
                failedCount: 10,
            }
        });
    } catch (err: any) {
        console.error("Use Case Exec error:", err);
        return NextResponse.json({ error: err.message || "Execution Failed" }, { status: 500 });
    }
}
