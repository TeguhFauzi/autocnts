/**
 * 30 skenario bispro yang mentrigger notifikasi per role.
 * Jalankan: node scripts/bispro-30.mjs
 */
const BASE = process.env.BASE || "http://localhost:5422";
let n = 0;
const results = [];
function ok(name, cond) { n++; results.push(`${cond ? "✅" : "❌"} ${n}. ${name}`); }

function jar() {
    let cookie = "";
    return {
        store(res) {
            for (const s of res.headers.getSetCookie?.() ?? []) {
                const pair = s.split(";")[0];
                const name = pair.split("=")[0];
                cookie = [...cookie.split("; ").filter((c) => c && !c.startsWith(name + "=")), pair].join("; ");
            }
        },
        header() { return cookie; },
    };
}

async function login(email, password) {
    const j = jar();
    const csrfRes = await fetch(`${BASE}/api/auth/csrf`); j.store(csrfRes);
    const { csrfToken } = await csrfRes.json();
    const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: j.header() },
        body: new URLSearchParams({ csrfToken, email, password, json: "true" }),
    });
    j.store(res);
    return { cookie: j.header() };
}

async function req(s, method, path, body, follow = true) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { "Content-Type": "application/json", Cookie: s.cookie },
        body: body ? JSON.stringify(body) : undefined,
        redirect: follow ? "follow" : "manual",
    });
    return { status: res.status, json: await res.json().catch(() => null) };
}

async function waitNotif(s, role, min = 1) {
    const r = await req(s, "GET", `/api/notifications?role=${role}`);
    return (r.json?.notifications?.length ?? 0) >= min;
}

(async () => {
    console.log("=== BISPRO 30 SKENARIO + NOTIFIKASI ===\n");

    // 1-5: Admin akses semua modul
    const admin = await login("admin@autocount.local", "admin123");
    ok("1. Admin akses accounts", (await req(admin, "GET", "/api/accounts?page=1&limit=1")).status === 200);
    ok("2. Admin akses invoices", (await req(admin, "GET", "/api/invoices?page=1&limit=1")).status === 200);
    ok("3. Admin akses bills", (await req(admin, "GET", "/api/bills?page=1&limit=1")).status === 200);
    ok("4. Admin akses journals", (await req(admin, "GET", "/api/journals?page=1&limit=1")).status === 200);
    ok("5. Admin akses items", (await req(admin, "GET", "/api/items?page=1&limit=1")).status === 200);

    // ambil referensi
    const cust = (await req(admin, "GET", "/api/customers?page=1&limit=100")).json.data;
    const items = (await req(admin, "GET", "/api/items?page=1&limit=100")).json.data ?? (await req(admin, "GET", "/api/items?page=1&limit=100")).json.items;
    const sups = (await req(admin, "GET", "/api/suppliers?page=1&limit=100")).json.data;
    const tmp = await login("customer@autocount.local", "customer123");
    const code = (await req(tmp, "GET", "/api/portal/profile")).json?.customer?.code;
    const customerId = cust.find((c) => c.code === code)?.id ?? cust[0].id;
    const itemId = items[0].id;
    const supplierId = sups[0].id;

    // 6-9: Sales membuat invoice
    const sales = await login("sales@autocount.local", "sales123");
    ok("6. Sales login", !!sales.cookie);
    ok("7. Sales ditolak akses /api/accounts", [302, 307].includes((await req(sales, "GET", "/api/accounts", undefined, false)).status));
    const inv1 = await req(sales, "POST", "/api/invoices", { customerId, date: "2026-10-06", lines: [{ itemId, description: "Auto30 #1", qty: 1, price: 100000 }] });
    ok("8. Sales membuat invoice #1", inv1.status === 201);
    const inv2 = await req(sales, "POST", "/api/invoices", { customerId, date: "2026-10-06", lines: [{ itemId, description: "Auto30 #2", qty: 2, price: 50000 }] });
    ok("9. Sales membuat invoice #2", inv2.status === 201);

    // 10-12: Notifikasi untuk accountant & customer dari invoice sales
    ok("10. Notifikasi accountant dari invoice sales", await waitNotif(accountantRef(admin), "accountant"));
    ok("11. Notifikasi customer dari invoice sales", await waitNotif(admin, "customer"));
    ok("12. GET /api/notifications?role=accountant punya Faktur Baru", (await req(admin, "GET", "/api/notifications?role=accountant")).json.notifications.some((n) => n.title === "Faktur Baru"));

    function accountantRef() { return admin; }

    // 13-16: Customer bayar invoice
    const invId = inv1.json.id;
    const pay = await req(tmp, "POST", "/api/portal/pay", { invoiceId: invId });
    ok("13. Customer bayar invoice #1", pay.status === 200);
    ok("14. Notifikasi admin dari pembayaran", (await req(admin, "GET", "/api/notifications?role=admin")).json.notifications.some((n) => n.title === "Pembayaran Masuk"));
    ok("15. Notifikasi accountant dari pembayaran", (await req(admin, "GET", "/api/notifications?role=accountant")).json.notifications.some((n) => n.title === "Penerimaan Kas"));
    ok("16. Customer tidak bisa bayar invoice orang lain", (await req(tmp, "POST", "/api/portal/pay", { invoiceId: (await req(admin, "GET", "/api/invoices?page=1&limit=50")).json.data.find((i) => i.customerName !== "PT Mitra Sejahtera")?.id ?? 0 })).status === 403);

    // 17-20: Accountant cek & jurnal
    const accountant = await login("accountant@autocount.local", "accountant123");
    ok("17. Accountant login", !!accountant.cookie);
    ok("18. Accountant akses journals", (await req(accountant, "GET", "/api/journals?page=1&limit=1")).status === 200);
    ok("19. Accountant akses trial balance", (await req(accountant, "GET", "/api/reports?section=all&page=1&limit=1")).status === 200);
    ok("20. Accountant bisa POST jurnal", (await req(accountant, "POST", "/api/journals", { date: "2026-10-06", description: "Auto30 Jurnal", lines: [{ accountId: (await req(admin, "GET", "/api/accounts?page=1&limit=2")).json.data[0].id, debit: 1000, credit: 0, memo: "x" }, { accountId: (await req(admin, "GET", "/api/accounts?page=1&limit=2")).json.data[1].id, debit: 0, credit: 1000, memo: "x" }] })).status === 201);

    // 21-25: Purchase buat bill
    const purchase = await login("purchase@autocount.local", "purchase123");
    ok("21. Purchase login", !!purchase.cookie);
    ok("22. Purchase ditolak akses /api/journals", [302, 307].includes((await req(purchase, "GET", "/api/journals", undefined, false)).status));
    const bill = await req(purchase, "POST", "/api/bills", { supplierId, date: "2026-10-06", lines: [{ itemId, description: "Auto30 Bill", qty: 1, price: 200000 }] });
    ok("23. Purchase membuat bill", bill.status === 201);
    ok("24. Notifikasi warehouse dari bill", (await req(admin, "GET", "/api/notifications?role=warehouse")).json.notifications.some((n) => n.title === "Barang Masuk"));
    ok("25. Notifikasi accountant dari bill", (await req(admin, "GET", "/api/notifications?role=accountant")).json.notifications.some((n) => n.title === "Bill Baru"));

    // 26-30: Warehouse + penutup
    const warehouse = await login("warehouse@autocount.local", "warehouse123");
    ok("26. Warehouse login", !!warehouse.cookie);
    ok("27. Warehouse akses items", (await req(warehouse, "GET", "/api/items?page=1&limit=1")).status === 200);
    ok("28. Warehouse ditolak akses /api/invoices", [302, 307].includes((await req(warehouse, "GET", "/api/invoices", undefined, false)).status));
    ok("29. Notifikasi admin dari jurnal", (await req(admin, "GET", "/api/notifications?role=admin")).json.notifications.some((n) => n.title === "Jurnal Baru"));
    ok("30. Notifikasi accountant dari jurnal", (await req(admin, "GET", "/api/notifications?role=accountant")).json.notifications.some((n) => n.title === "Jurnal Baru"));

    console.log(results.join("\n"));
    const failed = results.filter((r) => r.startsWith("❌")).length;
    console.log(`\n=== ${results.length - failed} passed, ${failed} failed ===`);
    process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
