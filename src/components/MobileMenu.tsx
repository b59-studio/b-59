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
      <span className="nav-mobile-heading">Brand Design</span>
      <Link
        href="/solutions/brand-design/philosophy"
        className="nav-mobile-link nav-mobile-sublink"
        onClick={onNavigate}
      >
        Philosophy
      </Link>
      {/* Portfolio is built but unlinked until it's ready to go public. */}

      <span className="nav-mobile-heading">Development</span>
      <Link href="/solutions/ready2vote" className="nav-mobile-link nav-mobile-sublink" onClick={onNavigate}>
        ready<span className="text-b59-blue">2</span>vote
      </Link>

      <Link href="/about" className="nav-mobile-link" onClick={onNavigate}>
        About
      </Link>

      <Link href="/donate" className="nav-mobile-link" onClick={onNavigate}>
        Donate
      </Link>
    </div>
  );
}
