/**
 * Resolve the public base URL of the site from the environment.
 *
 * NEXT_PUBLIC_SITE_URL is operator-provided. A malformed value (for example a
 * pasted markdown link) would otherwise throw inside `new URL(...)` at module
 * load and fail the entire production build, not just the donate flow. Guard
 * against that: fall back to DEFAULT_SITE_URL when the value is absent or is
 * not a valid http(s) URL.
 *
 * Returns an absolute origin (scheme + host + port) with no trailing slash, so
 * callers can safely template `${siteUrl}/path` or pass it to `new URL(...)`.
 */
export const DEFAULT_SITE_URL = "https://b-59.com";

export function resolveSiteUrl(
  raw: string | undefined = process.env.NEXT_PUBLIC_SITE_URL,
): string {
  const candidate = raw?.trim();
  if (!candidate) {
    return DEFAULT_SITE_URL;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}
