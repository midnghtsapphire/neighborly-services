import { describe, expect, it } from "vitest";
import { formatHourlyRate, parseHourlyRate } from "../pricing";

describe("formatHourlyRate", () => {
  it("formats whole-dollar rates without cents", () => {
    expect(formatHourlyRate(25)).toBe("$25/hr");
  });

  it("keeps cents when present", () => {
    expect(formatHourlyRate(12.5)).toBe("$12.50/hr");
  });

  it("returns Contact for missing/invalid rates", () => {
    expect(formatHourlyRate(null)).toBe("Contact");
    expect(formatHourlyRate(undefined)).toBe("Contact");
    expect(formatHourlyRate(Number.NaN)).toBe("Contact");
    expect(formatHourlyRate(-1)).toBe("Contact");
  });

  it("allows omitting the suffix", () => {
    expect(formatHourlyRate(40, { suffix: "" })).toBe("$40");
  });
});

describe("parseHourlyRate", () => {
  it("parses plain numbers and currency strings", () => {
    expect(parseHourlyRate(20)).toEqual({ ok: true, value: 20 });
    expect(parseHourlyRate("18.5")).toEqual({ ok: true, value: 18.5 });
    expect(parseHourlyRate("$22.00")).toEqual({ ok: true, value: 22 });
  });

  it("rejects empty, NaN, negative, and huge values", () => {
    expect(parseHourlyRate("")).toMatchObject({ ok: false });
    expect(parseHourlyRate(null)).toMatchObject({ ok: false });
    expect(parseHourlyRate("abc")).toMatchObject({ ok: false });
    expect(parseHourlyRate(-5)).toMatchObject({ ok: false });
    expect(parseHourlyRate(50_000)).toMatchObject({ ok: false });
  });
});
