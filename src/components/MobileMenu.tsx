"use client";

import Link from "next/link";

type MobileMenuProps = {
  open: boolean;
  onNavigate: () => void;
};

export function MobileMenu({ open, onNavigate }: MobileMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="md:hidden py-4 space-y-2 border-t border-b59-gray/20 mt-2">
      <Link href="/about" className="nav-mobile-link" onClick={onNavigate}>
        About
      </Link>
      {/** Work link hidden until page is ready
      <Link href="/work" className="nav-mobile-link" onClick={onNavigate}>
        Work
      </Link>
      */}
    </div>
  );
}
