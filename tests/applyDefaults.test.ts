import { beforeEach, describe, expect, it } from "bun:test";
import type { Command, ParsedOptions } from "../src/types.js";
import { applyDefaults } from "../src/applyDefaults.js";

describe("applyDefaults", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should apply default string value", () => {
    command.optionDefinitions = [
      {
        name: "output",
        type: "string",
        description: "Output",
        default: "./dist",
      },
    ];
    const parsed: ParsedOptions = {};
    const result = applyDefaults(parsed, command);
    expect(result.output).toBe("./dist");
  });

  it("should apply default number value", () => {
    command.optionDefinitions = [
      {
        name: "port",
        type: "number",
        description: "Port",
        default: 3000,
      },
    ];
    const parsed: ParsedOptions = {};
    const result = applyDefaults(parsed, command);
    expect(result.port).toBe(3000);
  });

  it("should apply default boolean value", () => {
    command.optionDefinitions = [
      {
        name: "verbose",
        type: "boolean",
        description: "Verbose",
        default: false,
      },
    ];
    const parsed: ParsedOptions = {};
    const result = applyDefaults(parsed, command);
    expect(result.verbose).toBe(false);
  });

  it("should not overwrite existing value", () => {
    command.optionDefinitions = [
      {
        name: "output",
        type: "string",
        description: "Output",
        default: "./dist",
      },
    ];
    const parsed: ParsedOptions = { output: "./custom" };
    const result = applyDefaults(parsed, command);
    expect(result.output).toBe("./custom");
  });

  it("should apply multiple defaults", () => {
    command.optionDefinitions = [
      {
        name: "output",
        type: "string",
        description: "Output",
        default: "./dist",
      },
      {
        name: "port",
        type: "number",
        description: "Port",
        default: 3000,
      },
    ];
    const parsed: ParsedOptions = {};
    const result = applyDefaults(parsed, command);
    expect(result.output).toBe("./dist");
    expect(result.port).toBe(3000);
  });

  it("should handle no defaults defined", () => {
    command.optionDefinitions = [
      {
        name: "output",
        type: "string",
        description: "Output",
      },
    ];
    const parsed: ParsedOptions = {};
    const result = applyDefaults(parsed, command);
    expect(result.output).toBeUndefined();
  });

  it("should work with no optionDefinitions", () => {
    const parsed: ParsedOptions = { key: "value" };
    const result = applyDefaults(parsed, command);
    expect(result).toEqual(parsed);
  });

  it("should preserve other options", () => {
    command.optionDefinitions = [
      {
        name: "format",
        type: "string",
        description: "Format",
        default: "json",
      },
    ];
    const parsed: ParsedOptions = { output: "dist", verbose: true };
    const result = applyDefaults(parsed, command);
    expect(result.output).toBe("dist");
    expect(result.verbose).toBe(true);
    expect(result.format).toBe("json");
  });
});
