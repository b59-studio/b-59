import type { Metadata } from "next";
import { cookies } from "next/headers";
import { WinPanel } from "@/components/research/election-2026/WinPanel";
import { ACCESS_COOKIE, configuredPassword, hasAccess } from "@/lib/win-calculator-access";
import { UnlockForm } from "./UnlockForm";

// Behind a password and meant for campaign teams, so it stays out of search
// engines and out of the sitemap (src/app/sitemap.ts).
export const metadata: Metadata = {
  title: "Win Calculator",
  description: "Vote targets for the 2026 Texas general election, for campaign teams.",
  robots: { index: false, follow: false },
};

export default async function WinCalculator() {
  const password = configuredPassword();
  const open = hasAccess((await cookies()).get(ACCESS_COOKIE)?.value, password);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="ea" lang="en" dir="ltr">
        <header className="ea-head">
          <p className="ea-dateline">Studio · Texas general election, Nov. 3, 2026</p>
          <h1 className="ea-h1">Win calculator</h1>
          <p className="ea-lede">
            Set the Democratic share in each of the 17 focus counties and Travis, and see what the rest of the state has
            to deliver for a statewide majority.
          </p>
        </header>
        {open ? (
          <WinPanel />
        ) : password ? (
          <UnlockForm />
        ) : (
          <p className="ea-note ea-note-lead">The calculator is not open yet. Ask the studio for access.</p>
        )}
      </div>
    </div>
  );
}
