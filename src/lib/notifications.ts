"use client";

export type Notif = {
    id: string;
    role: string; // target role: "admin" | "accountant" | "sales" | "purchase" | "warehouse" | "customer"
    title: string;
    message: string;
    time: number;
    read: boolean;
};

const KEY = "autocount_notifications";

function load(): Notif[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
        return [];
    }
}

function save(list: Notif[]) {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
    window.dispatchEvent(new Event("notif-change"));
}

export function addNotification(role: string, title: string, message: string) {
    const list = load();
    list.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, title, message, time: Date.now(), read: false });
    save(list);
}

export function getNotifications(role?: string): Notif[] {
    const list = load();
    return role ? list.filter((n) => n.role === role) : list;
}

export function markAllRead(role?: string) {
    const list = load().map((n) => (role && n.role !== role ? n : { ...n, read: true }));
    save(list);
}

export function clearNotifications() {
    save([]);
}
