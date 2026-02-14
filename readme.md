# @tkeron/commands

Zero-dependency CLI command parser and router for Bun/Node.js.

## Install

```bash
bun add @tkeron/commands
```

## Quick Start

```typescript
import { getCommands } from "@tkeron/commands";

const cli = getCommands("myapp", "1.0.0")
  .addCommand("build")
  .addAlias("b")
  .addDescription("Build the project")
  .addFlag("verbose", "v", "Enable verbose output")
  .addStringOption("output", "o", "Output directory", { default: "./dist" })
  .addPositionedArgument("source")
  .setCallback(console.log)

  .commands()

  .addCommand("serve")
  .addAlias("s")
  .addDescription("Start dev server")
  .addNumberOption("port", "p", "Port number", { default: 3000 })
  .addFlag("open", "o", "Open browser")
  .setCallback(console.log)

  .commands()

  .addHeaderText("MyApp v1.0.0\n")
  .addFooterText("\nDocs: https://example.com");

cli.start();
```

Usage:

```bash
myapp build src --verbose -o dist
myapp serve -p 8080 --open
myapp help
myapp version
```

## API

### `getCommands(programName, version)`

Creates a new `Commands` instance.

### Commands

| Method                 | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `.addCommand(name)`    | Add a command, returns `CommandFactory`           |
| `.addHeaderText(text)` | Set help header text                              |
| `.addFooterText(text)` | Set help footer text                              |
| `.start(argv?)`        | Parse and execute. Uses `process.argv` by default |

### CommandFactory (chaining)

| Method                                                      | Description                               |
| ----------------------------------------------------------- | ----------------------------------------- |
| `.addAlias(alias)`                                          | Add command alias                         |
| `.addDescription(text)`                                     | Set command description                   |
| `.addFlag(name, shortFlag?, description?)`                  | Add boolean flag (`--verbose`, `-v`)      |
| `.addStringOption(name, shortFlag?, description?, config?)` | Add string option                         |
| `.addNumberOption(name, shortFlag?, description?, config?)` | Add number option                         |
| `.addOption(name, example?)`                                | Add legacy `key=value` option             |
| `.addPositionedArgument(name)`                              | Add positional argument                   |
| `.setCallback(fn)`                                          | Set command handler                       |
| `.commands()`                                               | Return to `Commands` to add more commands |

### Option Config

`addStringOption` and `addNumberOption` accept an optional config object:

```typescript
{
  default?: string | number | boolean;
  required?: boolean;
  aliases?: string[];
  allowedValues?: (string | number)[];
  valueName?: string;
}
```

## Syntax Support

Both syntaxes work and can be mixed:

**Standard** (new):

```bash
myapp build --verbose --output dist
myapp build -v -o dist
myapp build -vw              # combined short flags
myapp build --no-verbose     # negated flags
myapp build -- --not-parsed  # stop parsing after --
```

**Legacy** (backward compatible):

```bash
myapp build output=dist format=json
```

## Built-in Commands

`help` and `version` are added automatically.

## License

MIT
