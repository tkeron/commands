import {
  describe,
  it,
  expect,
  spyOn,
  mock,
  beforeEach,
  afterEach,
} from "bun:test";
import { getCommands } from "../src/getCommandsFuncs.js";

describe("Version Command - Configuration", () => {
  let logMock: any;
  let logs: string[];

  beforeEach(() => {
    logs = [];
    logMock = spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(() => {
    logMock.mockRestore();
  });

  it("should display version when explicitly configured", () => {
    const commands = getCommands("mycli", "1.2.3");
    commands.start(["node", "app", "version"]);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs.join("\n")).toContain("1.2.3");
  });

  it("should display version using -v alias", () => {
    const commands = getCommands("mycli", "2.5.0");
    commands.start(["node", "app", "-v"]);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs.join("\n")).toContain("2.5.0");
  });

  it("should display version using --version alias", () => {
    const commands = getCommands("mycli", "3.0.1");
    commands.start(["node", "app", "--version"]);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs.join("\n")).toContain("3.0.1");
  });

  it("should use default version 0.0.1 when version not provided", () => {
    const commands = getCommands("mycli");
    commands.start(["node", "app", "version"]);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs.join("\n")).toContain("0.0.1");
  });

  it("should use default version when only programName provided", () => {
    const commands = getCommands("myapp");
    commands.start(["node", "app", "-v"]);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs.join("\n")).toContain("0.0.1");
  });

  it("should use default version when no parameters provided", () => {
    const commands = getCommands();
    commands.start(["node", "app", "version"]);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs.join("\n")).toContain("0.0.1");
  });
});

describe("Version Command - Display Format", () => {
  let logMock: any;
  let logs: string[];

  beforeEach(() => {
    logs = [];
    logMock = spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(() => {
    logMock.mockRestore();
  });

  it("should display version with header text when configured", () => {
    const commands = getCommands("mycli", "1.0.0");
    commands.addHeaderText("My CLI Tool v1.0.0");
    commands.start(["node", "app", "version"]);

    const output = logs.join("\n");
    expect(output).toContain("My CLI Tool v1.0.0");
    expect(output).toContain("1.0.0");
  });

  it("should display version with footer text when configured", () => {
    const commands = getCommands("mycli", "2.0.0");
    commands.addFooterText("For more info: https://example.com");
    commands.start(["node", "app", "version"]);

    const output = logs.join("\n");
    expect(output).toContain("2.0.0");
    expect(output).toContain("For more info: https://example.com");
  });

  it("should display version with both header and footer", () => {
    const commands = getCommands("mycli", "3.5.2");
    commands.addHeaderText("Welcome to MyCLI");
    commands.addFooterText("Documentation: docs.example.com");
    commands.start(["node", "app", "version"]);

    const output = logs.join("\n");
    expect(output).toContain("Welcome to MyCLI");
    expect(output).toContain("3.5.2");
    expect(output).toContain("Documentation: docs.example.com");
  });

  it("should display only version when no header or footer", () => {
    const commands = getCommands("mycli", "1.5.0");
    commands.start(["node", "app", "version"]);

    const output = logs.join("\n");
    expect(output).toContain("1.5.0");
  });
});

describe("Version Command - Edge Cases", () => {
  let logMock: any;
  let logs: string[];

  beforeEach(() => {
    logs = [];
    logMock = spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(() => {
    logMock.mockRestore();
  });

  it("should handle empty string version", () => {
    const commands = getCommands("mycli", "");
    commands.start(["node", "app", "version"]);

    expect(logs.length).toBeGreaterThan(0);
  });

  it("should handle pre-release versions", () => {
    const commands = getCommands("mycli", "1.0.0-alpha.1");
    commands.start(["node", "app", "version"]);

    expect(logs.join("\n")).toContain("1.0.0-alpha.1");
  });

  it("should handle beta versions", () => {
    const commands = getCommands("mycli", "2.0.0-beta.5");
    commands.start(["node", "app", "version"]);

    expect(logs.join("\n")).toContain("2.0.0-beta.5");
  });

  it("should handle release candidate versions", () => {
    const commands = getCommands("mycli", "1.5.0-rc.2");
    commands.start(["node", "app", "version"]);

    expect(logs.join("\n")).toContain("1.5.0-rc.2");
  });

  it("should handle non-semver version strings", () => {
    const commands = getCommands("mycli", "v1.0");
    commands.start(["node", "app", "version"]);

    expect(logs.join("\n")).toContain("v1.0");
  });

  it("should handle very long version strings", () => {
    const longVersion = "1.0.0-alpha.beta.gamma.delta.epsilon.1234567890";
    const commands = getCommands("mycli", longVersion);
    commands.start(["node", "app", "version"]);

    expect(logs.join("\n")).toContain(longVersion);
  });

  it("should handle version with build metadata", () => {
    const commands = getCommands("mycli", "1.0.0+build.2024.02.14");
    commands.start(["node", "app", "version"]);

    expect(logs.join("\n")).toContain("1.0.0+build.2024.02.14");
  });
});

describe("Version Command - Multiple Invocations", () => {
  let logMock: any;
  let logs: string[];

  beforeEach(() => {
    logs = [];
    logMock = spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(() => {
    logMock.mockRestore();
    logs = [];
  });

  it("should display correct version on multiple calls with version command", () => {
    const commands = getCommands("mycli", "1.2.3");

    commands.start(["node", "app", "version"]);
    const firstOutput = logs.join("\n");
    logs = [];

    commands.start(["node", "app", "version"]);
    const secondOutput = logs.join("\n");

    expect(firstOutput).toContain("1.2.3");
    expect(secondOutput).toContain("1.2.3");
  });

  it("should display correct version with different aliases", () => {
    const commands = getCommands("mycli", "2.0.0");

    commands.start(["node", "app", "version"]);
    const versionOutput = logs.join("\n");
    logs = [];

    commands.start(["node", "app", "-v"]);
    const dashVOutput = logs.join("\n");
    logs = [];

    commands.start(["node", "app", "--version"]);
    const doubleDashOutput = logs.join("\n");

    expect(versionOutput).toContain("2.0.0");
    expect(dashVOutput).toContain("2.0.0");
    expect(doubleDashOutput).toContain("2.0.0");
  });
});

describe("Version Command - Integration with Commands", () => {
  let logMock: any;
  let logs: string[];

  beforeEach(() => {
    logs = [];
    logMock = spyOn(console, "log").mockImplementation((...args: any[]) => {
      logs.push(args.join(" "));
    });
  });

  afterEach(() => {
    logMock.mockRestore();
  });

  it("should not interfere with other commands", () => {
    const callback = mock(() => {});
    const commands = getCommands("mycli", "1.0.0");

    commands
      .addCommand("build")
      .addDescription("Build the project")
      .setCallback(callback);

    commands.start(["node", "app", "build"]);
    expect(callback).toBeCalledTimes(1);

    commands.start(["node", "app", "version"]);
    expect(logs.join("\n")).toContain("1.0.0");
  });

  it("should work alongside commands with -v flag", () => {
    const callback = mock(() => {});
    const commands = getCommands("mycli", "2.0.0");

    commands
      .addCommand("test")
      .addFlag("verbose", "v", "Verbose output")
      .setCallback(callback);

    commands.start(["node", "app", "-v"]);
    expect(logs.join("\n")).toContain("2.0.0");
    expect(callback).not.toBeCalled();
  });
});
