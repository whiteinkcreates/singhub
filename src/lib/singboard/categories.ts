/** Controlled SingBOARD categories, independent of visual flyer/post format. */
export const SINGBOARD_CATEGORIES = {
  special_event: {label:"Special event", badge:"border-fuchsia-300/50 bg-fuchsia-400/15 text-fuchsia-100", color:"#ed5cbd"},
  theme_karaoke: {label:"Theme karaoke", badge:"border-cyan-300/50 bg-cyan-400/15 text-cyan-100", color:"#41d9ef"},
  hiring: {label:"Hiring", badge:"border-amber-300/50 bg-amber-400/15 text-amber-100", color:"#fbbf24"},
  community: {label:"Community", badge:"border-violet-300/50 bg-violet-400/15 text-violet-100", color:"#b794f6"},
  notice: {label:"Announcement", badge:"border-emerald-300/50 bg-emerald-400/15 text-emerald-100", color:"#6ee7b7"},
} as const;

export type SingBoardCategory = keyof typeof SINGBOARD_CATEGORIES;
export const SINGBOARD_CATEGORY_KEYS = Object.keys(SINGBOARD_CATEGORIES) as SingBoardCategory[];

export function getSingBoardCategory(value: string | null | undefined, postType?:string): SingBoardCategory {
  if (value && Object.prototype.hasOwnProperty.call(SINGBOARD_CATEGORIES, value))
    return value as SingBoardCategory;
  return postType === "wanted" ? "hiring" : postType === "note" ? "notice" : "special_event";
}
