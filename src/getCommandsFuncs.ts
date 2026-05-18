import { getStart } from "./getStart.js";
import { buildHelpText, getCommandText } from "./textFuncs.js";
import { stringWidth } from "./stringWidth.js";
import { wrapText } from "./wrapText.js";
import { getTerminalWidth } from "./getTerminalWidth.js";
import type {
  CommandFactory,
  Command,
  Commands,
  CommandsCollection,
  Callback,
  OptionDefinition,
} from "./types.js";
export * from "./types.js";

export const getCommands = (
  programName: string = "program",
  version: string = "0.0.1",
): Commands => {
  const commandsCollection: CommandsCollection = {};

  const commands = initCommands(commandsCollection);
  commands.programName = programName;
  commands.version = version;

  initHelpAndVersion(commands, commandsCollection);

  return commands;
};

export const initCommands = (
  commandsCollection: CommandsCollection,
  commands: Commands = <Commands>(<unknown>{
    programName: "",
    version: "",
    footerText: "",
    headerText: "",
    addCommand: undefined,
    start: undefined,
    addHeaderText: undefined,
    addFooterText: undefined,
  }),
  commandFactory: CommandFactory = <CommandFactory>(<unknown>{
    commands: undefined,
    name: undefined,
    addAlias: undefined,
    addOption: undefined,
    addFlag: undefined,
    addStringOption: undefined,
    addNumberOption: undefined,
    addPositionedArgument: undefined,
    addDescription: undefined,
    setCallback: undefined,
  }),
): Commands => {
  if (!commandFactory.commands) commandFactory.commands = () => commands;
  commands.addCommand = getAddCommand(commandsCollection, commandFactory);
  commands.start = getStart(commandsCollection);
  commands.addHeaderText = getAddHeaderText(commands);
  commands.addFooterText = getAddFooterText(commands);

  return commands;
};

export const initHelpAndVersion = (
  commands: Commands,
  commandsCollection: CommandsCollection,
) => {
  const helpCallback = () =>
    console.log(buildHelpText(commands, commandsCollection));
  const versionCallback = () =>
    console.log(
      `${commands.headerText || ""}\n${commands.version}\n${
        commands.footerText || ""
      }\n`,
    );

  commands
    .addCommand("help")
    .addAlias("-h")
    .addAlias("--help")
    .addDescription("show program help")
    .setCallback(helpCallback);
  commands
    .addCommand("version")
    .addAlias("-v")
    .addAlias("--version")
    .addDescription("show program version")
    .setCallback(versionCallback);

  return { helpCallback, versionCallback };
};

export const getAddCommand =
  (commandsCollection: CommandsCollection, commandFactory: CommandFactory) =>
  (commandName: string) => {
    commandFactory.name = commandName;
    const command: Command = <Command>(<unknown>{
      aliases: [],
      callback: undefined,
      description: "",
      name: commandName,
      options: [],
      optionsExamples: [],
      positionedArguments: [],
      optionDefinitions: [],
      getHelpLine: undefined,
    });
    commandsCollection[commandName] = command;
    command.getHelpLine = getGetHelpLine(command);

    commandFactory.addAlias = getAddAlias(commandFactory, commandsCollection);
    commandFactory.addOption = getAddOption(commandFactory, commandsCollection);
    commandFactory.addFlag = getAddFlag(commandFactory, commandsCollection);
    commandFactory.addStringOption = getAddStringOption(
      commandFactory,
      commandsCollection,
    );
    commandFactory.addNumberOption = getAddNumberOption(
      commandFactory,
      commandsCollection,
    );
    commandFactory.addDescription = getAddDescription(
      commandFactory,
      commandsCollection,
    );
    commandFactory.setCallback = getSetCallback(
      commandFactory,
      commandsCollection,
    );
    commandFactory.addPositionedArgument = getAddPositionedArgument(
      commandFactory,
      commandsCollection,
    );

    return commandFactory;
  };

export const getAddAlias = (
  commandFactory: CommandFactory,
  commandsCollection: CommandsCollection,
) => {
  return (alias: string) => {
    commandsCollection[commandFactory.name].aliases.push(alias);
    commandsCollection[alias] = commandsCollection[commandFactory.name];

    return commandFactory;
  };
};

export const getAddOption =
  (commandFactory: CommandFactory, commandsCollection: CommandsCollection) =>
  (option: string | OptionDefinition, example?: string) => {
    if (typeof option === "string") {
      commandsCollection[commandFactory.name].options.push(option);
      commandsCollection[commandFactory.name].optionsExamples.push(
        example || "",
      );
    } else {
      commandsCollection[commandFactory.name].optionDefinitions.push(option);
    }

    return commandFactory;
  };

export const getAddPositionedArgument = (
  commandFactory: CommandFactory,
  commandsCollection: CommandsCollection,
) => {
  return (arg: string): CommandFactory => {
    const positionedArguments =
      commandsCollection[commandFactory.name].positionedArguments;

    if (!positionedArguments.includes(arg)) {
      positionedArguments.push(arg);
    }

    return commandFactory;
  };
};

export const getSetCallback = (
  commandFactory: CommandFactory,
  commandsCollection: CommandsCollection,
) => {
  return (fn: Callback): CommandFactory => {
    commandsCollection[commandFactory.name].callback = fn;

    return commandFactory;
  };
};

export const getAddDescription = (
  commandFactory: CommandFactory,
  commandsCollection: CommandsCollection,
) => {
  return (description: string) => {
    commandsCollection[commandFactory.name].description = description;
    return commandFactory;
  };
};

export const getAddHeaderText = (commands: Commands) => {
  return (text: string) => {
    commands.headerText = text;
    return commands;
  };
};

export const getAddFooterText = (commands: Commands) => {
  return (text: string) => {
    commands.footerText = text;
    return commands;
  };
};

export const getAddFlag =
  (commandFactory: CommandFactory, commandsCollection: CommandsCollection) =>
  (name: string, shortFlag?: string, description?: string): CommandFactory => {
    const def: OptionDefinition = {
      name,
      shortFlag,
      type: "boolean",
      description: description || "",
    };
    commandsCollection[commandFactory.name].optionDefinitions.push(def);
    return commandFactory;
  };

export const getAddStringOption =
  (commandFactory: CommandFactory, commandsCollection: CommandsCollection) =>
  (
    name: string,
    shortFlag?: string,
    description?: string,
    config?: Partial<OptionDefinition>,
  ): CommandFactory => {
    const def: OptionDefinition = {
      name,
      shortFlag,
      type: "string",
      description: description || "",
      ...config,
    };
    commandsCollection[commandFactory.name].optionDefinitions.push(def);
    return commandFactory;
  };

export const getAddNumberOption =
  (commandFactory: CommandFactory, commandsCollection: CommandsCollection) =>
  (
    name: string,
    shortFlag?: string,
    description?: string,
    config?: Partial<OptionDefinition>,
  ): CommandFactory => {
    const def: OptionDefinition = {
      name,
      shortFlag,
      type: "number",
      description: description || "",
      ...config,
    };
    commandsCollection[commandFactory.name].optionDefinitions.push(def);
    return commandFactory;
  };

export const getGetHelpLine =
  (command: Command) =>
  (width: number = 50, terminalWidth?: number) => {
    const termWidth = terminalWidth ?? getTerminalWidth();
    const leftPart = getCommandText(command);
    const leftVisual = stringWidth(leftPart);
    const leftPadded =
      leftVisual >= width
        ? leftPart
        : leftPart + ".".repeat(width - leftVisual);
    const leftActualWidth = Math.max(leftVisual, width);
    const description = command.description ?? "";

    if (stringWidth(description) === 0) {
      return leftPadded + "  \n";
    }

    const sepWidth = 2;
    const descBudget = termWidth - leftActualWidth - sepWidth;
    const minBudget = 20;

    if (descBudget < minBudget) {
      const indent = "    ";
      const lines = wrapText(
        description,
        Math.max(minBudget, termWidth - indent.length),
        0,
      );
      const body = lines.map((l) => indent + l).join("\n");
      return leftPadded + "\n" + body + "\n";
    }

    const lines = wrapText(description, descBudget, 0);
    const hangingPad = " ".repeat(leftActualWidth + sepWidth);
    const joined = lines
      .map((l, i) => (i === 0 ? l : hangingPad + l))
      .join("\n");
    return leftPadded + "  " + joined + "\n";
  };
