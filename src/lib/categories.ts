/**
 * Canonical service categories for Neighborly Services.
 * Kept pure (no React) so UI and unit tests share one source of truth.
 */

export type ServiceCategoryValue =
  | "pet_care"
  | "lawn_garden"
  | "handyman"
  | "tutoring"
  | "sewing"
  | "upholstery"
  | "cleaning"
  | "babysitting"
  | "errands"
  | "delivery"
  | "music_lessons"
  | "life_coaching"
  | "other";

export interface ServiceCategory {
  label: string;
  value: ServiceCategoryValue;
  /** Tailwind class tokens used by the browse grid. */
  color: string;
}

/** Browse-grid categories (order is display order). */
export const SERVICE_CATEGORIES: ReadonlyArray<
  Omit<ServiceCategory, "color"> & { color: string }
> = [
  { label: "Pet Care", value: "pet_care", color: "bg-secondary text-secondary-foreground" },
  { label: "Lawn & Garden", value: "lawn_garden", color: "bg-success/10 text-success" },
  { label: "Handyman", value: "handyman", color: "bg-primary/10 text-primary" },
  { label: "Tutoring", value: "tutoring", color: "bg-neighborhood/10 text-neighborhood" },
  { label: "Sewing", value: "sewing", color: "bg-accent/50 text-accent-foreground" },
  { label: "Upholstery", value: "upholstery", color: "bg-neighborhood/10 text-neighborhood" },
  { label: "Cleaning", value: "cleaning", color: "bg-secondary text-secondary-foreground" },
  { label: "Babysitting", value: "babysitting", color: "bg-primary/10 text-primary" },
  { label: "Errands", value: "errands", color: "bg-success/10 text-success" },
  { label: "Delivery", value: "delivery", color: "bg-primary/10 text-primary" },
  { label: "Music Lessons", value: "music_lessons", color: "bg-neighborhood/10 text-neighborhood" },
  { label: "Life Coaching", value: "life_coaching", color: "bg-secondary text-secondary-foreground" },
] as const;

const LABEL_BY_VALUE: Record<string, string> = Object.fromEntries([
  ...SERVICE_CATEGORIES.map((c) => [c.value, c.label] as const),
  ["other", "Other"],
]);

/** Human label for a stored category slug; falls back to title-cased slug. */
export function getCategoryLabel(value: string | null | undefined): string {
  if (!value) return "Other";
  if (LABEL_BY_VALUE[value]) return LABEL_BY_VALUE[value];
  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** True when value is a known category slug (including "other"). */
export function isKnownCategory(value: string | null | undefined): boolean {
  if (!value) return false;
  return Object.prototype.hasOwnProperty.call(LABEL_BY_VALUE, value);
}
