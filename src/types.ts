export type OptionType = "boolean" | "string" | "number";

export interface OptionDefinition {
  name: string;
  shortFlag?: string;
  type: OptionType;
  description: string;
  required?: boolean;
  default?: string | number | boolean;
  aliases?: string[];
  allowedValues?: (string | number)[];
  valueName?: string;
}

export interface Command {
  name: string;
  description: string;
  aliases: string[];
  options: string[];
  optionsExamples: string[];
  positionedArguments: string[];
  optionDefinitions: OptionDefinition[];
  getHelpLine: (width?: number) => string;
  callback: Callback;
}

export type ParsedOptions = { [key: string]: string | number | boolean };

export type Callback = (options?: ParsedOptions) => void;

export type CommandsCollection = { [key: string]: Command };

export interface ParsingOptions {
  allowLegacySyntax?: boolean;
  allowStandardSyntax?: boolean;
  strictMode?: boolean;
  allowUnknownOptions?: boolean;
  stopAtFirstUnknown?: boolean;
}

export type SyntaxMode = "legacy" | "standard" | "mixed";

export interface ParsedResult {
  options: ParsedOptions;
  positional: string[];
  unknown: string[];
  syntaxMode: SyntaxMode;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CommandFactory {
  name: string;
  commands: () => Commands;
  addAlias: (alias: string) => CommandFactory;
  addDescription: (description: string) => CommandFactory;
  addOption: (
    option: string | OptionDefinition,
    example?: string,
  ) => CommandFactory;
  addFlag: (
    name: string,
    shortFlag?: string,
    description?: string,
  ) => CommandFactory;
  addStringOption: (
    name: string,
    shortFlag?: string,
    description?: string,
    config?: Partial<OptionDefinition>,
  ) => CommandFactory;
  addNumberOption: (
    name: string,
    shortFlag?: string,
    description?: string,
    config?: Partial<OptionDefinition>,
  ) => CommandFactory;
  addPositionedArgument: (arg: string) => CommandFactory;
  setCallback: (callback: Callback) => CommandFactory;
}

export interface Commands {
  addCommand: (commandName: string) => CommandFactory;
  programName: string;
  headerText: string;
  footerText: string;
  version: string;
  addHeaderText: (text: string) => Commands;
  addFooterText: (text: string) => Commands;
  start: (argv?: string[]) => void;
}
