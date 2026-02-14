import type { CommandsCollection } from "./types.js";
import { parseArgs } from "./parseArgs.js";
import { applyDefaults } from "./applyDefaults.js";
import { validateOptions } from "./validateOptions.js";

export const getStart =
  (commandsCollection: CommandsCollection) => (argv?: string[]) => {
    if (!argv) argv = process.argv;
    if (!Array.isArray(argv)) throw new Error("no arguments passed");
    if (argv.length < 2) throw new Error("arguments out of range");
    argv = argv.slice(2);
    if (argv.length === 0) {
      commandsCollection.help.callback();
      return;
    }

    const commandName = argv[0];

    const command = commandsCollection[commandName];
    if (!command) {
      console.log(`command '${commandName}' not found`);
      return;
    }

    const parsedResult = parseArgs(argv.slice(1), command);
    let options = parsedResult.options;

    options = applyDefaults(options, command);

    const validation = validateOptions(options, command);
    if (!validation.valid) {
      for (const error of validation.errors) {
        console.log(error);
      }
      return;
    }

    const positionedOverflow = parsedResult.positional.filter(
      (arg) =>
        !command.positionedArguments.some((name) => options[name] === arg),
    );

    if (positionedOverflow.length > 0) {
      console.log(
        `argument${positionedOverflow.length === 1 ? "" : "s"} '${positionedOverflow.join(", ")}' not defined`,
      );
      return;
    }

    command.callback(options);
  };
