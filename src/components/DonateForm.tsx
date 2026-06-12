"use client";

import { useState } from "react";

type Frequency = "once" | "monthly";

const PRESET_AMOUNTS = [10, 25, 100, 500] as const;
const MIN_DOLLARS = 1;
const MAX_DOLLARS = 50_000;

export function DonateForm() {
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeDollars = selectedPreset ?? Number(customAmount);
  const amountIsValid =
    Number.isFinite(activeDollars) &&
    activeDollars >= MIN_DOLLARS &&
    activeDollars <= MAX_DOLLARS;

  const choosePreset = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount("");
    setError(null);
  };

  const changeCustom = (value: string) => {
    setCustomAmount(value);
    setSelectedPreset(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!amountIsValid || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: Math.round(activeDollars * 100),
          frequency,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // Hand off to Stripe's hosted checkout page.
      window.location.assign(data.url);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="donate-form space-y-8" noValidate>
      <fieldset>
        <legend className="donate-legend">Frequency</legend>
        <div className="donate-toggle" role="group" aria-label="Donation frequency">
          {(["once", "monthly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className="donate-toggle-btn"
              aria-pressed={frequency === option}
              onClick={() => setFrequency(option)}
            >
              {option === "once" ? "One-time" : "Monthly"}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="donate-legend">Amount</legend>
        <div className="donate-amounts">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              className="donate-amount-btn"
              aria-pressed={selectedPreset === amount}
              onClick={() => choosePreset(amount)}
            >
              ${amount}
            </button>
          ))}
        </div>

        <label htmlFor="custom-amount" className="donate-custom-label">
          Or enter a custom amount
        </label>
        <div className="donate-custom-wrap">
          <span className="donate-custom-prefix" aria-hidden="true">
            $
          </span>
          <input
            id="custom-amount"
            name="custom-amount"
            type="number"
            inputMode="decimal"
            min={MIN_DOLLARS}
            max={MAX_DOLLARS}
            step="1"
            placeholder="Other amount"
            className="donate-custom-input"
            value={customAmount}
            onChange={(event) => changeCustom(event.target.value)}
          />
        </div>
      </fieldset>

      {error && (
        <p className="donate-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-secondary w-full text-center"
        disabled={!amountIsValid || submitting}
        aria-busy={submitting}
      >
        {submitting
          ? "Redirecting to secure checkout…"
          : frequency === "monthly"
            ? `Donate $${amountIsValid ? activeDollars : ""} monthly`
            : `Donate $${amountIsValid ? activeDollars : ""}`}
      </button>

      <p className="donate-secure-note">
        Payments are processed securely by Stripe. B-59 never sees your card details.
      </p>
    </form>
  );
}
