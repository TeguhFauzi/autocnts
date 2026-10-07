# Bispro (Business Process) AutoCountSoft — Terintegrasi Multi-Role

Dokumen ini memetakan bagaimana setiap role saling terhubung dalam satu alur bisnis.

## Roles yang tersedia

| Role | Email demo | Password | Modul yang diakses |
|---|---|---|---|
| ADMIN | admin@autocount.local | admin123 | Semua — COA, jurnal, faktur, bills, items, customers, suppliers, reports, user |
| ACCOUNTANT | accountant@autocount.local | accountant123 | Jurnal, faktur, bills, laporan — penanggung jawab buku besar & laporan keuangan |
| SALES | sales@autocount.local | sales123 | Customers, invoice (AR), katalog — fokus penjualan |
| PURCHASE | purchase@autocount.local | purchase123 | Suppliers, bills (AP), items — fokus pembelian |
| WAREHOUSE | warehouse@autocount.local | warehouse123 | Items/stok, penerimaan barang, penyesuaian persediaan |
| CUSTOMER | customer@autocount.local | customer123 | Portal: invoice saya, bayar mandiri, riwayat, katalog, profil |

## Alur Bisnis Utuh (1 Bispro)

### 1. Setup awal — ADMIN / ACCOUNTANT
- Membuat Bagan Akun (COA), pelanggan, pemasok, item/stok.
- Menentukan harga jual & HPP pada items.

### 2. Penjualan — SALES
- Salesmembuat Invoice (AR) untuk customer.
- Sistem otomatis mencatat jurnal AR (debit Piutang, kredit Pendapatan).
- Stok item berkurang (gerakan stok ke WAREHOUSE).

### 3. Pembayaran — CUSTOMER
- Customer melihat invoice di Portal (daftar faktur, status).
- Customer melakukan pelunasan mandiri → status menjadi PAID.
- Sistem mencatat penerimaan kas (debit Kas/Bank, kredit Piutang).

### 4. Pembelian — PURCHASE + WAREHOUSE
- Purchase membuat Bill (AP) ke supplier.
- Warehouse menerima barang → stok bertambah, persediaan (inventory) naik.
- Payment bill dari kas perusahaan (debit Hutang, kredit Kas/Bank).

### 5. Penutupan Buku — ACCOUNTANT
- ACCOUNTANT meninjau jurnal berpasangan (debit = kredit).
- Membuat jurnal penyesuaian persediaan/beban.
- Menghasilkan Laporan: Neraca Saldo, Laba Rugi, Neraca.

### 6. Verifikasi & Laporan — ADMIN
- ADMIN mengecek keseluruhan: dashboard, semua modul, user.

## Matriks Relasi

```
ADMIN ──(setup COA/customers/suppliers/items)──▶ semua modul
SALES ──(create Invoice)──▶ AR journal ──▶ CUSTOMER portal (lihat & bayar)
CUSTOMER ──(bayar invoice)──▶ Kas masuk ──▶ laporan Laba Rugi/Neraca
PURCHASE ──(create Bill)──▶ AP journal ──▶ Warehouse (penerimaan stok)
WAREHOUSE ──(stok in/out)──▶ persediaan ──▶ HPP & COGS
ACCOUNTANT ──(jurnal & laporan)──▶ Neraca Saldo/Laba Rugi/Neraca
```

Semua transaksi mengalir ke jurnal & laporan yang sama — tidak ada data terpecah per role.
