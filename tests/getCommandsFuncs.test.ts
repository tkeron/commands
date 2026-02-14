import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import type {
  CommandFactory,
  Commands,
  CommandsCollection,
} from "../src/types.js";
import {
  getAddAlias,
  getAddDescription,
  getAddFooterText,
  getAddHeaderText,
  getAddOption,
  getAddPositionedArgument,
  getCommands,
  getGetHelpLine,
  getSetCallback,
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
    expect(commands).toBeTruthy();
  });
  it("initHelpAndVersion", () => {
    expect(commandsCollection).not.toHaveProperty("help");
    expect(commandsCollection).not.toHaveProperty("version");
    const { helpCallback, versionCallback } = initHelpAndVersion(
      commands,
      commandsCollection,
    );
    expect(commandsCollection).toHaveProperty("help");
    expect(commandsCollection).toHaveProperty("version");

    const logMock = spyOn(console, "log").mockImplementation(() => {});
    expect(helpCallback).not.toThrow();
    expect(versionCallback).not.toThrow();
    logMock.mockRestore();
  });
  it("getAddOption", () => {
    commands.addCommand("test");
    const addOption = getAddOption(commandFactory, commandsCollection);
    addOption("op001");
    const { test } = commandsCollection;
    expect(test.options).toContain("op001");
  });
  it("getAddPositionedArgument", () => {
    commands.addCommand("test");
    const addPositionedArgument = getAddPositionedArgument(
      commandFactory,
      commandsCollection,
    );

    addPositionedArgument("pos001");
    const { test } = commandsCollection;

    expect(test.positionedArguments).toContain("pos001");
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
  it("should set commandFactory.commands when falsy", () => {
    commandFactory.commands = <() => Commands>(<unknown>undefined);
    initCommands(commandsCollection, commands, commandFactory);
    expect(commandFactory.commands).toBeTruthy();
    expect(commandFactory.commands).not.toThrow();
  });
});

describe("getAddAlias", () => {
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

  it("should add alias to command aliases array", () => {
    commands.addCommand("test");
    const addAlias = getAddAlias(commandFactory, commandsCollection);
    addAlias("t");
    expect(commandsCollection.test.aliases).toContain("t");
  });

  it("should register alias as key in commandsCollection", () => {
    commands.addCommand("test");
    const addAlias = getAddAlias(commandFactory, commandsCollection);
    addAlias("t");
    expect(commandsCollection.t).toBe(commandsCollection.test);
  });

  it("should support multiple aliases", () => {
    commands.addCommand("test");
    const addAlias = getAddAlias(commandFactory, commandsCollection);
    addAlias("t");
    addAlias("--test");
    expect(commandsCollection.test.aliases).toEqual(["t", "--test"]);
    expect(commandsCollection.t).toBe(commandsCollection.test);
    expect(commandsCollection["--test"]).toBe(commandsCollection.test);
  });

  it("should return commandFactory for chaining", () => {
    commands.addCommand("test");
    const addAlias = getAddAlias(commandFactory, commandsCollection);
    const result = addAlias("t");
    expect(result).toBe(commandFactory);
  });
});

describe("getAddDescription", () => {
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

  it("should set description on command", () => {
    commands.addCommand("test");
    const addDescription = getAddDescription(
      commandFactory,
      commandsCollection,
    );
    addDescription("A test command");
    expect(commandsCollection.test.description).toBe("A test command");
  });

  it("should return commandFactory for chaining", () => {
    commands.addCommand("test");
    const addDescription = getAddDescription(
      commandFactory,
      commandsCollection,
    );
    const result = addDescription("desc");
    expect(result).toBe(commandFactory);
  });
});

describe("getSetCallback", () => {
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

  it("should set callback on command", () => {
    commands.addCommand("test");
    const setCallback = getSetCallback(commandFactory, commandsCollection);
    const cb = () => {};
    setCallback(cb);
    expect(commandsCollection.test.callback).toBe(cb);
  });

  it("should return commandFactory for chaining", () => {
    commands.addCommand("test");
    const setCallback = getSetCallback(commandFactory, commandsCollection);
    const result = setCallback(() => {});
    expect(result).toBe(commandFactory);
  });
});

describe("getAddPositionedArgument deduplication", () => {
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

  it("should not add duplicate positioned arguments", () => {
    commands.addCommand("test");
    const addArg = getAddPositionedArgument(commandFactory, commandsCollection);
    addArg("pos001");
    addArg("pos001");
    expect(commandsCollection.test.positionedArguments).toEqual(["pos001"]);
  });

  it("should allow different positioned arguments", () => {
    commands.addCommand("test");
    const addArg = getAddPositionedArgument(commandFactory, commandsCollection);
    addArg("input");
    addArg("output");
    expect(commandsCollection.test.positionedArguments).toEqual([
      "input",
      "output",
    ]);
  });
});

describe("getCommands extended", () => {
  it("should use custom programName and version", () => {
    const commands = getCommands("myapp", "1.2.3");
    expect(commands.programName).toBe("myapp");
    expect(commands.version).toBe("1.2.3");
  });

  it("should initialize with empty header and footer", () => {
    const commands = getCommands();
    expect(commands.headerText).toBe("");
    expect(commands.footerText).toBe("");
  });

  it("should register help command via start", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const commands = getCommands();
    commands.start(["node", "app", "help"]);
    expect(logMock).toBeCalledTimes(1);
    logMock.mockRestore();
  });

  it("should register version command via start", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const commands = getCommands("testapp", "2.0.0");
    commands.start(["node", "app", "version"]);
    expect(logMock).toBeCalledTimes(1);
    logMock.mockRestore();
  });
});

describe("chaining integration", () => {
  it("should support full command building chain", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const cb = mock();
    const commands = getCommands("myapp", "1.0.0");
    commands
      .addCommand("build")
      .addAlias("b")
      .addOption("output", "./dist")
      .addPositionedArgument("source")
      .addDescription("Build the project")
      .setCallback(cb);

    commands.start(["node", "app", "build", "src", "output=./dist"]);
    expect(cb).toBeCalledTimes(1);
    expect(cb).toBeCalledWith({ source: "src", output: "./dist" });
    logMock.mockRestore();
  });

  it("should support alias execution", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const cb = mock();
    const commands = getCommands("myapp", "1.0.0");
    commands
      .addCommand("build")
      .addAlias("b")
      .addDescription("Build the project")
      .setCallback(cb);

    commands.start(["node", "app", "b"]);
    expect(cb).toBeCalledTimes(1);
    logMock.mockRestore();
  });

  it("should support header and footer text chaining", () => {
    const commands = getCommands("myapp", "1.0.0");
    const result = commands.addHeaderText("Header").addFooterText("Footer");
    expect(result.headerText).toBe("Header");
    expect(result.footerText).toBe("Footer");
  });

  it("should navigate back to commands from commandFactory", () => {
    const commands = getCommands("myapp", "1.0.0");
    const returned = commands
      .addCommand("test")
      .addDescription("test")
      .setCallback(() => {})
      .commands();
    expect(returned).toBe(commands);
  });
});
