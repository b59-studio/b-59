"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProjectMark } from "./ProjectMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

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

      {/* Case studies are held back for now; the pages stay built but
          unlinked, as the portfolio is.
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
      <Link href="/solutions/brand-design/merch" className="nav-mobile-link nav-mobile-sublink" onClick={onNavigate}>
        <ProjectMark project="merch" size={20} />
        <span>{t("merch")}</span>
      </Link>
      <span className="nav-mobile-sub nav-mobile-sub-marked">{t("merchSub")}</span>
      */}

      <Link href="/about" className="nav-mobile-link" onClick={onNavigate}>
        {t("ourStory")}
      </Link>
      <Link href="/about/inspirations" className="nav-mobile-link" onClick={onNavigate}>
        {t("inspirations")}
      </Link>
      <Link href="/about/team" className="nav-mobile-link" onClick={onNavigate}>
        {t("team")}
      </Link>
      <Link href="/solutions/brand-design/philosophy" className="nav-mobile-link" onClick={onNavigate}>
        {t("brandDesignPhilosophy")}
      </Link>
      {/* Portfolio is built but unlinked until it's ready to go public. */}

      <Link href="/donate" className="nav-mobile-link" onClick={onNavigate}>
        {t("donate")}
      </Link>

      {/* Last in the panel, under the links: the page already opens in the
          reader's language and their device's mode, so these are the override
          rather than the way in (standards/33). The footer carries the same
          pair. */}
      <div className="flex items-center gap-2 border-t border-b59-gray/20 pt-3 mt-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}
