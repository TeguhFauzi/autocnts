import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    createHash,
} from "crypto";

// 32-byte key derived from NEXTAUTH_SECRET (server-only module).
const key = createHash("sha256")
    .update(process.env.NEXTAUTH_SECRET || "dev-secret")
    .digest();

const ALGO = "chacha20-poly1305";
const NONCE_LEN = 12;
const TAG_LEN = 16;

/** Encrypt a numeric id into a URL-safe token. */
export function encryptId(id: number | string): string {
    const nonce = randomBytes(NONCE_LEN);
    const cipher = createCipheriv(ALGO, key, nonce, { authTagLength: TAG_LEN });
    const ct = Buffer.concat([
        cipher.update(String(id), "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([nonce, ct, tag]).toString("base64url");
}

/** Decrypt a token back to a numeric id. Returns NaN on failure. */
export function decryptId(token: string): number {
    try {
        const buf = Buffer.from(token, "base64url");
        const nonce = buf.subarray(0, NONCE_LEN);
        const tag = buf.subarray(buf.length - TAG_LEN);
        const ct = buf.subarray(NONCE_LEN, buf.length - TAG_LEN);
        const decipher = createDecipheriv(ALGO, key, nonce, {
            authTagLength: TAG_LEN,
        });
        decipher.setAuthTag(tag);
        const pt = Buffer.concat([
            decipher.update(ct),
            decipher.final(),
        ]).toString("utf8");
        return Number(pt);
    } catch {
        return NaN;
    }
}

/** Attach an encrypted `eid` to a row that has a numeric `id`. */
export function withEid<T extends { id: number }>(row: T): T & { eid: string } {
    return { ...row, eid: encryptId(row.id) };
}
