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
1. Install [node.js](https://nodejs.org) (version >= 22).
1. Install [yarn](https://yarnpkg.com/lang/en/docs/install/)
1. [Clone this repository](https://help.github.com/articles/cloning-a-repository/).
1. Run `yarn` in that folder.

Once done, you can build the extension by running `yarn start` (see [Build commands](#build-commands)).

To load the extension into your browser, see [Loading RES into your browser](#loading-res-into-your-browser).

#### Build commands

**`yarn start [--browsers <browsers>]`** will clean `dist/`, then build RES (dev mode), and start a watch task that will rebuild RES when you make changes. Only changed files will be rebuilt.

**`yarn once [--browsers <browsers>]`** will clean `dist/`, then build RES (dev mode) a single time.

**`yarn build [--browsers <browsers>]`** will clean `dist/`, then build RES (release mode). Each build output will be compressed to a .zip file in `dist/zip/`.

`<browsers>` is a comma-separated list of browsers to target, e.g. `chrome,firefox,safari`. `all` will build all targets. By default, `chrome` will be targeted.

Safari builds emit a WebExtension bundle in `dist/safari/` and `dist/zip/safari.zip`. Packaging that bundle for distribution still requires Xcode on macOS.
For the broad public beta/TestFlight rollout, use [`docs/safari-public-beta.md`](docs/safari-public-beta.md) as the source of truth.

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

##### Safari (macOS)

1. Install Xcode and its command line tools on macOS.
1. If the converter fails with `A required plugin failed to load`, run `xcodebuild -runFirstLaunch` once.
1. Run `yarn safari:validate` to build `dist/safari`, convert it into `dist/safari-xcode/`, patch the generated Xcode bundle identifiers, and verify that the app target can be built locally without signing.
1. Open `/dist/safari-xcode/Reddit Enhancement Suite Safari/Reddit Enhancement Suite Safari.xcodeproj` in Xcode, run the containing app locally to enable the extension in Safari, and use Xcode for reload/debug cycles.
1. Public distribution goes through Apple's Safari Web Extension packaging flow and App Store Connect rather than the browser store automation used for Chrome and Firefox.
1. Broad public Safari testing should use TestFlight rather than GitHub artifacts; see [`docs/safari-public-beta.md`](docs/safari-public-beta.md).

Safari smoke checklist after the containing app is installed:

  - Extension enables and injects on old Reddit.
  - Options page opens and settings/translations load.
  - Toolbar action still toggles subreddit CSS.
  - `showImages` expands media and optional host-permission prompts still work.
  - Download actions open the asset for manual save.
  - History-dependent UI is absent or intentionally inert, without console errors.
  - File backup/restore works.
  - Cloud backup works for manual auth only, or the provider is intentionally hidden if manual auth fails.
  - Private browsing does not crash the extension.
  - If the options page is blank or the toolbar click does nothing, open `debug.html` inside the extension bundle to inspect persisted Safari runtime diagnostics and clear them between attempts.
  - If you need to file a Safari bug, use the copy/download actions on `debug.html` and submit the report through the GitHub Safari beta issue template.

Known Safari gaps in the current port:

  - No extension-managed browsing history; history-dependent filters and showImages history writes are disabled.
  - No controlled extension downloads; Safari falls back to opening the asset in a new tab for manual save.
  - Automatic cloud backups remain disabled until Safari background redirect auth is validated manually.
  - Safari runtime diagnostics are enabled by default and stored in extension local storage until the port stabilizes.

#### Cross-browser regression smoke

If a change touches `lib/environment/`, browser manifests, or build target logic, do not mark the PR review-ready until this short smoke pass has been completed on the PR branch:

  - Chrome on old Reddit: RES injects, settings save/reload, toolbar style toggle works on a styled subreddit, `showImages` expands media, downloads remain managed, and history-based behavior still works.
  - Firefox on old Reddit: same smoke pass, plus Firefox-specific auth/storage behavior still matches expected pre-Safari behavior.
  - Safari: keep the existing Safari smoke checklist above.

Chrome is the representative Chromium runtime for these checks. Edge and Opera only need build validation unless Chrome shows a regression.

## Project structure

#### Top level files and folders

  - `.github/`: Github templates
  - `docs/`: release and rollout documentation
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
  - `safari/`: Safari-specific RES files
  - `tests/`: integration tests
  - `package.json`: package info, dependencies
  - `build.js`: build script

## Adding new files

#### Modules

First, check to see if there is an existing module with the same focus.

See [`examples/module.js`](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/examples/module.js) for an example.

Create a new `.js` file in `lib/modules`. Export it in `lib/modules/index.js` 
It will automatically be loaded when the build script is restarted.

All user-visible text must be translated. See the [locales README](/locales/locales/README.md) for details.

#### Media hosts

See [`examples/host.js`](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/examples/host.js) for an example.

Create a new `.js` file in `lib/modules/hosts`. Export it in `lib/modules/hosts/index.js` 
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
