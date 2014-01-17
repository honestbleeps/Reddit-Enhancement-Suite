EXISTING RES CONTRIBUTORS: Please read the "afterwords..." part of [this comment](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/451#issuecomment-23672706) and perform the necessary steps to get your repo back to normal.

For general documentation, see the RES Wiki (http://redditenhancementsuite.com:8080/wiki/), at least until the new documentation is finished.

### FIRST, a note ###

Hi there! Thanks for checking out RES on GitHub.  A few important notes:

1. RES is licensed under GPLv3, which means you're technically free to do whatever you wish in terms of redistribution.  However, I ask out of courtesy that should you choose to release your own, separate distribution of RES, you please name it something else entirely. Unfortunately, I have run into problems in the past with people redistributing under the same name, and causing me tech support headaches.

2. I ask that you please do not distribute your own binaries of RES (e.g. with bugfixes, etc).  The version numbers in RES are important references for tech support so that we can replicate bugs that users report using the same version they are, and when you distribute your own - you run the risk of polluting/confusing that.  In addition, if a user overwrites his/her extension with your distributed copy, it may not properly retain their RES settings/data depending on the developer ID used, etc.

I can't stop you from doing any of this. I'm just asking out of courtesy because I already spend a great deal of time providing tech support and chasing down bugs, and it's much harder when people think I'm the support guy for a separate branch of code.

Thanks!

Steve Sobel
steve@honestbleeps.com

### OKAY! On to what you came to the readme for - how is this project structured? ###

- README - (YOU ARE HERE - unless you're on GitHub browsing)

- changelog.txt - self explanatory

- lib/reddit\_enhancement\_suite.user.js 
	This is the core userscript. You will need to create a set of hard links from this script under each browser specific folder. Unfortunately, Github does not maintain these hard links on committing. Note that because Safari's extension builder barfs on symlinks, you must use hard links instead.

- Chrome/	This directory contains the following:
  - background.html - the "background page" for RES, necessary for chrome extensions
  - manifest.json - the project manifest
  - icon.png, icon48.png, icon128.png - icons!
  - jquery-1.6.4.min.js - jquery 1.6.4!
  - reddit_enhancement_suite.user.js - a hard link to ../lib


- Opera/	This directory contains the following:
  - index.html - the "background page" for RES, necessary for opera extensions
  - config.xml - Opera's equivalent of Chrome's manifest.json
  - logo.gif - a logo gif!
  - includes/reddit_enhancement_suite.user.js - a hard link to ../lib


- RES.safariextension/	NOTE: This directory must have .safariextension in the name, or Safari's extension builder pukes.
	This directory contains the following:
  - background-safari.html - the "background page" for RES, necessary for safari extensions
  - Info.plist - the project manifest
  - icon.png, icon48.png, icon128.png - icons!
  - jquery-1.6.4.min.js - jquery 1.6.4!
  - reddit_enhancement_suite.user.js - a hard link to ../lib


- XPI/	NOTE: An XPI is a Firefox addon... This is compiled using the Addon SDK.
	This directory contains the following:

  - lib/main.js - this is Firefox's sort of "background page" for RES, like what Chrome has, but just a JS file

  - data/jquery-1.6.4.min.js - jquery 1.6.4!

  - data/reddit_enhancement_suite.user.js - a hard link to ../lib

  - doc/main.md - "documentation" file that's not currently being used.

  - README.md - "documentation" file that's not currently being used.

  - package.json - the project manifest for the Firefox addon

### Building development versions of the extension ###

One thing to note is that if you switch branches this will break your hard links. Therefore, you must create them when checking out new pieces of code.

**Chrome**
  1. Go to ``Settings->Extensions`` and tick the ``Developer Mode`` checkbox
  2. Choose ``Load unpacked extension`` and point it to the ``Chrome`` folder. Make sure you have created the hard link to ``lib/reddit_enhancement_suite.js`` before doing this. Make sure you only have one RES version running at a time.
  3. Any time you make changes to the script you must go back to the ``Settings->Extensions`` page and ``Reload`` the extension.

**Firefox**
  1. Download the addon SDK from [here](https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip).
  2. Start a terminal and source the python script so that you can run the ``cfx`` commands. In Unix this is usually ``. bin/activate`` or ``source bin/activate`` and in Windows this usually involves running ``Scripts/activate.bat``. If your python is python 3, run ``virtualenv --python=pyhton2 .`` and try again.
  3. In the terminal, ``cd`` to the ``XPI`` folder and run the command ``cfx run``, which should launch a new Firefox browser using a temporary profile with only RES installed. Make sure you have create the hard link to ``lib/reddit_enhancement_suite.js`` before doing this.

**Safari (assumes Mac)**
  1. Open the ``Preferences`` by going to ``Safari->Preferences`` or pressing ``⌘,``, then go to ``Advanced`` and check the checkbox for ``Show develop menu in menu bar``. 
  2. Navigate to ``Develop->Show Extension Builder`` to open the extensions menu. Add a new extension by pressing the ``+`` in the bottom left and choosing ``Add extension``.
  3. Navigate to the ``RES.safariextension`` folder for RES and select it. Make sure you have created the hard link to ``lib/reddit_enhancement_suite.js`` before doing this.
  4. It will likely say you cannot install it becase no Safari development certificate exists. You will need to visit the [Safari Dev Center](https://developer.apple.com/devcenter/safari/index.action) and create an account (right hand side).
  5. You then need to visit the [Safari Developer Program](https://developer.apple.com/programs/safari/) site and sign up for a FREE account.
  6. You can then visit your member page and use the certificate utility to create a new Safari Developer Certificate. Follow the instructions to install the certificate. If you have an error involving it being signed by an unknown authority, then doubleclick the certificate and under the ``Trust`` setting choose ``Always Trust``. You should then be able to install the extension from the ``Extension Builder`` menu.

**Opera**
  1. Click ``Tools->Extensions->Manage Extensions``
  2. Drag the ``config.xml`` file in the ``Opera`` directory in to the extensions window and release. You should now have installed the extension. Make sure you have created the hard link to ``lib/reddit_enhancement_suite.js`` before doing this.

### Using grunt instead of hard links ###

If you prefer RES can also be built using [grunt](http://gruntjs.com/). In order to use grunt you will need to have [node.js](http://nodejs.org/) installed on your system.

If you have never used grunt before:

1. Run `npm install -g grunt-cli` to install the grunt task runner.
2. Navigate to the RES directory in a console and run `npm install` to install all other dependencies.

Once done you can build the extension by running `grunt`. 

For developing, run grunt followed by the name of the browser you wish to develop on. For example `grunt chrome` for Chrome or `grunt firefox` for Firefox. Once run grunt will start a watch task which will instantly reflect any changes made in the /lib directory over to the given browser's extension folder. You will need to stop and start grunt if you add any additional files.

To load the extension in to your browser see the "Building development versions of the extension" documentation above. 
