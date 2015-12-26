# Reddit Enhancement Suite

[![Build Status](https://travis-ci.org/honestbleeps/Reddit-Enhancement-Suite.svg?branch=master)](https://travis-ci.org/honestbleeps/Reddit-Enhancement-Suite)
[![Code Climate](https://codeclimate.com/github/honestbleeps/Reddit-Enhancement-Suite/badges/gpa.svg)](https://codeclimate.com/github/honestbleeps/Reddit-Enhancement-Suite)
[![devDependency Status](https://david-dm.org/honestbleeps/Reddit-Enhancement-Suite/dev-status.svg)](https://david-dm.org/honestbleeps/Reddit-Enhancement-Suite#info=devDependencies)

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

2. There are a few features we have made a conscious choice not to add to RES, so make sure whatever you'd like to contribute [isn't on that list](https://www.reddit.com/r/Enhancement/wiki/rejectedfeaturerequests).

3. It would be greatly appreciated if you could stick to a few style guidelines:

  - please use tabs for indentation
  - please use spaces in your `if` statements, e.g. `if (foo === bar)`, not `if(foo===bar)`
  - please use single quotes `'` and not double quotes `"` for strings
  - please comment your code!
  - please consider using the `gulp travis` command ([see below](#details-and-advanced-usage)) to verify your code style

4. If you decide to add support for another media hosting site to RES, check out [lib/modules/hosts/example.js](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/lib/modules/hosts/example.js). Please be sure that they support [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) so the sites do not need to be added as additional permissions, which has caused [headaches in the past](https://www.reddit.com/r/Enhancement/comments/1jskcm/announcement_chrome_users_did_your_res_turn_off/).

5. If you decide to add a new module, check out [lib/modules/example.js](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/lib/modules/example.js). To add the module to the browser manifests, use `gulp add-module --file module.js` (replace `module.js` with your filename).


## Project structure

##### Top level files & folders

  - `README.md` – YOU ARE HERE, unless you're browsing on GitHub
  - `changelog.txt` – self-explanatory
  - `gulpfile.js` - build script
  - `package.json` – package info, dependencies
  - `lib/` – all RES code
  - `lib/core/` – core RES code
  - `lib/modules/` – RES modules
  - `lib/vendor/` – RES vendor libraries
  - `Chrome/` – Chrome-specific RES files
  - `Firefox/` – Firefox-specific RES files
  - `Safari/` – Safari-specific RES files
  - `dist/` - build output
  - `tests/` – RES tests, currently unused

##### Chrome files

  - `background.js` – the "background page" for RES, necessary for Chrome extensions
  - `manifest.json` – the project manifest
  - `icon.png`, `icon48.png`, `icon128.png` – icons!

##### Firefox files

  - `index.js` – this is Firefox's sort of "background page" for RES, like what Chrome has, but just a JS file
  - `package.json` – the project manifest for the Firefox add-on

##### Safari files

  - `background-safari.html` – the "background page" for RES, necessary for Safari extensions
  - `Info.plist` – the project manifest
  - `icon.png`, `icon48.png`, `icon128.png` – icons!

## Building development versions of the extension

RES is built with [gulp](http://gulpjs.com/).

First time installation:

1. Install [node.js](http://nodejs.org) on your system.
1. Run `npm install -g gulp`.
1. Navigate to your RES folder.
1. Run `npm install`.

Once done, you can build the extension by running `gulp`. This will also start a watch task that will rebuild RES when you make changes (see [Advanced Usage](#details-and-advanced-usage) for more details). If you're having issues with building the extension, try uninstalling global `gulp` (`npm uninstall -g gulp`) and reinstalling it.

To load the extension into your browser, see [the sections below](#building-in-chrome).

#### Details and Advanced Usage

JavaScript files in `lib/` (except `lib/vendor/`) will be compiled with [Babel](https://babeljs.io/).

Sass (`.scss`) files in `lib/` will be compiled with [Sass](http://sass-lang.com/) and post-processed with [Autoprefixer](https://github.com/postcss/autoprefixer).

**`gulp`** will run `gulp clean` and `gulp watch` in sequence.

**`gulp clean`** will delete the build output subdirectories of the `dist/` directory.

**`gulp build`** will build RES, copying the resultant files into the `dist/` directory. It is recommended to run `gulp clean` first.

**`gulp watch`** will run `gulp build`, then re-run it when anything changes. Only changed files will be rebuilt.

**`gulp add-module --file module.js`** will add `module.js`, a new module, to the manifest for each browser.

**`gulp add-host --file hostname.js`** will add `hostname.js`, a new media host, to the manifest for each browser.

**`gulp zip --zipdir /path/to/zip/directory`** will compress the build folders in `dist/` into .zip files. If no `--zipdir` is specified, the .zip files will be placed in `dist/zip/`. It is recommended to run `gulp build` first.

**`gulp <tasks> -b chrome -b firefox`** can be used with any of the above commands to specify individual browsers (chrome, firefox, safari), instead of performing the task(s) for all of them.

**`gulp travis`** will verify the code style (and point out any errors) of all `.js` files in `lib/` (except `lib/vendor/`) using [ESLint](http://eslint.org/), as well as all `.scss` files with [scss-lint](https://github.com/brigade/scss-lint). We recommend that you run this before opening a pull request. (This is used by Travis CI to automatically test pull requests.)

Note: You will need to install [Ruby](https://www.ruby-lang.org/) and run `gem install scss_lint` before using `gulp travis`.

#### Accessing nightly builds

In addition to building your own version of RES, you can download older (or current) builds of RES for testing purposes.

(Almost) every commit to master is quickly archived away at http://allthefoxes.me; if you would like access to this database, please contact [/u/allthefoxes on reddit](https://www.reddit.com/u/allthefoxes) or email [fox@allthefoxes.me](mailto:fox@allthefoxes.me)

All that is asked is that you have at least one previous contribution to RES.

##### Building in Chrome

  1. Go to `Menu->Tools->Extensions` and tick the `Developer Mode` checkbox
  2. Choose `Load unpacked extension` and point it to the `dist/chrome` folder. Make sure you only have one RES version running at a time.
  3. Any time you make changes to the script, you must go back to the `Menu->Tools->Extensions` page and `Reload` the extension.

##### Building in Firefox

  1. Install [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm) using `npm`: `npm install -g jpm`
  2. Navigate to `dist/firefox` and run the command `jpm run`, which should launch a new Firefox browser using a temporary profile with only RES installed.

##### Building in Safari (assumes Mac)

  1. Open the `Preferences` by going to `Safari->Preferences` or pressing `⌘`, then go to `Advanced` and check the checkbox for `Show develop menu in menu bar`.
  2. Navigate to `Develop->Show Extension Builder` to open the extensions menu. Add a new extension by pressing the `+` in the bottom left and choosing `Add extension`.
  3. Navigate to the `dist/RES.safariextension` folder for RES and select it.
  4. It will likely say you cannot install it because no Safari development certificate exists. You will need to visit the [Safari Dev Center](https://developer.apple.com/devcenter/safari/index.action) and create an account (right hand side).
  5. You then need to visit the [Safari Developer Program](https://developer.apple.com/programs/safari/) site and sign up for a FREE account.
  6. You can then visit your member page and use the certificate utility to create a new Safari Developer Certificate. Follow the instructions to install the certificate. If you have an error involving it being signed by an unknown authority, then double click the certificate and under the `Trust` setting choose `Always Trust`. You should then be able to install the extension from the `Extension Builder` menu.

## Adding new files

##### Modules

Create a new `.js` file in `lib/modules`. Use [gulp add-module](#details-and-advanced-usage) to add the file to the browsers' manifests.

##### Inline image viewer hosts

See `lib/modules/hosts/example.js` for an example.

Create a new `.js` file in `lib/modules/hosts`. Use [gulp add-host](#details-and-advanced-usage) to add the file to the browsers' manifests.

##### Stylesheets

Create a new Sass partial under `lib/css/` (with a leading underscore, e.g. `_myPartial.scss`). Import the file in `lib/css/res.scss` (i.e. `@import 'modules/myPartial';` - do not include the underscore or file extension). You do not need to add it to any browser manifests.

Body classes will be automatically added for boolean and enum options with the property `bodyClass: true`, in the form `.res-moduleId-optionKey` for boolean options (only when they're enabled), and `.res-moduleId-optionKey-optionValue` for enums.
This is the preferred way to create optional CSS, do not use `addCSS()` unless absolutely necessary (i.e. variable color, size, etc.).
