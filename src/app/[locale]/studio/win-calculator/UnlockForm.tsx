"use client";

import { useActionState } from "react";
import { unlock, type UnlockState } from "./actions";

export function UnlockForm() {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock, { error: null });
  return (
    <form action={action} className="ea-lock">
      <label className="ea-field">
        <span className="ea-field-label">Password</span>
        <input
          className="ea-input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "win-calculator-error" : undefined}
        />
      </label>
      {state.error && (
        <p id="win-calculator-error" role="alert" className="ea-error body-sm">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn-secondary justify-self-start" disabled={pending}>
        {pending ? "Checking…" : "Open the calculator"}
      </button>
    </form>
  );
}
