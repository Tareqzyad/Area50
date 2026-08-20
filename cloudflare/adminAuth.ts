import { env } from "cloudflare:workers";

export const ADMIN_COOKIE_NAME = "area50_admin_session";
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

function constantTimeEquals(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.AREA50_ADMIN_CODE),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(new Uint8Array(signature));
}

function getCookie(request: Request, name: string) {
  const prefix = `${name}=`;
  return (request.headers.get("Cookie") || "").split(";").map(value => value.trim())
    .find(value => value.startsWith(prefix))?.slice(prefix.length);
}

function setSessionCookie(headers: Headers, request: Request, value: string, maxAge: number) {
  const isHttps = new URL(request.url).protocol === "https:";
  headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isHttps ? "; Secure" : ""}`,
  );
}

export function isValidAdminCode(code: string) {
  return Boolean(env.AREA50_ADMIN_CODE) && constantTimeEquals(code, env.AREA50_ADMIN_CODE);
}

export async function createAdminSession() {
  const nonce = new Uint8Array(18);
  crypto.getRandomValues(nonce);
  const payload = `${Date.now()}.${toHex(nonce)}`;
  return `${payload}.${await sign(payload)}`;
}

export async function isAdminRequest(request: Request) {
  const token = getCookie(request, ADMIN_COOKIE_NAME);
  if (!token || !env.AREA50_ADMIN_CODE) return false;
  const [issuedAt, nonce, signature, extra] = decodeURIComponent(token).split(".");
  if (!issuedAt || !nonce || !signature || extra) return false;
  const timestamp = Number(issuedAt);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > ADMIN_SESSION_MAX_AGE_SECONDS * 1000 || Date.now() - timestamp < 0) return false;
  return constantTimeEquals(signature, await sign(`${issuedAt}.${nonce}`));
}

export function setAdminSession(headers: Headers, request: Request, token: string) {
  setSessionCookie(headers, request, token, ADMIN_SESSION_MAX_AGE_SECONDS);
}

export function clearAdminSession(headers: Headers, request: Request) {
  setSessionCookie(headers, request, "", 0);
}
