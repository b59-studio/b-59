import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API, Next internals, any path with a file extension, and the
  // generated share-card routes: those have no extension and no locale twin,
  // so a locale rewrite would send /opengraph-image to a 404.
  matcher: "/((?!api|_next|_vercel|opengraph-image|twitter-image|.*\\..*).*)",
};
