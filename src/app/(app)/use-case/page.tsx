"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

export default function UseCasePage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

    const runUseCaseData = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch("/api/use-case/execute", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setStatus({ success: true, message: "Use Case data & transaksi berhasil disimulasikan!" });
            } else {
                setStatus({ error: data.error || "Gagal mengeksekusi" });
            }
        } catch (e: any) {
            setStatus({ error: e.message || "Gagal menghubungi server" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Full Use-Case & Scenario Execution"
                subtitle="Otomatisasi 30 Data Transaksi: 10 Skenario Success (Lunas), 10 On-Progress (Berjalan/DP), dan 10 Failed (Gagal/Batal)"
            />

            {/* Quick Action Button */}
            <div className="card bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold">⚡ Otomatisasi Eksekusi 30 Skenario (30 Data Transaksi)</h2>
                    <p className="text-sm opacity-90 mt-1">
                        Klik tombol di samping untuk menggenerasi 10 Data SUCCESS, 10 Data ON-PROGRESS, dan 10 Data FAILED secara otomatis di Database.
                    </p>
                </div>
                <button
                    onClick={runUseCaseData}
                    disabled={loading}
                    className="px-6 py-3 bg-white text-brand-700 font-bold rounded-xl shadow hover:bg-brand-50 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                    {loading ? "Menjalankan..." : "🚀 Eksekusi 30 Transaksi Skenario"}
                </button>
            </div>

            {status && (
                <div
                    className={`p-4 rounded-xl text-sm font-medium ${
                        status.success
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                    {status.success ? `✓ ${status.message}` : `✕ Error: ${status.error}`}
                </div>
            )}

            {/* 30 Scenario Cards */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Daftar 30 Skenario Transaksi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                        ...["Transfer Bank BCA", "Mandiri Direct Debit", "Portal Pelanggan Self-Service", "QRIS", "Virtual Account BRI", "Kartu Kredit", "Tunai di Kasir", "Cek", "Credit Card Online", "ShopeePay"].map((m, i) => ({ n: `INV-SUC-${String(i + 1).padStart(3, "0")}`, type: "SUCCESS", desc: `Lunas 100% via ${m}`, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" })),
                        ...["Pembayaran DP 50% diterima, menunggu termin ke-2", "Faktur terbit, proses verifikasi departemen keuangan", "Cicilan tahap 1 terbayar sebagian", "Menunggu persetujuan manajer", "DP 30% lunas, jadwal termin berikutnya", "Menunggu konfirmasi transfer", "Invoice dikirim, buyer review", "Cicilan ke-2 dari 4 termin", "DP 75% dibayar", "Verifikasi dokumen pajak"].map((d, i) => ({ n: `INV-PROG-${String(i + 1).padStart(3, "0")}`, type: "ON-PROGRESS", desc: d, cls: "bg-amber-50 text-amber-700 border-amber-200" })),
                        ...["Gagal bayar / Overdue jatuh tempo & pesanan dibatalkan", "Transaksi ditolak - Pembatalan total oleh pembeli", "Cek Bilyet Kosong / Gagal Kliring Perbankan", "Refund penuh karena barang cacat", "Duplikat faktur dibatalkan", "Customer bangkrut, piutang dihapus buku", "Pembayaran gagal via gateway", "Sengketa transaksi / chargeback", "Pesanan dibatalkan sebelum pengiriman", "Faktur dikredit penuh (retur total)"].map((d, i) => ({ n: `INV-FAIL-${String(i + 1).padStart(3, "0")}`, type: "FAILED", desc: d, cls: "bg-red-50 text-red-700 border-red-200" })),
                    ].map((s, i) => (
                        <div key={i} className="card p-4 space-y-1.5 border">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-gray-700">{s.n}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.type}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step-by-Step Use-Case Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Step 1 */}
                <div className="card space-y-3 border-t-4 border-t-brand-500">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-1 bg-brand-50 text-brand-700 rounded-md">
                            LANGKAH 1
                        </span>
                        <span className="text-xs text-gray-400">Admin</span>
                    </div>
                    <h3 className="font-bold text-gray-800">1. Customer Onboarding</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Pendaftaran Customer baru <strong>PT Mitra Sejahtera</strong> (`C-1001`) beserta kontak &amp; alamat perusahaan.
                    </p>
                    <Link href="/customers" className="btn-secondary text-xs w-full justify-center">
                        Buka Menu Pelanggan →
                    </Link>
                </div>

                {/* Step 2 */}
                <div className="card space-y-3 border-t-4 border-t-indigo-500">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
                            LANGKAH 2
                        </span>
                        <span className="text-xs text-gray-400">Admin</span>
                    </div>
                    <h3 className="font-bold text-gray-800">2. Issue Sales Invoice</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Penerbitan Faktur Penjualan <strong>INV-2026-001</strong> senilai <strong>Rp 15.000.000</strong> atas barang/lisensi software.
                    </p>
                    <Link href="/invoices" className="btn-secondary text-xs w-full justify-center">
                        Buka Daftar Faktur →
                    </Link>
                </div>

                {/* Step 3 */}
                <div className="card space-y-3 border-t-4 border-t-emerald-500">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">
                            LANGKAH 3
                        </span>
                        <span className="text-xs text-gray-400">Pelanggan &amp; Admin</span>
                    </div>
                    <h3 className="font-bold text-gray-800">3. Pelunasan &amp; Jurnal</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Pelanggan melunasi faktur &amp; sistem otomatis membuat Entri Jurnal Debet <strong>Bank (1100)</strong> vs Kredit <strong>Pendapatan (4000)</strong>.
                    </p>
                    <Link href="/journals" className="btn-secondary text-xs w-full justify-center">
                        Buka Entri Jurnal →
                    </Link>
                </div>

                {/* Step 4 */}
                <div className="card space-y-3 border-t-4 border-t-amber-500">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-md">
                            LANGKAH 4
                        </span>
                        <span className="text-xs text-gray-400">Executive Report</span>
                    </div>
                    <h3 className="font-bold text-gray-800">4. Executive Reporting</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Analisis Laporan Laba Rugi real-time &amp; proyeksi target omzet menggunakan <strong>Smart Planner Advisor</strong>.
                    </p>
                    <Link href="/reports" className="btn-secondary text-xs w-full justify-center">
                        Lihat Smart Planner →
                    </Link>
                </div>
            </div>
        </div>
    );
}
