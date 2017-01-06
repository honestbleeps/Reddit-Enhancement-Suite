# Reddit Enhancement Suite

[![Travis Build Status](https://travis-ci.org/honestbleeps/Reddit-Enhancement-Suite.svg?branch=master)](https://travis-ci.org/honestbleeps/Reddit-Enhancement-Suite)
[![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/github/honestbleeps/Reddit-Enhancement-Suite?branch=master&svg=true)](https://ci.appveyor.com/project/honestbleeps/Reddit-Enhancement-Suite)
[![Coverage Status](https://coveralls.io/repos/github/honestbleeps/Reddit-Enhancement-Suite/badge.svg?branch=master)](https://coveralls.io/github/honestbleeps/Reddit-Enhancement-Suite?branch=master)
[![Code Climate](https://codeclimate.com/github/honestbleeps/Reddit-Enhancement-Suite/badges/gpa.svg)](https://codeclimate.com/github/honestbleeps/Reddit-Enhancement-Suite)
[![devDependency Status](https://david-dm.org/honestbleeps/Reddit-Enhancement-Suite/dev-status.svg)](https://david-dm.org/honestbleeps/Reddit-Enhancement-Suite#info=devDependencies)
[![Chat on IRC](https://img.shields.io/badge/irc-%23enhancement-blue.svg)](http://webchat.snoonet.org/#enhancement)

Reddit Enhancement Suite (RES) is a suite of modules that enhances your Reddit browsing experience.

For general documentation, visit the [Reddit Enhancement Suite Wiki](https://www.reddit.com/r/Enhancement/wiki/index).

## Introduction

Hi there! Thanks for checking out RES on GitHub. A few important notes:

1. RES is licensed under GPLv3, which means you're technically free to do whatever you wish in terms of redistribution as long as you maintain GPLv3 licensing. However, I ask out of courtesy that should you choose to release your own, separate distribution of RES, you please name it something else entirely. Unfortunately, I have run into problems in the past with people redistributing under the same name, and causing me tech support headaches.

2. I ask that you please do not distribute your own binaries of RES (e.g. with bugfixes, etc). The version numbers in RES are important references for tech support so that we can replicate bugs that users report using the same version they are, and when you distribute your own - you run the risk of polluting/confusing that. In addition, if a user overwrites his/her extension with your distributed copy, it may not properly retain their RES settings/data depending on the developer ID used, etc.

I can't stop you from doing any of this. I'm just asking out of courtesy because I already spend a great deal of time providing tech support and chasing down bugs, and it's much harder when people think I'm the support guy for a separate branch of code.

Thanks!

Steve Sobel
steve@honestbleeps.com

## Contributor guidelines

Thinking about contributing to RES? Awesome! We just ask that you follow a few simple guidelines:

1. RES has grown quite large, so we do have to pick and choose what features we should add. Code bloat is always a concern, and RES is already rather hefty. If you're unsure if your feature would appeal to a wide audience, please post about it on [/r/Enhancement](https://www.reddit.com/r/Enhancement/) or [contact @honestbleeps](https://www.reddit.com/message/compose/?to=honestbleeps) directly to ask.

1. There are a few features we have made a conscious choice not to add to RES, so make sure whatever you'd like to contribute [isn't on that list](https://www.reddit.com/r/Enhancement/wiki/rejectedfeaturerequests).

1. To build the extension, see [Building development versions of the extension](#building-development-versions-of-the-extension).

1. If you're adding new modules or hosts, see [Adding new files](#adding-new-files).

1. Code style is enforced with ESLint and sass-lint. For commands to check code style and autofix common errors, see [Details and advanced usage](#details-and-advanced-usage).

## Project structure

##### Top level files and folders

  - `.github/`: Github templates
  - `build/`: Files handling automated browser deployments
  - `changelog/`: Release changelogs
  - `chrome/`: Chrome-specific RES files
  - `dist/`: build output
  - `edge/`: Microsoft Edge-specific RES files
  - `examples/`: example code for new hosts/modules
  - `firefox/`: Firefox-specific RES files
  - `images/`: Images for RES logo and CSS icons
  - `lib/`: all RES code
  - `lib/core/`: core RES code
  - `lib/css/`: RES css
  - `lib/environment/`: RES environment code
  - `lib/images/`: RES images
  - `lib/modules/`: RES modules
  - `lib/templates/`: RES templates
  - `lib/utils/`: RES utilities
  - `lib/vendor/`: RES vendor libraries 
  - `locales`: RES i18n translations  
  - `node/`: Node files
  - `safari/`: Safari-specific RES files
  - `tests/`: integration tests
  - `utils/`: Misc RES utilities
  - `CHANGELOG.md`: self-explanatory 
  - `README.md`: YOU ARE HERE, unless you're browsing on GitHub
  - `package.json`: package info, dependencies
  - `webpack.config.babel.js`: build script
  - `**/__tests__`: unit tests

##### Chrome files

  - `background.entry.js`: the "background page" for RES, necessary for Chrome extensions
  - `environment.js`: specific environment settings for Chrome
  - `manifest.json`: the project manifest
  - `options.html`: options page for chrome extensions

##### Microsoft Edge files

  - `edge.entry.js`: shim to allow chrome extension code usage
  - `environment.js`: Edge-specific overrides of the Chrome environment
  - `manifest.json`: the project manifest
  
##### Firefox files

  - `background.entry.js`: the "background page" for RES, necessary for Firefox extensions
  - `environment.js`: specific environment settings for Firefox
  - `package.json`: the project manifest for the Firefox add-on

##### Safari files

  - `Info.plist`: the project manifest
  - `background-safari.html`: the "background html page" for RES, necessary for Safari extensions
  - `background.entry.js`: the "background page" for RES, necessary for Safari extensions
  - `environment.js`: specific environment settings for Safari

## Building development versions of the extension

First time installation:

1. Install [git](https://git-scm.com/).
1. Install [node.js](https://nodejs.org) (version >= 6).
1. Install [Python 2](https://www.python.org/downloads/) (*not* version 3). On Windows, please install the "Add python.exe to path" feature on the customize screen.
1. Navigate to your RES folder.
1. Run `npm install`.

Once done, you can build the extension by running `npm start`. This will also start a watch task that will rebuild RES when you make changes (see [Advanced Usage](#details-and-advanced-usage) for more details).

To load the extension into your browser, see [the sections below](#building-in-chrome).

#### Details and advanced usage

**`npm start [-- <browsers>]`** will clean `dist/`, then build RES (dev mode), and start a watch task that will rebuild RES when you make changes. Only changed files will be rebuilt.

**`npm run once [-- <browsers>]`** will clean `dist/`, then build RES (dev mode) a single time.

**`npm run build [-- <browsers>]`** will clean `dist/`, then build RES (release mode). Each build output will be compressed to a .zip file in `dist/zip/`.

`<browsers>` is a comma-separated list of browsers to target, e.g. `chrome,firefox,safari,node`. `all` will build all targets. By default, `chrome` will be targeted.

**`npm run lint`** will verify the code style (and point out any errors) of all `.js` files in `lib/` (except `lib/vendor/`) using [ESLint](http://eslint.org/), as well as all `.scss` files with [sass-lint](https://github.com/sasstools/sass-lint).

**`npm run lint-fix`** will autofix any [fixable](http://eslint.org/docs/user-guide/command-line-interface#fix) lint issues.

**`npm run flow`** will run [Flow](https://flowtype.org/) type checking, and start the Flow server so future runs will complete faster. Use `npm run flow -- stop` to stop the server, or `npm run flow -- check` to run Flow once without starting the server.

**`npm test`** will run unit tests (in `__tests__` directories) using [Ava](https://github.com/avajs/ava).

**`npm run test-integration -- <browsers>`** will run integration tests (in `tests/`) using [Nightwatch.js](http://nightwatchjs.org/).
Currently just `chrome` and `firefox` can be targeted.
To run integration tests locally, you must change `selenium_host`, `selenium_port`, `username`, and `access_key` in `nightwatch.conf.js` to correspond to your Selenium server.

##### Building in Chrome

  1. Go to `Menu->Tools->Extensions` and tick the `Developer Mode` checkbox
  2. Choose `Load unpacked extension` and point it to the `/dist/chrome` folder (not the `/chrome` folder). Make sure you only have one RES version running at a time.
  3. Any time you make changes to the script, you must go back to the `Menu->Tools->Extensions` page and `Reload` the extension.

##### Building in Microsoft Edge

  1. Go to `about:flags` and tick the `Enable extension developer features` checkbox.
  2. Choose `Load extension` on the extensions menu and select the `/dist/edge` folder (not the `/edge` folder).
  3. Any time you make changes to the extension, you must go back to the `Menu->Extensions` page, go to the extensions settings and `Reload` the extension.

##### Building in Firefox

  1. Install [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm) using `npm`: `npm install -g jpm`
  2. Navigate to the `/dist/firefox` folder (not the `/firefox` folder) and run the command `jpm run`, which should launch a new Firefox browser using a temporary profile with only RES installed.

##### Building in Safari (assumes Mac)

  1. Open the `Preferences` by going to `Safari->Preferences` or pressing `⌘,`, then go to `Advanced` and check the checkbox for `Show Develop menu in menu bar`.
  2. Navigate to `Develop->Show Extension Builder` to open the extensions builder. Add a new extension by pressing the `+` in the bottom left and choosing `Add Extension`.
  3. Navigate to the `/dist/RES.safariextension` folder (not the `/safari` folder) for RES and select it.
  4. If you are using Safari 9+, you should be able to install the extension without enrolling in the [Apple Developer Program](https://developer.apple.com/programs/); however, the extension will be auto-uninstalled when you quit Safari.

  If you use an older version of Safari or find the auto-uninstall annoying, you need to purchase a proper certificate by signing up for the [Apple Developer Program](https://developer.apple.com/programs/) (currently $99/yr).

#### Accessing nightly builds

In addition to building your own version of RES, you can download older (or current) builds of RES for testing purposes.

(Almost) every commit to master is quickly archived away at http://allthefoxes.me; if you would like access to this database, please contact [/u/allthefoxes on reddit](https://www.reddit.com/user/allthefoxes) or email [fox@allthefoxes.me](mailto:fox@allthefoxes.me).

All that is asked is that you have at least one previous contribution to RES.

## Adding new files

##### Modules

See [`examples/module.js`](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/examples/module.js) for an example.

Create a new `.js` file in `lib/modules`.
It will automatically be loaded when the build script is restarted.

All modules must now have i18n implementations. Please see [here](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/locales/locales/README.md) for details.

##### Inline image viewer hosts

Please be sure that they support [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) so the sites do not need to be added as additional permissions, which has caused [headaches in the past](https://www.reddit.com/r/Enhancement/comments/1jskcm/announcement_chrome_users_did_your_res_turn_off/).

See [`examples/host.js`](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/examples/host.js) for an example.

Create a new `.js` file in `lib/modules/hosts`.
It will automatically be loaded when the build script is restarted.

##### Stylesheets

Create a new Sass partial under `lib/css/modules/` (with a leading underscore, e.g. `_myPartial.scss`).
Import the file in `lib/css/res.scss` (i.e. `@import 'modules/myPartial';`—do not include the underscore or file extension).

Body classes will be automatically added for boolean and enum options with the property `bodyClass: true`, in the form `.res-moduleId-optionKey` for boolean options (only when they're enabled), and `.res-moduleId-optionKey-optionValue` for enums.
This is the preferred way to create optional CSS; do not use `addCSS()` unless absolutely necessary (i.e. variable color, size, etc.).
