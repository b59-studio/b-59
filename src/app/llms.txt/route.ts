import { buildLlmsTxt } from "@/lib/llms-txt";
import { resolveSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(resolveSiteUrl()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
