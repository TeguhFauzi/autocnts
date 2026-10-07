import { NextRequest, NextResponse } from "next/server";
import { listNotifications, clearNotifications } from "@/lib/notifyStore";

export async function GET(req: NextRequest) {
    const role = req.nextUrl.searchParams.get("role") ?? undefined;
    return NextResponse.json({ notifications: listNotifications(role) });
}

export async function POST(req: NextRequest) {
    const b = await req.json().catch(() => ({}));
    if (!b?.role || !b?.title) return NextResponse.json({ error: "role & title required" }, { status: 400 });
    const { recordNotification } = await import("@/lib/notifyStore");
    recordNotification(b.role, b.title, b.message ?? "");
    return NextResponse.json({ ok: true });
}

export async function DELETE() {
    clearNotifications();
    return NextResponse.json({ ok: true });
}
