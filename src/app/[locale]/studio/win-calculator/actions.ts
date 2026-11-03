"use server";

import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_SECONDS,
  accessToken,
  configuredPassword,
  passwordMatches,
} from "@/lib/win-calculator-access";

export type UnlockState = { error: string | null };

/** Checks the typed password and, if it is right, sets the access cookie; the page then renders the calculator. */
export async function unlock(_previous: UnlockState, form: FormData): Promise<UnlockState> {
  const password = configuredPassword();
  if (!passwordMatches(String(form.get("password") ?? ""), password)) {
    return { error: "That password is not right." };
  }
  (await cookies()).set(ACCESS_COOKIE, accessToken(password!), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE_SECONDS,
  });
  return { error: null };
}
