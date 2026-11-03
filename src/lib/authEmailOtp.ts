/**
 * Email OTP lengths are configured by Supabase Auth, not by the browser.
 * Valid Supabase email OTP lengths range from 6 through 10 digits.
 * Keep leading zeros and do not truncate pasted codes before stripping spaces.
 */
export const MAX_EMAIL_OTP_LENGTH = 10;
export const MIN_EMAIL_OTP_LENGTH = 6;

export function normalizeEmailOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, MAX_EMAIL_OTP_LENGTH);
}

export function isValidEmailOtp(value: string): boolean {
  return /^[0-9]{6,10}$/.test(value);
}
