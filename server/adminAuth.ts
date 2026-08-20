import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { parse } from "cookie";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";

export const ADMIN_COOKIE_NAME = "area50_admin_session";
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function sign(payload: string) {
  return createHmac("sha256", ENV.adminCode).update(payload).digest("hex");
}

export function isValidAdminCode(code: string) {
  const configured = ENV.adminCode;
  if (!configured || !code) return false;
  const actual = Buffer.from(code);
  const expected = Buffer.from(configured);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createAdminSession() {
  const payload = `${Date.now()}.${randomBytes(18).toString("hex")}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSession(token: string | undefined) {
  if (!token || !ENV.adminCode) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, signature] = parts;
  const timestamp = Number(issuedAt);
  if (!nonce || !Number.isFinite(timestamp)) return false;
  if (Date.now() - timestamp > ADMIN_SESSION_MAX_AGE_SECONDS * 1000) return false;
  if (Date.now() - timestamp < 0) return false;

  const expected = Buffer.from(sign(`${issuedAt}.${nonce}`));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export function getAdminSession(req: Request) {
  const cookies = parse(req.headers.cookie ?? "");
  return cookies[ADMIN_COOKIE_NAME];
}

export function isAdminRequest(req: Request) {
  return isValidAdminSession(getAdminSession(req));
}

export function setAdminSession(res: Response, req: Request, token: string) {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
    sameSite: "lax",
  });
}

export function clearAdminSession(res: Response, req: Request) {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    ...getSessionCookieOptions(req),
    sameSite: "lax",
    maxAge: 0,
  });
}
