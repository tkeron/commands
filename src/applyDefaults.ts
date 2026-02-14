import type { Command, ParsedOptions } from "./types.js";

export const applyDefaults = (
  parsed: ParsedOptions,
  command: Command,
): ParsedOptions => {
  const result = { ...parsed };

  if (!command.optionDefinitions || command.optionDefinitions.length === 0) {
    return result;
  }

  for (const def of command.optionDefinitions) {
    if (def.default !== undefined && result[def.name] === undefined) {
      result[def.name] = def.default;
    }
  }

  return result;
};
