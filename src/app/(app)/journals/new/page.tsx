import { db } from "@/db";
import { accounts } from "@/db/schema";
import { asc } from "drizzle-orm";
import { encryptId } from "@/lib/crypto";
import { JournalForm } from "./JournalForm";

export const dynamic = "force-dynamic";

export default async function NewJournalPage() {
    const rows = await db
        .select({
            id: accounts.id,
            code: accounts.code,
            name: accounts.name,
            type: accounts.type,
        })
        .from(accounts)
        .orderBy(asc(accounts.code));

    const list = rows.map((a) => ({
        eid: encryptId(a.id),
        code: a.code,
        name: a.name,
        type: a.type,
    }));

    return <JournalForm accounts={list} />;
}
