"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { initFcm } from "@/lib/fcm";
import { useLang } from "@/lib/context";

type ServerNotif = { role: string; title: string; message: string; time: number };

const READ_KEY = "autocount_notif_read";

function getReadIds(): number[] {
    try { return JSON.parse(localStorage.getItem(READ_KEY) || "[]"); } catch { return []; }
}

export function NotificationBell() {
    const { data: session } = useSession();
    const { t } = useLang();
    const role = (session?.user as any)?.role as string | undefined;
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<ServerNotif[]>([]);
    const [readIds, setReadIds] = useState<number[]>([]);

    const refresh = useCallback(async () => {
        if (!role) return;
        try {
            const res = await fetch(`/api/notifications?role=${role}`);
            const json = await res.json();
            setItems(json.notifications || []);
        } catch { /* ignore */ }
        setReadIds(getReadIds());
    }, [role]);

    useEffect(() => {
        refresh();
        initFcm().catch(() => {});
        const id = setInterval(refresh, 5000);
        return () => clearInterval(id);
    }, [refresh]);

    const markAllRead = () => {
        const ids = items.map((n) => n.time);
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
        setReadIds(ids);
    };

    const markItemRead = (time: number) => {
        const ids = Array.from(new Set([...getReadIds(), time]));
        localStorage.setItem(READ_KEY, JSON.stringify(ids));
        setReadIds(ids);
    };

    const hrefFor = (n: ServerNotif) => {
        const title = n.title.toLowerCase();
        const isCustomer = n.role === "customer";
        if (title.includes("bill")) return "/bills";
        if (title.includes("barang masuk") || title.includes("barang")) return "/items";
        if (title.includes("jurnal")) return "/journals";
        if (title.includes("faktur") || title.includes("invoice") || title.includes("pembayaran") || title.includes("penerimaan")) return isCustomer ? "/portal/invoices" : "/invoices";
        return "/";
    };

    const unread = items.filter((n) => !readIds.includes(n.time)).length;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-xl text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900/80 shadow-sm border border-gray-100 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-white transition-colors"
                aria-label="Notifications"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unread}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">
                        <span className="text-sm font-bold text-gray-800 dark:text-white">Notifikasi</span>
                        <button onClick={markAllRead} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Tandai dibaca</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-400 dark:text-slate-400 text-center">Belum ada notifikasi.</p>
                    ) : (
                        items.map((n, i) => (
                            <a
                                key={i}
                                href={hrefFor(n)}
                                onClick={() => markItemRead(n.time)}
                                className={`block px-4 py-3 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${readIds.includes(n.time) ? "opacity-50" : ""}`}
                            >
                                <p className="text-sm font-semibold text-gray-800 dark:text-white">{n.title}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{n.message}</p>
                            </a>
                        ))
                    )}
                    </div>
                </div>
            )}
        </div>
    );
}
