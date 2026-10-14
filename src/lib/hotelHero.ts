import type { HotelGuide } from './hotelGuides';
import type { HotelMediaProfile, HotelPackageReview } from './hotelProfiles';

export type PublishedHotelHero = Pick<HotelMediaProfile, 'heroImageUrl' | 'heroAlt' | 'heroPosition' | 'heroPlacement' | 'imageSource' | 'usageRights'> & { packageReview: HotelPackageReview };

export function isHotelHeroApproved(url: string | undefined, review?: HotelPackageReview) {
  return Boolean(url?.trim() && review?.heroApproved && review.heroImageUrl === url && review.rightsNote.trim());
}

export function heroSnapshot(profile: HotelMediaProfile): PublishedHotelHero | undefined {
  if (!isHotelHeroApproved(profile.heroImageUrl, profile.packageReview)) return undefined;
  return { heroImageUrl: profile.heroImageUrl, heroAlt: profile.heroAlt, heroPosition: profile.heroPosition,
    heroPlacement: profile.heroPlacement, imageSource: profile.imageSource, usageRights: profile.usageRights, packageReview: profile.packageReview! };
}

// Keep all metadata attached to the selected image. A staged crop must never move
// an older approved photo. Only the server may retain a published snapshot.
export function selectHotelHero(registered: HotelGuide, media: HotelMediaProfile | null, internal = false) {
  const saved = media?.heroImageUrl.trim() ? media : undefined;
  const published = media?.publishedHero;
  const selected = internal && saved ? saved
    : saved && isHotelHeroApproved(saved.heroImageUrl, saved.packageReview) ? saved
    : published && isHotelHeroApproved(published.heroImageUrl, published.packageReview) ? published
    : undefined;
  if (selected) return { hotel: { ...registered, heroImageUrl: selected.heroImageUrl, heroAlt: selected.heroAlt,
    heroPosition: selected.heroPosition, heroPlacement: selected.heroPlacement }, approved: isHotelHeroApproved(selected.heroImageUrl, selected.packageReview) };
  // Approval can refer to the registry image even when the override is blank.
  const approved = isHotelHeroApproved(registered.heroImageUrl, media?.packageReview);
  return { hotel: registered, approved };
}

export function retainPublishedHero(next: HotelMediaProfile, previous: HotelMediaProfile | null, registered?: HotelGuide): HotelMediaProfile {
  // Never trust a snapshot submitted by the editor. Retain only server-read approval.
  const registeredSnapshot = previous && registered && isHotelHeroApproved(registered.heroImageUrl, previous.packageReview)
    ? heroSnapshot({ ...previous, heroImageUrl: registered.heroImageUrl!, heroAlt: registered.heroAlt || registered.name + " exterior", heroPosition: registered.heroPosition, heroPlacement: registered.heroPlacement }) : undefined;
  const publishedHero = heroSnapshot(next) || (previous && heroSnapshot(previous)) || previous?.publishedHero || registeredSnapshot;
  // An explicit revocation for the same URL removes that published snapshot.
  const revoked = next.packageReview?.heroApproved === false && next.heroImageUrl === publishedHero?.heroImageUrl;
  return { ...next, publishedHero: revoked ? undefined : publishedHero };
}
