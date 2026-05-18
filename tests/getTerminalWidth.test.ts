import { describe, expect, it } from "bun:test";
import { getTerminalWidth } from "../src/getTerminalWidth.js";

describe("getTerminalWidth", () => {
  it("returns a positive number", () => {
    expect(getTerminalWidth()).toBeGreaterThan(0);
  });

  it("uses fallback when columns is missing", () => {
    const stdout = { columns: undefined } as unknown as NodeJS.WriteStream;
    expect(getTerminalWidth(72, stdout)).toBe(72);
  });

  it("uses fallback when columns is 0", () => {
    const stdout = { columns: 0 } as unknown as NodeJS.WriteStream;
    expect(getTerminalWidth(80, stdout)).toBe(80);
  });

  it("returns columns when present", () => {
    const stdout = { columns: 123 } as unknown as NodeJS.WriteStream;
    expect(getTerminalWidth(80, stdout)).toBe(123);
  });

  it("default fallback is 80", () => {
    const stdout = { columns: undefined } as unknown as NodeJS.WriteStream;
    expect(getTerminalWidth(undefined, stdout)).toBe(80);
  });
});
