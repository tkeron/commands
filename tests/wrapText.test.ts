import { describe, expect, it } from "bun:test";
import { wrapText } from "../src/wrapText.js";

describe("wrapText", () => {
  it("returns single line when fits", () => {
    expect(wrapText("hello world", 20)).toEqual(["hello world"]);
  });

  it("returns empty array for empty string", () => {
    expect(wrapText("", 20)).toEqual([]);
  });

  it("wraps long text on word boundaries", () => {
    expect(wrapText("the quick brown fox", 10)).toEqual([
      "the quick",
      "brown fox",
    ]);
  });

  it("applies hanging indent to subsequent lines", () => {
    expect(wrapText("the quick brown fox", 10, 2)).toEqual([
      "the quick",
      "  brown",
      "  fox",
    ]);
  });

  it("breaks a single word longer than width", () => {
    const result = wrapText("supercalifragilistic", 5);
    expect(result.length).toBeGreaterThan(1);
    expect(result.every((l) => l.length <= 5)).toBe(true);
    expect(result.join("")).toBe("supercalifragilistic");
  });

  it("counts visual width for CJK", () => {
    expect(wrapText("日本 語", 4)).toEqual(["日本", "語"]);
  });

  it("returns original when width <= 0", () => {
    expect(wrapText("hello", 0)).toEqual(["hello"]);
  });

  it("collapses multiple spaces in input", () => {
    expect(wrapText("a   b   c", 10)).toEqual(["a b c"]);
  });

  it("hanging indent never produces lines wider than width", () => {
    const result = wrapText(
      "alpha beta gamma delta epsilon zeta eta theta",
      12,
      4,
    );
    for (const line of result) {
      expect(line.length).toBeLessThanOrEqual(12);
    }
  });
});
