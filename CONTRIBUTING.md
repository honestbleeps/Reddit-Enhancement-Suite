# Contributor guidelines

Thinking about contributing to RES? Awesome! We just ask that you follow a few simple guidelines:

1. RES has grown quite large, so we do have to pick and choose what features we should add. Code bloat is always a concern, and RES is already rather hefty. If you're unsure if your feature would appeal to a wide audience, please post about it on [/r/Enhancement](https://www.reddit.com/r/Enhancement/).

1. There are a few features we have made a conscious choice not to add to RES, so make sure whatever you'd like to contribute [isn't on that list](https://www.reddit.com/r/Enhancement/wiki/rejectedfeaturerequests).

1. To build the extension, see [Building development versions of the extension](#building-development-versions-of-the-extension).

1. To add new modules or hosts, see [Adding new files](#adding-new-files).

1. To check code style and autofix some formatting errors, see [Lint and test commands](#lint-and-test-commands).

## Project structure

#### Top level files and folders

  - `.github/`: Github templates
  - `browser/`: extension API files common to all browsers
  - `build/`: files handling automated browser deployments
  - `changelog/`: release changelogs
  - `chrome/`: Chrome-specific RES files
  - `dist/`: build output
  - `edge/`: Microsoft Edge-specific RES files
  - `examples/`: example code for new hosts/modules
  - `firefox/`: Firefox-specific RES files
  - `images/`: images for RES logo and CSS icons
  - `lib/`: all RES code
  - `lib/core/`: core RES code
  - `lib/css/`: RES css
  - `lib/environment/`: RES environment code
  - `lib/images/`: RES images
  - `lib/modules/`: RES modules
  - `lib/templates/`: RES templates
  - `lib/utils/`: RES utilities
  - `lib/vendor/`: RES vendor libraries (old libs not on npm)
  - `lib/**/__tests__`: unit tests
  - `locales`: RES i18n translations
  - `tests/`: integration tests
  - `package.json`: package info, dependencies
  - `webpack.config.babel.js`: build script

## Building development versions of the extension

#### First time installation

1. Install [git](https://git-scm.com/).
1. Install [node.js](https://nodejs.org) (version >= 6).
1. Install [Python 2](https://www.python.org/downloads/) (*not* version 3). On Windows, please install the "Add python.exe to path" feature on the customize screen.
1. Navigate to your RES folder.
1. Run `npm install`.

Once done, you can build the extension by running `npm start` (see [Build commands](#build-commands)).

To load the extension into your browser, see [Loading RES into your browser](#loading-res-into-your-browser).

#### Build commands

**`npm start [-- <browsers>]`** will clean `dist/`, then build RES (dev mode), and start a watch task that will rebuild RES when you make changes. Only changed files will be rebuilt.

**`npm run once [-- <browsers>]`** will clean `dist/`, then build RES (dev mode) a single time.

**`npm run build [-- <browsers>]`** will clean `dist/`, then build RES (release mode). Each build output will be compressed to a .zip file in `dist/zip/`.

`<browsers>` is a comma-separated list of browsers to target, e.g. `chrome,firefox,edge`. `all` will build all targets. By default, `chrome` will be targeted.

#### Lint and test commands

**`npm run lint`** will verify the code style (and point out any errors) of all `.js` files in `lib/` (except `lib/vendor/`) using [ESLint](http://eslint.org/), as well as all `.scss` files with [sass-lint](https://github.com/sasstools/sass-lint).

**`npm run lint-fix`** will autofix any [fixable](http://eslint.org/docs/user-guide/command-line-interface#fix) lint issues.

**`npm run flow`** will run [Flow](https://flowtype.org/) type checking, and start the Flow server so future runs will complete faster. Use `npm run flow -- stop` to stop the server, or `npm run flow -- check` to run Flow once without starting the server.

**`npm test`** will run unit tests (in `__tests__` directories) using [Ava](https://github.com/avajs/ava).

**`npm run test-integration -- <browsers>`** will run integration tests (in `tests/`) using [Nightwatch.js](http://nightwatchjs.org/).
Currently just `chrome` and `firefox` can be targeted.

To run integration tests locally, you need to run an instance of [Selenium Standalone Server](http://www.seleniumhq.org/download/) and have either [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/home) or [GeckoDriver](https://github.com/mozilla/geckodriver) on your `PATH`.
The [`selenium-standalone`](https://www.npmjs.com/package/selenium-standalone) package may help with this.
The default host and port (`localhost` and `4444`) should work for most local installations, but if necessary they can be overridden with the `SELENIUM_HOST` and `SELENIUM_PORT` environment variables.

#### Loading RES into your browser

##### Chrome

  1. Go to `Menu->Tools->Extensions` and tick the `Developer Mode` checkbox
  2. Choose `Load unpacked extension` and point it to the `/dist/chrome` folder (not the `/chrome` folder). Make sure you only have one RES version running at a time.
  3. Any time you make changes to the script, you must go back to the `Menu->Tools->Extensions` page and `Reload` the extension.

##### Microsoft Edge

  1. Go to `about:flags` and tick the `Enable extension developer features` checkbox.
  2. Choose `Load extension` on the extensions menu and select the `/dist/edgeextension/manifest/Extension` folder.
  3. Any time you make changes to the extension, you must go back to the `Menu->Extensions` page, go to the extensions settings and `Reload` the extension.

##### Firefox

  1. Install [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm) using `npm`: `npm install -g jpm`
  2. Navigate to the `/dist/firefox` folder (not the `/firefox` folder) and run the command `jpm run`, which should launch a new Firefox browser using a temporary profile with only RES installed.

## Adding new files

#### Modules

See [`examples/module.js`](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/examples/module.js) for an example.

Create a new `.js` file in `lib/modules`.
It will automatically be loaded when the build script is restarted.

All modules must now have i18n implementations. Please see [here](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/locales/locales/README.md) for details.

#### Media hosts

Please be sure that they support [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) so the sites do not need to be added as additional permissions, which has caused [headaches in the past](https://www.reddit.com/r/Enhancement/comments/1jskcm/announcement_chrome_users_did_your_res_turn_off/).

See [`examples/host.js`](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/examples/host.js) for an example.

Create a new `.js` file in `lib/modules/hosts`.
It will automatically be loaded when the build script is restarted.

#### Stylesheets

Create a new `.scss` file in `lib/css/modules/` (with a leading underscore, e.g. `_myModule.scss`).
Import the file in `lib/css/res.scss` (e.g. `@import 'modules/myPartial';`).

Body classes will be automatically added for boolean and enum options with the property `bodyClass: true`, in the form `.res-moduleId-optionKey` for boolean options (only when they're enabled), and `.res-moduleId-optionKey-optionValue` for enums.
This is the preferred way to create optional CSS; do not use `addCSS()` unless absolutely necessary (i.e. variable color, size, etc.).
