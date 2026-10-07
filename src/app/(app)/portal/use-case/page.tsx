"use client";

import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";

const CASE_GROUPS: { title: string; color: string; cases: { code: string; desc: string }[] }[] = [
    {
        title: "🧾 Faktur & Penagihan (Customer)",
        color: "border-t-brand-500",
        cases: [
            { code: "CST-INV-01", desc: "Customer melihat daftar seluruh faktur pembelian miliknya." },
            { code: "CST-INV-02", desc: "Customer membuka detail satu faktur dan memeriksa item serta totalnya." },
            { code: "CST-INV-03", desc: "Customer mengunduh faktur sebagai PDF untuk arsip." },
            { code: "CST-INV-04", desc: "Customer memeriksa faktur yang belum dibayar (UNPAID)." },
            { code: "CST-INV-05", desc: "Customer memeriksa faktur dengan pembayaran sebagian (PARTIAL)." },
            { code: "CST-INV-06", desc: "Customer memeriksa faktur yang sudah lunas (PAID)." },
            { code: "CST-INV-07", desc: "Customer membandingkan total tagihan bulan ini vs bulan lalu." },
            { code: "CST-INV-08", desc: "Customer mencari faktur berdasarkan nomor dokumen." },
            { code: "CST-INV-09", desc: "Customer melihat jatuh tempo faktur terdekat." },
            { code: "CST-INV-10", desc: "Customer memantau notifikasi faktur yang hampir jatuh tempo." },
        ],
    },
    {
        title: "💳 Pembayaran (Customer)",
        color: "border-t-emerald-500",
        cases: [
            { code: "CST-PAY-01", desc: "Customer membayar faktur penuh langsung dari portal." },
            { code: "CST-PAY-02", desc: "Customer membayar sebagian (DP) atas sebuah faktur." },
            { code: "CST-PAY-03", desc: "Customer memilih metode transfer bank untuk pembayaran." },
            { code: "CST-PAY-04", desc: "Customer membayar via kartu kredit." },
            { code: "CST-PAY-05", desc: "Customer membayar via Virtual Account." },
            { code: "CST-PAY-06", desc: "Customer melihat riwayat pembayaran yang sudah dilakukan." },
            { code: "CST-PAY-07", desc: "Customer mengunduh bukti pembayaran (receipt)." },
            { code: "CST-PAY-08", desc: "Customer memeriksa status pembayaran tertunda." },
            { code: "CST-PAY-09", desc: "Customer melihat total pembayaran bulan berjalan." },
            { code: "CST-PAY-10", desc: "Customer melakukan pelunasan atas faktur overdue." },
        ],
    },
    {
        title: "📦 Katalog, Akun & Profil (Customer)",
        color: "border-t-amber-500",
        cases: [
            { code: "CST-CAT-01", desc: "Customer membuka katalog produk & jasa yang ditawarkan." },
            { code: "CST-CAT-02", desc: "Customer melihat harga resmi dari setiap item." },
            { code: "CST-CAT-03", desc: "Customer memeriksa ketersediaan stok suatu produk." },
            { code: "CST-CAT-04", desc: "Customer mencari produk berdasarkan nama." },
            { code: "CST-CAT-05", desc: "Customer memperbarui data profil perusahaan." },
            { code: "CST-CAT-06", desc: "Customer mengubah bahasa tampilan portal (ID/EN)." },
            { code: "CST-CAT-07", desc: "Customer mengganti tema terang/gelap." },
            { code: "CST-CAT-08", desc: "Customer melihat ringkasan dashboard: total tagihan & pembayaran." },
            { code: "CST-CAT-09", desc: "Customer menghubungi sales melalui tautan kontak resmi." },
            { code: "CST-CAT-10", desc: "Customer logout dari portal dengan aman." },
        ],
    },
];

export default function CustomerUseCasePage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Customer Use-Case Scenarios (30 Cases)"
                subtitle="30 skenario penggunaan dari sudut pandang Customer Portal: Faktur, Pembayaran, Katalog & Akun"
            />
            {CASE_GROUPS.map((g) => (
                <div key={g.title}>
                    <h3 className="text-base font-bold text-gray-800 mb-3">{g.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {g.cases.map((c) => (
                            <div key={c.code} className={`card p-4 space-y-1.5 border-t-4 ${g.color}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold text-gray-700">{c.code}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">CUSTOMER</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="card p-6 border-t-4 border-t-indigo-500 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-gray-800">Mulai dari Portal Customer</h3>
                    <p className="text-xs text-gray-500 mt-1">Buka dashboard, faktur, riwayat pembayaran, dan katalog produk.</p>
                </div>
                <Link href="/portal" className="btn-secondary text-xs whitespace-nowrap">Buka Customer Portal →</Link>
            </div>
        </div>
    );
}
