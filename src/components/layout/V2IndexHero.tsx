import Link from "next/link";
import { PositionedImage } from "@/components/media/PositionedImage";
import type { ResponsiveImagePlacement } from "@/lib/imagePlacement";
import "./v2IndexHero.css";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  heroUrl?: string;
  heroAlt?: string;
  heroPosition?: string;
  heroPlacement?: ResponsiveImagePlacement;
  primaryHref?: string;
  primaryLabel?: string;
};
export function V2IndexHero({
  eyebrow, title, description, heroUrl, heroAlt, heroPosition, heroPlacement,
  primaryHref = "/find-karaoke", primaryLabel = "Find karaoke",
}: Props) {
  return (
    <section className="singhub-v2-index-hero" aria-label={title}>
      <PositionedImage
        src={heroUrl || "/images/singhub-v2/singhub-city-discovery.webp"}
        alt={heroAlt || "San Diego karaoke nightlife"}
        placement={heroPlacement}
        position={heroPosition}
        className="singhub-v2-index-photo"
      />
      <div className="singhub-v2-index-hero-content">
        <p className="singhub-v2-index-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="singhub-v2-index-description">{description}</p>
        <Link href={primaryHref} className="singhub-v2-index-cta">{primaryLabel} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
