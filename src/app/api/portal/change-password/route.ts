import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
    }

    const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!u) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    const ok = await bcrypt.compare(currentPassword, u.passwordHash);
    if (!ok) return NextResponse.json({ error: "Password lama salah" }, { status: 400 });

    await db.update(users).set({ passwordHash: await bcrypt.hash(newPassword, 10) }).where(eq(users.id, u.id));
    return NextResponse.json({ success: true });
}
