import { getCommands } from "../src/index.js";
import type { Commands } from "../src/types.js";

const commands = getCommands("test program", "0.0.14")
  .addCommand("com1")
  .addAlias("c1")
  .addOption("opt1")
  .addOption("opt2")
  .addDescription("command 001 test...")
  .addPositionedArgument("pos0")
  .addPositionedArgument("pos1")
  .setCallback(console.log)

  .commands()

  .addCommand("com2")
  .addAlias("c2")
  .addAlias("a2")
  .addOption("opt1")
  .addDescription("command 002 test...")
  .setCallback(console.log)

  .commands()

  .addCommand("com3")
  .addAlias("c3")
  .addOption("opt1")
  .addOption("opt2", "exOpt2...")
  .addOption("opt3")
  .addDescription("command 003 test...")
  .addPositionedArgument("pos0")
  .addPositionedArgument("pos1")
  .addPositionedArgument("pos3")
  .setCallback(console.log)

  .commands()

  .addHeaderText("header...\n\n")
  .addFooterText("\n\nFooter...");

commands.start([
  "",
  "",
  ..."com1 pos0value  opt1=qw111erty pos1value opt2=as222d  asdasd"
    .replace(/\s+/g, " ")
    .split(" "),
]);

commands.start([
  "",
  "",
  ..."a2 pos0value  opt1=qw111erty pos1value opt2=as222d  asdasd"
    .replace(/\s+/g, " ")
    .split(" "),
]);

commands.start([
  "",
  "",
  ..."c3 pos0value  opt1=qw111erty pos1value opt2=as222d  asdasd"
    .replace(/\s+/g, " ")
    .split(" "),
]);

const standardCommands = getCommands("myapp", "1.0.0")
  .addCommand("build")
  .addAlias("b")
  .addDescription("Build project")
  .addFlag("verbose", "v", "Verbose output")
  .addFlag("watch", "w", "Watch mode")
  .addStringOption("output", "o", "Output directory", { default: "./dist" })
  .addPositionedArgument("source")
  .setCallback(console.log)

  .commands()

  .addCommand("serve")
  .addAlias("s")
  .addDescription("Start dev server")
  .addNumberOption("port", "p", "Port number", { default: 3000 })
  .addStringOption("host", "h", "Host", { default: "localhost" })
  .addFlag("open", "o", "Open browser")
  .setCallback(console.log)

  .commands()

  .addCommand("test")
  .addAlias("t")
  .addDescription("Run tests")
  .addStringOption("filter", "f", "Test filter")
  .addFlag("coverage", "c", "Coverage report")
  .addNumberOption("timeout", undefined, "Timeout in ms", { default: 5000 })
  .setCallback(console.log)

  .commands()

  .addHeaderText("MyApp CLI v1.0.0\n")
  .addFooterText("\nFor more info: https://example.com");

standardCommands.start(["", "", "build", "src", "--verbose", "-o", "build"]);

standardCommands.start(["", "", "serve", "-p", "8080", "--open"]);

standardCommands.start(["", "", "test", "--filter", "unit", "--coverage"]);

standardCommands.start(["", "", "b", "-vw"]);

standardCommands.start(["", "", "build", "src", "--verbose", "extra=legacy"]);

declare global {
  var commands: Commands;
  var standardCommands: Commands;
}

globalThis.commands = commands;
globalThis.standardCommands = standardCommands;
