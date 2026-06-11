import type { Metadata } from "next";
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

export default function Donate() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-10">
        <section>
          <h1 className="heading-xl mb-6">
            Support B<span className="text-b59-blue">-</span>59
          </h1>
          <div className="body-lg space-y-4">
            <p>
              Your contribution helps us build and maintain civic software that
              actually works <span className="text-b59-blue">—</span> for voter
              access, courts, administrative processes, and public transparency.
            </p>
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
          <p>
            Contributions are processed through B-59 LLC and are{" "}
            <strong>not tax-deductible</strong> at this time. A tax-deductible
            giving option through our nonprofit is coming soon.
          </p>
        </section>
      </div>
    </div>
  );
}
