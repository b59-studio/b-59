/** Points along the reading direction; `.home-arrow` mirrors it under RTL. */
export function RowArrow() {
  return (
    <svg
      className="home-arrow"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden={true}
      focusable="false"
    >
      <path
        d="M4 10h12m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
