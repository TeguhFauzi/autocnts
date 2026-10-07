export function money(n: number | string): string {
    const v = typeof n === "string" ? parseFloat(n || "0") : n;
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(v || 0);
}

export function num(n: number | string): number {
    return typeof n === "string" ? parseFloat(n || "0") : n || 0;
}

export function today(): string {
    return new Date().toISOString().slice(0, 10);
}

export function genDocNo(prefix: string): string {
    const d = new Date();
    const stamp =
        d.getFullYear().toString().slice(2) +
        String(d.getMonth() + 1).padStart(2, "0") +
        String(d.getDate()).padStart(2, "0") +
        "-" +
        String(d.getHours()).padStart(2, "0") +
        String(d.getMinutes()).padStart(2, "0") +
        String(d.getSeconds()).padStart(2, "0");
    return `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export function cls(...parts: (string | false | null | undefined)[]): string {
    return parts.filter(Boolean).join(" ");
}
