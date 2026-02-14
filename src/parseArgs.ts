import type {
  Command,
  OptionDefinition,
  ParsedOptions,
  ParsedResult,
  ParsingOptions,
  SyntaxMode,
} from "./types.js";

const detectSyntaxMode = (argv: string[]): SyntaxMode => {
  const hasStandard = argv.some((arg) => arg.startsWith("-") && arg !== "-");
  const hasLegacy = argv.some(
    (arg) => arg.includes("=") && !arg.startsWith("-"),
  );

  if (hasStandard && hasLegacy) return "mixed";
  if (hasStandard) return "standard";
  return "legacy";
};

const findOptionDefinition = (
  name: string,
  command: Command,
): OptionDefinition | undefined => {
  return command.optionDefinitions.find(
    (def) =>
      def.name === name ||
      def.shortFlag === name ||
      def.aliases?.includes(name),
  );
};

const isKnownOption = (arg: string, command: Command): boolean => {
  if (arg === "--") return true;

  if (arg.startsWith("--")) {
    const name = arg.slice(2).split("=")[0];
    const isNegated = name.startsWith("no-");
    const actualName = isNegated ? name.slice(3) : name;
    return !!findOptionDefinition(actualName, command);
  }

  if (arg.startsWith("-") && arg.length === 2) {
    const flag = arg.slice(1);
    return !!findOptionDefinition(flag, command);
  }

  return false;
};

const castValue = (
  value: string,
  type: OptionDefinition["type"],
): string | number | boolean => {
  if (type === "number") {
    return Number(value);
  }
  if (type === "boolean") {
    return value === "true" || value === "1";
  }
  return value;
};

export const parseArgs = (
  argv: string[],
  command: Command,
  options?: ParsingOptions,
): ParsedResult => {
  const opts: ParsingOptions = {
    allowLegacySyntax: true,
    allowStandardSyntax: true,
    strictMode: false,
    allowUnknownOptions: true,
    stopAtFirstUnknown: false,
    ...options,
  };

  const parsed: ParsedOptions = {};
  const positional: string[] = [];
  const unknown: string[] = [];
  const syntaxMode = detectSyntaxMode(argv);

  const nonPositionalArgs: string[] = [];
  let stopParsing = false;
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];

    if (stopParsing) {
      unknown.push(arg);
      i++;
      continue;
    }

    if (arg === "--") {
      stopParsing = true;
      i++;
      continue;
    }

    if (arg.startsWith("--")) {
      const longFlag = arg.slice(2);
      const [name, ...valueParts] = longFlag.split("=");
      const value = valueParts.join("=");

      const isNegated = name.startsWith("no-");
      const actualName = isNegated ? name.slice(3) : name;
      const def = findOptionDefinition(actualName, command);

      if (value) {
        if (def) {
          const resolvedName = def.name;
          parsed[resolvedName] = castValue(value, def.type);
        } else {
          parsed[actualName] = value;
        }
        nonPositionalArgs.push(arg);
      } else {
        if (def && def.type === "boolean") {
          parsed[def.name] = !isNegated;
          nonPositionalArgs.push(arg);
        } else if (def && def.type !== "boolean") {
          if (
            i + 1 < argv.length &&
            argv[i + 1] !== "--" &&
            !isKnownOption(argv[i + 1], command)
          ) {
            const nextValue = argv[i + 1];
            parsed[def.name] = castValue(nextValue, def.type);
            nonPositionalArgs.push(arg, nextValue);
            i++;
          } else {
            if (!opts.allowUnknownOptions) {
              unknown.push(arg);
            }
          }
        } else {
          if (!opts.allowUnknownOptions) {
            unknown.push(arg);
          } else {
            if (isNegated) {
              parsed[actualName] = false;
            } else {
              parsed[actualName] = true;
            }
            nonPositionalArgs.push(arg);
          }
        }
      }
      i++;
      continue;
    }

    if (arg.startsWith("-") && arg !== "-" && arg.length > 1) {
      const flags = arg.slice(1);

      if (flags.includes("=")) {
        const [shortFlag, ...valueParts] = flags.split("=");
        const value = valueParts.join("=");
        const def = findOptionDefinition(shortFlag, command);

        if (def) {
          parsed[def.name] = castValue(value, def.type);
        } else {
          parsed[shortFlag] = value;
        }
        nonPositionalArgs.push(arg);
      } else if (flags.length === 1) {
        const def = findOptionDefinition(flags, command);

        if (def && def.type === "boolean") {
          parsed[def.name] = true;
          nonPositionalArgs.push(arg);
        } else if (def && def.type !== "boolean") {
          if (
            i + 1 < argv.length &&
            argv[i + 1] !== "--" &&
            !isKnownOption(argv[i + 1], command)
          ) {
            const nextValue = argv[i + 1];
            parsed[def.name] = castValue(nextValue, def.type);
            nonPositionalArgs.push(arg, nextValue);
            i++;
          }
        } else {
          parsed[flags] = true;
          nonPositionalArgs.push(arg);
        }
      } else {
        for (const flag of flags) {
          const def = findOptionDefinition(flag, command);
          if (def) {
            parsed[def.name] = true;
          } else {
            parsed[flag] = true;
          }
        }
        nonPositionalArgs.push(arg);
      }
      i++;
      continue;
    }

    if (arg.includes("=") && !arg.startsWith("-")) {
      const [key, ...valueParts] = arg.split("=");
      const value = valueParts.join("=");
      parsed[key] = value;
      nonPositionalArgs.push(arg);
      i++;
      continue;
    }

    positional.push(arg);
    i++;
  }

  const positionedArgsCount = command.positionedArguments.length;
  const actualPositional = positional.slice(0, positionedArgsCount);
  const extraPositional = positional.slice(positionedArgsCount);

  actualPositional.forEach((value, index) => {
    const argName = command.positionedArguments[index];
    parsed[argName] = value;
  });

  return {
    options: parsed,
    positional: extraPositional.length > 0 ? extraPositional : positional,
    unknown,
    syntaxMode,
  };
};
