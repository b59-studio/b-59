import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The shared password in front of the studio's win calculator.
 *
 * One password, set as WIN_CALCULATOR_PASSWORD. A visitor who enters it gets
 * a cookie holding a token derived from it, so the password itself never sits
 * in the browser, and changing the password signs everyone out. With the
 * variable unset or blank the page stays locked for everyone: a missing secret
 * must never mean "open".
 */
export const ACCESS_COOKIE = "b59_win_calculator";
export const ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const CONTEXT = "b59-win-calculator-access-v1";

/** The configured password, or null when none is set. */
export function configuredPassword(env: Record<string, string | undefined> = process.env): string | null {
  const value = env.WIN_CALCULATOR_PASSWORD?.trim();
  return value ? value : null;
}

/** The cookie value that proves a visitor entered `password`. */
export function accessToken(password: string): string {
  return createHmac("sha256", password).update(CONTEXT).digest("hex");
}

function sameString(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Whether a typed password is the configured one. Never true when none is configured. */
export function passwordMatches(attempt: string, password: string | null): boolean {
  return password !== null && sameString(accessToken(attempt.trim()), accessToken(password));
}

/** Whether a visitor's cookie grants access under the configured password. */
export function hasAccess(cookie: string | undefined, password: string | null): boolean {
  return password !== null && cookie !== undefined && sameString(cookie, accessToken(password));
}
