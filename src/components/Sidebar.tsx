"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cls } from "@/lib/utils";
import {
    IconDashboard,
    IconAccounts,
    IconJournal,
    IconCustomers,
    IconInvoice,
    IconSupplier,
    IconBill,
    IconStock,
    IconReports,
    IconLogout,
    IconSun,
    IconMoon,
    IconGlobe,
} from "@/components/icons";
import { useTheme, useLang } from "@/lib/context";

// Admin / user navigation (full)
const adminNav = [
    { href: "/", key: "dashboard", Icon: IconDashboard },
    { href: "/accounts", key: "accounts", Icon: IconAccounts },
    { href: "/journals", key: "journals", Icon: IconJournal },
    { href: "/customers", key: "customers", Icon: IconCustomers },
    { href: "/invoices", key: "invoices", Icon: IconInvoice },
    { href: "/suppliers", key: "suppliers", Icon: IconSupplier },
    { href: "/bills", key: "bills", Icon: IconBill },
    { href: "/items", key: "items", Icon: IconStock },
    { href: "/reports", key: "reports", Icon: IconReports },
    { href: "/use-case", key: "useCaseDemo", Icon: IconGlobe },
];

// Customer navigation (portal & self-service features)
const customerNav = [
    { href: "/portal", key: "customerPortal", Icon: IconDashboard },
    { href: "/portal/invoices", key: "myInvoices", Icon: IconInvoice },
    { href: "/portal/history", key: "paymentHistory", Icon: IconJournal },
    { href: "/portal/catalog", key: "productCatalog", Icon: IconStock },
    { href: "/portal/profile", key: "myProfile", Icon: IconCustomers },
    { href: "/portal/password", key: "changePassword", Icon: IconLogout },
    { href: "/portal/use-case", key: "useCaseDemo", Icon: IconGlobe },
];

// Accountant navigation
const accountantNav = [
    { href: "/", key: "dashboard", Icon: IconDashboard },
    { href: "/accounts", key: "accounts", Icon: IconAccounts },
    { href: "/journals", key: "journals", Icon: IconJournal },
    { href: "/invoices", key: "invoices", Icon: IconInvoice },
    { href: "/bills", key: "bills", Icon: IconBill },
    { href: "/reports", key: "reports", Icon: IconReports },
];

// Sales navigation
const salesNav = [
    { href: "/", key: "dashboard", Icon: IconDashboard },
    { href: "/customers", key: "customers", Icon: IconCustomers },
    { href: "/invoices", key: "invoices", Icon: IconInvoice },
    { href: "/items", key: "items", Icon: IconStock },
    { href: "/reports", key: "reports", Icon: IconReports },
];

// Purchase navigation
const purchaseNav = [
    { href: "/", key: "dashboard", Icon: IconDashboard },
    { href: "/suppliers", key: "suppliers", Icon: IconSupplier },
    { href: "/bills", key: "bills", Icon: IconBill },
    { href: "/items", key: "items", Icon: IconStock },
    { href: "/reports", key: "reports", Icon: IconReports },
];

// Warehouse navigation
const warehouseNav = [
    { href: "/", key: "dashboard", Icon: IconDashboard },
    { href: "/items", key: "items", Icon: IconStock },
    { href: "/reports", key: "reports", Icon: IconReports },
];

const navByRole: Record<string, typeof adminNav> = {
    accountant: accountantNav,
    sales: salesNav,
    purchase: purchaseNav,
    warehouse: warehouseNav,
};

export function Sidebar() {
    const path = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLang();

    const role = (session?.user as any)?.role as string | undefined;
    const isCustomer = role === "customer";
    const navKeys = status === "loading" ? [] : (isCustomer ? customerNav : (role && navByRole[role]) || adminNav);
    // Hanya item dengan href paling spesifik (terpanjang) yang dianggap aktif
    const activeHref = navKeys
        .filter((n) => (n.href === "/" ? path === "/" : path === n.href || path.startsWith(n.href + "/")))
        .sort((a, b) => b.href.length - a.href.length)[0]?.href;

    const initials = (session?.user?.name ?? "U")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <aside className="sidebar w-64 shrink-0 h-screen sticky top-0 flex flex-col">
            {/* Logo */}
            <div className="px-5 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg">
                        A
                    </div>
                    <div>
                        <div className="text-base font-bold text-white leading-tight">
                            AutoCount
                        </div>
                        <div className="text-[11px] text-sidebar-muted">
                            {isCustomer ? "Customer Portal" : "Pro Accounting"}
                        </div>
                    </div>
                </div>
            </div>



            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
                {navKeys.map((n) => {
                    const active = n.href === activeHref;
                    const Icon = n.Icon;
                    return (
                        <Link
                            key={n.href}
                            href={n.href}
                            className={cls(
                                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                                active
                                    ? "bg-white/10 text-white font-semibold"
                                    : "text-sidebar-muted hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <Icon
                                className={cls(
                                    "w-5 h-5 shrink-0 transition-colors",
                                    active
                                        ? "text-brand-400"
                                        : "text-sidebar-muted group-hover:text-white"
                                )}
                            />
                            {t(n.key)}
                        </Link>
                    );
                })}
            </nav>

            {/* Settings toggles */}
            <div className="px-4 py-3 border-t border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sidebar-muted text-xs font-medium">
                        {theme === "dark" ? (
                            <IconMoon className="w-4 h-4 text-brand-400" />
                        ) : (
                            <IconSun className="w-4 h-4 text-amber-400" />
                        )}
                        <span>{t("darkMode")}</span>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle dark mode">
                        <input
                            type="checkbox"
                            checked={theme === "dark"}
                            onChange={toggleTheme}
                        />
                        <span className="toggle-track" />
                    </label>
                </div>

                {/* Language row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sidebar-muted text-xs font-medium">
                        <IconGlobe className="w-4 h-4 text-emerald-400" />
                        <span>{t("language")}</span>
                    </div>
                    <button
                        onClick={toggleLang}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-150 hover:bg-white/10"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                        aria-label="Toggle language"
                    >
                        <span
                            className={cls(
                                "transition-all",
                                lang === "en" ? "text-white" : "opacity-40"
                            )}
                        >
                            EN
                        </span>
                        <span className="opacity-30 text-[10px]">|</span>
                        <span
                            className={cls(
                                "transition-all",
                                lang === "id" ? "text-white" : "opacity-40"
                            )}
                        >
                            ID
                        </span>
                    </button>
                </div>
            </div>

            {/* User footer */}
            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate">
                            {session?.user?.name ?? "User"}
                        </div>
                        <div className="text-[11px] text-sidebar-muted truncate">
                            {session?.user?.email}
                            {role && (
                                <span className="ml-1 opacity-60">({role})</span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        await signOut({ redirect: false });
                        router.push("/landing");
                        router.refresh();
                    }}
                    className="flex items-center gap-2 w-full mt-1 px-3 py-2 rounded-xl text-sm text-sidebar-muted hover:bg-white/5 hover:text-white transition-all duration-150"
                >
                    <IconLogout className="w-5 h-5" />
                    {t("signOut")}
                </button>
            </div>
        </aside>
    );
}
