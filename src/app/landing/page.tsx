"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const BRAND = "#80C31E";
const BRAND_DARK = "#6EAC13";
const AC = "https://www.autocountsoft.com";

/* ─────────────────────────── DATA ─────────────────────────── */
const NAV_PRODUCTS_ON_PREMISE = [
    { label: "Accounting 2.0", href: `${AC}/pro-accounting2.html`, desc: "Perfectly integrated financial and business automation.", logo: "/images/nav-accounting.png", logoW: 132 },
    { label: "POS 5.0", href: `${AC}/pro-pos.html`, desc: "Full POS for Retails or F&B business, standalone or multi-outlets.", logo: "/images/nav-pos.png", logoW: 57 },
];
const NAV_PRODUCTS_CLOUD = [
    { label: "Cloud Accounting", href: `${AC}/pro-cloud-acc.html`, desc: "A new way of accessing your accounting software when and where you need it.", logo: "/images/product-cloudacc.png", logoW: 156 },
    { label: "HRMS", href: `${AC}/pro-payroll.html`, desc: "Automate payroll, streamline leave management, and empower employees all with Siora AI. Work faster, smarter, and error-free.", logo: "/images/product-hrms.png", logoW: 120 },
    { label: "OneSales", href: `${AC}/pro-onesales.html`, desc: "Unify Cross-channel Sales Data and Grow Customer Base Faster.", logo: "/images/product-onesales.png", logoW: 101 },
    { label: "OneRewards", href: `${AC}/onerewards.html`, desc: "Reward management system which enhance customer loyalty.", logo: "/images/product-onerewards.png", logoW: 129 },
];
const NAV_EINVOICE = { label: "LHDN e-Invoice", href: `${AC}/autocount-einvoice-solution-malaysia_Why_AC.html`, desc: "Easily request and submit LHDN compliant e-Invoices directly in AutoCount." };

const NAV_COMPANY = [
    { label: "About Us", href: `${AC}/about.html` },
    { label: "Hall of Fame", href: `${AC}/hallfame.html` },
    { label: "Newsroom", href: `${AC}/newsroom.html` },
    { label: "Our Customers", href: `${AC}/testimonial.html` },
    { label: "Investors", href: `${AC}/investor-relations/index.html` },
];
const NAV_RESOURCES = [
    { label: "Training & Event", href: `${AC}/training.html` },
    { label: "Blog", href: `${AC}/blog.html` },
    { label: "Wiki Knowledge Base", href: "https://wiki.autocountsoft.com/wiki/Main_Page" },
    { label: "AutoCount Academy", href: `${AC}/academy.html` },
    { label: "HRDF Courses", href: `${AC}/hrdf-courses.html` },
    { label: "Free eBook", href: `${AC}/free-ebook.html` },
];

const SERVICE_NAV = [
    { label: "Overview", id: "overview" },
    { label: "Features", id: "features" },
    { label: "Modules", id: "modules" },
    { label: "Why AutoCount", id: "benefits" },
    { label: "Products", id: "products" },
    { label: "Testimonials", id: "testimonials" },
];

const FEATURES = [
    {
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
        title: "Real-Time Dashboard",
        desc: "Get a comprehensive overview of your business performance with real-time financial dashboards and detailed analytics.",
    },
    {
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" /><path d="M9 15h6" /><path d="M9 11h6" />
            </svg>
        ),
        title: "LHDN e-Invoice Ready",
        desc: "Easily request and submit LHDN compliant e-Invoices directly from the system. Stay ahead of regulatory requirements.",
    },
    {
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
        ),
        title: "Inventory Management",
        desc: "Track stock levels, manage multiple warehouses, and optimise your inventory with automated reorder points.",
    },
    {
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="8" /><line x1="3" x2="6" y1="3" y2="6" />
                <line x1="21" x2="18" y1="3" y2="6" /><line x1="12" x2="12" y1="12" y2="8" />
                <path d="M12 12 15 15" />
            </svg>
        ),
        title: "Multi-Currency Support",
        desc: "Conduct business globally with support for multiple currencies, automatic exchange rate updates, and GST/SST compliance.",
    },
    {
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
            </svg>
        ),
        title: "Advanced Reporting",
        desc: "Generate over 300+ standard reports or customise your own. Export to Excel, PDF, and more with a single click.",
    },
    {
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
        ),
        title: "Seamless Integration",
        desc: "Connect with banking, e-commerce, logistics, and CRM platforms. Open API available for custom integrations.",
    },
];

const MODULES = [
    { icon: "📋", title: "Invoicing", desc: "Quotes, DO, Invoice, CN, DN" },
    { icon: "🛒", title: "Purchasing", desc: "PO, GRN, Purchase Invoices" },
    { icon: "🏦", title: "Banking", desc: "Payments, Receipts, Reconciliation" },
    { icon: "📒", title: "General Ledger", desc: "Journal, Trial Balance, P&L" },
    { icon: "📦", title: "Stock Control", desc: "Multi-location, Serial, Batch" },
    { icon: "💰", title: "GST / SST", desc: "Automatic Tax Computation" },
    { icon: "🏭", title: "Manufacturing", desc: "BOM, Production, Costing" },
    { icon: "📊", title: "Reporting", desc: "300+ Built-in Reports" },
];

const BENEFITS = [
    { icon: "🛡️", title: "Secure & Reliable", desc: "On-premise deployment with bank-level security. Your data stays on your server, fully under your control." },
    { icon: "⚙️", title: "Highly Customisable", desc: "Tailor-made solutions with plug-in support and open API. Adapt the software to fit your unique workflow." },
    { icon: "🚀", title: "Fast Performance", desc: "Optimised for speed even with large datasets. Process thousands of transactions without lag." },
    { icon: "🤝", title: "Local Support Network", desc: "Over 500+ certified dealers and partners across Indonesia providing on-ground technical support." },
    { icon: "📱", title: "Mobile Accessible", desc: "Access your accounting data on-the-go through mobile apps and cloud-connected solutions." },
    { icon: "💰", title: "Cost Effective", desc: "Affordable licensing with no hidden fees. One-time purchase or flexible subscription options available." },
];

const PRODUCTS = [
    { title: "Accounting 2.0", desc: "Complete on-premise accounting with perfectly integrated financial and business automation features.", color: "#80C31E", category: "ON-PREMISE", href: `${AC}/pro-accounting2.html` },
    { title: "POS 5.0", desc: "Full POS solution for Retail or F&B business, standalone or multi-outlets with real-time sync.", color: "#E91E63", category: "ON-PREMISE", href: `${AC}/pro-pos.html` },
    { title: "Cloud Accounting", desc: "Access your accounting software when and where you need it with cloud-based flexibility.", color: "#2196F3", category: "CLOUD", href: `${AC}/pro-cloud-acc.html` },
    { title: "HRMS", desc: "Automate payroll, streamline leave management, and empower employees with Siora AI.", color: "#FF9800", category: "CLOUD", href: `${AC}/pro-payroll.html` },
    { title: "OneSales", desc: "Unify cross-channel sales data and grow your customer base faster with integrated tools.", color: "#9C27B0", category: "CLOUD", href: `${AC}/pro-onesales.html` },
    { title: "LHDN e-Invoice", desc: "Submit LHDN compliant e-Invoices directly in AutoCount. Stay compliant with ease.", color: "#00BCD4", category: "COMPLIANCE", href: `${AC}/autocount-einvoice-solution-malaysia_Why_AC.html` },
];

const TESTIMONIALS = [
    {
        videoId: "mXTGYGvT58A",
        name: "AutoCount Accounting",
        company: "AutoCount Sdn Bhd",
        role: "Product Overview",
        quote: "AutoCount Accounting V2 provides perfectly integrated financial and business automation for SMEs across Southeast Asia.",
    },
    {
        videoId: "NNnJevwax-8",
        name: "AutoCount Cloud",
        company: "AutoCount Sdn Bhd",
        role: "Cloud Accounting",
        quote: "Access your accounting software when and where you need it. Cloud Accounting makes remote collaboration effortless.",
    },
    {
        videoId: "fTLWEGZXApY",
        name: "AutoCount HRMS",
        company: "AutoCount Sdn Bhd",
        role: "HRMS Solution",
        quote: "Automate payroll, streamline leave management, and empower your employees — all powered by Siora AI.",
    },
];

/* ─────────────── HOOKS ─────────────── */
function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const { ref, visible } = useReveal();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/* ─────────────── DROPDOWN COMPONENTS ─────────────── */
function NavDropdown({ label, children }: { label: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    return (
        <li ref={ref} className="relative group">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="flex items-center gap-1.5 px-4 py-6 text-sm font-semibold text-gray-600 hover:text-[#80C31E] transition-colors"
            >
                {label}
                <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""} group-hover:rotate-180`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div className={`absolute top-full left-0 min-w-[340px] bg-white border border-gray-100 rounded-lg shadow-2xl transition-all duration-200 z-50 ${open ? "opacity-100 visible translate-y-0 pointer-events-auto" : "opacity-0 invisible translate-y-2 pointer-events-none"} group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto`}>
                {children}
            </div>
        </li>
    );
}

function ProductMegaMenu() {
    return (
        <div className="p-6 w-[560px]">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] pb-3 border-b border-gray-200 mb-4">On-Premise</div>
            <div className="grid grid-cols-2 gap-6 mb-2">
                {NAV_PRODUCTS_ON_PREMISE.map((p) => (
                    <a key={p.label} href={p.href} className="block group">
                        <img src={p.logo} alt={p.label} style={{ height: 29, width: "auto" }} className="mb-2" />
                        <div className="text-[13px] text-gray-500 leading-snug group-hover:text-[#80C31E] transition-colors">{p.desc}</div>
                    </a>
                ))}
            </div>
            <a href={NAV_EINVOICE.href} className="block py-5 group">
                <div className="text-xl font-extrabold text-[#28ad62] mb-1.5">LHDN e-Invoice</div>
                <div className="text-[13px] text-gray-500 leading-snug group-hover:text-[#80C31E] transition-colors">{NAV_EINVOICE.desc}</div>
            </a>

            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] pb-3 border-b border-gray-200 mb-4 mt-2">Cloud-Based</div>
            <div className="grid grid-cols-2 gap-6">
                {NAV_PRODUCTS_CLOUD.map((p) => (
                    <a key={p.label} href={p.href} className="block group">
                        <img src={p.logo} alt={p.label} style={{ height: 28, width: "auto" }} className="mb-2" />
                        <div className="text-[13px] text-gray-500 leading-snug group-hover:text-[#80C31E] transition-colors">{p.desc}</div>
                    </a>
                ))}
            </div>
        </div>
    );
}

function SimpleDropdown({ items }: { items: { label: string; href: string }[] }) {
    return (
        <div className="p-2">
            {items.map((i) => (
                <a key={i.label} href={i.href} className="block px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-green-50 hover:text-[#80C31E] transition-colors font-medium">
                    {i.label}
                </a>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState("overview");
    const [showTop, setShowTop] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);
    const serviceNavRef = useRef<HTMLDivElement>(null);
    const [serviceNavSticky, setServiceNavSticky] = useState(false);

    /* Scroll handler */
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 30);
            setShowTop(window.scrollY > 600);

            // Service nav sticky
            if (serviceNavRef.current) {
                const rect = serviceNavRef.current.getBoundingClientRect();
                setServiceNavSticky(rect.top <= 72);
            }

            // Active section tracking
            for (const nav of [...SERVICE_NAV].reverse()) {
                const el = document.getElementById(nav.id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 200) {
                        setActiveSection(nav.id);
                        break;
                    }
                }
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Counter animation */
    useEffect(() => {
        const el = statsRef.current;
        if (!el) return;
        const animate = (target: HTMLElement, val: number, suffix: string) => {
            let cur = 0;
            const inc = val / 60;
            const t = setInterval(() => {
                cur += inc;
                if (cur >= val) { cur = val; clearInterval(t); }
                if (val >= 1000) target.textContent = Math.floor(cur / 1000) + "K+";
                else if (val < 10) target.textContent = cur.toFixed(1) + suffix;
                else target.textContent = Math.floor(cur) + suffix;
            }, 16);
        };
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                const spans = el.querySelectorAll("[data-counter]");
                if (spans[0]) animate(spans[0] as HTMLElement, 600000, "");
                if (spans[1]) animate(spans[1] as HTMLElement, 30, "+");
                if (spans[2]) animate(spans[2] as HTMLElement, 99.9, "%");
                obs.unobserve(el);
            }
        }, { threshold: 0.5 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const scrollTo = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>

            {/* ══════════ TOP MINI NAV BAR (like original) ══════════ */}
            <div className={`bg-[#2a2a2a] text-white text-xs hidden lg:block transition-all duration-300 ${scrolled ? "max-h-0 opacity-0 overflow-hidden" : "max-h-12 opacity-100"}`}>
                <div className="max-w-[1170px] mx-auto px-4 flex justify-end items-center gap-1">
                    <div className="relative group">
                        <button
                            className="flex items-center gap-1.5 px-3 py-2 hover:text-[#80C31E] transition-colors"
                            onClick={(e) => {
                                const m = e.currentTarget.nextElementSibling as HTMLElement;
                                m.classList.toggle("hidden");
                            }}
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                            Indonesia
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                        <div className="hidden absolute top-full right-0 min-w-[160px] bg-[#3a3a3a] rounded-lg shadow-xl py-1 z-50">
                            <a href="https://www.autocountsoft.com" className="block px-4 py-2 hover:bg-white/10 hover:text-[#80C31E]">Malaysia</a>
                            <a href="https://www.autocountsoft.com.sg" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-white/10 hover:text-[#80C31E]">Singapore</a>
                            <a href="https://ph.autocountsoft.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-white/10 hover:text-[#80C31E]">Philippines</a>
                        </div>
                    </div>
                    <span className="text-gray-600">|</span>
                    <a href={`${AC}/contact.html`} className="flex items-center gap-1.5 px-3 py-2 hover:text-[#80C31E] transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" /></svg>
                        Contact Us
                    </a>
                    <span className="text-gray-600">|</span>
                    <Link href="/login" className="flex items-center gap-1.5 px-3 py-2 hover:text-[#80C31E] transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        FREE TRIAL
                    </Link>
                    <span className="text-gray-600">|</span>
                    <Link href="/login" className="flex items-center gap-1.5 px-3 py-2 hover:text-[#80C31E] transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Dealer Login
                    </Link>
                </div>
            </div>

            {/* ══════════ MAIN NAVBAR ══════════ */}
            <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
                <div className="max-w-[1170px] mx-auto px-4 flex items-center justify-between">
                    <a href="#" className="flex items-center gap-0 py-3" onClick={() => scrollTo("overview")}>
                        <Image src="/images/ac-logo.png" alt="AutoCount" width={160} height={36} className="h-9 w-auto" priority />
                    </a>

                    {/* Desktop nav */}
                    <ul className="hidden lg:flex items-center">
                        <NavDropdown label="Products">
                            <ProductMegaMenu />
                        </NavDropdown>
                        <NavDropdown label="Company">
                            <SimpleDropdown items={NAV_COMPANY} />
                        </NavDropdown>
                        <NavDropdown label="Resources">
                            <SimpleDropdown items={NAV_RESOURCES} />
                        </NavDropdown>
                        <li>
                            <a href={`${AC}/pro-cloud-acc-accountant.html`} className="px-4 py-6 text-sm font-semibold text-gray-600 hover:text-[#80C31E] transition-colors">
                                For Accountants & Bookkeepers
                            </a>
                        </li>
                    </ul>

                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden flex flex-col gap-[5px] p-2"
                        onClick={() => { setMenuOpen(!menuOpen); setMobileSubmenu(null); }}
                        aria-label="Menu"
                    >
                        <span className={`block w-6 h-0.5 bg-gray-800 rounded transition-all ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-gray-800 rounded transition-all ${menuOpen ? "opacity-0" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-gray-800 rounded transition-all ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg max-h-[80vh] overflow-y-auto">
                        <div className="p-4 space-y-1">
                            {[
                                { label: "Products", key: "products", items: [...NAV_PRODUCTS_ON_PREMISE, ...NAV_PRODUCTS_CLOUD, NAV_EINVOICE] },
                                { label: "Company", key: "company", items: NAV_COMPANY },
                                { label: "Resources", key: "resources", items: NAV_RESOURCES },
                            ].map((menu) => (
                                <div key={menu.key}>
                                    <button
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                                        onClick={() => setMobileSubmenu(mobileSubmenu === menu.key ? null : menu.key)}
                                    >
                                        {menu.label}
                                        <svg className={`w-4 h-4 transition-transform ${mobileSubmenu === menu.key ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                                    </button>
                                    {mobileSubmenu === menu.key && (
                                        <div className="pl-4 space-y-0.5 pb-2">
                                            {menu.items.map((i) => (
                                                <a key={i.label} href={i.href} className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:text-[#80C31E] hover:bg-green-50 transition-colors">
                                                    {i.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <a href={`${AC}/pro-cloud-acc-accountant.html`} className="block px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 rounded-lg">For Accountants</a>
                            <div className="border-t border-gray-100 pt-3 mt-2 space-y-2">
                                <Link href="/login" className="block text-center px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-[#80C31E] transition-colors">Dealer Login</Link>
                                <Link href="/login" className="block text-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white" style={{ background: BRAND }}>Free Trial</Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* ══════════ SERVICE NAV BAR (like original green bar) ══════════ */}
            <div ref={serviceNavRef} className={`bg-[#333] z-40 transition-all ${serviceNavSticky ? "sticky top-[60px]" : ""}`}>
                <div className="max-w-[1170px] mx-auto flex overflow-x-auto scrollbar-none">
                    {SERVICE_NAV.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => scrollTo(s.id)}
                            className={`relative px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                                activeSection === s.id
                                    ? "text-white bg-[#80C31E]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {s.label}
                            {activeSection === s.id && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent" style={{ borderTopColor: BRAND, bottom: "-8px" }} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ══════════ HERO SECTION ══════════ */}
            <section className="relative overflow-hidden" id="overview">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f8fdf3] via-white to-[#f0f7e6]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2380C31E' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />

                <div className="relative max-w-[1170px] mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left content */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-[#f0f9e0] text-[#5a9e0a] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
                            🏆 #1 Accounting Software in Indonesia
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.1] tracking-tight mb-6">
                            Perfectly Integrated{" "}
                            <span style={{ color: BRAND }}>Financial & Business</span>{" "}
                            Automation
                        </h1>
                        <p className="text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                            Manage your business finances with AutoCount Accounting V2 — secure, customisable tools with full reporting and flexible on-premise solutions designed for SMEs.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                style={{ background: BRAND }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                Download Free Trial
                            </Link>
                            <button
                                onClick={() => scrollTo("features")}
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md font-semibold border-2 border-gray-200 hover:border-[#80C31E] hover:text-[#80C31E] transition-all"
                            >
                                Discover Features →
                            </button>
                        </div>

                        {/* Stats */}
                        <div ref={statsRef} className="flex gap-10 justify-center lg:justify-start pt-6 border-t border-gray-200">
                            {[
                                { label: "Businesses Served", suffix: "K+" },
                                { label: "Years of Excellence", suffix: "+" },
                                { label: "Uptime Reliability", suffix: "%" },
                            ].map((s, i) => (
                                <div key={i} className="text-center lg:text-left">
                                    <div data-counter className="text-3xl font-extrabold" style={{ color: BRAND }}>0</div>
                                    <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Dashboard Image */}
                    <div className="relative hidden lg:block">
                        <div className="absolute -top-4 -left-6 z-20 flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold animate-bounce" style={{ animationDuration: "4s" }}>
                            <span className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-lg">📊</span>
                            Real-time Reports
                        </div>
                        <div className="absolute bottom-8 -right-6 z-20 flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
                            <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">🔒</span>
                            Bank-level Security
                        </div>
                        <div className="absolute bottom-28 -left-8 z-20 flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-xl text-sm font-semibold animate-bounce" style={{ animationDuration: "4s", animationDelay: "2s" }}>
                            <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg">⚡</span>
                            Lightning Fast
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200" style={{ transform: "perspective(1000px) rotateY(-3deg) rotateX(1deg)" }}>
                            <Image src="/images/dashboard-mockup.png" alt="AutoCount Dashboard" width={700} height={450} priority className="w-full h-auto" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ FEATURES ══════════ */}
            <section className="py-20 bg-white" id="features">
                <div className="max-w-[1170px] mx-auto px-4">
                    <Reveal className="text-center mb-14">
                        <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: BRAND }}>Powerful Features</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                            Everything You Need to Manage<br />Your <span style={{ color: BRAND }}>Business Finances</span>
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">AutoCount Accounting V2 provides a comprehensive set of tools to streamline your financial management.</p>
                    </Reveal>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURES.map((f, i) => (
                            <Reveal key={i} delay={i * 80}>
                                <div className="group bg-white border border-gray-100 rounded-xl p-8 hover:-translate-y-1 hover:shadow-xl hover:border-green-200 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" style={{ background: BRAND }} />
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 bg-green-50 text-[#80C31E] group-hover:bg-[#80C31E] group-hover:text-white">
                                        {f.icon}
                                    </div>
                                    <h4 className="text-lg font-bold mb-3">{f.title}</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                                    <a href={`${AC}/pro-accounting2.html`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold mt-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: BRAND }}>
                                        Discover more →
                                    </a>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ MODULES ══════════ */}
            <section className="py-20 bg-[#f8f9fa]" id="modules">
                <div className="max-w-[1170px] mx-auto px-4">
                    <Reveal className="text-center mb-14">
                        <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: BRAND }}>Integrated Modules</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                            A Complete Suite of <span style={{ color: BRAND }}>Business Modules</span>
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Every module works together seamlessly for a unified accounting experience.</p>
                    </Reveal>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {MODULES.map((m, i) => (
                            <Reveal key={i} delay={i * 60}>
                                <div className="group bg-white border border-gray-100 rounded-xl p-6 text-center hover:-translate-y-1 hover:shadow-lg hover:border-green-200 transition-all cursor-pointer">
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center text-2xl group-hover:bg-[#80C31E] group-hover:scale-110 transition-all">
                                        {m.icon}
                                    </div>
                                    <h4 className="font-bold text-sm mb-1">{m.title}</h4>
                                    <p className="text-xs text-gray-400">{m.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ BENEFITS / WHY AUTOCOUNT ══════════ */}
            <section className="py-20 bg-[#2a2a2a] text-white relative overflow-hidden" id="benefits">
                <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full" style={{ background: `radial-gradient(circle, ${BRAND}15, transparent 70%)` }} />
                <div className="max-w-[1170px] mx-auto px-4 relative z-10">
                    <Reveal className="text-center mb-14">
                        <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: BRAND }}>Why AutoCount</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                            Trusted by <span style={{ color: BRAND }}>600,000+</span> Businesses<br />Across Southeast Asia
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Discover why leading SMEs choose AutoCount for their business management needs.</p>
                    </Reveal>
                    <div className="grid md:grid-cols-2 gap-5">
                        {BENEFITS.map((b, i) => (
                            <Reveal key={i} delay={i * 80}>
                                <div className="group flex gap-5 p-6 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.08] hover:border-[#80C31E]/30 transition-all">
                                    <div className="w-14 h-14 min-w-[56px] rounded-xl flex items-center justify-center text-2xl" style={{ background: `${BRAND}20` }}>
                                        {b.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">{b.title}</h4>
                                        <p className="text-sm text-gray-400 leading-relaxed">{b.desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ PRODUCTS ══════════ */}
            <section className="py-20 bg-white" id="products">
                <div className="max-w-[1170px] mx-auto px-4">
                    <Reveal className="text-center mb-14">
                        <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: BRAND }}>Our Products</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                            Complete <span style={{ color: BRAND }}>Business Solutions</span> for Every Need
                        </h2>
                    </Reveal>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PRODUCTS.map((p, i) => (
                            <Reveal key={i} delay={i * 80}>
                                <div className="group bg-white border border-gray-100 rounded-xl p-8 text-center hover:-translate-y-1 hover:shadow-xl transition-all relative overflow-hidden">
                                    <div className="absolute top-0 inset-x-0 h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{ background: p.color }} />
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ background: p.color + "15", color: p.color }}>{p.category}</span>
                                    <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">{p.desc}</p>
                                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-sm hover:gap-3 transition-all" style={{ color: BRAND }}>
                                        Learn More →
                                    </a>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ TESTIMONIALS ══════════ */}
            <section className="py-20 bg-[#f8f9fa]" id="testimonials">
                <div className="max-w-[1170px] mx-auto px-4">
                    <Reveal className="text-center mb-14">
                        <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: BRAND }}>Customer Stories</p>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                            What Our <span style={{ color: BRAND }}>Customers Say</span>
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Hear directly from businesses who transformed their operations with AutoCount.</p>
                    </Reveal>
                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <Reveal key={i} delay={i * 100}>
                                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all group">
                                    {/* Video Thumbnail with Play Button */}
                                    <a
                                        href={`https://www.youtube.com/watch?v=${t.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative block w-full overflow-hidden bg-black"
                                        style={{ paddingBottom: "56.25%" }}
                                    >
                                        {/* Thumbnail */}
                                        <img
                                            src={`https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg`}
                                            alt={`${t.name} testimonial`}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
                                        />
                                        {/* Dark overlay */}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                        {/* Play Button */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-7 h-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* YouTube logo watermark */}
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 rounded px-2 py-1">
                                            <svg className="w-4 h-3" viewBox="0 0 90 20" fill="white">
                                                <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
                                                <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
                                            </svg>
                                            <span className="text-white text-[10px] font-medium">YouTube</span>
                                        </div>
                                    </a>
                                    {/* Card Body */}
                                    <div className="p-6">
                                        <div className="flex gap-0.5 mb-3 text-amber-400">★★★★★</div>
                                        <blockquote className="text-sm text-gray-500 leading-relaxed italic mb-4">
                                            &ldquo;{t.quote}&rdquo;
                                        </blockquote>
                                        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ background: BRAND }}
                                            >
                                                {t.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800">{t.name}</div>
                                                <div className="text-xs text-gray-400">{t.role}, {t.company}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    {/* View more link */}
                    <Reveal className="text-center mt-10">
                        <a
                            href="https://www.youtube.com/@AutoCount"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 text-sm font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all"
                            style={{ borderColor: BRAND, color: BRAND }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-2.75 12.64 12.64 0 0 0-9.29 1.49A12.47 12.47 0 0 0 .6 14.13a12.55 12.55 0 0 0 3.58 8.8A12.46 12.46 0 0 0 12 26a12.57 12.57 0 0 0 10-4.95 12.46 12.46 0 0 0 2.53-10.1 4.78 4.78 0 0 1-4.94-4.26Z" /><path d="M9.5 15.5v-7l7 3.5-7 3.5z" fill="white" /></svg>
                            View More on YouTube
                        </a>
                    </Reveal>
                </div>
            </section>


            {/* ══════════ CTA ══════════ */}
            <section className="py-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1), transparent 50%)" }} />
                <div className="max-w-[1170px] mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        Ready to Transform Your Business?
                    </h2>
                    <p className="text-white/85 text-lg max-w-xl mx-auto mb-8">
                        Download AutoCount Accounting V2 and experience the power of integrated business management — free for 30 days.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-white font-semibold shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all" style={{ color: BRAND_DARK }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            Download Free Trial
                        </Link>
                        <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════ FOOTER ══════════ */}
            <footer className="bg-[#2a2a2a] text-gray-400 pt-16">
                <div className="max-w-[1170px] mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">
                        <div>
                            <div className="mb-5">
                                <Image src="/images/ac-logo-w.png" alt="AutoCount" width={160} height={36} className="h-8 w-auto brightness-0 invert" />
                            </div>
                            <p className="text-sm leading-relaxed mb-5">Indonesia&apos;s leading accounting software provider, serving over 600,000 businesses.</p>
                            <div className="flex gap-3">
                                {[
                                { n: "facebook", u: "https://www.facebook.com/autocountsoftware/" },
                                { n: "linkedin", u: "https://www.linkedin.com/company/autocount-my/" },
                                { n: "youtube", u: "https://www.youtube.com/channel/UCLKS_FVONt9orXlZb2zrHfQ" },
                                { n: "instagram", u: "https://www.instagram.com/autocountsoft/" },
                            ].map((s) => (
                                    <a key={s.n} href={s.u} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center hover:bg-[#80C31E] hover:text-white transition-all text-xs font-bold uppercase">
                                        {s.n[0]}
                                    </a>
                                ))}
                            </div>
                        </div>
                        {[
                            { title: "Products", items: [...NAV_PRODUCTS_ON_PREMISE, ...NAV_PRODUCTS_CLOUD, NAV_EINVOICE] },
                            { title: "Company", items: NAV_COMPANY },
                            { title: "Resources", items: NAV_RESOURCES },
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{col.title}</h4>
                                <ul className="space-y-2.5">
                                    {col.items.map((item) => (
                                        <li key={item.label}><a href={item.href} className="text-sm text-gray-500 hover:text-[#80C31E] transition-colors">{item.label}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/[0.08] py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <p>&copy; {new Date().getFullYear()} AutoCount Sdn. Bhd. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a href={`${AC}/privacy.html`} className="hover:text-[#80C31E] transition-colors">Privacy Policy</a>
                            <a href={`${AC}/terms_of_use.html`} className="hover:text-[#80C31E] transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ══════════ BACK TO TOP ══════════ */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`fixed bottom-8 right-8 w-12 h-12 rounded-full text-white flex items-center justify-center text-lg shadow-lg hover:-translate-y-1 transition-all z-50 ${showTop ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-5"}`}
                style={{ background: BRAND }}
                aria-label="Back to top"
            >
                ↑
            </button>
        </div>
    );
}
