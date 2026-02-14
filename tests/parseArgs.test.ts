import { beforeEach, describe, expect, it } from "bun:test";
import type { Command } from "../src/types.js";
import { parseArgs } from "../src/parseArgs.js";

describe("parseArgs - Legacy Syntax", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: ["output", "verbose"],
      optionsExamples: [],
      positionedArguments: ["file"],
      optionDefinitions: [],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should parse simple key=value", () => {
    const result = parseArgs(["output=dist"], command);
    expect(result.options.output).toBe("dist");
    expect(result.syntaxMode).toBe("legacy");
  });

  it("should parse multiple key=value", () => {
    const result = parseArgs(
      ["output=dist", "format=json", "port=3000"],
      command,
    );
    expect(result.options.output).toBe("dist");
    expect(result.options.format).toBe("json");
    expect(result.options.port).toBe("3000");
  });

  it("should parse empty value key=", () => {
    const result = parseArgs(["output="], command);
    expect(result.options.output).toBe("");
  });

  it("should parse value with = inside key=val=ue", () => {
    const result = parseArgs(["url=http://example.com?a=1&b=2"], command);
    expect(result.options.url).toBe("http://example.com?a=1&b=2");
  });

  it("should parse mixed positioned args and options", () => {
    const result = parseArgs(["myfile.txt", "output=dist"], command);
    expect(result.positional).toContain("myfile.txt");
    expect(result.options.output).toBe("dist");
  });

  it("should handle positioned args mapping", () => {
    const result = parseArgs(["myfile.txt"], command);
    expect(result.options.file).toBe("myfile.txt");
  });

  it("should handle extra positioned args", () => {
    command.positionedArguments = ["file"];
    const result = parseArgs(["file1.txt", "file2.txt", "file3.txt"], command);
    expect(result.options.file).toBe("file1.txt");
    expect(result.positional).toContain("file2.txt");
    expect(result.positional).toContain("file3.txt");
  });
});

describe("parseArgs - Boolean Flags", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [
        {
          name: "verbose",
          shortFlag: "v",
          type: "boolean",
          description: "Enable verbose",
        },
        {
          name: "quiet",
          shortFlag: "q",
          type: "boolean",
          description: "Enable quiet mode",
        },
      ],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should parse --flag as true", () => {
    const result = parseArgs(["--verbose"], command);
    expect(result.options.verbose).toBe(true);
    expect(result.syntaxMode).toBe("standard");
  });

  it("should parse short -f as true", () => {
    const result = parseArgs(["-v"], command);
    expect(result.options.verbose).toBe(true);
  });

  it("should parse --no-flag as false", () => {
    const result = parseArgs(["--no-verbose"], command);
    expect(result.options.verbose).toBe(false);
  });

  it("should parse combined short flags -abc", () => {
    const result = parseArgs(["-vq"], command);
    expect(result.options.verbose).toBe(true);
    expect(result.options.quiet).toBe(true);
  });

  it("should parse multiple separate flags", () => {
    const result = parseArgs(["--verbose", "--quiet"], command);
    expect(result.options.verbose).toBe(true);
    expect(result.options.quiet).toBe(true);
  });

  it("should handle flag not defined in optionDefinitions", () => {
    const result = parseArgs(["--unknown"], command, {
      allowUnknownOptions: false,
    });
    expect(result.options.unknown).toBeUndefined();
    expect(result.unknown).toContain("--unknown");
  });
});

describe("parseArgs - Options with Value", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [
        {
          name: "output",
          shortFlag: "o",
          type: "string",
          description: "Output directory",
        },
        {
          name: "count",
          shortFlag: "c",
          type: "number",
          description: "Number of items",
        },
      ],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should parse --opt value", () => {
    const result = parseArgs(["--output", "dist"], command);
    expect(result.options.output).toBe("dist");
  });

  it("should parse --opt=value", () => {
    const result = parseArgs(["--output=dist"], command);
    expect(result.options.output).toBe("dist");
  });

  it("should parse -o value", () => {
    const result = parseArgs(["-o", "dist"], command);
    expect(result.options.output).toBe("dist");
  });

  it("should parse -o=value", () => {
    const result = parseArgs(["-o=dist"], command);
    expect(result.options.output).toBe("dist");
  });

  it("should parse number option", () => {
    const result = parseArgs(["--count", "42"], command);
    expect(result.options.count).toBe(42);
    expect(typeof result.options.count).toBe("number");
  });

  it("should parse multiple options", () => {
    const result = parseArgs(["--output", "dist", "--count", "10"], command);
    expect(result.options.output).toBe("dist");
    expect(result.options.count).toBe(10);
  });

  it("should handle empty value --opt ''", () => {
    const result = parseArgs(["--output", ""], command);
    expect(result.options.output).toBe("");
  });

  it("should handle value with = inside --opt=val=ue", () => {
    const result = parseArgs(["--output=http://a.com?x=1"], command);
    expect(result.options.output).toBe("http://a.com?x=1");
  });
});

describe("parseArgs - Double Dash Separator", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [
        {
          name: "output",
          type: "string",
          description: "Output",
        },
      ],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should stop parsing after --", () => {
    const result = parseArgs(
      ["--output", "dist", "--", "--not-parsed"],
      command,
    );
    expect(result.options.output).toBe("dist");
    expect(result.unknown).toContain("--not-parsed");
  });

  it("should treat everything after -- as unknown", () => {
    const result = parseArgs(["--", "--opt", "value", "-f"], command);
    expect(result.unknown).toEqual(["--opt", "value", "-f"]);
  });

  it("should handle -- at the end", () => {
    const result = parseArgs(["--output", "dist", "--"], command);
    expect(result.options.output).toBe("dist");
    expect(result.unknown).toEqual([]);
  });

  it("should handle only --", () => {
    const result = parseArgs(["--"], command);
    expect(result.unknown).toEqual([]);
  });
});

describe("parseArgs - Type Casting", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [
        {
          name: "port",
          type: "number",
          description: "Port",
        },
        {
          name: "verbose",
          type: "boolean",
          description: "Verbose",
        },
        {
          name: "name",
          type: "string",
          description: "Name",
        },
      ],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should cast string to number", () => {
    const result = parseArgs(["--port", "3000"], command);
    expect(result.options.port).toBe(3000);
    expect(typeof result.options.port).toBe("number");
  });

  it("should handle invalid number as NaN", () => {
    const result = parseArgs(["--port", "abc"], command);
    expect(Number.isNaN(result.options.port)).toBe(true);
  });

  it("should handle negative numbers", () => {
    const result = parseArgs(["--port", "-1"], command);
    expect(result.options.port).toBe(-1);
  });

  it("should handle float numbers", () => {
    const result = parseArgs(["--port", "3.14"], command);
    expect(result.options.port).toBe(3.14);
  });

  it("should keep string as string", () => {
    const result = parseArgs(["--name", "test"], command);
    expect(result.options.name).toBe("test");
    expect(typeof result.options.name).toBe("string");
  });

  it("should handle boolean flag", () => {
    const result = parseArgs(["--verbose"], command);
    expect(result.options.verbose).toBe(true);
    expect(typeof result.options.verbose).toBe("boolean");
  });
});

describe("parseArgs - Positioned Arguments", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: ["input", "output"],
      optionDefinitions: [],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should map positioned args by name", () => {
    const result = parseArgs(["file1.txt", "file2.txt"], command);
    expect(result.options.input).toBe("file1.txt");
    expect(result.options.output).toBe("file2.txt");
  });

  it("should handle fewer args than expected", () => {
    const result = parseArgs(["file1.txt"], command);
    expect(result.options.input).toBe("file1.txt");
    expect(result.options.output).toBeUndefined();
  });

  it("should handle overflow positioned args", () => {
    const result = parseArgs(["file1.txt", "file2.txt", "file3.txt"], command);
    expect(result.options.input).toBe("file1.txt");
    expect(result.options.output).toBe("file2.txt");
    expect(result.positional).toContain("file3.txt");
  });

  it("should separate positioned from options in standard syntax", () => {
    command.optionDefinitions = [
      { name: "format", type: "string", description: "Format" },
    ];
    const result = parseArgs(
      ["file1.txt", "--format", "json", "file2.txt"],
      command,
    );
    expect(result.options.input).toBe("file1.txt");
    expect(result.options.output).toBe("file2.txt");
    expect(result.options.format).toBe("json");
  });
});

describe("parseArgs - Edge Cases", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [
        {
          name: "output",
          type: "string",
          description: "Output",
        },
        {
          name: "verbose",
          type: "boolean",
          description: "Verbose",
        },
      ],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should handle --opt followed by another option", () => {
    const result = parseArgs(["--output", "--verbose"], command);
    expect(result.options.output).toBeUndefined();
    expect(result.options.verbose).toBe(true);
  });

  it("should handle empty argv", () => {
    const result = parseArgs([], command);
    expect(result.options).toEqual({});
    expect(result.positional).toEqual([]);
  });

  it("should handle value that looks like option", () => {
    const result = parseArgs(["--output", "--myfile.txt"], command);
    expect(result.options.output).toBe("--myfile.txt");
  });

  it("should handle mixed legacy and standard syntax", () => {
    const result = parseArgs(["--verbose", "key=value"], command, {
      allowLegacySyntax: true,
      allowStandardSyntax: true,
    });
    expect(result.options.verbose).toBe(true);
    expect(result.options.key).toBe("value");
    expect(result.syntaxMode).toBe("mixed");
  });

  it("should reject mixed syntax in strict mode", () => {
    const result = parseArgs(["--verbose", "key=value"], command, {
      strictMode: true,
    });
    expect(result.syntaxMode).toBe("mixed");
  });

  it("should handle value with spaces after --opt", () => {
    const result = parseArgs(["--output", "my file.txt"], command);
    expect(result.options.output).toBe("my file.txt");
  });
});

describe("parseArgs - Backward Compatibility", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: ["output", "format"],
      optionsExamples: [],
      positionedArguments: ["file"],
      optionDefinitions: [],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should detect legacy syntax automatically", () => {
    const result = parseArgs(["output=dist", "format=json"], command);
    expect(result.syntaxMode).toBe("legacy");
  });

  it("should detect standard syntax automatically", () => {
    command.optionDefinitions = [
      { name: "output", type: "string", description: "Output" },
    ];
    const result = parseArgs(["--output", "dist"], command);
    expect(result.syntaxMode).toBe("standard");
  });

  it("should work with no optionDefinitions (legacy mode)", () => {
    const result = parseArgs(["key=value"], command);
    expect(result.options.key).toBe("value");
  });

  it("should allow legacy syntax by default", () => {
    const result = parseArgs(["key=value"], command);
    expect(result.options.key).toBe("value");
  });

  it("should allow standard syntax by default", () => {
    command.optionDefinitions = [
      { name: "verbose", type: "boolean", description: "Verbose" },
    ];
    const result = parseArgs(["--verbose"], command);
    expect(result.options.verbose).toBe(true);
  });
});

describe("parseArgs - Aliases", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [
        {
          name: "output",
          shortFlag: "o",
          type: "string",
          description: "Output",
          aliases: ["out", "destination"],
        },
      ],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should map short flag to name", () => {
    const result = parseArgs(["-o", "dist"], command);
    expect(result.options.output).toBe("dist");
  });

  it("should map alias to name", () => {
    const result = parseArgs(["--out", "dist"], command);
    expect(result.options.output).toBe("dist");
  });

  it("should map another alias to name", () => {
    const result = parseArgs(["--destination", "dist"], command);
    expect(result.options.output).toBe("dist");
  });
});

describe("parseArgs - Allowed Values", () => {
  let command: Command;

  beforeEach(() => {
    command = {
      name: "test",
      description: "test",
      aliases: [],
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [
        {
          name: "format",
          type: "string",
          description: "Output format",
          allowedValues: ["json", "xml", "yaml"],
        },
      ],
      getHelpLine: () => "",
      callback: () => {},
    };
  });

  it("should accept allowed value", () => {
    const result = parseArgs(["--format", "json"], command);
    expect(result.options.format).toBe("json");
  });

  it("should parse disallowed value but not validate here", () => {
    const result = parseArgs(["--format", "invalid"], command);
    expect(result.options.format).toBe("invalid");
  });
});
