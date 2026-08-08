import { describe, expect, it } from "vitest";
import {
  SERVICE_CATEGORIES,
  getCategoryLabel,
  isKnownCategory,
} from "../categories";

describe("SERVICE_CATEGORIES", () => {
  it("has unique values", () => {
    const values = SERVICE_CATEGORIES.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("includes core neighborhood categories", () => {
    const values = new Set(SERVICE_CATEGORIES.map((c) => c.value));
    expect(values.has("pet_care")).toBe(true);
    expect(values.has("handyman")).toBe(true);
    expect(values.has("cleaning")).toBe(true);
  });
});

describe("getCategoryLabel", () => {
  it("maps known slugs to labels", () => {
    expect(getCategoryLabel("pet_care")).toBe("Pet Care");
    expect(getCategoryLabel("lawn_garden")).toBe("Lawn & Garden");
    expect(getCategoryLabel("other")).toBe("Other");
  });

  it("title-cases unknown slugs", () => {
    expect(getCategoryLabel("snow_removal")).toBe("Snow Removal");
  });

  it("returns Other for empty input", () => {
    expect(getCategoryLabel(null)).toBe("Other");
    expect(getCategoryLabel(undefined)).toBe("Other");
    expect(getCategoryLabel("")).toBe("Other");
  });
});

describe("isKnownCategory", () => {
  it("accepts known slugs", () => {
    expect(isKnownCategory("tutoring")).toBe(true);
    expect(isKnownCategory("other")).toBe(true);
  });

  it("rejects unknown or empty", () => {
    expect(isKnownCategory("spaceship_repair")).toBe(false);
    expect(isKnownCategory(null)).toBe(false);
    expect(isKnownCategory("")).toBe(false);
  });
});
