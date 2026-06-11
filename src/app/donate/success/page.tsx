import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Thank you for supporting B-59.",
  alternates: { canonical: "/donate/success" },
  robots: { index: false, follow: false },
};

export default function DonateSuccess() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-8 text-center">
        <h1 className="heading-xl">
          Thank you<span className="text-b59-blue">.</span>
        </h1>
        <div className="body-lg space-y-4">
          <p>
            Your contribution went through. A receipt is on its way to your email
            from Stripe. We&apos;re grateful for your support of B-59&apos;s work.
          </p>
        </div>
        <div>
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
