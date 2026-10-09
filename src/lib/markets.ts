/** Market definitions for phased expansion. No production data-source changes. */
export type MarketConfig = {
  id: string;
  name: string;
  timeZone: string;
  status: 'live' | 'staging';
};
export const MARKETS: Readonly<Record<string, MarketConfig>> = {
  'san-diego': { id: 'san-diego', name: 'San Diego', timeZone: 'America/Los_Angeles', status: 'live' },
  phoenix: { id: 'phoenix', name: 'Phoenix', timeZone: 'America/Phoenix', status: 'staging' },
  boston: { id: 'boston', name: 'Boston', timeZone: 'America/New_York', status: 'staging' },
  maine: { id: 'maine', name: 'Maine', timeZone: 'America/New_York', status: 'staging' },
  redlands: { id: 'redlands', name: 'Redlands', timeZone: 'America/Los_Angeles', status: 'staging' },
};
export function getMarketConfig(id: string): MarketConfig | undefined {
  return MARKETS[id.trim().toLowerCase()];
}
export function marketLocalDate(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = (key: string) => parts.find(part => part.type === key)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
