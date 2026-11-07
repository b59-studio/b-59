import { ProjectMark } from "./ProjectMark";
import { NavGlyph } from "./NavGlyph";
import type { NavItem } from "./nav-menus";

type Translate = (key: string) => string;

export function NavItemMark({ item, size, className }: { item: NavItem; size: number; className?: string }) {
  return "project" in item.icon ? (
    <ProjectMark project={item.icon.project} size={size} className={className} />
  ) : (
    <NavGlyph glyph={item.icon.glyph} size={size} className={className} />
  );
}

export function NavItemName({ item, t }: { item: NavItem; t: Translate }) {
  if ("key" in item.label) return <>{t(item.label.key)}</>;
  if (item.label.brand === "ready2vote") {
    return (
      <>
        ready<span className="text-b59-blue">2</span>vote
      </>
    );
  }
  return <>{item.label.brand}</>;
}
