import {
    pgTable,
    serial,
    text,
    varchar,
    timestamp,
    numeric,
    integer,
    date,
    boolean,
} from "drizzle-orm/pg-core";

// ---------- Users ----------
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 32 }).notNull().default("user"),
    customerId: integer("customer_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Chart of Accounts ----------
// type: ASSET | LIABILITY | EQUITY | INCOME | EXPENSE
export const accounts = pgTable("accounts", {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 32 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    type: varchar("type", { length: 16 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Journals (header) ----------
export const journals = pgTable("journals", {
    id: serial("id").primaryKey(),
    refNo: varchar("ref_no", { length: 48 }).notNull().unique(),
    date: date("date").notNull(),
    description: text("description"),
    source: varchar("source", { length: 24 }).notNull().default("GL"), // GL | AR | AP | STOCK
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Journal Lines ----------
export const journalLines = pgTable("journal_lines", {
    id: serial("id").primaryKey(),
    journalId: integer("journal_id")
        .notNull()
        .references(() => journals.id, { onDelete: "cascade" }),
    accountId: integer("account_id")
        .notNull()
        .references(() => accounts.id),
    debit: numeric("debit", { precision: 14, scale: 2 }).notNull().default("0"),
    credit: numeric("credit", { precision: 14, scale: 2 }).notNull().default("0"),
    memo: text("memo"),
});

// ---------- Customers (AR) ----------
export const customers = pgTable("customers", {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 32 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 160 }),
    phone: varchar("phone", { length: 48 }),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Suppliers (AP) ----------
export const suppliers = pgTable("suppliers", {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 32 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 160 }),
    phone: varchar("phone", { length: 48 }),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Items (Stock) ----------
export const items = pgTable("items", {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 32 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    uom: varchar("uom", { length: 24 }).notNull().default("UNIT"),
    price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
    cost: numeric("cost", { precision: 14, scale: 2 }).notNull().default("0"),
    qtyOnHand: numeric("qty_on_hand", { precision: 14, scale: 2 })
        .notNull()
        .default("0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Invoices (AR sales) ----------
// status: UNPAID | PARTIAL | PAID
export const invoices = pgTable("invoices", {
    id: serial("id").primaryKey(),
    docNo: varchar("doc_no", { length: 48 }).notNull().unique(),
    customerId: integer("customer_id")
        .notNull()
        .references(() => customers.id),
    date: date("date").notNull(),
    dueDate: date("due_date"),
    total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
    paid: numeric("paid", { precision: 14, scale: 2 }).notNull().default("0"),
    status: varchar("status", { length: 16 }).notNull().default("UNPAID"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoiceLines = pgTable("invoice_lines", {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id")
        .notNull()
        .references(() => invoices.id, { onDelete: "cascade" }),
    itemId: integer("item_id").references(() => items.id),
    description: text("description").notNull(),
    qty: numeric("qty", { precision: 14, scale: 2 }).notNull().default("1"),
    price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
});

// ---------- Bills (AP purchase) ----------
export const bills = pgTable("bills", {
    id: serial("id").primaryKey(),
    docNo: varchar("doc_no", { length: 48 }).notNull().unique(),
    supplierId: integer("supplier_id")
        .notNull()
        .references(() => suppliers.id),
    date: date("date").notNull(),
    dueDate: date("due_date"),
    total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
    paid: numeric("paid", { precision: 14, scale: 2 }).notNull().default("0"),
    status: varchar("status", { length: 16 }).notNull().default("UNPAID"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const billLines = pgTable("bill_lines", {
    id: serial("id").primaryKey(),
    billId: integer("bill_id")
        .notNull()
        .references(() => bills.id, { onDelete: "cascade" }),
    itemId: integer("item_id").references(() => items.id),
    description: text("description").notNull(),
    qty: numeric("qty", { precision: 14, scale: 2 }).notNull().default("1"),
    price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
});

// ---------- Payments (receipts AR + payments AP) ----------
// kind: RECEIPT | PAYMENT
export const payments = pgTable("payments", {
    id: serial("id").primaryKey(),
    docNo: varchar("doc_no", { length: 48 }).notNull().unique(),
    kind: varchar("kind", { length: 16 }).notNull(),
    date: date("date").notNull(),
    partyId: integer("party_id").notNull(), // customerId or supplierId
    docRefId: integer("doc_ref_id"), // invoiceId or billId
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
    method: varchar("method", { length: 32 }).notNull().default("CASH"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
