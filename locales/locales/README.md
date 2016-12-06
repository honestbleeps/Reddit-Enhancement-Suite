# Localization

**Do not edit the files in this directory, they are automatically generated.**

[Instead, visit Transifex if you wish to submit translations.](https://www.transifex.com/reddit-enhancement-suite/reddit-enhancement-suite/)

## New strings

New strings should be added to `en.json` and only that file.

## Translating Modules

Currently only module names, categories and descriptions are translatable. Please see [this](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/lib/modules/commentHidePersistor.js) module for an example of how it's implemented.

These strings can be found in `en.json` which then translate to the English string. A list of categories can also be found near the top of `en.json`.

Modules will be reviewed for i18n before merge.

###Naming Conventions

* Use camelCase for the names.
* For module options use this format:
  * {moduleId}Options{OptionName}
