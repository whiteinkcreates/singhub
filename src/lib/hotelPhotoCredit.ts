export type HotelPhotoCredit = {
  attribution: string;
  sourceUrl: string;
  status: "licensed" | "permission-pending" | "illustrative";
  license?: string;
  licenseUrl?: string;
  note?: string;
};
