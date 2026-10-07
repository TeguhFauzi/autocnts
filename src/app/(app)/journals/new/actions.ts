"use server";

import { createJournal as _createJournal } from "../actions";

export async function createJournal(payload: any) {
    return _createJournal(payload as any);
}
