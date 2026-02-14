import type { Command, Commands, CommandsCollection } from "./types.js";

export const buildHelpText = (
  commands: Commands,
  commandsCollection: CommandsCollection,
): string => {
  let descriptions = buildDescriptionsText(commandsCollection);

  const helpText = `\n${
    (commands.headerText.length > 0 && commands.headerText) || ""
  }\n${descriptions}${
    (commands.footerText.length > 0 && commands.footerText) || ""
  }\n`;
  return helpText;
};

export const buildDescriptionsText = (
  commandsCollection: CommandsCollection,
): string => {
  let descriptions = "";
  let max = 0;
  const ready: string[] = [];

  for (const com of Object.values(commandsCollection)) {
    const commandText = getCommandText(com);
    if (commandText.length > max) max = commandText.length;
  }
  for (const com of Object.values(commandsCollection)) {
    if (ready.includes(com.name)) continue;
    descriptions += com.getHelpLine(max + 4);
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
