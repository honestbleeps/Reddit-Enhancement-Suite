# Contributor guidelines

Thinking about contributing to RES? Awesome! We just ask that you follow a few simple guidelines:

1. RES has grown quite large, so we have carefully chosen what features we should add to avoid maintenance burden and code bloat. If you're unsure if your feature would appeal to a wide audience, please post about it on [/r/Enhancement](https://www.reddit.com/r/Enhancement/).

1. There are a few features we have made a conscious choice not to add to RES, so make sure whatever you'd like to contribute [isn't on that list](https://www.reddit.com/r/Enhancement/wiki/rejectedfeaturerequests).

1. To build the extension, see [Building development versions of the extension](#building-development-versions-of-the-extension).

1. To add new modules or hosts, see [Adding new files](#adding-new-files).

1. To check code style and autofix some formatting errors, see [Lint and test commands](#lint-and-test-commands).

1. [Come chat with us on Discord](https://discord.gg/UzkFNNa) if you would like to implement a new feature. It is the quickest way to get a response from the development team.

## Building development versions of the extension

#### First time installation

1. Install [git](https://git-scm.com/).
1. Install [node.js](https://nodejs.org) (version >= 10).
1. Install [yarn](https://yarnpkg.com/lang/en/docs/install/)
1. [Clone this repository](https://help.github.com/articles/cloning-a-repository/).
1. Run `yarn` in that folder.

Once done, you can build the extension by running `yarn start` (see [Build commands](#build-commands)).

To load the extension into your browser, see [Loading RES into your browser](#loading-res-into-your-browser).

#### Build commands

**`yarn start [--env browsers=<browsers>]`** will clean `dist/`, then build RES (dev mode), and start a watch task that will rebuild RES when you make changes. Only changed files will be rebuilt.

**`yarn once [--env browsers=<browsers>]`** will clean `dist/`, then build RES (dev mode) a single time.

**`yarn build [--env browsers=<browsers>]`** will clean `dist/`, then build RES (release mode). Each build output will be compressed to a .zip file in `dist/zip/`.

`<browsers>` is a comma-separated list of browsers to target, e.g. `chrome,firefox`. `all` will build all targets. By default, `chrome` will be targeted.

#### Lint and test commands

**`yarn lint`** will verify the code style (and point out any errors) of all `.js` files in `lib/` (except `lib/vendor/`) using [ESLint](http://eslint.org/), as well as all `.scss` files with [stylelint](https://stylelint.io/).

**`yarn lint-fix`** will autofix any [fixable](http://eslint.org/docs/user-guide/command-line-interface#fix) lint issues.

**`yarn flow`** will run [Flow](https://flowtype.org/) type checking, and start the Flow server so future runs will complete faster. Use `yarn flow -- stop` to stop the server, or `yarn flow check` to run Flow once without starting the server.

**`yarn test`** will run unit tests (in `__tests__` directories) using [Ava](https://github.com/avajs/ava).

**`yarn integration <browsers> [-f <testFileGlob>]`** will run integration tests (in `tests/`) using [Nightwatch.js](http://nightwatchjs.org/).
Currently just `chrome` and `firefox` can be targeted.

To run integration tests locally, you need to run an instance of [Selenium Standalone Server](http://www.seleniumhq.org/download/) and have either [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/home) or [GeckoDriver](https://github.com/mozilla/geckodriver) on your `PATH`.
The [`selenium-standalone`](https://www.npmjs.com/package/selenium-standalone) package may help with this.
The default host and port (`localhost` and `4444`) should work for most local installations, but if necessary they can be overridden with the `SELENIUM_HOST` and `SELENIUM_PORT` environment variables.

#### Loading RES into your browser

##### Chrome

1. Go to `Menu->More tools->Extensions` and tick the `Developer Mode` checkbox.
1. Click `Load unpacked extension` and select the `/dist/chrome` folder (not the `/chrome` folder).
1. Any time you make changes, you must go back to the `Menu->More tools->Extensions` page and `Reload` the extension.

##### Firefox

1. Go to `about:debugging` and tick the `Enable add-on debugging` checkbox.
1. Click `Load Temporary Add-on` and select `/dist/firefox/manifest.json` (not the `/firefox` folder).
1. Any time you make changes, you must go back to the `about:debugging` page and `Reload` the extension.

## Project structure

#### Top level files and folders

  - `.github/`: Github templates
  - `browser/`: extension API files common to all browsers
  - `build/`: files handling automated browser deployments
  - `changelog/`: release changelogs
  - `chrome/`: Chrome-specific RES files
  - `dist/`: build output
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

## Adding new files

#### Modules

First, check to see if there is an existing module with the same focus.

See [`examples/module.js`](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/examples/module.js) for an example.

Create a new `.js` file in `lib/modules`.
It will automatically be loaded when the build script is restarted.

All user-visible text must be translated. See the [locales README](/locales/locales/README.md) for details.

#### Media hosts

See [`examples/host.js`](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/examples/host.js) for an example.

Create a new `.js` file in `lib/modules/hosts`.
It will automatically be loaded when the build script is restarted.

If the host uses an API that does not support [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing), you must add it to the browsers' manifests and the host's `permissions` property. For example, search for usages of `api.twitter.com`.

#### Stylesheets

Create a new `.scss` file in `lib/css/modules/` (with a leading underscore, e.g. `_myModule.scss`).
Import the file in `lib/css/res.scss` (e.g. `@import 'modules/myPartial';`).

For toggleable CSS, add `bodyClass: true` to an option or module, then wrap your CSS with `.res-moduleId-optionKey` (boolean options), `.res-moduleId-optionKey-optionValue` (enum options), or `.res-moduleId` (modules).

For example:
```scss
.res-showImages-hideImages {
	img {
		display: none;
	}
}
```
