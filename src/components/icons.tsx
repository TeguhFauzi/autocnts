type IconProps = { className?: string };

const base = (path: React.ReactNode) =>
    function Icon({ className = "w-5 h-5" }: IconProps) {
        return (
            <svg
                className={className}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {path}
            </svg>
        );
    };

export const IconDashboard = base(
    <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
);

export const IconAccounts = base(
    <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
    </>
);

export const IconJournal = base(
    <>
        <path d="M4 4h11l5 5v11a0 0 0 0 1 0 0H4z" />
        <path d="M14 4v5h5" />
        <path d="M8 13h7" />
        <path d="M8 17h7" />
    </>
);

export const IconCustomers = base(
    <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 11a3 3 0 1 0 0-6" />
        <path d="M19.5 20a4.5 4.5 0 0 0-3-4.2" />
    </>
);

export const IconInvoice = base(
    <>
        <path d="M6 3h9l4 4v14l-2.5-1.5L14 21l-2.5-1.5L9 21l-3-1.5V3z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
    </>
);

export const IconSupplier = base(
    <>
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10" />
    </>
);

export const IconBill = base(
    <>
        <path d="M18 3H6v18l3-1.5L12 21l3-1.5L18 21V3z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
    </>
);

export const IconStock = base(
    <>
        <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" />
        <path d="M3.3 7.5L12 12l8.7-4.5" />
        <path d="M12 12v9" />
    </>
);

export const IconReports = base(
    <>
        <path d="M4 20V4" />
        <path d="M4 20h16" />
        <path d="M8 16v-4" />
        <path d="M12 16V8" />
        <path d="M16 16v-6" />
    </>
);

export const IconLogout = base(
    <>
        <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
        <path d="M16 16l4-4-4-4" />
        <path d="M20 12H9" />
    </>
);

export const IconPlus = base(
    <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </>
);

export const IconArrowLeft = base(
    <>
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
    </>
);

export const IconTrash = base(
    <>
        <path d="M4 7h16" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </>
);

export const IconTrend = base(
    <>
        <path d="M3 17l6-6 4 4 7-7" />
        <path d="M14 8h5v5" />
    </>
);

export const IconEdit = base(
    <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </>
);

export const IconEye = base(
    <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
    </>
);

export const IconSun = base(
    <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>
);

export const IconMoon = base(
    <>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </>
);

export const IconGlobe = base(
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3c-2 3-3 5.5-3 9s1 6 3 9" />
        <path d="M12 3c2 3 3 5.5 3 9s-1 6-3 9" />
        <path d="M3.6 9h16.8M3.6 15h16.8" />
    </>
);

export const IconPower = base(
    <>
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
        <path d="M12 2v10" />
    </>
);

export const IconBan = base(
    <>
        <circle cx="12" cy="12" r="9" />
        <path d="M5.6 5.6l12.8 12.8" />
    </>
);

export const IconDownload = base(
    <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </>
);
