import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/Brand";
import { DonateForm } from "@/components/DonateForm";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support B-59's work building civic software that actually works — for voter access, courts, administrative processes, and public transparency.",
  alternates: { canonical: "/donate" },
  openGraph: {
    title: "Donate to B-59",
    description:
      "Support B-59's work modernizing civic infrastructure. One-time or monthly contributions, processed securely by Stripe.",
    url: "/donate",
  },
};

const brand = () => <Brand />;
const blue = (chunks: React.ReactNode) => <span className="text-b59-blue">{chunks}</span>;
const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

export default async function Donate() {
  const t = await getTranslations("donate");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-10">
        <section>
          <h1 className="heading-xl mb-6">{t.rich("heading", { brand })}</h1>
          <div className="body-lg space-y-4">
            <p>{t.rich("intro", { blue })}</p>
          </div>
        </section>

        <section>
          <DonateForm />
        </section>

        <section className="donate-disclosure body-sm">
          {/*
            NOTE: contributions currently route through B-59 LLC, so they are
            NOT tax-deductible. Once the nonprofit entity is live, update this
            copy and point STRIPE_SECRET_KEY at the nonprofit's Stripe account.
          */}
          <p>{t.rich("disclosure", { brand, strong })}</p>
        </section>
      </div>
    </div>
  );
}
