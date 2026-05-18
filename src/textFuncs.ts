import type { Command, Commands, CommandsCollection } from "./types.js";
import { getTerminalWidth } from "./getTerminalWidth.js";
import { stringWidth } from "./stringWidth.js";

export const buildHelpText = (
  commands: Commands,
  commandsCollection: CommandsCollection,
  terminalWidth?: number,
): string => {
  let descriptions = buildDescriptionsText(commandsCollection, terminalWidth);

  const helpText = `\n${
    (commands.headerText.length > 0 && commands.headerText) || ""
  }\n${descriptions}${
    (commands.footerText.length > 0 && commands.footerText) || ""
  }\n`;
  return helpText;
};

export const buildDescriptionsText = (
  commandsCollection: CommandsCollection,
  terminalWidth?: number,
): string => {
  const termWidth = terminalWidth ?? getTerminalWidth();
  let descriptions = "";
  let max = 0;
  const ready: string[] = [];

  for (const com of Object.values(commandsCollection)) {
    const commandText = getCommandText(com);
    const w = stringWidth(commandText);
    if (w > max) max = w;
  }
  const leftCol = max + 4;
  for (const com of Object.values(commandsCollection)) {
    if (ready.includes(com.name)) continue;
    descriptions += com.getHelpLine(leftCol, termWidth);
    ready.push(com.name);
  }

  return descriptions;
};

export const getCommandText = (command: Command): string => {
  const names = [command.name, ...command.aliases].join("|");

  const args = command.positionedArguments.map((a) => `[${a}]`).join(" ");

  let optionsText = "";

  if (command.optionDefinitions && command.optionDefinitions.length > 0) {
    optionsText = command.optionDefinitions
      .map((def) => {
        const longFlag = `--${def.name}`;
        const shortFlag = def.shortFlag ? `-${def.shortFlag}, ` : "";
        const valueName = def.valueName || def.name;

        if (def.type === "boolean") {
          return def.required
            ? `<${shortFlag}${longFlag}>`
            : `[${shortFlag}${longFlag}]`;
        } else {
          const valueDisplay = def.required
            ? `<${valueName}>`
            : `<${valueName}>`;
          return def.required
            ? `<${shortFlag}${longFlag} ${valueDisplay}>`
            : `[${shortFlag}${longFlag} ${valueDisplay}]`;
        }
      })
      .join(" ");
  } else {
    optionsText = command.options
      .map((o, n) => `[${o}=${command.optionsExamples[n] || "VALUE"}]`)
      .join(" ");
  }

  return `${names}   ${args}   ${optionsText}`.trim() + "  ";
};
