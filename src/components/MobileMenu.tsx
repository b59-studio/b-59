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
      <Link href="/studio" className="nav-mobile-link" onClick={onNavigate}>
        Our Work
      </Link>

      <span className="nav-mobile-heading">Solutions</span>
      <Link href="/solutions/ready2vote" className="nav-mobile-link nav-mobile-sublink" onClick={onNavigate}>
        ready<span className="text-b59-blue">2</span>vote
      </Link>
      <span className="nav-mobile-sub">
        Helps Texans complete and mail their voter registration application.
      </span>
      <Link href="/solutions/hotline" className="nav-mobile-link nav-mobile-sublink" onClick={onNavigate}>
        Hotline
      </Link>
      <span className="nav-mobile-sub">
        Scheduling that shares a few times, not your whole calendar.
      </span>

      <span className="nav-mobile-heading">Case Studies</span>
      <Link
        href="/solutions/travis-county-vdr"
        className="nav-mobile-link nav-mobile-sublink"
        onClick={onNavigate}
      >
        Travis County VDR Toolkit
      </Link>
      <span className="nav-mobile-sub">
        A mobile-first rebuild of the county&apos;s Voter Registration Toolkit.
      </span>

      <Link href="/about" className="nav-mobile-link" onClick={onNavigate}>
        Our Story
      </Link>
      <Link href="/solutions/brand-design/philosophy" className="nav-mobile-link" onClick={onNavigate}>
        Brand Design Philosophy
      </Link>
      {/* Portfolio is built but unlinked until it's ready to go public. */}

      <Link href="/donate" className="nav-mobile-link" onClick={onNavigate}>
        Donate
      </Link>
    </div>
  );
}
