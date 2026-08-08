/**
 * Pricing helpers for Neighborly service listings.
 * Pure functions — safe for unit tests and UI formatting.
 */

export interface FormatRateOptions {
  /** Currency code (ISO 4217). Default USD. */
  currency?: string;
  /** Locale for number formatting. Default en-US. */
  locale?: string;
  /** Suffix after the amount, e.g. "/hr". Default "/hr". Pass "" to omit. */
  suffix?: string;
}

/**
 * Format an hourly rate for display.
 * Returns "Contact" when rate is null/undefined/NaN/negative.
 */
export function formatHourlyRate(
  rate: number | null | undefined,
  options: FormatRateOptions = {},
): string {
  if (rate == null || Number.isNaN(rate) || rate < 0) return "Contact";
  const { currency = "USD", locale = "en-US", suffix = "/hr" } = options;
  const amount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: rate % 1 === 0 ? 0 : 2,
  }).format(rate);
  return suffix ? `${amount}${suffix}` : amount;
}

/**
 * Validate a user-entered hourly rate string.
 * Returns { ok: true, value } or { ok: false, error }.
 */
export function parseHourlyRate(
  input: string | number | null | undefined,
): { ok: true; value: number } | { ok: false; error: string } {
  if (input == null || input === "") {
    return { ok: false, error: "Rate is required" };
  }
  const n = typeof input === "number" ? input : Number(String(input).replace(/[$,\s]/g, ""));
  if (Number.isNaN(n)) return { ok: false, error: "Rate must be a number" };
  if (n < 0) return { ok: false, error: "Rate cannot be negative" };
  if (n > 10_000) return { ok: false, error: "Rate exceeds maximum ($10,000)" };
  // Round to cents
  const value = Math.round(n * 100) / 100;
  return { ok: true, value };
}
