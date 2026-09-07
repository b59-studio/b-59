/**
 * Which mode the site opens in, resolved in one place.
 *
 * Three states, two of them stored: `light` and `dark` are an explicit choice,
 * and *unset* means "follow the device" — which is what an untouched browser
 * holds. The toggle writes a choice; it never writes the device's answer back
 * as if it were one, so a reader who has never touched it keeps following
 * their machine (standards/25).
 */
export const THEME_KEY = 'theme';

export const DARK_QUERY = '(prefers-color-scheme: dark)';

export type Theme = 'light' | 'dark';

/** The reader's explicit choice, or null when they have not made one. */
export function storedChoice(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    // A browser refusing storage has no stored choice, which is the default.
    return null;
  }
}

/** What to show right now: the choice if there is one, the device if not. */
export function resolveTheme(): Theme {
  return storedChoice() ?? (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light');
}

/**
 * The same answer, inline, before React exists — the class has to be on
 * `<html>` before first paint or a dark reader is shown a white flash. Kept
 * beside `resolveTheme` on purpose: two copies of this rule is how a site ends
 * up following the device in one place and not the other.
 */
export const noFlashScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||(t!=="light"&&matchMedia("${DARK_QUERY}").matches))document.documentElement.classList.add("dark")}catch(e){}`;
