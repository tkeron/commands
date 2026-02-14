import type { Command, ParsedOptions, ValidationResult } from "./types.js";

export const validateOptions = (
  parsed: ParsedOptions,
  command: Command,
): ValidationResult => {
  const errors: string[] = [];

  if (!command.optionDefinitions || command.optionDefinitions.length === 0) {
    return { valid: true, errors: [] };
  }

  for (const def of command.optionDefinitions) {
    if (def.required && parsed[def.name] === undefined) {
      errors.push(`Required option '${def.name}' is missing`);
    }

    if (parsed[def.name] !== undefined) {
      if (def.type === "number" && Number.isNaN(parsed[def.name])) {
        errors.push(`Option '${def.name}' must be a valid number`);
      }

      if (
        def.allowedValues &&
        def.allowedValues.length > 0 &&
        !def.allowedValues.includes(parsed[def.name] as string | number)
      ) {
        errors.push(
          `Option '${def.name}' must be one of: ${def.allowedValues.join(", ")}`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
