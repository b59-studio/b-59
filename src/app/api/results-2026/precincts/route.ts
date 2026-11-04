import { NextResponse } from "next/server";
import { getPrecincts, REFRESH_SECONDS } from "@/lib/results-2026/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One county's precinct detail for one race, by vote type. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const detail = await getPrecincts(params.get("county") ?? "", params.get("key") ?? "").catch((error: unknown) => {
    console.error("Precinct results read failed", error);
    return null;
  });
  if (!detail) return NextResponse.json({ error: "This county publishes no precinct detail for this race." }, { status: 404 });
  return NextResponse.json(detail, {
    headers: { "Cache-Control": `public, s-maxage=${REFRESH_SECONDS / 2}, stale-while-revalidate=${REFRESH_SECONDS}` },
  });
}
