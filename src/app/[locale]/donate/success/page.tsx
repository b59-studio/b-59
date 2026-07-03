import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Thank you for supporting B-59.",
  alternates: { canonical: "/donate/success" },
  robots: { index: false, follow: false },
};

const brand = () => <Brand />;
const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;

export default async function DonateSuccess() {
  const t = await getTranslations("donateSuccess");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-8 text-center">
        <h1 className="heading-xl">{t.rich("heading", { blue })}</h1>
        <div className="body-lg space-y-4">
          <p>{t.rich("body", { brand })}</p>
        </div>
        <div>
          <Link href="/" className="btn-primary">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
