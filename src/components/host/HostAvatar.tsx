/* eslint-disable @next/next/no-img-element */
import type { HostProfile } from "@/types";

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "SH";
}

export function HostAvatar({ host, large = false }: { host: HostProfile; large?: boolean }) {
  const imageUrl = host.profileImageUrl || host.logoUrl;
  const sizeClasses = large ? "h-32 w-32 text-4xl" : "h-16 w-16 text-lg";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${host.publicDisplayName} profile image`}
        className={`${sizeClasses} rounded-2xl border border-cyan-300/40 object-cover shadow-lg shadow-cyan-950/40`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-2xl border border-fuchsia-300/45 bg-slate-950 text-center font-black text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.25)]`}
      aria-label={`${host.publicDisplayName} initials`}
    >
      {getInitials(host.publicDisplayName)}
    </div>
  );
}
