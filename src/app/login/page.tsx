"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("admin@autocount.local");
    const [password, setPassword] = useState("admin123");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErr("");
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        if (res?.error) {
            setLoading(false);
            setErr("Invalid email or password");
            return;
        }
        // Get session to check role for redirect
        const session = await getSession();
        const role = (session?.user as any)?.role;
        if (role === "customer") {
            router.push("/portal");
        } else {
            router.push("/");
        }
        router.refresh();
        setLoading(false);
    }

    function fillCredentials(em: string, pw: string) {
        setEmail(em);
        setPassword(pw);
        setErr("");
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Brand panel */}
            <div className="hidden lg:flex sidebar relative overflow-hidden flex-col justify-between p-12 text-white">
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            "radial-gradient(600px circle at 20% 20%, rgba(99,102,241,.4), transparent 40%), radial-gradient(500px circle at 80% 70%, rgba(79,70,229,.35), transparent 40%)",
                    }}
                />
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-bold shadow-lg">
                        A
                    </div>
                    <div className="text-lg font-bold">AutoCount</div>
                </div>
                <div className="relative">
                    <h1 className="text-4xl font-bold leading-tight">
                        Accounting made
                        <br />
                        effortless.
                    </h1>
                    <p className="mt-4 text-sidebar-muted max-w-sm">
                        General Ledger, Receivables, Payables, Stock, and
                        real-time financial reports — all in one lightweight
                        workspace.
                    </p>
                </div>
                <div className="relative text-xs text-sidebar-muted">
                    &copy; {new Date().getFullYear()} AutoCount Pro Accounting
                </div>
            </div>

            {/* Form panel */}
            <div className="flex items-center justify-center p-6 relative">
                <Link
                    href="/landing"
                    className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-[#80C31E] transition-colors group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back to Home
                </Link>
                <div className="w-full max-w-sm animate-in">
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg">
                                A
                            </div>
                            <div className="text-lg font-bold text-brand-600">
                                AutoCount
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                            Welcome back
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Sign in to your accounting workspace
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="label">Email</label>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input
                                className="input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {err && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                                {err}
                            </div>
                        )}
                        <button
                            className="btn-primary w-full cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 space-y-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                            Demo Credentials
                        </div>
                        <button
                            type="button"
                            onClick={() => fillCredentials("admin@autocount.local", "admin123")}
                            className="w-full rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4 py-3 text-left text-xs text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Admin</span>
                                    <span className="text-gray-400 mx-2">|</span>
                                    <span>admin@autocount.local / admin123</span>
                                </div>
                                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                                    ADMIN
                                </span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => fillCredentials("customer@autocount.local", "customer123")}
                            className="w-full rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4 py-3 text-left text-xs text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Customer</span>
                                    <span className="text-gray-400 mx-2">|</span>
                                    <span>customer@autocount.local / customer123</span>
                                </div>
                                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                    CUSTOMER
                                </span>
                            </div>
                        </button>
                        <div className="pt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Bispro Roles</div>
                        {[
                            { label: "Accountant", email: "accountant@autocount.local", pwd: "accountant123", role: "ACCOUNTANT" },
                            { label: "Sales", email: "sales@autocount.local", pwd: "sales123", role: "SALES" },
                            { label: "Purchase", email: "purchase@autocount.local", pwd: "purchase123", role: "PURCHASE" },
                            { label: "Warehouse", email: "warehouse@autocount.local", pwd: "warehouse123", role: "WAREHOUSE" },
                        ].map((r) => (
                            <button
                                key={r.role}
                                type="button"
                                onClick={() => fillCredentials(r.email, r.pwd)}
                                className="w-full rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4 py-3 text-left text-xs text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-gray-700 dark:text-slate-200">{r.label}</span>
                                        <span className="text-gray-400 mx-2">|</span>
                                        <span>{r.email} / {r.pwd}</span>
                                    </div>
                                    <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                                        {r.role}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
