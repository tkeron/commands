import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
  type Mock,
} from "bun:test";

import { getStart } from "../src/getStart.js";
import { commandsCollection } from "./helpers/testConstants.js";

describe("getStart", () => {
  let callback: Mock<any>;
  let start: (argv?: string[]) => void;
  let logMock: Mock<any>;
  let logs: any[] = [];
  let savedArgv: string[];

  beforeEach(() => {
    savedArgv = process.argv;
    logs = [];
    callback = mock();
    commandsCollection.command_1.callback = callback;
    start = getStart(commandsCollection);
    logMock = spyOn(console, "log").mockImplementation((...args: any) => {
      logs.push(args);
    });
  });
  afterEach(() => {
    process.argv = savedArgv;
    callback.mockClear();
    logMock.mockRestore();
  });

  it("happy path, run command", () => {
    start(["", "", "command_1"]);
    expect(callback).toBeCalledTimes(1);
  });
  it("run command with option", () => {
    start(["", "", "command_1", "op1=value1"]);
    expect(callback).toBeCalledTimes(1);
  });
  it("run command with extra positioned arguments", () => {
    logs = [];
    start(["", "", "command_1", "pos1", "pos2", "pos3"]);
    start(["", "", "command_1", "pos1", "pos2", "pos3", "pos4"]);
    expect(logs).toHaveLength(2);
    expect(logs[0]).toHaveLength(1);
    expect(logs[0][0]).toBe("argument 'pos3' not defined");
    expect(logs[1]).toHaveLength(1);
    expect(logs[1][0]).toBe("arguments 'pos3, pos4' not defined");
  });
  it("run with process.argv", () => {
    process.argv = ["", ""];
    start();
    logs = [];
    commandsCollection.help.callback();
    expect(logs).toHaveLength(1);
  });
  it("should throw when no args passed", () => {
    process.argv = <string[]>(<unknown>undefined);
    expect(start).toThrow(new Error("no arguments passed"));
  });
  it("should throw when less than 2 args passed", () => {
    process.argv = [];
    expect(start).toThrow(new Error("arguments out of range"));
  });
  it("should show message when passed a nonexistent command", () => {
    process.argv = ["", "", "fakeCommand"];
    logs = [];
    start();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toHaveLength(1);
    expect(logs[0][0]).toBe("command 'fakeCommand' not found");
  });
  it("run with less positioned arguments", () => {
    start(["", "", "al1", "arg001"]);
    expect(callback).toBeCalledWith({ pos1: "arg001" });
  });
  it("should parse option values correctly", () => {
    start(["node", "app", "command_1", "opt1=hello"]);
    expect(callback).toBeCalledWith({ opt1: "hello" });
  });

  it("should parse multiple options", () => {
    start(["node", "app", "command_1", "opt1=hello", "opt2=world"]);
    expect(callback).toBeCalledWith({ opt1: "hello", opt2: "world" });
  });

  it("should handle mixed options and positioned arguments", () => {
    start(["node", "app", "al1", "arg001", "opt1=value1"]);
    expect(callback).toBeCalledWith({ pos1: "arg001", opt1: "value1" });
  });

  it("should handle empty option value", () => {
    start(["node", "app", "command_1", "opt1="]);
    expect(callback).toBeCalledWith({ opt1: "" });
  });

  it("should call callback with empty object when no options or args", () => {
    start(["node", "app", "command_1"]);
    expect(callback).toBeCalledWith({});
  });
});
