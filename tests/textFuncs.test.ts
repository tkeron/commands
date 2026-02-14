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
