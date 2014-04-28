# Reddit Enhancement Suite

Reddit Enhancement Suite (RES) is a suite of modules that enhance your Reddit browsing experience.

For general documentation, visit the [Reddit Enhancement Suite Wiki](http://redditenhancementsuite.com:8080/wiki/).

### Introduction

Hi there! Thanks for checking out RES on GitHub. A few important notes:

1. RES is licensed under GPLv3, which means you're technically free to do whatever you wish in terms of redistribution. However, I ask out of courtesy that should you choose to release your own, separate distribution of RES, you please name it something else entirely. Unfortunately, I have run into problems in the past with people redistributing under the same name, and causing me tech support headaches.

2. I ask that you please do not distribute your own binaries of RES (e.g. with bugfixes, etc). The version numbers in RES are important references for tech support so that we can replicate bugs that users report using the same version they are, and when you distribute your own - you run the risk of polluting/confusing that. In addition, if a user overwrites his/her extension with your distributed copy, it may not properly retain their RES settings/data depending on the developer ID used, etc.

I can't stop you from doing any of this. I'm just asking out of courtesy because I already spend a great deal of time providing tech support and chasing down bugs, and it's much harder when people think I'm the support guy for a separate branch of code.

Thanks!

Steve Sobel
steve@honestbleeps.com

## Project structure

In order to build the extension, the files from `lib/` must be replicated (either via hard-links or grunt) into the relevant browser directory.

##### Top level files & folders

  - `README.md` – YOU ARE HERE, unless you're browing on GitHub
  - `changelog.txt` – self-explanatory
  - `makelinks.sh` – script to generate hard links
  - `Gruntfile.js`, `package.json` – used for alternative build scripts
  - `lib/` – core RES code
  - `lib/modules/` – RES modules
  - `Chrome/` – Chrome-specific RES files
  - `Opera/` – Opera-specific RES files
  - `OperaBlink/` – Opera Blink (new Opera)-specific RES files
  - `RES.safariextension/` – Safari-specific RES files
  - `XPI/` – Firefox-specific RES files
  - `IE/` – Internet Explorer-specific files
  - `tests/` – RES tests, currently unused

##### Chrome files

  - `background.js` – the "background page" for RES, necessary for chrome extensions
  - `manifest.json` – the project manifest
  - `icon.png`, `icon48.png`, `icon128.png` – icons!
  - `jquery-1.10.2.min.map` – Chrome moans if this file doesn't exist

##### Opera files

  - `index.html` – the "background page" for RES, necessary for opera extensions
  - `config.xml` – Opera's equivalent of Chrome's `manifest.json`
  - `logo.gif` – a logo gif!

##### Safari files (RES.safariextension)
NOTE: This directory must have `.safariextension` in the name, or Safari's extension builder pukes.

  - `background-safari.html` – the "background page" for RES, necessary for safari extensions
  - `Info.plist` – the project manifest
  - `icon.png`, `icon48.png`, `icon128.png` – icons!

##### Firefox files (XPI)
NOTE: An XPI is a Firefox add-on, which is compiled using the [Add-on SDK](https://developer.mozilla.org/en-US/Add-ons/SDK).

  - `lib/main.js` – this is Firefox's sort of "background page" for RES, like what Chrome has, but just a JS file
  - `package.json` – the project manifest for the Firefox add-on

##### OperaBlink files

  - `background.js` – the "background page" for RES, necessary for chrome extensions
  - `manifest.json` – the project manifest
  - `icon.png`, `icon48.png`, `icon128.png` – icons!

## Building development versions of the extension

In order to build a development version of RES, run `makelinks.sh` to generate hard links into `lib/` from the browser-specific folders. (This is [necessary on Chrome](https://code.google.com/p/chromium/issues/detail?id=27185).) NOTE: switching branches will break hard links, so you will need to rerun `makelinks.sh` whenever you check out new code.

An alternative grunt build script is also provided; see "Using grunt instead of hard links" for more details.

##### Building in Chrome

  1. Go to `Menu->Tools->Extensions` and tick the `Developer Mode` checkbox
  2. Choose `Load unpacked extension` and point it to the `Chrome` folder. Make sure you only have one RES version running at a time.
  3. Any time you make changes to the script, you must go back to the `Menu->Tools->Extensions` page and `Reload` the extension.

##### Building in Firefox

  1. [Download the Add-on SDK](https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip).
  2. Start a terminal and source the Python script so that you can run the `cfx` commands. In Unix this is usually `. bin/activate` or `source bin/activate` and in Windows this usually involves running `bin/activate.bat`. If you are not using Python 2, run `virtualenv --python=python2 .` and try again.
  3. In the terminal, `cd` to the `XPI` folder and run the command `cfx run`, which should launch a new Firefox browser using a temporary profile with only RES installed.

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

### Using grunt instead of hard links

RES can also be built using [grunt](http://gruntjs.com/). In order to use grunt, you will need to have [node.js](http://nodejs.org/) installed on your system.

If you have never used grunt before:

1. Run `npm install -g grunt-cli` to install the grunt task runner.
2. Navigate to the RES directory in a console and run `npm install` to install all other dependencies.

Once done, you can build the extension by running `grunt`.

For developing, run `grunt` followed by the name of the browser you wish to develop on, such as `grunt chrome` for Chrome or `grunt firefox` for Firefox. Once run, grunt will start a watch task which will instantly copy any changes made in the `lib/` directory over to the given browser's extension folder. You will need to stop and start grunt if you add any additional files.

To load the extension into your browser, see the "Building development versions of the extension" section above.
