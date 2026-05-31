import type { ReactNode } from "react";

type BadgeVariant =
  | "verified"
  | "ai"
  | "basic"
  | "premium"
  | "claimed"
  | "default";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  verified: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  ai: "border-purple-400/40 bg-purple-400/10 text-purple-200",
  basic: "border-slate-500/50 bg-slate-800 text-slate-200",
  premium: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-200",
  claimed: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  default: "border-white/10 bg-white/5 text-slate-200",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}