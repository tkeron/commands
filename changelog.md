# v0.4.2

- test: validate trusted publishing without NODE_AUTH_TOKEN
- fix: use correct repository format in package.json (type + HTTPS URL)

# v0.4.1

- add comprehensive test coverage for version command
- add publishConfig to package.json for npm publishing

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
