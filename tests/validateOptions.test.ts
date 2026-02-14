import { beforeEach, describe, expect, it } from "bun:test";
import type { Command, ParsedOptions } from "../src/types.js";
import { validateOptions } from "../src/validateOptions.js";

describe("validateOptions", () => {
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

  it("should validate required option is present", () => {
    command.optionDefinitions = [
      {
        name: "output",
        type: "string",
        description: "Output",
        required: true,
      },
    ];
    const parsed: ParsedOptions = { output: "dist" };
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should fail when required option is missing", () => {
    command.optionDefinitions = [
      {
        name: "output",
        type: "string",
        description: "Output",
        required: true,
      },
    ];
    const parsed: ParsedOptions = {};
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Required option 'output' is missing");
  });

  it("should validate multiple required options", () => {
    command.optionDefinitions = [
      {
        name: "output",
        type: "string",
        description: "Output",
        required: true,
      },
      {
        name: "input",
        type: "string",
        description: "Input",
        required: true,
      },
    ];
    const parsed: ParsedOptions = { output: "dist" };
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Required option 'input' is missing");
  });

  it("should validate number type is valid", () => {
    command.optionDefinitions = [
      {
        name: "port",
        type: "number",
        description: "Port",
      },
    ];
    const parsed: ParsedOptions = { port: 3000 };
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(true);
  });

  it("should fail when number type is NaN", () => {
    command.optionDefinitions = [
      {
        name: "port",
        type: "number",
        description: "Port",
      },
    ];
    const parsed: ParsedOptions = { port: NaN };
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Option 'port' must be a valid number");
  });

  it("should validate allowed values", () => {
    command.optionDefinitions = [
      {
        name: "format",
        type: "string",
        description: "Format",
        allowedValues: ["json", "xml", "yaml"],
      },
    ];
    const parsed: ParsedOptions = { format: "json" };
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(true);
  });

  it("should fail when value not in allowed values", () => {
    command.optionDefinitions = [
      {
        name: "format",
        type: "string",
        description: "Format",
        allowedValues: ["json", "xml", "yaml"],
      },
    ];
    const parsed: ParsedOptions = { format: "invalid" };
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Option 'format' must be one of: json, xml, yaml",
    );
  });

  it("should pass validation when no optionDefinitions", () => {
    const parsed: ParsedOptions = { anything: "value" };
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(true);
  });

  it("should validate multiple errors at once", () => {
    command.optionDefinitions = [
      {
        name: "port",
        type: "number",
        description: "Port",
        required: true,
      },
      {
        name: "format",
        type: "string",
        description: "Format",
        allowedValues: ["json", "xml"],
      },
    ];
    const parsed: ParsedOptions = { format: "invalid" };
    const result = validateOptions(parsed, command);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
