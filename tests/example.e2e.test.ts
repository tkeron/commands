import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";

describe("example e2e", () => {
  let logs: any[] = [];
  let spy: any;

  beforeEach(() => {
    logs = [];
    spy = spyOn(globalThis.console, "log").mockImplementation(
      (...args: any) => {
        logs.push(args);
      },
    );
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("should runs ok", (done) => {
    expect(logs).toHaveLength(0);
    import("../examples/example");
    const check = () => {
      const { commands } = globalThis;
      if (!commands) return;
      expect(logs).toHaveLength(8);
      expect(logs[0]).toStrictEqual(["argument 'asdasd' not defined"]);
      expect(logs[1]).toStrictEqual([
        "arguments 'pos0value, pos1value, asdasd' not defined",
      ]);
      expect(logs[2]).toStrictEqual([
        {
          opt1: "qw111erty",
          opt2: "as222d",
          pos0: "pos0value",
          pos1: "pos1value",
          pos3: "asdasd",
        },
      ]);
      expect(logs).toHaveLength(8);
      clearInterval(handler);
      done();
    };
    const handler = setInterval(check, 10);
  });
});
