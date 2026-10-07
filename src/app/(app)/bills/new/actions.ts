"use server";

import { createBill as _createBill } from "../actions";

export async function createBill(payload: any) {
    return _createBill(payload as any);
}
