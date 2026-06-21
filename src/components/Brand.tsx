/**
 * The "B-59" wordmark. Kept on a single line (never split across a line break)
 * via the `.brand` rule, with the hyphen in company blue. Use this everywhere
 * the brand name appears so the rule is applied consistently.
 */
export function Brand() {
  return (
    <span className="brand">
      B<span className="text-b59-blue">-</span>59
    </span>
  );
}
