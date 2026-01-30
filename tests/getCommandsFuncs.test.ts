import { beforeEach, describe, expect, it } from "bun:test";
import type { CommandFactory, Commands, CommandsCollection } from "../src/types.js";
import {
  getAddFooterText,
  getAddHeaderText,
  getAddOption,
  getAddPositionedArgument,
  getCommands,
  getGetHelpLine,
  initCommands,
  initHelpAndVersion,
} from "../src/getCommandsFuncs.js";

describe("main", () => {
  let commandsCollection: CommandsCollection;
  let commands: Commands;
  let commandFactory: CommandFactory;

  beforeEach(() => {
    commandsCollection = {};
    commandFactory = <CommandFactory>(<unknown>{
      commands: undefined,
      name: undefined,
      addAlias: undefined,
      addOption: undefined,
      addPositionedArgument: undefined,
      addDescription: undefined,
      setCallback: undefined,
    });
    commands = initCommands(commandsCollection, undefined, commandFactory);
  });

  it("getCommands", () => {
    const commands = getCommands();
    expect(commands).toBeTruthy;
  });
  it("initHelpAndVersion", () => {
    expect(commandsCollection).not.toHaveProperty("help");
    expect(commandsCollection).not.toHaveProperty("version");
    const { helpCallback, versionCallback } = initHelpAndVersion(
      commands,
      commandsCollection
    );
    expect(commandsCollection).toHaveProperty("help");
    expect(commandsCollection).toHaveProperty("version");

    expect(helpCallback).not.toThrow();
    expect(versionCallback).not.toThrow();
  });
  it("getAddOption", () => {
    commands.addCommand("test");
    const addOption = getAddOption(commandFactory, commandsCollection);
    addOption("op001");
    const { test } = commandsCollection;
    expect(test.options.includes("op001"));
  });
  it("getAddPositionedArgument", () => {
    commands.addCommand("test");
    const addPositionedArgument = getAddPositionedArgument(
      commandFactory,
      commandsCollection
    );

    addPositionedArgument("pos001");
    const { test } = commandsCollection;

    expect(test.positionedArguments.includes("pos001"));
  });
  it("getAddHeaderText", () => {
    const addHeaderText = getAddHeaderText(commands);
    const txt = "test header text...";
    addHeaderText(txt);
    expect(commands.headerText).toBe(txt);
  });
  it("getAddFooterText", () => {
    const addFooterText = getAddFooterText(commands);
    const txt = "test footer text...";
    addFooterText(txt);
    expect(commands.footerText).toBe(txt);
  });
  it("getGetHelpLine", () => {
    commands.addCommand("test");
    const { test } = commandsCollection;
    const getHelpLine = getGetHelpLine(test);
    const hl50 = getHelpLine();
    expect(hl50).toBe("test  ............................................  \n");
  });
  it("", () => {
    commandFactory.commands = <() => Commands>(<unknown>undefined);
    initCommands(commandsCollection, commands, commandFactory);
    expect(commandFactory.commands).toBeTruthy;
    expect(commandFactory.commands).not.toThrow();
  });
});
