/**
 * Profile display helpers (initials, safe names).
 */

/** Build avatar initials from a full name. Falls back to "?" */
export function getInitials(fullName: string | null | undefined, max = 2): string {
  if (!fullName || !fullName.trim()) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, max).toUpperCase();
  }
  return parts
    .slice(0, max)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/** Safe display name with fallback. */
export function displayName(
  fullName: string | null | undefined,
  fallback = "Neighbor",
): string {
  const trimmed = fullName?.trim();
  return trimmed ? trimmed : fallback;
}
