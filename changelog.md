# v0.4.8

- terminal-aware help formatting: wrap descriptions to terminal width
- accurate visual column width via `Bun.stringWidth` (CJK / emoji / ANSI safe)
- add `stringWidth`, `wrapText`, `getTerminalWidth` internal helpers
- `getHelpLine` / `buildDescriptionsText` accept optional `terminalWidth` param
- fall back to next line when left column leaves < 20 cols for description

# v0.4.7

# v0.4.6

- add Prettier for consistent code formatting
- fix test command in workflow (bun test → bun run test)
- format existing code with Prettier
- fix markdown escaping in changelog

# v0.4.5

- use Node lts/\* instead of fixed version in workflow

# v0.4.4

- migrate to npm trusted publishing (token-free authentication)
- add npm@latest installation for npm 11.5.1+ requirement
- add --provenance flag to publish command
- fix repository URL format (git+ prefix)
- add comprehensive test coverage for version command

# v0.4.3

- fix: restore NODE_AUTH_TOKEN requirement for npm publish

# v0.4.0

- add standard CLI syntax support (`--flag`, `-f`, `--opt value`, `--opt=value`)
- add typed option definitions (`OptionDefinition`) with `boolean`, `string`, `number` types
- add `addFlag()`, `addStringOption()`, `addNumberOption()` builder methods
- add argument parser (`parseArgs`) with auto-detection of legacy/standard/mixed syntax
- add default values via `applyDefaults()`
- add option validation (`validateOptions`) with required, type, and allowed values checks
- add combined short flags support (`-vw`)
- add negated flags (`--no-verbose`)
- add double-dash separator (`--`) to stop parsing
- add option aliases support
- maintain full backward compatibility with legacy `key=value` syntax
- refactor `getStart` to use new parsing pipeline
- update help text generation for typed options

# v0.3.0

- migrate project to bun

# v0.1.1

- fixed commands ordered arguments

# v0.1.0

- passes positioned arguments to the callback in the second parameter.
