"use server";

import { createInvoice as _createInvoice } from "../actions";

export async function createInvoice(payload: any) {
    return _createInvoice(payload as any);
}
