// Server-side notification event store (in-memory, per proses)
export type ServerNotif = {
    role: string;
    title: string;
    message: string;
    time: number;
};

const store: ServerNotif[] = [];

export function recordNotification(role: string, title: string, message: string) {
    store.unshift({ role, title, message, time: Date.now() });
    if (store.length > 500) store.pop();
}

export function listNotifications(role?: string): ServerNotif[] {
    return role ? store.filter((n) => n.role === role) : store;
}

export function clearNotifications() {
    store.length = 0;
}
