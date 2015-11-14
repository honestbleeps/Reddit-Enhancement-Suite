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

3. It would be greatly appreciated if you could stick to a few style guidelines. Some of these guidelines are NOT (yet!) strictly followed by RES because it originally started as an amalgamation of code from so many different sources. That said, we do hope to clean it up in due time...  Some guidelines:

  - please use tabs for indentation
  - please use spaces in your `if` statements, e.g. `if (foo === bar)`, not `if(foo===bar)`
  - please use single quotes `'` and not double quotes `"` for strings
  - please comment your code!
  - please, when possible, place `var` declarations all together at the top of a function
  - please consider installing a tool like [JSHint](http://www.jshint.com/) or [JSLint](http://www.jslint.com/) that will help enforce good JavaScript best practices!

4. If you decide to add support for another media hosting site to RES, check out [lib/modules/hosts/example.js](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/lib/modules/hosts/example.js). Please be sure that they support [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) so the sites do not need to be added as additional permissions, which has caused [headaches in the past](https://www.reddit.com/r/Enhancement/comments/1jskcm/announcement_chrome_users_did_your_res_turn_off/).

5. If you decide to add a new module, check out [lib/modules/example.js](https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/lib/modules/example.js). To add the module to the browser manifests, use `gulp add-module --file module.js` (replace `module.js` with your filename).


## Project structure

In order to build the extension, the files from `lib/` must be replicated ([either via hard-links or grunt/Gulp](#building-development-versions-of-the-extension)) into the relevant browser directory.

##### Top level files & folders

  - `README.md` – YOU ARE HERE, unless you're browsing on GitHub
  - `changelog.txt` – self-explanatory
  - `makelinks.sh` – script to generate hard links
  - `Gruntfile.js`, `package.json` – used for alternative build scripts
  - `lib/` – all RES code
  - `lib/core/` – core RES code
  - `lib/modules/` – RES modules
  - `lib/vendor/` – RES vendor libraries
  - `Chrome/` – Chrome-specific RES files
  - `Opera/` – Opera-specific RES files
  - `OperaBlink/` – Opera Blink (new Opera)-specific RES files
  - `RES.safariextension/` – Safari-specific RES files
  - `XPI/` – Firefox-specific RES files
  - `tests/` – RES tests, currently unused

##### Chrome files

  - `background.js` – the "background page" for RES, necessary for Chrome extensions
  - `manifest.json` – the project manifest
  - `icon.png`, `icon48.png`, `icon128.png` – icons!

##### Opera files

  - `index.html` – the "background page" for RES, necessary for Opera extensions
  - `config.xml` – Opera's equivalent of Chrome's `manifest.json`
  - `logo.gif` – a logo gif!

##### Safari files (RES.safariextension)
NOTE: This directory must have `.safariextension` in the name, or Safari's extension builder pukes.

  - `background-safari.html` – the "background page" for RES, necessary for Safari extensions
  - `Info.plist` – the project manifest
  - `icon.png`, `icon48.png`, `icon128.png` – icons!

##### Firefox files (XPI)
NOTE: An XPI is a Firefox add-on, which is compiled using the [Add-on SDK](https://developer.mozilla.org/en-US/Add-ons/SDK).

  - `index.js` – this is Firefox's sort of "background page" for RES, like what Chrome has, but just a JS file
  - `package.json` – the project manifest for the Firefox add-on

##### OperaBlink files

  - `background.js` – the "background page" for RES, necessary for Opera extensions
  - `manifest.json` – the project manifest
  - `icon.png`, `icon48.png`, `icon128.png` – icons!

## Building development versions of the extension

In order to build a development version of RES, run `makelinks.sh` to generate hard links into `lib/` from the browser-specific folders. (This is [necessary on Chrome](https://code.google.com/p/chromium/issues/detail?id=27185).) NOTE: switching branches will break hard links, so you will need to rerun `makelinks.sh` whenever you check out new code.

Alternative build scripts for building RES via [grunt](#using-grunt) or [gulp](#using-gulp) are also provided.

#### Accessing nightly builds

In addition to building your own version of RES, you can download older (or current) builds of RES for testing purposes.

(Almost) every commit to master is quickly archived away at http://allthefoxes.me; if you would like access to this database, please contact [/u/allthefoxes on reddit](https://www.reddit.com/u/allthefoxes) or email [fox@allthefoxes.me](mailto:fox@allthefoxes.me)

All that is asked is that you have at least one previous contribution to RES.

##### Building in Chrome

  1. Go to `Menu->Tools->Extensions` and tick the `Developer Mode` checkbox
  2. Choose `Load unpacked extension` and point it to the `Chrome` folder. Make sure you only have one RES version running at a time.
  3. Any time you make changes to the script, you must go back to the `Menu->Tools->Extensions` page and `Reload` the extension.

##### Building in Firefox

  1. Install [jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm) using `npm`: `npm install -g jpm`
  2. Navigate to `dist/XPI` and run the command `jpm run`, which should launch a new Firefox browser using a temporary profile with only RES installed.

##### Building in Safari (assumes Mac)

  1. Open the `Preferences` by going to `Safari->Preferences` or pressing `⌘`, then go to `Advanced` and check the checkbox for `Show develop menu in menu bar`.
  2. Navigate to `Develop->Show Extension Builder` to open the extensions menu. Add a new extension by pressing the `+` in the bottom left and choosing `Add extension`.
  3. Navigate to the `RES.safariextension` folder for RES and select it.
  4. It will likely say you cannot install it because no Safari development certificate exists. You will need to visit the [Safari Dev Center](https://developer.apple.com/devcenter/safari/index.action) and create an account (right hand side).
  5. You then need to visit the [Safari Developer Program](https://developer.apple.com/programs/safari/) site and sign up for a FREE account.
  6. You can then visit your member page and use the certificate utility to create a new Safari Developer Certificate. Follow the instructions to install the certificate. If you have an error involving it being signed by an unknown authority, then double click the certificate and under the `Trust` setting choose `Always Trust`. You should then be able to install the extension from the `Extension Builder` menu.

##### Building in Opera

  1. Click `Tools->Extensions->Manage Extensions`
  2. Drag the `config.xml` file in the `Opera` directory in to the extensions window and release. You should now have installed the extension.

The above steps will fail if the `makelinks.sh` or grunt build scripts have not been run before hand. Please ensure you only have one copy of RES running at a time.

### Using grunt

RES can also be built using [grunt](http://gruntjs.com/). In order to use grunt, you will need to have [node.js](http://nodejs.org/) installed on your system.

If you have never used grunt before:

1. Run `npm install -g grunt-cli` to install the grunt task runner.
2. Navigate to the RES directory in a console and run `npm install` to install all other dependencies.

Once done, you can build the extension by running `grunt`.

For developing, run `grunt` followed by the name of the browser you wish to develop on, such as `grunt chrome` for Chrome or `grunt firefox` for Firefox. Once run, grunt will start a watch task which will instantly copy any changes made in the `lib/` directory over to the given browser's extension folder. You will need to stop and start grunt if you add any additional files.

To load the extension into your browser, see the ["Building development versions of the extension" section](#building-development-versions-of-the-extension) above.

### Using Gulp

RES can also be built with [gulp](http://gulpjs.com/), an advanced build manager similar to grunt.

You will need [node.js](http://nodejs.org) installed on your system.

First time use:

1. Run `npm install -g gulp`.
2. Navigate to your RES folder.
3. Run `npm install` ^(If you're super-conscientious about which modules are installed, then look at gulpfile.js and `npm install` the required packages manually.)

Usage:

    gulp

by itself will build all current browser versions of RES and will place them into a new folder called dist. If the dist directory already exists, it will clear out anything inside it.

    gulp clean

cleans out the `dist/` directory

    gulp <tasks> -b browser1 -b browser2

can be used with any of the following tasks to specify individual browsers (chrome, firefox, safari, opera, or oblink), instead of performing the task(s) for all of them.

    gulp build

builds RES, copying the resultant files into the `dist/` directory. It is recommended to run `gulp clean` first.

    gulp add-module --file module.js

adds module.js, a new module, to the manifest for each browser.

	gulp add-host --file hostname.js

adds hostname.js, a new media host, to the manifest for each browser.

    gulp watch

rebuilds the extension when anything changes.

    gulp zip --zipdir /path/to/zip/directory

compresses the build folders in `dist/` into .zip files. If no `--zipdir` is specified, the .zip files will be placed in `dist/zip/`. You must run `gulp build` first, otherwise there will be no files to zip.
