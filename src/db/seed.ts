import { db } from "./index";
import {
    users,
    accounts,
    customers,
    suppliers,
    items,
    invoices,
    invoiceLines,
    bills,
    billLines,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🚀 Starting Seed Automation with 3 Scenarios (SUCCESS, ON-PROGRESS, FAILED/CANCELLED)...");

    // 1. Users
    const adminHash = await bcrypt.hash("admin123", 10);
    await db
        .insert(users)
        .values({
            name: "Administrator Admin",
            email: "admin@autocount.local",
            passwordHash: adminHash,
            role: "admin",
        })
        .onConflictDoNothing();

    const custHash = await bcrypt.hash("customer123", 10);
    await db
        .insert(users)
        .values({
            name: "PT Utama Jaya",
            email: "customer@autocount.local",
            passwordHash: custHash,
            role: "customer",
        })
        .onConflictDoNothing();

    // 1b. Role tambahan (mirip AutoCount): akuntan, sales, purchase, warehouse
    const extraRoles: Array<{ name: string; email: string; pwd: string; role: string }> = [
        { name: "Akuntan", email: "accountant@autocount.local", pwd: "accountant123", role: "accountant" },
        { name: "Sales", email: "sales@autocount.local", pwd: "sales123", role: "sales" },
        { name: "Purchase", email: "purchase@autocount.local", pwd: "purchase123", role: "purchase" },
        { name: "Warehouse", email: "warehouse@autocount.local", pwd: "warehouse123", role: "warehouse" },
    ];
    for (const r of extraRoles) {
        const h = await bcrypt.hash(r.pwd, 10);
        await db
            .insert(users)
            .values({ name: r.name, email: r.email, passwordHash: h, role: r.role })
            .onConflictDoNothing();
    }

    // 2. Chart of Accounts
    const coa = [
        { code: "1000", name: "Kas & Bank", type: "ASSET" },
        { code: "1100", name: "Bank BCA - Utama", type: "ASSET" },
        { code: "1200", name: "Piutang Usaha (AR)", type: "ASSET" },
        { code: "1300", name: "Persediaan Barang (Inventory)", type: "ASSET" },
        { code: "2000", name: "Hutang Usaha (AP)", type: "LIABILITY" },
        { code: "2100", name: "Hutang Pajak", type: "LIABILITY" },
        { code: "3000", name: "Modal Pemilik", type: "EQUITY" },
        { code: "3100", name: "Laba Ditahan", type: "EQUITY" },
        { code: "4000", name: "Pendapatan Penjualan", type: "INCOME" },
        { code: "4100", name: "Pendapatan Jasa", type: "INCOME" },
        { code: "5000", name: "Beban Pokok Penjualan (HPP)", type: "EXPENSE" },
        { code: "6000", name: "Beban Gaji Karyawan", type: "EXPENSE" },
        { code: "6100", name: "Beban Sewa Gedung", type: "EXPENSE" },
        { code: "6200", name: "Beban Listrik & Air", type: "EXPENSE" },
    ];
    await db.insert(accounts).values(coa).onConflictDoNothing();

    // 3. Customers
    const customerList = [
        { code: "C-1001", name: "PT Mitra Sejahtera", email: "finance@mitrasejahtera.co.id", phone: "021-555-0101", address: "Jakarta Selatan" },
        { code: "C-1002", name: "CV Berkah Mandiri", email: "sales@berkahmandiri.co.id", phone: "022-555-0202", address: "Bandung" },
        { code: "C-1003", name: "PT Solusi Teknologi", email: "accounting@solusitek.co.id", phone: "031-555-0303", address: "Surabaya" },
    ];
    await db.insert(customers).values(customerList).onConflictDoNothing();

    // Fetch inserted customers for FK IDs
    const allCustomers = await db.select().from(customers);
    const c1 = allCustomers.find((c) => c.code === "C-1001") || allCustomers[0];
    const c2 = allCustomers.find((c) => c.code === "C-1002") || allCustomers[0];
    const c3 = allCustomers.find((c) => c.code === "C-1003") || allCustomers[0];

    // Link customer login user to C-1001
    await db.update(users).set({ customerId: c1.id }).where(eq(users.email, "customer@autocount.local"));

    // 4. Suppliers
    const supplierList = [
        { code: "S-1001", name: "PT Distro Hardware Utama", email: "sales@distrohardware.co.id", phone: "021-444-0101", address: "Jakarta Barat" },
        { code: "S-1002", name: "UD Logistik Nusantara", email: "cs@logistiknusantara.co.id", phone: "021-444-0202", address: "Tangerang" },
        { code: "S-1003", name: "PT Impor Komponen Global", email: "order@komponenglobal.co.id", phone: "024-444-0303", address: "Semarang" },
    ];
    await db.insert(suppliers).values(supplierList).onConflictDoNothing();

    // 5. Items
    const itemList = [
        { code: "ITM-001", name: "Laptop Business Pro 14 inch", uom: "UNIT", price: "12500000", cost: "10000000", qtyOnHand: "50" },
        { code: "ITM-002", name: "Monitor Ergonomis 27 inch 4K", uom: "UNIT", price: "4500000", cost: "3500000", qtyOnHand: "35" },
        { code: "ITM-003", name: "Mechanical Keyboard RGB", uom: "UNIT", price: "850000", cost: "600000", qtyOnHand: "120" },
        { code: "ITM-004", name: "Wireless Ergonomic Mouse", uom: "UNIT", price: "350000", cost: "220000", qtyOnHand: "200" },
        { code: "ITM-005", name: "Layanan Maintenance Server (1 Bln)", uom: "BLN", price: "2500000", cost: "1000000", qtyOnHand: "999" },
    ];
    await db.insert(items).values(itemList).onConflictDoNothing();

    // Clear previous scenario invoices for clean test execution
    await db.delete(invoiceLines);
    await db.delete(invoices);

    console.log("📊 Inserting 3 Automated Execution Scenarios for Invoices...");

    // ==========================================
    // SCENARIO 1: SUCCESS (3 Executions - PAID)
    // ==========================================
    const successInvoices = [
        { docNo: "INV-SUC-001", customerId: c1.id, date: "2026-09-01", dueDate: "2026-09-15", total: "15000000", paid: "15000000", status: "PAID", notes: "✅ [SUCCESS] Pelunasan lunas via Transfer Bank BCA" },
        { docNo: "INV-SUC-002", customerId: c2.id, date: "2026-09-05", dueDate: "2026-09-20", total: "9000000", paid: "9000000", status: "PAID", notes: "✅ [SUCCESS] Pelunasan lunas via Portal Pelanggan" },
        { docNo: "INV-SUC-003", customerId: c3.id, date: "2026-09-10", dueDate: "2026-09-25", total: "25000000", paid: "25000000", status: "PAID", notes: "✅ [SUCCESS] Pelunasan lunas Giro Cek" },
    ];

    for (const invData of successInvoices) {
        const [inserted] = await db.insert(invoices).values(invData).returning();
        await db.insert(invoiceLines).values([
            { invoiceId: inserted.id, description: "Laptop Business Pro 14 inch", qty: "1", price: invData.total, amount: invData.total }
        ]);
    }

    // ===============================================
    // SCENARIO 2: ON-PROGRESS (3 Executions - PARTIAL / UNPAID)
    // ===============================================
    const onProgressInvoices = [
        { docNo: "INV-PROG-001", customerId: c1.id, date: "2026-09-28", dueDate: "2026-10-15", total: "20000000", paid: "10000000", status: "PARTIAL", notes: "⏳ [ON-PROGRESS] Pembayaran DP 50% diterima, sisa termin ke-2" },
        { docNo: "INV-PROG-002", customerId: c2.id, date: "2026-10-01", dueDate: "2026-10-20", total: "12500000", paid: "0", status: "UNPAID", notes: "⏳ [ON-PROGRESS] Faktur baru terbit, menunggu proses verifikasi finance customer" },
        { docNo: "INV-PROG-003", customerId: c3.id, date: "2026-10-02", dueDate: "2026-10-25", total: "8500000", paid: "3500000", status: "PARTIAL", notes: "⏳ [ON-PROGRESS] Cicilan tahap 1 selesai" },
    ];

    for (const invData of onProgressInvoices) {
        const [inserted] = await db.insert(invoices).values(invData).returning();
        await db.insert(invoiceLines).values([
            { invoiceId: inserted.id, description: "Pengadaan Perangkat Hardware & Jasa", qty: "1", price: invData.total, amount: invData.total }
        ]);
    }

    // ==============================================
    // SCENARIO 3: FAILED / CANCELLED (3 Executions)
    // ==============================================
    const failedInvoices = [
        { docNo: "INV-FAIL-001", customerId: c1.id, date: "2026-08-10", dueDate: "2026-08-25", total: "5000000", paid: "0", status: "UNPAID", notes: "❌ [FAILED] Jatuh Tempo (Overdue) - Gagal bayar / Pembatalan pesanan" },
        { docNo: "INV-FAIL-002", customerId: c2.id, date: "2026-08-15", dueDate: "2026-08-30", total: "3500000", paid: "0", status: "UNPAID", notes: "❌ [FAILED] Transaksi Ditolak - Kode item mismatch / Retur total" },
        { docNo: "INV-FAIL-003", customerId: c3.id, date: "2026-09-02", dueDate: "2026-09-16", total: "18500000", paid: "0", status: "UNPAID", notes: "❌ [FAILED] Pembatalan Klien - Pembayaran via Cheque Bilyet Kosong" },
    ];

    for (const invData of failedInvoices) {
        const [inserted] = await db.insert(invoices).values(invData).returning();
        await db.insert(invoiceLines).values([
            { invoiceId: inserted.id, description: "Item Transaksi Dibatalkan / Gagal", qty: "1", price: invData.total, amount: invData.total }
        ]);
    }

    console.log("✅ Seed execution completed successfully!");
    console.log("Summary: 3 SUCCESS, 3 ON-PROGRESS, 3 FAILED/CANCELLED data cases generated.");
    process.exit(0);
}

main().catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
});
