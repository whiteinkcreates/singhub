import type { ReactNode } from "react";

type VenueTagProps = {
  label: string;
  accent?: "pink" | "cyan" | "neutral";
};

type IconProps = { className?: string };

function Icon({ children, className = "h-3.5 w-3.5" }: { children: ReactNode; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>{children}</svg>;
}

function MicIcon(props: IconProps) {
  return <Icon {...props}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6"/></Icon>;
}
function FoodIcon(props: IconProps) {
  return <Icon {...props}><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"/></Icon>;
}
function DrinkIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 4h14l-2 7a5 5 0 0 1-10 0L5 4ZM12 16v5M8 21h8"/></Icon>;
}
function GameIcon(props: IconProps) {
  return <Icon {...props}><rect x="4" y="6" width="16" height="12" rx="4"/><path d="M8 12h4M10 10v4M16 11h.01M18 13h.01"/></Icon>;
}
function PoolIcon(props: IconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M10.7 10.7 13.3 13.3M13.3 10.7 10.7 13.3"/></Icon>;
}
function PatioIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 12h16M12 4v8M7 8l5-4 5 4M8 12v8M16 12v8M5 20h14"/></Icon>;
}
function ParkingIcon(props: IconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M10 17V7h3a3 3 0 0 1 0 6h-3"/></Icon>;
}
function GroupIcon(props: IconProps) {
  return <Icon {...props}><circle cx="9" cy="9" r="3"/><circle cx="16.5" cy="10" r="2.5"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M13 20a4.5 4.5 0 0 1 8 0"/></Icon>;
}
function ClockIcon(props: IconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>;
}
function CalendarIcon(props: IconProps) {
  return <Icon {...props}><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></Icon>;
}
function DoorIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 21h14M7 21V4l10-1v18M13 12h.01"/></Icon>;
}
function DanceIcon(props: IconProps) {
  return <Icon {...props}><circle cx="14" cy="4" r="2"/><path d="m12 8-3 4 3 3-2 6M12 8l4 3 3-1M12 15l4 5"/></Icon>;
}
function IdIcon(props: IconProps) {
  return <Icon {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5.5 16c.8-1.7 4.2-1.7 5 0M13 10h5M13 14h4"/></Icon>;
}
function NightIcon(props: IconProps) {
  return <Icon {...props}><path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></Icon>;
}

function iconForLabel(label: string) {
  const value = label.toLowerCase();
  if (value.includes("karaoke")) return MicIcon;
  if (/(food|eat|wing|taco|slider|popper|burger|burrito|flatbread)/.test(value)) return FoodIcon;
  if (/(drink|bar|beer|wine|cocktail|margarita|shot)/.test(value)) return DrinkIcon;
  if (value.includes("pool")) return PoolIcon;
  if (/(game|games)/.test(value)) return GameIcon;
  if (/(outdoor|patio)/.test(value)) return PatioIcon;
  if (value.includes("parking")) return ParkingIcon;
  if (/(group|groups|all ages)/.test(value)) return GroupIcon;
  if (/(friday|monday|tuesday|wednesday|thursday|saturday|sunday|tonight|\bpm\b|\bam\b)/.test(value)) return ClockIcon;
  if (/(reservation|book)/.test(value)) return CalendarIcon;
  if (/(private room|private rooms)/.test(value)) return DoorIcon;
  if (value.includes("dance")) return DanceIcon;
  if (value.includes("21+")) return IdIcon;
  if (/(late night|late-night)/.test(value)) return NightIcon;
  return null;
}

export function VenueTag({ label, accent = "neutral" }: VenueTagProps) {
  const TagIcon = iconForLabel(label);
  const styles = accent === "pink"
    ? "border-fuchsia-300/55 bg-fuchsia-300/15 text-fuchsia-100"
    : accent === "cyan"
      ? "border-cyan-300/55 bg-cyan-300/12 text-cyan-100"
      : "border-white/10 bg-white/[0.06] text-slate-200";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-[0.08em] ${styles}`}>
      {TagIcon ? <TagIcon /> : null}
      {label}
    </span>
  );
}
