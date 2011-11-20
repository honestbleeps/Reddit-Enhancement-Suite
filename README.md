For general documentation, see the RES Wiki (http://redditenhancementsuite.com:8080/wiki/index.php?title=Main\_Page), at least until the new documentation is finished.

### FIRST, a note ###

Hi there! Thanks for checking out RES on GitHub.  A few important notes:

1. RES is GPLed, which means you're technically free to do whatever you wish in terms of redistribution.  However, I ask out of courtesy that should you choose to release your own, separate distribution of RES, you please name it something else entirely. Unfortunately, I have run into problems in the past with people redistributing under the same name, and causing me tech support headaches.

2. Related: RES is not submitted to browser extension pages like the Chrome Extension Gallery, AMO, etc, because the hope/intent is to provide simultaneous releases for all four browsers at once. This isn't possible given the variable approval times in each gallery, though. I ask that you please do not submit your own RES that isn't renamed there just to get browser syncing of extensions going - because like in #1, it has caused me issues in the past. Someone decided to submit to Chrome's gallery, then I was getting tech support requests from people who were on an old (his) version and weren't getting auto updated through my distribution channel.

I can't stop you from doing any of this. I'm just asking out of courtesy because I already spend a great deal of time providing tech support and chasing down bugs, and it's much harder when people think I'm the support guy for a separate branch of code.

Thanks!

Steve Sobel
steve@honestbleeps.com

### OKAY! On to what you came to the readme for - how is this project structured? ###

- README - (YOU ARE HERE - unless you're on GitHub browsing)

- changelog.txt - self explanatory

- lib/reddit\_enhancement\_suite.user.js 
	This is the core userscript. There are hard links (which I hope github translates 
	properly, we'll see!) from each browser's own directory to this file. Note that 
	because Safari's extension builder barfs on symlinks, I had to use hard links instead.

- Chrome/
	This directory contains the following:
		- background.html - the "background page" for RES, necessary for chrome extensions
		- manifest.json - the project manifest
		- icon.png, icon48.png, icon128.png - icons!
		- jquery-1.6.4.min.js - jquery 1.6.4!
		- reddit_enhancement_suite.user.js - a hard link to ../lib, not the "actual file"...

- Opera/
	This directory contains the following:
		- index.html - the "background page" for RES, necessary for opera extensions
		- config.xml - Opera's equivalent of Chrome's manifest.json
		- logo.gif - a logo gif!
		- includes/reddit_enhancement_suite.user.js - a hard link to ../lib, not the "actual file"...

- RES.safariextension/
	NOTE: This directory must have .safariextension in the name, or Safari's extension builder pukes.
	This directory contains the following:
		- background-safari.html - the "background page" for RES, necessary for safari extensions
		- Info.plist - the project manifest
		- icon.png, icon48.png, icon128.png - icons!
		- jquery-1.6.4.min.js - jquery 1.6.4!
		- reddit_enhancement_suite.user.js - a hard link to ../lib, not the "actual file"...

- XPI/
	NOTE: An XPI is a Firefox addon... This is compiled using the Addon SDK.
	This directory contains the following:
		- lib/main.js - this is firefox's sort of "background page" for RES, like what chrome has, but just a JS file
		- data/jquery-1.6.4.min.js - jquery 1.6.4!
		- data/reddit_enhancement_suite.user.js - a hard link to ../lib, not the "actual file"...
		- doc/main.md - "documentation" file that's not currently being used.
		- README.md - "documentation" file that's not currently being used.
		- package.json - the project manifest for the Firefox addon
