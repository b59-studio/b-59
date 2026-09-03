"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProjectMark } from "./ProjectMark";

type MobileMenuProps = {
  open: boolean;
  onNavigate: () => void;
};

export function MobileMenu({ open, onNavigate }: MobileMenuProps) {
  const t = useTranslations("nav");

  if (!open) {
    return null;
  }

  return (
    <div className="nav-mobile-panel md:hidden py-4 space-y-2 border-t border-b59-gray/20 mt-2">
      <Link href="/studio" className="nav-mobile-link" onClick={onNavigate}>
        {t("ourWork")}
      </Link>

      <span className="nav-mobile-heading">{t("solutions")}</span>
      <Link href="/solutions/ready2vote" className="nav-mobile-link nav-mobile-sublink" onClick={onNavigate}>
        <ProjectMark project="ready2vote" size={20} />
        <span>
          ready<span className="text-b59-blue">2</span>vote
        </span>
      </Link>
      <span className="nav-mobile-sub nav-mobile-sub-marked">{t("ready2voteSub")}</span>
      <Link href="/solutions/hotline" className="nav-mobile-link nav-mobile-sublink" onClick={onNavigate}>
        <ProjectMark project="hotline" size={20} />
        <span>Hotline</span>
      </Link>
      <span className="nav-mobile-sub nav-mobile-sub-marked">{t("hotlineSub")}</span>

      <span className="nav-mobile-heading">{t("caseStudies")}</span>
      <Link
        href="/solutions/travis-county-vdr"
        className="nav-mobile-link nav-mobile-sublink"
        onClick={onNavigate}
      >
        <ProjectMark project="travis-county-vdr" size={20} />
        <span>Travis County VDR Toolkit</span>
      </Link>
      <span className="nav-mobile-sub nav-mobile-sub-marked">{t("travisCountyVdrSub")}</span>
      <Link
        href="/solutions/voter-registration-palooza"
        className="nav-mobile-link nav-mobile-sublink"
        onClick={onNavigate}
      >
        <ProjectMark project="voter-registration-palooza" size={20} />
        <span>Voter Registration Palooza</span>
      </Link>
      <span className="nav-mobile-sub nav-mobile-sub-marked">
        {t("voterRegistrationPaloozaSub")}
      </span>

      <Link href="/about" className="nav-mobile-link" onClick={onNavigate}>
        {t("ourStory")}
      </Link>
      <Link href="/solutions/brand-design/philosophy" className="nav-mobile-link" onClick={onNavigate}>
        {t("brandDesignPhilosophy")}
      </Link>
      {/* Portfolio is built but unlinked until it's ready to go public. */}

      <Link href="/donate" className="nav-mobile-link" onClick={onNavigate}>
        {t("donate")}
      </Link>
    </div>
  );
}
