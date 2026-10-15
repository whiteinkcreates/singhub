// Compare both delivery URLs and Cloudinary IDs so transformed URLs stay protected.
export function hotelAssetAssignments(profiles: { slug: string; media: unknown }[], asset: { url: string; publicId: string }) {
  const matches = (value: unknown) => {
    if (typeof value !== 'string') return false;
    if (value === asset.url) return true;
    try {
      const original = new URL(asset.url);
      const candidate = new URL(value);
      const path = decodeURIComponent(candidate.pathname);
      return candidate.origin === original.origin && (path.includes('/' + asset.publicId + '.') || path.endsWith('/' + asset.publicId));
    } catch { return false; }
  };
  return profiles.flatMap(({ slug, media }) => {
    if (!media || typeof media !== 'object') return [];
    const record = media as Record<string, unknown>;
    const published = record.publishedHero as Record<string, unknown> | undefined;
    const fields = { hero: record.heroImageUrl, 'published hero': published?.heroImageUrl, Walkable: record.walkableImageUrl, 'Quick Ride': record.quickRideImageUrl, Standouts: record.standoutImageUrl };
    return Object.entries(fields).filter(([, value]) => matches(value)).map(([role]) => `${slug} (${role})`);
  });
}
