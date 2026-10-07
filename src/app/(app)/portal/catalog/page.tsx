"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { money } from "@/lib/utils";
import { useLang } from "@/lib/context";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Pagination } from "@/components/Pagination";

export default function CustomerCatalogPage() {
    const { t } = useLang();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE = 5;

    const loadItems = async (p?: number) => {
        setLoading(true);
        try {
            const targetPage = p ?? page;
            const res = await fetch(`/api/portal/items?page=${targetPage}&limit=${PAGE}`);
            const data = await res.json();
            setItems(data.data || data.items || []);
            setTotal(data.total ?? 0);
            setTotalPages(data.totalPages || 1);
            setPage(targetPage);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("productCatalog") || "Katalog Barang & Jasa"}
                subtitle="Lihat daftar produk, persediaan, dan layanan beserta daftar harga resmi."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="card animate-pulse h-36 bg-gray-100 dark:bg-slate-800" />
                    ))
                ) : items.length === 0 ? (
                    <div className="col-span-full card text-center py-8 text-gray-400">
                        Tidak ada barang / jasa tersedia saat ini.
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="card hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">
                                        {item.code}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {item.uom || "Unit"}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-slate-100 text-base mb-1">
                                    {item.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                                    {item.description || "Layanan dan produk berkualitas dari perusahaan kami."}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-xs text-gray-500">Harga Satuan:</span>
                                <span className="text-base font-bold text-emerald-600">
                                    {money(item.price)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} totalItems={total} pageSize={PAGE} onPageChange={(p) => loadItems(p)} />
        </div>
    );
}
