"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = "light" | "dark";
type Lang = "en" | "id";

interface ThemeCtx {
    theme: Theme;
    toggleTheme: () => void;
}
interface LangCtx {
    lang: Lang;
    toggleLang: () => void;
    t: (key: string) => string;
}

// ─── Dictionaries ─────────────────────────────────────────────────────────────
const dict: Record<Lang, Record<string, string>> = {
    en: {
        dashboard: "Dashboard",
        accounts: "Chart of Accounts",
        accountsSubtitle: "General ledger accounts",
        journals: "Journal Entries",
        journalsSubtitle: "Double-entry transactions",
        customers: "Customers",
        customersSubtitle: "Manage customers and clients",
        invoices: "Invoices (AR)",
        invoicesSubtitle: "Customer sales invoices",
        suppliers: "Suppliers",
        suppliersSubtitle: "Manage suppliers and vendors",
        bills: "Bills (AP)",
        billsSubtitle: "Supplier purchase bills",
        items: "Items / Stock",
        itemsSubtitle: "Inventory and services catalog",
        reports: "Reports",
        reportsSubtitle: "Financial statements and accounting reports",
        signOut: "Sign out",
        darkMode: "Dark mode",
        language: "Language",
        // Actions & Buttons
        new: "New",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        actions: "Actions",
        search: "Search...",
        // Table Headers & Labels
        code: "Code",
        name: "Name",
        contact: "Contact",
        address: "Address",
        type: "Type",
        date: "Date",
        number: "Number",
        party: "Party / Name",
        customer: "Customer",
        supplier: "Supplier",
        total: "Total",
        paid: "Paid",
        status: "Status",
        unit: "Unit",
        price: "Price",
        cost: "Cost",
        stock: "Stock Quantity",
        debit: "Debit",
        credit: "Credit",
        description: "Description",
        active: "Active",
        inactive: "Inactive",
        toggleStatus: "Toggle Status",
        previous: "Previous",
        next: "Next",
        page: "Page",
        of: "of",
        showing: "Showing",
        entries: "entries",
        noRecords: "No records found.",
        noAccounts: "No accounts found.",
        noJournals: "No journal entries found.",
        noInvoices: "No invoices found.",
        noBills: "No bills found.",
        noItems: "No stock items found.",
        loading: "Loading...",
        view: "View",
        downloadPdf: "Download PDF",
        // Dashboard
        financialOverview: "Financial overview",
        totalSales: "Total Sales",
        receivable: "Receivable (AR)",
        payable: "Payable (AP)",
        stockItems: "Stock Items",
        salesTrend: "Sales Trend",
        monthlyInvoicedSales: "Monthly invoiced sales",
        quickActions: "Quick Actions",
        newInvoice: "New Invoice",
        newBill: "New Bill",
        newJournal: "New Journal",
        viewReports: "View Reports",
        customerPortal: "Customer Portal",
        customerMode: "Customer Mode",
        useCaseDemo: "Use-Case Demo",
        myProfile: "My Profile",
        changePassword: "Change Password",
        // Reports & Smart Planner
        trialBalance: "Trial Balance",
        profitAndLoss: "Profit & Loss",
        balanceSheet: "Balance Sheet",
        income: "Income",
        expenses: "Expenses",
        totalIncome: "Total Income",
        totalExpenses: "Total Expenses",
        netProfit: "Net Profit",
        assets: "Assets",
        liabilities: "Liabilities",
        equity: "Equity",
        totalAssets: "Total Assets",
        totalLiabilities: "Total Liabilities",
        currentEarnings: "Current Earnings",
        totalEquity: "Total Equity",
        liabilitiesAndEquity: "Liabilities + Equity",
        smartPlannerTitle: "Smart Planner & Strategic Advisor",
        smartPlannerSub: "Financial Planning & Target Profit Simulation",
        financialParams: "1. Financial Target Parameters",
        targetNetProfit: "Target Net Profit",
        timeframeMonths: "Timeframe (Months)",
        expenseEfficiency: "Expense Efficiency (%)",
        strategicRecs: "Strategic Recommendations:",
        addSalesNeeded: "Increase sales by at least",
        perMonth: "/month",
        overNext: "over the next",
        months: "months.",
        costEfficiencyNote: "Expense efficiency will reduce total expenses to",
        visualAnalysisTitle: "2. Sales Target Comparison Analysis",
        currentIncomeLabel: "Current Income",
        targetStandardLabel: "Standard Sales Target",
        targetOptimizedLabel: "Target + Efficiency",
        profitGap: "Profit Gap to Target",
        targetProfitLabel: "Target Profit",
        // Customer Portal
        portalSubtitle: "Check bills, invoice status, and make self-service payments",
        welcomeCustomer: "Welcome, Customer",
        totalInvoices: "Total Invoices",
        unpaidInvoices: "Unpaid Invoices",
        outstandingAmount: "Outstanding Amount",
        paymentSuccess: "Payment for",
        amountOf: "amounting to",
        successPaid: "successfully settled!",
        invoiceList: "Your Invoices List",
        refresh: "Refresh",
        invoiceNo: "Invoice No",
        dueDate: "Due Date",
        totalBill: "Total Bill",
        paidAmount: "Paid Amount",
        billingStatus: "Billing Status",
        customerAction: "Customer Action",
        noInvoicesFound: "No invoices found.",
        clickToLoad: 'Click "Check My Invoices" above to load bills.',
        paymentHistory: "Payment History",
        myInvoices: "My Invoices & Pay",
        productCatalog: "Product & Service Catalog",
        // My Profile & Change Password
        profileTitle: "Company Profile",
        profileSubtitle: "View and update your company details.",
        customerCode: "Customer Code",
        companyName: "Company Name",
        email: "Email",
        phone: "Phone",
        saveChanges: "Save Changes",
        profileSaved: "Profile saved successfully",
        changePasswordTitle: "Change Password",
        changePasswordSubtitle: "Update your portal account password.",
        currentPassword: "Current Password",
        newPassword: "New Password",
        updatePassword: "Update Password",
        passwordChanged: "Password changed successfully",
        // Invoice status badges
        paidTag: "✅ PAID",
        paidStatus: "✅ PAID",
        unpaidStatus: "⚠️ UNPAID",
        paidDone: "✓ Paid",
        paidBadgeText: "PAID",
        payNow: "💳 Pay & Self-Settlement",
        processing: "Processing...",
        deleteAccount: "Delete this account?",
        deleteBill: "Delete this bill?",
        deleteInvoice: "Delete this invoice?",
        deleteItem: "Delete this item?",
        deleteJournal: "Delete this journal?",
        deleteCustomer: "Delete this customer?",
        deleteSupplier: "Delete this supplier?",
        deleteRecord: "Delete this record?",
    },
    id: {
        dashboard: "Dasbor",
        accounts: "Bagan Akun",
        accountsSubtitle: "Akun buku besar umum",
        journals: "Entri Jurnal",
        journalsSubtitle: "Transaksi jurnal berpasangan",
        customers: "Pelanggan",
        customersSubtitle: "Kelola pelanggan dan klien",
        invoices: "Faktur (AR)",
        invoicesSubtitle: "Faktur penjualan pelanggan",
        suppliers: "Pemasok",
        suppliersSubtitle: "Kelola pemasok dan vendor",
        bills: "Tagihan (AP)",
        billsSubtitle: "Tagihan pembelian dari pemasok",
        items: "Barang / Stok",
        itemsSubtitle: "Katalog persediaan dan jasa",
        reports: "Laporan",
        reportsSubtitle: "Laporan keuangan dan ikhtisar pembukuan",
        signOut: "Keluar",
        darkMode: "Mode gelap",
        language: "Bahasa",
        // Actions & Buttons
        new: "Baru",
        edit: "Ubah",
        delete: "Hapus",
        save: "Simpan",
        cancel: "Batal",
        actions: "Aksi",
        search: "Cari...",
        // Table Headers & Labels
        code: "Kode",
        name: "Nama",
        contact: "Kontak",
        address: "Alamat",
        type: "Tipe",
        date: "Tanggal",
        number: "Nomor",
        party: "Pihak / Nama",
        customer: "Pelanggan",
        supplier: "Pemasok",
        total: "Total",
        paid: "Dibayar",
        status: "Status",
        unit: "Satuan",
        price: "Harga Jual",
        cost: "Harga Beli / Pokok",
        stock: "Jumlah Stok",
        debit: "Debit",
        credit: "Kredit",
        description: "Deskripsi",
        active: "Aktif",
        inactive: "Nonaktif",
        toggleStatus: "Ubah Status",
        previous: "Sebelumnya",
        next: "Selanjutnya",
        page: "Halaman",
        of: "dari",
        showing: "Menampilkan",
        entries: "data",
        noRecords: "Tidak ada data.",
        noAccounts: "Tidak ada akun ditemukan.",
        noJournals: "Tidak ada entri jurnal ditemukan.",
        noInvoices: "Tidak ada faktur ditemukan.",
        noBills: "Tidak ada tagihan ditemukan.",
        noItems: "Tidak ada barang stok ditemukan.",
        loading: "Memuat...",
        view: "Lihat",
        downloadPdf: "Unduh PDF",
        // Dashboard
        financialOverview: "Ikhtisar keuangan",
        totalSales: "Total Penjualan",
        receivable: "Piutang (AR)",
        payable: "Hutang (AP)",
        stockItems: "Stok Barang",
        salesTrend: "Tren Penjualan",
        monthlyInvoicedSales: "Penjualan bulanan dari faktur",
        quickActions: "Aksi Cepat",
        newInvoice: "Faktur Baru",
        newBill: "Tagihan Baru",
        newJournal: "Jurnal Baru",
        viewReports: "Lihat Laporan",
        customerPortal: "Portal Pelanggan",
        customerMode: "Mode Pelanggan",
        useCaseDemo: "Demo Use-Case",
        myProfile: "Profil Saya",
        changePassword: "Ganti Password",
        // Reports & Smart Planner
        trialBalance: "Neraca Saldo",
        profitAndLoss: "Laba Rugi",
        balanceSheet: "Neraca",
        income: "Pendapatan",
        expenses: "Beban",
        totalIncome: "Total Pendapatan",
        totalExpenses: "Total Beban",
        netProfit: "Laba Bersih",
        assets: "Aset",
        liabilities: "Kewajiban",
        equity: "Ekuitas",
        totalAssets: "Total Aset",
        totalLiabilities: "Total Kewajiban",
        currentEarnings: "Laba Berjalan",
        totalEquity: "Total Ekuitas",
        liabilitiesAndEquity: "Kewajiban + Ekuitas",
        smartPlannerTitle: "Smart Planner & Penasihat Strategis",
        smartPlannerSub: "Perencanaan Keuangan & Simulasi Target Laba",
        financialParams: "1. Parameter Target Keuangan",
        targetNetProfit: "Target Laba Bersih",
        timeframeMonths: "Jangka Waktu (Bulan)",
        expenseEfficiency: "Efisiensi Beban (%)",
        strategicRecs: "Rekomendasi Langkah Strategis:",
        addSalesNeeded: "Tambahkan penjualan minimal",
        perMonth: "/bulan",
        overNext: "selama",
        months: "bulan ke depan.",
        costEfficiencyNote: "Efisiensi beban akan menurunkan pengeluaran menjadi",
        visualAnalysisTitle: "2. Visual Analisis Komparasi Target Penjualan",
        currentIncomeLabel: "Pendapatan Saat Ini",
        targetStandardLabel: "Target Penjualan (Standard)",
        targetOptimizedLabel: "Target + Efisiensi",
        profitGap: "Selisih Laba ke Target",
        targetProfitLabel: "Target Laba",
        // Customer Portal
        portalSubtitle: "Cek tagihan, status faktur, dan lakukan pelunasan mandiri",
        welcomeCustomer: "Selamat Datang, Pelanggan",
        totalInvoices: "Total Faktur",
        unpaidInvoices: "Belum Dibayar",
        outstandingAmount: "Sisa Tagihan",
        paymentSuccess: "Pembayaran",
        amountOf: "sebesar",
        successPaid: "berhasil dilunasi!",
        invoiceList: "Daftar Faktur Penagihan Anda",
        refresh: "Refresh",
        invoiceNo: "No. Faktur",
        dueDate: "Jatuh Tempo",
        totalBill: "Total Tagihan",
        paidAmount: "Telah Dibayar",
        billingStatus: "Status Penagihan",
        customerAction: "Aksi Pelanggan",
        noInvoicesFound: "Tidak ada faktur ditemukan.",
        clickToLoad: 'Klik "Cek Faktur Penagihan Saya" di atas untuk memuat tagihan.',
        paymentHistory: "Riwayat Pembayaran",
        myInvoices: "Faktur Saya & Bayar",
        productCatalog: "Katalog Barang & Jasa",
        // My Profile & Change Password
        profileTitle: "Profil Perusahaan",
        profileSubtitle: "Lihat dan perbarui data perusahaan Anda.",
        customerCode: "Kode Customer",
        companyName: "Nama Perusahaan",
        email: "Email",
        phone: "Telepon",
        saveChanges: "Simpan Perubahan",
        profileSaved: "Profil berhasil disimpan",
        changePasswordTitle: "Ganti Password",
        changePasswordSubtitle: "Perbarui password akun portal Anda.",
        currentPassword: "Password Lama",
        newPassword: "Password Baru",
        updatePassword: "Ubah Password",
        passwordChanged: "Password berhasil diubah",
        // Invoice status badges
        paidTag: "✅ LUNAS",
        paidStatus: "✅ LUNAS (PAID)",
        unpaidStatus: "⚠️ BELUM DIBAYAR",
        paidDone: "✓ Terbayar",
        paidBadgeText: "LUNAS",
        payNow: "💳 Bayar & Pelunasan Mandiri",
        processing: "Memproses...",
        deleteAccount: "Hapus akun ini?",
        deleteBill: "Hapus tagihan ini?",
        deleteInvoice: "Hapus faktur ini?",
        deleteItem: "Hapus barang ini?",
        deleteJournal: "Hapus jurnal ini?",
        deleteCustomer: "Hapus pelanggan ini?",
        deleteSupplier: "Hapus pemasok ini?",
        deleteRecord: "Hapus data ini?",
    },
};

// ─── Theme Context ─────────────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeCtx>({
    theme: "light",
    toggleTheme: () => { },
});

// ─── Lang Context ─────────────────────────────────────────────────────────────
const LangContext = createContext<LangCtx>({
    lang: "en",
    toggleLang: () => { },
    t: (k) => k,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppSettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [theme, setTheme] = useState<Theme>("light");
    const [lang, setLang] = useState<Lang>("en");
    const [mounted, setMounted] = useState(false);

    // Read persisted values on mount
    useEffect(() => {
        const savedTheme = (localStorage.getItem("ac-theme") as Theme) ?? "light";
        const savedLang = (localStorage.getItem("ac-lang") as Lang) ?? "en";
        setTheme(savedTheme);
        setLang(savedLang);
        setMounted(true);
    }, []);

    // Apply dark class to <html>
    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("ac-theme", theme);
    }, [theme, mounted]);

    // Persist lang
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem("ac-lang", lang);
    }, [lang, mounted]);

    const toggleTheme = useCallback(
        () => setTheme((t) => (t === "light" ? "dark" : "light")),
        []
    );
    const toggleLang = useCallback(
        () => setLang((l) => (l === "en" ? "id" : "en")),
        []
    );
    const t = useCallback(
        (key: string) => dict[lang][key] ?? key,
        [lang]
    );

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <LangContext.Provider value={{ lang, toggleLang, t }}>
                {children}
            </LangContext.Provider>
        </ThemeContext.Provider>
    );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export const useTheme = () => useContext(ThemeContext);
export const useLang = () => useContext(LangContext);
