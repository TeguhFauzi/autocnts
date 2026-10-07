import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Routes that customers are allowed to access
const CUSTOMER_ALLOWED = ["/portal", "/api/portal", "/api/notifications"];

// Allowed route prefixes per role (after "/" exact match)
const ROLE_ALLOWED: Record<string, string[]> = {
    accountant: ["/accounts", "/journals", "/invoices", "/bills", "/reports", "/api/accounts", "/api/journals", "/api/invoices", "/api/bills", "/api/reports", "/api/notifications"],
    sales: ["/customers", "/invoices", "/items", "/reports", "/api/customers", "/api/invoices", "/api/items", "/api/reports", "/api/notifications"],
    purchase: ["/suppliers", "/bills", "/items", "/reports", "/api/suppliers", "/api/bills", "/api/items", "/api/reports", "/api/notifications"],
    warehouse: ["/items", "/reports", "/api/items", "/api/reports", "/api/notifications"],
};

function isAllowedForRole(pathname: string, role: string): boolean {
    const allowed = ROLE_ALLOWED[role];
    if (!allowed) return true;
    if (pathname === "/") return true;
    return allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const role = (req.nextauth.token as any)?.role as string | undefined;

        // Customer role: restrict to portal routes only
        if (role === "customer") {
            const isAllowed = CUSTOMER_ALLOWED.some((p) => pathname.startsWith(p));
            // Also allow API auth, _next, static
            const isSystem = pathname.startsWith("/api/auth") || pathname.startsWith("/_next");
            if (!isAllowed && !isSystem) {
                const url = req.nextUrl.clone();
                url.pathname = "/portal";
                return NextResponse.redirect(url);
            }
        }

        // Role-based access for back-office roles
        if (role && role in ROLE_ALLOWED) {
            const isSystem = pathname.startsWith("/api/auth") || pathname.startsWith("/_next");
            if (!isSystem && !isAllowedForRole(pathname, role)) {
                const url = req.nextUrl.clone();
                url.pathname = "/";
                return NextResponse.redirect(url);
            }
        }

        // Admin/user role: all routes accessible
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/landing",
        },
    }
);

export const config = {
    matcher: [
        "/((?!landing|login|api/auth|_next/static|_next/image|favicon.ico|images/).*)",
    ],
};
