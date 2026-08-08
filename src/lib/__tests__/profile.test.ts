import { describe, expect, it } from "vitest";
import { displayName, getInitials } from "../profile";

describe("getInitials", () => {
  it("uses first letters of each word", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
    expect(getInitials("Grace Hopper")).toBe("GH");
  });

  it("handles single names", () => {
    expect(getInitials("Prince")).toBe("PR");
    expect(getInitials("A")).toBe("A");
  });

  it("falls back for empty names", () => {
    expect(getInitials(null)).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });
});

describe("displayName", () => {
  it("returns trimmed name or fallback", () => {
    expect(displayName("  Sam  ")).toBe("Sam");
    expect(displayName(null)).toBe("Neighbor");
    expect(displayName("", "Guest")).toBe("Guest");
  });
});
