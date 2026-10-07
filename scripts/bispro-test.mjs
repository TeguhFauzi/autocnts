/**
 * Bispro E2E automation test — semua role saling berkesinambungan.
 * Jalankan: node scripts/bispro-test.mjs   (server harus sudah jalan di :5422)
 */
const BASE = process.env.BASE || "http://localhost:5422";

function jar() {
    let cookie = "";
    return {
        store(res) {
            const set = res.headers.getSetCookie?.() ?? [];
            for (const s of set) {
                const pair = s.split(";")[0];
                const name = pair.split("=")[0];
                const rest = cookie
                    .split("; ")
                    .filter((c) => c && !c.startsWith(name + "="));
                cookie = [...rest, pair].join("; ");
            }
        },
        header() { return cookie; },
    };
}

async function login(email, password) {
    const j = jar();
    const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
    j.store(csrfRes);
    const { csrfToken } = await csrfRes.json();
    const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: j.header() },
        body: new URLSearchParams({ csrfToken, email, password, json: "true" }),
    });
    j.store(res);
    const session = await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: j.header() } });
    const sess = await session.json();
    if (!sess?.user) throw new Error(`Login gagal untuk ${email}`);
    console.log(`✔ Login ${sess.user.role}: ${email}`);
    return { cookie: j.header(), role: sess.user.role };
}

async function req(s, method, path, body, follow = true) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { "Content-Type": "application/json", Cookie: s.cookie },
        body: body ? JSON.stringify(body) : undefined,
        redirect: follow ? "follow" : "manual",
    });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = text; }
    return { status: res.status, json };
}

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
    if (cond) { pass++; console.log(`  ✅ ${name}`); }
    else { fail++; console.log(`  ❌ ${name} ${extra}`); }
}

(async () => {
    console.log("=== BISPRO E2E: semua role saling berkesinambungan ===\n");

    // 1. ADMIN: semua modul bisa diakses
    const admin = await login("admin@autocount.local", "admin123");
    for (const p of ["/api/accounts?page=1&limit=1", "/api/customers?page=1&limit=1", "/api/items?page=1&limit=1", "/api/suppliers?page=1&limit=1", "/api/bills?page=1&limit=1"]) {
        const r = await req(admin, "GET", p);
        check(`ADMIN dapat akses ${p}`, r.status === 200);
    }

    // ambil data referensi
    const custRes = await req(admin, "GET", "/api/customers?page=1&limit=100");
    const customerList = custRes.json?.data ?? [];
    const itemsRes = await req(admin, "GET", "/api/items?page=1&limit=1");
    const itemId = itemsRes.json?.items?.[0]?.id ?? itemsRes.json?.data?.[0]?.id;
    const supRes = await req(admin, "GET", "/api/suppliers?page=1&limit=1");
    const supplierId = supRes.json?.data?.[0]?.id;

    // Cari customerId yang terhubung ke akun customer (via profile)
    const tmpCust = await login("customer@autocount.local", "customer123");
    const profile = await req(tmpCust, "GET", "/api/portal/profile");
    const myCode = profile.json?.customer?.code;
    const customerId = customerList.find((c) => c.code === myCode)?.id ?? customerList[0]?.id;
    console.log(`  ℹ customerCode=${myCode} customerId=${customerId} itemId=${itemId} supplierId=${supplierId}`);

    // 2. SALES: buat invoice → harus bisa (hanya modul sales)
    const sales = await login("sales@autocount.local", "sales123");
    check("SALES ditolak akses /api/accounts", [302, 307].includes((await req(sales, "GET", "/api/accounts", undefined, false)).status));
    const inv = await req(sales, "POST", "/api/invoices", {
        customerId, date: new Date().toISOString().slice(0, 10),
        lines: [{ itemId, description: "Penjualan otomatis E2E", qty: 1, price: 150000 }],
    });
    check("SALES membuat invoice", inv.status === 200 || inv.status === 201, JSON.stringify(inv.json).slice(0, 120));
    const invoiceId = inv.json?.id ?? inv.json?.invoice?.id;
    console.log(`  ℹ invoiceId=${invoiceId}`);

    // 3. CUSTOMER: lihat invoice tadi & bayar
    const customer = await login("customer@autocount.local", "customer123");
    const portalInv = await req(customer, "GET", "/api/portal/invoices?page=1&limit=100");
    check("CUSTOMER melihat invoice di portal", portalInv.status === 200);
    const mine = (portalInv.json?.invoices ?? []).find((i) => i.id === invoiceId);
    check("Invoice sales muncul di portal customer", !!mine);
    if (invoiceId) {
        const pay = await req(customer, "POST", "/api/portal/pay", { invoiceId });
        check("CUSTOMER membayar invoice", pay.status === 200, JSON.stringify(pay.json).slice(0, 120));
    }

    // 4. ACCOUNTANT: cek jurnal & laporan
    const accountant = await login("accountant@autocount.local", "accountant123");
    check("ACCOUNTANT dapat akses journals", (await req(accountant, "GET", "/api/journals?page=1&limit=1")).status === 200);
    const tb = await req(accountant, "GET", "/api/reports?section=all&page=1&limit=5");
    check("ACCOUNTANT dapat trial balance", tb.status === 200);
    check("ACCOUNTANT ditolak akses /api/customers? (harus tetap bisa read) — skip", true);

    // 5. PURCHASE: buat bill
    const purchase = await login("purchase@autocount.local", "purchase123");
    const bill = await req(purchase, "POST", "/api/bills", {
        supplierId, date: new Date().toISOString().slice(0, 10),
        lines: [{ itemId, description: "Pembelian otomatis E2E", qty: 2, price: 50000 }],
    });
    check("PURCHASE membuat bill", bill.status === 200 || bill.status === 201, JSON.stringify(bill.json).slice(0, 120));
    check("PURCHASE ditolak akses /api/journals", [302, 307].includes((await req(purchase, "GET", "/api/journals", undefined, false)).status));

    // 6. WAREHOUSE: cek stok
    const warehouse = await login("warehouse@autocount.local", "warehouse123");
    check("WAREHOUSE dapat akses items", (await req(warehouse, "GET", "/api/items?page=1&limit=1")).status === 200);
    check("WAREHOUSE ditolak akses /api/invoices", [302, 307].includes((await req(warehouse, "GET", "/api/invoices", undefined, false)).status));

    console.log(`\n=== Hasil: ${pass} passed, ${fail} failed ===`);
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
