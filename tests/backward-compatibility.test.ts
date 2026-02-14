import { describe, expect, it, mock, spyOn } from "bun:test";
import { getCommands } from "../src/index.js";

describe("Backward Compatibility - Legacy Syntax", () => {
  it("should work exactly as before with key=value syntax", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const callback = mock();

    const commands = getCommands("testapp", "1.0.0");
    commands
      .addCommand("build")
      .addOption("output", "./dist")
      .addOption("format", "json")
      .addPositionedArgument("source")
      .setCallback(callback);

    commands.start([
      "node",
      "app",
      "build",
      "src",
      "output=build",
      "format=xml",
    ]);

    expect(callback).toBeCalledTimes(1);
    const options = callback.mock.calls[0][0];
    expect(options.source).toBe("src");
    expect(options.output).toBe("build");
    expect(options.format).toBe("xml");

    logMock.mockRestore();
  });

  it("should maintain help command functionality", () => {
    const logs: any[] = [];
    const logMock = spyOn(console, "log").mockImplementation((...args: any) => {
      logs.push(args);
    });

    const commands = getCommands("testapp", "1.0.0");
    commands.addCommand("build").addDescription("Build the project");

    commands.start(["node", "app", "help"]);

    expect(logs.length).toBeGreaterThan(0);
    logMock.mockRestore();
  });

  it("should maintain version command functionality", () => {
    const logs: any[] = [];
    const logMock = spyOn(console, "log").mockImplementation((...args: any) => {
      logs.push(args);
    });

    const commands = getCommands("testapp", "1.2.3");
    commands.start(["node", "app", "version"]);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0][0]).toContain("1.2.3");
    logMock.mockRestore();
  });
});

describe("Standard CLI Syntax - New Features", () => {
  it("should support boolean flags with new API", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const callback = mock();

    const commands = getCommands("testapp", "1.0.0");
    commands
      .addCommand("build")
      .addFlag("verbose", "v", "Enable verbose output")
      .addFlag("watch", "w", "Watch mode")
      .setCallback(callback);

    commands.start(["node", "app", "build", "--verbose", "--watch"]);

    expect(callback).toBeCalledTimes(1);
    const options = callback.mock.calls[0][0];
    expect(options.verbose).toBe(true);
    expect(options.watch).toBe(true);

    logMock.mockRestore();
  });

  it("should support string options with short flags", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const callback = mock();

    const commands = getCommands("testapp", "1.0.0");
    commands
      .addCommand("serve")
      .addStringOption("port", "p", "Port number", { default: "3000" })
      .addStringOption("host", "h", "Host", { default: "localhost" })
      .setCallback(callback);

    commands.start(["node", "app", "serve", "-p", "8080"]);

    expect(callback).toBeCalledTimes(1);
    const options = callback.mock.calls[0][0];
    expect(options.port).toBe("8080");
    expect(options.host).toBe("localhost");

    logMock.mockRestore();
  });

  it("should support number options", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const callback = mock();

    const commands = getCommands("testapp", "1.0.0");
    commands
      .addCommand("run")
      .addNumberOption("count", "c", "Number of runs", { default: 1 })
      .setCallback(callback);

    commands.start(["node", "app", "run", "--count", "5"]);

    expect(callback).toBeCalledTimes(1);
    const options = callback.mock.calls[0][0];
    expect(options.count).toBe(5);
    expect(typeof options.count).toBe("number");

    logMock.mockRestore();
  });
});

describe("Mixed Syntax Support", () => {
  it("should handle both legacy and standard syntax together", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const callback = mock();

    const commands = getCommands("testapp", "1.0.0");
    commands
      .addCommand("deploy")
      .addFlag("verbose", "v")
      .addOption("env", "production")
      .setCallback(callback);

    commands.start(["node", "app", "deploy", "--verbose", "target=staging"]);

    expect(callback).toBeCalledTimes(1);
    const options = callback.mock.calls[0][0];
    expect(options.verbose).toBe(true);
    expect(options.target).toBe("staging");

    logMock.mockRestore();
  });
});

describe("Existing example.ts compatibility", () => {
  it("should maintain exact behavior of examples/example.ts", () => {
    const logMock = spyOn(console, "log").mockImplementation(() => {});
    const callback = mock();

    const commands = getCommands("test program", "0.0.14");
    commands
      .addCommand("com1")
      .addAlias("c1")
      .addOption("opt1")
      .addOption("opt2")
      .addDescription("command 001 test...")
      .addPositionedArgument("pos0")
      .addPositionedArgument("pos1")
      .setCallback(callback);

    commands.start([
      "node",
      "app",
      "com1",
      "pos0value",
      "opt1=qw111erty",
      "pos1value",
      "opt2=as222d",
    ]);

    expect(callback).toBeCalledTimes(1);
    const options = callback.mock.calls[0][0];
    expect(options.pos0).toBe("pos0value");
    expect(options.pos1).toBe("pos1value");
    expect(options.opt1).toBe("qw111erty");
    expect(options.opt2).toBe("as222d");

    logMock.mockRestore();
  });
});
