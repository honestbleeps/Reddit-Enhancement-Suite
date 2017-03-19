# Localization

**Do not edit the files in this directory, they are automatically generated.**

[Instead, visit Transifex if you wish to submit translations.](https://www.transifex.com/reddit-enhancement-suite/reddit-enhancement-suite/)

## New strings

New strings should be added to `en.json` and only that file.

## Translating Modules

User interface text can be translated with the `i18n` function.

The names, categories and descriptions of modules and options are automatically translated (you do not need to call `i18n`).

See the [userbarHider](/lib/modules/userbarHider.js) module for examples of both of these.

### Naming Conventions

* Use camelCase.
* In general, i18n keys for a module should start with its `moduleId`.
  * Option titles: `{moduleId}Options{OptionName}Title` (e.g. `userbarHiderUserbarStateTitle`)
  * Option descriptions: `{moduleId}Options{OptionName}Desc` (e.g. `userbarHiderUserbarStateDesc`)
