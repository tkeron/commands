import {
  command,
  commands,
  commandsCollection,
} from "./helpers/testConstants.js";
import {
  buildDescriptionsText,
  buildHelpText,
  getCommandText,
} from "../src/textFuncs.js";
import { describe, expect, it } from "bun:test";

describe("text Functions", () => {
  describe("getCommandText", () => {
    it("should return command text", () => {
      const result = getCommandText(command);

      expect(result).toBe(
        "command_1|al1|al2   [pos1] [pos2]   [op1=opEx1] [op2=VALUE]  ",
      );
    });

    it("should return command text without aliases", () => {
      const result = getCommandText({ ...command, aliases: [] });

      expect(result).toBe(
        "command_1   [pos1] [pos2]   [op1=opEx1] [op2=VALUE]  ",
      );
    });
  });
  describe("buildHelpText", () => {
    it("should return help text", () => {
      const result = buildHelpText(commands, commandsCollection);
      expect(result).toBe(
        "\nheader text...\nhelp line...\nhelp line...\nhelp line...\nfooter text...\n",
      );
    });
    it("should return help text without headerText", () => {
      const result = buildHelpText(
        { ...commands, headerText: "" },
        commandsCollection,
      );
      expect(result).toBe(
        "\n\nhelp line...\nhelp line...\nhelp line...\nfooter text...\n",
      );
    });
    it("should return help text without footerText", () => {
      const result = buildHelpText(
        { ...commands, footerText: "" },
        commandsCollection,
      );
      expect(result).toBe(
        "\nheader text...\nhelp line...\nhelp line...\nhelp line...\n\n",
      );
    });
  });
  describe("buildDescriptionsText", () => {
    it("should return description text", () => {
      const result = buildDescriptionsText(commandsCollection);
      expect(result).toBe("help line...\n".repeat(3));
    });

    it("should return empty string for empty collection", () => {
      const result = buildDescriptionsText({});
      expect(result).toBe("");
    });
  });

  describe("getCommandText edge cases", () => {
    it("should handle command with no options and no positioned args", () => {
      const result = getCommandText({
        ...command,
        options: [],
        optionsExamples: [],
        positionedArguments: [],
        aliases: [],
      });
      expect(result).toBe("command_1  ");
    });

    it("should handle command with only aliases", () => {
      const result = getCommandText({
        ...command,
        options: [],
        optionsExamples: [],
        positionedArguments: [],
      });
      expect(result).toBe("command_1|al1|al2  ");
    });

    it("should use VALUE as default example when not provided", () => {
      const result = getCommandText({
        ...command,
        options: ["opt1"],
        optionsExamples: [],
        positionedArguments: [],
        aliases: [],
      });
      expect(result).toBe("command_1      [opt1=VALUE]  ");
    });
  });
});

describe("getCommandText with optionDefinitions", () => {
  it("should format boolean flag with short flag", () => {
    const command = {
      ...commandsCollection.command_1,
      optionDefinitions: [
        {
          name: "verbose",
          shortFlag: "v",
          type: "boolean" as const,
          description: "Verbose output",
        },
      ],
    };
    const result = getCommandText(command);
    expect(result).toContain("--verbose");
    expect(result).toContain("-v");
  });

  it("should format string option with short flag", () => {
    const command = {
      ...commandsCollection.command_1,
      optionDefinitions: [
        {
          name: "output",
          shortFlag: "o",
          type: "string" as const,
          description: "Output directory",
        },
      ],
    };
    const result = getCommandText(command);
    expect(result).toContain("--output");
    expect(result).toContain("-o");
  });

  it("should show required marker for required options", () => {
    const command = {
      ...commandsCollection.command_1,
      optionDefinitions: [
        {
          name: "config",
          type: "string" as const,
          description: "Config file",
          required: true,
        },
      ],
    };
    const result = getCommandText(command);
    expect(result).toContain("<config>");
  });

  it("should show optional marker for optional options", () => {
    const command = {
      ...commandsCollection.command_1,
      optionDefinitions: [
        {
          name: "format",
          type: "string" as const,
          description: "Output format",
          required: false,
        },
      ],
    };
    const result = getCommandText(command);
    expect(result).toContain("[--format");
  });

  it("should fall back to legacy format when no optionDefinitions", () => {
    const command = {
      ...commandsCollection.command_1,
      optionDefinitions: [],
    };
    const result = getCommandText(command);
    expect(result).toContain("[op1=opEx1]");
  });
});

describe("getGetHelpLine wrapping behavior", () => {
  const baseCommand = {
    name: "build",
    description: "",
    aliases: [],
    options: [],
    optionsExamples: [],
    positionedArguments: [],
    optionDefinitions: [],
    getHelpLine: () => "",
    callback: () => {},
  };

  it("returns padded line with no description (backward compatible)", async () => {
    const { getGetHelpLine } = await import("../src/getCommandsFuncs.js");
    const helpLine = getGetHelpLine(baseCommand);
    const result = helpLine(50, 80);
    expect(result.endsWith("  \n")).toBe(true);
    expect(result.split("\n").length).toBe(2);
  });

  it("keeps description on same line when fits", async () => {
    const { getGetHelpLine } = await import("../src/getCommandsFuncs.js");
    const helpLine = getGetHelpLine({
      ...baseCommand,
      description: "short desc",
    });
    const result = helpLine(20, 80);
    expect(result.split("\n").length).toBe(2);
    expect(result).toContain("short desc");
  });

  it("wraps long description with hanging indent", async () => {
    const { getGetHelpLine } = await import("../src/getCommandsFuncs.js");
    const helpLine = getGetHelpLine({
      ...baseCommand,
      description:
        "a very long description that should wrap across multiple lines",
    });
    const result = helpLine(20, 50);
    const lines = result.split("\n").filter((l) => l.length > 0);
    expect(lines.length).toBeGreaterThan(1);
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i].startsWith(" ".repeat(22))).toBe(true);
    }
  });

  it("puts description on next line when left col too wide", async () => {
    const { getGetHelpLine } = await import("../src/getCommandsFuncs.js");
    const helpLine = getGetHelpLine({
      ...baseCommand,
      description: "some description text here",
    });
    const result = helpLine(70, 80);
    const lines = result.split("\n").filter((l) => l.length > 0);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    expect(lines[0]).toContain("build");
    expect(lines[1].startsWith("    ")).toBe(true);
  });

  it("no line exceeds terminal width", async () => {
    const { getGetHelpLine } = await import("../src/getCommandsFuncs.js");
    const { stringWidth } = await import("../src/stringWidth.js");
    const termWidth = 40;
    const helpLine = getGetHelpLine({
      ...baseCommand,
      description:
        "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu",
    });
    const result = helpLine(15, termWidth);
    const lines = result.split("\n").filter((l) => l.length > 0);
    for (const line of lines) {
      expect(stringWidth(line)).toBeLessThanOrEqual(termWidth);
    }
  });
});
