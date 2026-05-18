import { describe, expect, it } from "bun:test";
import { stringWidth } from "../src/stringWidth.js";

describe("stringWidth", () => {
  it("returns 0 for empty string", () => {
    expect(stringWidth("")).toBe(0);
  });

  it("returns length for plain ASCII", () => {
    expect(stringWidth("hello")).toBe(5);
    expect(stringWidth("a b c")).toBe(5);
  });

  it("ignores ANSI escape codes", () => {
    const colored = "\x1b[31mred\x1b[0m";
    expect(stringWidth(colored)).toBe(3);
  });

  it("counts CJK as width 2", () => {
    expect(stringWidth("日本")).toBe(4);
  });

  it("counts emoji as width 2", () => {
    expect(stringWidth("👍")).toBe(2);
  });

  it("handles mixed content", () => {
    expect(stringWidth("a日b")).toBe(4);
  });
});
