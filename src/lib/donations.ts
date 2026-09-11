/**
 * Whether the site is taking donations.
 *
 * One fact, read at both points that could start a contribution: the `/donate`
 * page (which returns 404 while this is false) and `POST /api/donate/checkout`
 * (which refuses before it reaches Stripe). Unlinking the page from the nav is
 * not enough on its own — a bookmark, a search result, or a POST straight at
 * the endpoint would still open a checkout and take money.
 *
 * Reopening donations is flipping this to `true` and putting back the links in
 * `Header`, `Footer`, `MobileMenu` and `/about/sitemap`, plus the `/donate`
 * entry in `src/app/sitemap.ts`. The page, the form, the Stripe helpers and the
 * success page are untouched and still build.
 *
 * `POST /api/donate/webhook` is deliberately NOT gated by this: monthly donors
 * who signed up while donations were open are still being charged, and those
 * invoices still have to be recorded.
 */
export const donationsOpen = false;
