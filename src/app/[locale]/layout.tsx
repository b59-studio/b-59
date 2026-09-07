import "../globals.css";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { resolveSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";
import { noFlashScript } from "@/lib/theme";
import { textDirection } from "@/i18n/config";

const siteUrl = resolveSiteUrl();
// Cookieless pageview analytics (docs/adr/0001-telemetry-decision.md): the
// script loads only when the Plausible site domain is configured.
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "B-59",
    url: siteUrl,
    description:
      "Human-centered design and strategy. We build civic technology, advise on complex decisions, and make things that matter. Public-first.",
    logo: `${siteUrl}/v2-yeah.png`,
  };

  return (
    <html lang={locale} dir={textDirection(locale)} suppressHydrationWarning>
      <head>
        {/* Resolve the mode before first paint. Without this a reader whose
            device is dark is shown a white page until React hydrates
            (standards/25). */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-screen flex flex-col transition-colors">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <Header />
            <main className="flex min-h-0 flex-1 flex-col pt-24 pb-8">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </body>
    </html>
  );
}
