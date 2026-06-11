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
      <span className="nav-mobile-heading">Solutions</span>
      <Link href="/solutions/ready2vote" className="nav-mobile-link nav-mobile-sublink" onClick={onNavigate}>
        ready<span className="text-b59-blue">2</span>vote
      </Link>

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
