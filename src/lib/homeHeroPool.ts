/** Approved SingHUB homepage hero set, featuring four music styles.
 * Homepage-only assets. /discover retains the managed City Signal photograph.
 * Current media lives on a stable CDN rather than shipping multi-megabyte bundles.
 */
export type HomeHero = {
  id: string;
  src: string;
  alt: string;
  position: string;
  mobilePosition: string;
};
export const HOME_HEROES: readonly HomeHero[] = [
  {
    id: 'nightclub',
    src: 'https://cdn.shopify.com/s/files/1/0560/5228/5537/files/singhub-home-hero-nightclub-v1.jpg?v=1792297067',
    alt: 'A smiling nightclub singer reaches out with a microphone to invite someone in the crowd to sing.',
    position: 'center center',
    mobilePosition: '70% center',
  },
  {
    id: 'country',
    src: 'https://cdn.shopify.com/s/files/1/0560/5228/5537/files/singhub-home-hero-country-v1.jpg?v=1792297071',
    alt: 'A country singer in a cowboy hat hands a microphone toward the audience in a lively honky-tonk.',
    position: 'center center',
    mobilePosition: '70% center',
  },
  {
    id: 'glam',
    src: 'https://cdn.shopify.com/s/files/1/0560/5228/5537/files/singhub-home-hero-glam-v1.jpg?v=1792297077',
    alt: 'A glamorous rock performer invites someone onstage with a microphone as a concert crowd cheers.',
    position: 'center center',
    mobilePosition: '70% center',
  },
  {
    id: 'rnb',
    src: 'https://cdn.shopify.com/s/files/1/0560/5228/5537/files/singhub-home-hero-rnb-v1.jpg?v=1792297082',
    alt: 'An R&B vocalist reaches into the audience with a microphone beneath vibrant purple and blue lights.',
    position: 'center center',
    mobilePosition: '70% center',
  },
];
