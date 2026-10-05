import "server-only";
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "./db";

export const SESSION_COOKIE = "agricarbon_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export type User = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
};

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [saltHex, hashHex] = encoded.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(
      password,
      Buffer.from(saltHex, "hex"),
      expected.length,
    );
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSession(
  userId: string,
  response: NextResponse,
  request: NextRequest,
) {
  const token = randomBytes(32).toString("hex");
  getDb()
    .prepare(
      "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    )
    .run(tokenHash(token), userId, Date.now() + SESSION_SECONDS * 1000);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

function lookupSession(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = getDb()
    .prepare(
      `
    SELECT users.id, users.name, users.phone, users.created_at
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `,
    )
    .get(tokenHash(token), Date.now()) as User | undefined;
  return row || null;
}

export function userFromRequest(request: NextRequest) {
  return lookupSession(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function userFromPageCookie() {
  const cookieStore = await cookies();
  return lookupSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export function clearSession(request: NextRequest, response: NextResponse) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    getDb()
      .prepare("DELETE FROM sessions WHERE token_hash = ?")
      .run(tokenHash(token));
  }
  response.cookies.delete(SESSION_COOKIE);
}
