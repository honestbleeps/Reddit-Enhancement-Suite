# Changelog

## [v4.6.1](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/v4.6.1)

Highlights:

- Fixed automatic scrolling issues -- Selected Entry can be turned back on!
- Added several new sites for expandos
- Moved "CSS hotfix" stylesheet from reddit.com to redditenhancementsuite.com[^*](https://www.reddit.com/r/Enhancement/wiki/about/privacy#wiki_external_assets "Potential privacy concern")
- Fixed various issues with filteReddit

### New Features and Enhancements

- [Quick navigation in RES Settings](https://www.reddit.com/#!settings/about) ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2773) @andytuba)
- New media hosts
	- Oddshot.tv ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2652) @nicememe)
	- LiveCap.tv ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2670) @gapipro)
	- Miiverse ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2440) @sfoop)
	- coub ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2539) @igorgladkoborodov)
	- qwip.it ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2594) @grafixoner)
	- swirl.xyz ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2483) @klpl, @zjaved)
	- uploadly (([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2491) @Cervenka)
	- eroshare ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2491) @Cervenka)
	- iloopit.net ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2494) @rapkin)
	- pornbot.net ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2272) Brad Mills @pornbotnet)
	- Use reddit's streamable expando on post listings ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/3b3077c7eae91c61249d53f2b9ea36e11da988c2) @githue)
- Added favicons for media hosts below expandos on post listings (thanks @andytuba)
- Added "legacy" scrolling style for keyboard nav (thanks @erikdesjardins)
- Changed "need to save settings" indicator to colorblind-friendly white (thanks @andytuba)
- Stylesheet Loader can load external stylesheets, RESUpdates.css moved to cdn.redditenhancmeentsuite.com (thanks @andytuba)
- /r/RESAnnouncements notifications are a little more ~~obnoxious~~ obvious (thanks @andytuba)
- "Use subreddit stylesheet" checkbox can be styled more easily by moderators and does not appear on top of other UI elements ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2768) @andytuba)
- [Presets module](https://www.reddit.com/#!settings/presets) easier to find and safer to use (thanks @andytuba)

### Bug Fixes
- filteReddit
	- Fix filters which apply to certain subreddits ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/53b9019784475f5a5ec6414b689ef8bc92405e95) @honestbleeps)
	- Fix custom filtering by [title](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/798ab78b54820a6b0bf1e7ec6f6adcc443489d17), by [score](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/b55e3476b9af5c5e5b907442cc3b041f61111c48), and [when no score is available](https://github.com/honestbleeps/Reddit-Enhancement-Suite/issues/2721) (thanks @erikdesjardins, @andytuba)
- Nightmode
	- Removed filters from post thumbnails and expando buttons so subreddit moderators can style them ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/b54d50e59a3b0bcfa0eb2d08113250abdba0a58f) @githue)
	- Fixed nightmode on report form and rules page ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/3408c7b45ffa450513dd375a4c4fcd3808297505) @githue)
	- Fixed sidebar toggles white background (thanks @andytuba)
- Never Ending Reddit
	- Fixed on modlog and comments pages (thanks @erikdesjardins)
	- Removed jumping to page 2 or deeper after switching accounts ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/8892044bca9174b6aba39436b141df38faf493f4) @andytuba)
	- Improved conserveMemory ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2767) @erikdesjardins)
- Show Media
	- Fix gfycat control panel ordering ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/e6425f55381c43c2ab118241234ccda879cc7caa) @githue)
	- Fix images linking to albums ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/ae7fb99aa9128b3085a755a0e8dac1e4b6939e48) @erikdesjardins)
	- Show images on page 2 of "saved" links (thanks @erikdesjardins)
- Upgraded /r/Dashboard search widget for new reddit search layout ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/8dc57d1a2b399dd7c5b99a4c050b98cb48d30840) @matheod)
- Styling
	- Fix subreddit shortcut drawers from extending below viewport ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/a8eba3b9f4e4bae8b258baae1958b5e406a16edc) @githue)
	- Fix unnecessary scrollbars on new comments ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/3651dd4518c84a674f88e0e3868cb8c5d7d54162) @githue)
	- Fix comments showing on top of sidebar ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2676) @githue)
	- Fix notifications hidden behind setting console ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/18026577e50e1d2a226c87ae78c6199cedb8c83a) @andytuba)
- Selected Entry/Keyboard Nav
	- fix automatically scrolling on pageload annoyingly (thanks @andytuba)
	- fix navigating from posts to comments and inside inbox and a variety of broken keyboard shortcuts (thanks @erikdesjardins, @andytuba)
	- fixed expandoss crolling the page awkwardly ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/84ed23f792f82de8eaee4c50170f8b231f3da7e9) @andyuba)
	- Fix "open link" from keyboard nav not opening in the same tab per options ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2764) @13steinj)
- Fix User Info appearing when module disabled (thanks @andytuba)
- Fixed new comment count for Japanese readers (thanks @kusotool)
- Fixed vote weight being attributed to wrong author when voting from inbox or comments listings ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/7eac310848f6e3c1cd1ca25367ca87ba69689b36) @andytuba)
- Fixed Stylesheet Loader loading stylesheets outside selected "only on..." subreddits
- Don't run RES on .json pages ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/371da40a065deda890fc782ea9c184707b9619c2) @andytuba)
- Fix [l=c] Single Click Opener from opening two comments pages for posts with non-Latin titles ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/pull/2682) @kusotool, @andytuba)
- Fix "back to top" arrow not appearing in Firefox 45 ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/defdd75) @andytuba)

### Housekeeping / Other

- Converted changelog to Markdown (thanks @Ajedi32)
- Upgrade firing events to outside extensions ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/73f414f19f657477548ce870e532f34780fd7d8a) @LordWingZero)
- "New messages" event fired to [other extensions](/r/InboxRevamp) ([thanks](https://github.com/honestbleeps/Reddit-Enhancement-Suite/commit/bb2a85c417edc473164856d505432eb64a69a5e3) @andytuba)



## [v4.6.0](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.6.0)

### New Features and Enhancements

- New Modules
	- Added "Orangered" module, for managing and syncing unread notifications (locally). Does not replace reddit message notifiers. (thanks @andytuba)
	- Added dropdown menu to envelope (notification) button linking to various parts of inbox (thanks @andytuba)
	- Added global spoiler tag module. Currently only works on user profiles. Any markdown pointing to /spoiler, #spoiler, /s or #s will be hidden. Hovering shows the text (thanks @SirCmpwn and @andytuba)
	- Added stylesheet module - load stylesheets from existing subreddits or arbitrary CSS on specific pages (big thanks @andytuba, thanks @erikdesjardins)
	- Added Backup & Restore module - manually backup your RES settings (thanks @thybag)
	- ...and a few more due to breaking up and refactoring existing modules
- filteReddit enhancements
	- Added custom filters to filteReddit module (big thanks @gamefreak)
	- Extended subreddit filter to everywhere by default, with an option to go back to /r/all and /domain (thanks @allewun and @andytuba)
- Header / Userbar enhancements
	- Added custom toggles to RES dropdown menu, particularly for turning custom-loaded subreddit stylesheets on/off (thanks @andytuba)
	- Added a back to top button (thanks @andytuba)
	- Added gold icon to accounts listed in Account Switcher dropdown menu (thanks @coreyja)
	- Added a "New RES announcement" notification in RES dropdown menu (thanks @andytuba)
	- Added a subreddit manager option for lowercase/mixed-case shortcuts in top bar (thanks @andytuba)
		- Added a subreddit manager option to use different/same set of shortcuts for different accounts (thanks @andytuba)
		- Added a dropdown to the inbox icon for sending messages and quickly navigating to inbox sections (thanks @andytuba)
		- Added option for reddit logo to link to /r/Dashboard (thanks @cathcart)
- Settings Console enhancements
	- Added serious gussying-up, usability, and nightmode styling improvements to settings console (thanks @githue a lot, also @andytuba and @gamefreak)
	- Added new settings presets - one button press to apply different presets to RES settings. (thanks @andytuba)
	- Added a prompt before abandoning changes to settings options you haven't saved (thanks @andytuba)
- Quick Message enhancements
	- Added the ability to send messages from subreddits you moderate (thanks @erikdesjardins)
	- Added options to automatically select a user or subreddit to send from (thanks @erikdesjardins)
	- Added the option to automatically add the page link/comment link when opening quickMessage (thanks @andytuba and @erikdesjardins)
	- Can now handle arbitrary reddit.com/message/compose links in the content and sidebar (thanks @erikdesjardins)
	- Message Menu dropdown menu for quick access to various parts of inbox (thanks @andytuba)
- New Expandos (Inline Image Viewer)
	- steamusercontent.com (thanks @JonBons)
	- futurism.co (thanks @mverderese)
	- pastebin.com, gist.github.com (thanks @erikdesjardins)
	- drscdn.500px.org (thanks @erikdesjardins, @andytuba) ^(not full 500px support, only direct links)
	- Microsoft OneDrive (thanks @sgtfrankieboy and @andytuba)
	- oddshot.tv (thanks @sgtfrankieboy and @nicememe)
	- Support for some imgur subdomains (stack.imgur, yahoo.imgur) (thanks @andytuba)
- Misc enhancements
	- Added repost warning on submit page (thanks @erikdesjardins and @andytuba) ^(Attempts to determine via search whether the link on the "submit a post" page has already been submitted to the current subreddit. Not 100% accurate.)
	- Tabs to visually segregate subreddits/filters/help on new search page (thanks @githue)
	- Subreddit Info now shows when hovering over trending subreddit listings (thanks @andytuba)
	- Improved readability/clickability on subreddit shortcut dropdown (thanks @githue)
	- Added the ability to customize keyboard shortcuts for comment tools (bold, italic, etc.) (thanks @erikdesjardins)
	- Added options to show full timestamps by default (thanks @erikdesjardins)
		- Added the number of children to "show child comments" (thanks @erikdesjardins)
		- Improved image/gif/video expando buttons (thanks @githue)
		- Highlight expando buttons of NSFW posts (thanks @andytuba, @githue)
		- Added option to change case of post titles (thanks @andytuba)
		- Command line "/r" to navigate to rising posts (thanks @erikdesjardins)
		- Split "move up/down" keyboard shortcuts into seperate keys for comments and link lists (thanks @andytuba)
		- Added option to automatically use the old search page (thanks @andytuba)
		- Increased /r/dashboard height capacity (thanks @erikdesjardins)
		- Added warnings to reload other tabs after switching accounts (thanks @andytuba)
		- Admin/mod/friend/OP highlighting overrides improved (thanks @githue)
		- Added .RES-keyNav-activeThing class to "currently selected thing" (not just the element, but all its children) (thanks @githue)

### Bug Fixes

- Vote weight tracking (RES tracking upvotes/downvotes you give to each user) works again (thanks @matheod)
- Updated styling of certain elements and pages in nightmode (code blocks, quotes, etc..) to work with reddit's new markdown. (thanks @gavin19)
- Updated nightmode styling for lots of things, including reddit's new search layout (thanks @githue)
- rts and save-RES buttons and some other things should now work with newly loaded comments (thanks @erikdesjardins)
- Fixed beta flask covering username (thanks @githue)
- Username Hider hides username with correct displayText in header and taglines (thanks @erikdesjardins)
- Username Highlighter adds colored background to hidden (usernameHider) usernames (e.g. OP, mod, admin, etc.) (thanks @erikdesjardins)
- New tabs will open in the foreground/background according to browser preference now. (Used to only open in background) (thanks @mc10)
- Fixed Modmail keyboard shortcut not being able to be customized (thanks @erikdesjardins)
- Changed: some expando types which used to rewrite the post URL no longer do so (thanks @erikdesjardins)
- Fixed subreddit detection with /r/keys for post title tagging and hover info (thanks @jsayol)
- Fixed quickMessage not respecting usernameHider (thanks @erikdesjardins)
- Fixed albums switching back to image 1 when scrolling and getting weird aspect ratios (thanks @erikdesjardins)
- Fixed tumblr photo captions not showing for single-image posts (thanks @andytuba)
- Fixed logging in using account switcher in Opera Blink (thanks @mryanmurphy)
- Fixed account switcher not closing properly sometimes (thanks @Shraymonks)
- Fixed multiple entries for the same subreddit appearing in "My subreddits" dropdown (thanks @andytuba)
- Fixed comment box disappearing because pushed below sidebar (thanks @githue)
- Fixed RES running on reddit toolbar pages (thanks @andytuba)
- Fixed nightmode styling on login popup (thanks @yangzihe)
- Fixed sorting by usernames in dashboard (thanks @githue, @andytuba)
- Fixed wrong account age near first of the month in user info hover popup (thanks @yangzihe)
- Fixed friend button and loading icon on user info popup (thanks @githue)
- Fixed NoParticipation EscapeNP on links starting with "/" (thanks @andytuba, @mc10)
- Fixed duplicate expando buttons - RES will now simply replace reddit's expando if it exists (thanks @andytuba)
- Stop the Never Ending Reddit progress indicator from being pushed below the sidebar (thanks @erikdesjardins)
- Fixed quickMessage messages getting truncated (thanks @erikdesjardins)
- Fixed shift-L ("View link and comments in new background tabs") not opening in background tabs (thanks @erikdesjardins)
- Fixed some characters not being unescaped in comment source (thanks @erikdesjardins)
- Fixed fadeSpeed options having behavior opposite of their description (thanks @erikdesjardins)
- Fixed some user tags being unreadable in nightmode and superscript (thanks @erikdesjardins)
- Fixed pinned header from jumping late after pageload (thanks @Shraymonks)
- Fixed defaultContext option not applying to profile pages (thanks @thybag)
- Fixed new comment count not working in Japanese (thanks @svjharris)
- Fixed NSFW stamp not being red in nightmode (thanks @igglyboo)
- Fixed some misc nightmode issues (thanks @mc10)

### Housekeeping / Other

- Updated various icons and buttons to use a flat look (thanks @erikdesjardins, @githue)
- Tidied up galeryimage gallery text and controls (thanks @githue)
- Consolidated and improved button and toggle button styling (thanks @githue)
- Improved styling and usability of pop-up notifications, hover info, dropdown menus, bunches of things (thanks @githue)
- Made the new announcement notification on the RES Gear Icon stand out a bit more (thanks @erikdesjardins)
- Moved uncheckSendReplies from betteReddit to submitHelper
- Default macros are now editable - Look of Disapproval removed from default macro list
- {{reply_to}} placeholder gets parent comment's author, not current username (thanks @erikdesjardins)
- Cleaned up accountSwitcher menu and error code (thanks @andytuba)
- Console fixes (thanks @matheod)
- Add less verbose versions of RESStorage commands in console (thanks @andytuba)
- Remove (non-functional) autocomplete from console (thanks @gmcclure382)
- Fewer ajax calls to check for moderated subreddits (thanks @JordanMilne, @andytuba)
- Fewer ajax calls for subreddit info (thanks @githue, @andytuba)
- Update jQuery and guiders.js (thanks @mc10)
- Update favico.js (thanks @benwa)
- Refactored showImages.js - All hosts now have their own file, allowing for easier fixing and creation of expando supporting hosts. (thanks @andytuba @erikdesjardins and more)
- Remove MediaCrush host (now defunct)
- Factor out Twitter support from the core files (thanks @andytuba and @erikdesjardins)
- Greatly refactored KeyboardNav (thanks @andytuba)
- Some RES added elements (such as keyboardNav numbers and usertags) will no longer get copied when you select text (thanks @arresteddevelopment)
- Removed toolbarFix since reddit toolbar is gone (thanks @andytuba)
- Major refactor of init process (big thanks @andytuba)
- Cleaned up gulp (thanks @mc10)
- Refactored gulp a bit (thanks @andytuba)
- Refactored gulp a *lot* (thanks @erikdesjardins)
- Bugfixes to gulp scripts (thanks @danieljl)
- Update and maintain readme (thanks @allthefoxes and @mc10)
- Cleanup and linting of many modules (big thanks @mc10, thanks @andytuba, @erikdesjardins, others)
- Automatic linting of pull requests (Travis CI) (thanks @mc10)
- Other miscellaneous refactoring
- Big thanks to @allthefoxes and others for maintaining this changelog.
- A [few](http://i.imgur.com/s4XgqRN.png) [typo](http://i.imgur.com/1oTVuEX.png) [commits](http://i.imgur.com/DC6svMP.png) [as](http://i.imgur.com/H5TJPnD.png) [always](http://i.imgur.com/yGrByoR.png) - [and](http://i.imgur.com/FkfNwcc.png) [these](http://i.imgur.com/PJSJCru.png) too.

## [v4.5.4](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.5.4)

### Bug Fixes

- New search layout supports image/media expandos, Never-Ending Reddit for post listings, keyboard navigation, user tagging, user/subreddit info pop-ups (thanks @andytuba)
- Hide broken "hide options" on new search layout (thanks @githue)
- Hover pop-ups popping after mousing off the trigger element before the hover delay ends (thanks @erikdesjardins)
- Never-Ending Reddit "loading next page" stays the same height instead of bumping the page around (thanks @erikdesjardins)
- nightmode fixups (thanks @gavin19 and @andytuba)
- Fixed filteReddit filtering every post because of unlessKeyword entries, and cleaned out old "undefined" unlessKeywords (thanks @andytuba)
- fixed enter key submitting comment/post prematurely (thanks @andytuba)
- fixed "hide" posts not hiding posts (thanks @erikdesjardins)

### Other

- Housekeeping (thanks @creesch)
- "submit an issue" wizard text re-ordered to ask user questions upfront and provide specific suggestions for troubleshooting info (thanks @andytuba)
- 4.5.3 changelog and hugs added to repo (thanks @KamranMackey)

## [v4.5.3](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.5.3)

### New Features and Enhancements

- "Quick Message" popup from user info popup "message" button or command line "qm" (thanks @erikdesjardins and @andytuba)
- regexp support in some filteReddit options (thanks @andytuba)
- Added an option to show an images original resolution in a tooltip to showImages module (Thanks @erikdesjardins !)
- Username Hider allows different display text / replacements for specific usernames and hide all Account Switcher usernames (thanks @erikdesjardins and @andytuba)
- Command line "sw" (account switcher) autocompletes usernames (thanks @andytuba)
- Option to make "edited time" bolder (thanks /u/erikdesjardins)
- Improved layout of RES settings console search results and share text (thanks /u/erikdesjardins and /u/andytuba)
- Made fade animations a buttery smooth 60fps (Thanks /u/bfred-it)
- escapeNP doesn't affect np.reddit.com links inside posts, comments, wiki, sidebar, or other snudown/markdown regions (thanks /u/andytuba)
- comment tools (formatting, macros) on modqueue pages (thanks /u/erikdesjardins)
- hide username in user info hover popup when using Username Hider (thanks @mc10)
- keyboard shortcut to save post/comment/wiki page: Ctrl+Enter or Cmd+Enter (thanks @jtymes!)
- keyboard shortcuts for links, superscripts, blockquotes in post/comment/wiki (thanks @erikdesjardins)
- option to move to next comment after voting on a comment with keyboard nav (thanks @erikdesjardins )
- keyboard shortcut for saving comments with reddit (thanks @erikdesjardins)
- comment formatting tools on modqueue pages (thanks @erikdesjardins and @andytuba)
- comment formatting tools on banned page (thanks /u/Walter_Bishop_PhD)
- options to not filter on modqueue (don't filter by default) and userpages (filter by default) (thanks @erikdesjardins)
- only show "filteReddit filtered a bunch of notifications" notification if a certain percentage (>= 80%) of posts per page are filtered (thanks @andytuba)
- editing subreddit sidebar shows preview in the sidebar (thanks /u/Walter_Bishop_PhD)
- Lots of nightmode cleanup (thanks @gavin19)
- deviantART text expando preview (thanks @erikdesjardins)
- Streamable.com expando support (thanks @petrosian)
- Multiple links in user tag (space-separated) (thanks @erikdesjardins)
- add "rising" support to dashboard (thanks @honestbleeps)

### Bug fixes

- several efficiency adds behind the scenes (thanks @honestbleeps)
- fix account switcher "must click twice" (thanks @erikdesjardins, @andytuba)
- keep user info hover popup showing when hovering over hidden username (thanks @mc10)
- Imgur expando's download button actually downloads now! (Thanks /u/markekraus!)
- Expando buttons now display after links in messages (Thanks /u/erikdesjardins!)
- Fixed the readme (Thanks /u/erikdesjardins and more)
- Fixed errors showing in hover modules (thanks /u/honestbleeps)
- Fix whitelisting subreddits from NSFW filter (Did not work before) (Thanks /u/erikdesjardins)
- Fix NSFW filter not working on saved comments (Thanks /u/erikdesjardins)
- Fix gifyoutube controls (Thanks /u/markekraus)
- Fix imgur.com/r/... link expandos (thanks /u/CelestialWalrus)
- (Sorta) fixed opening/closing a gifv expando REALLY fast makes it not take height (Thanks /u/diogorolo)
- gifv extra expando button hidden (thanks @Shraymonks)
- fixed "reply" box getting pushed below sidebar (thanks @erikdesjardins )
- Fixed alignment issues on image fallback when videos fail to load (Thanks /u/markekraus)
- Fixed search buttons and turned them off by default (Reddit now has a built in search button) (Thanks /u/mc10!)
- Fixed "open link in new tab" sometimes not making an absolute URL (Thanks /u/markekraus and /u/andytuba)
- fixed "#!settings/module/options with spaces" links not opening directly to option (thanks /u/andytuba)
- fixed big editor opening when pressing enter on post submit page (thanks @mc10 and @Igglyboo)
- use comments page link instead of post link for user tag link when creating user tag (thanks @erikdesjardins)
- show last image on URLs like http://imgur.com/123abc,456bca (thanks @erikdesjardins)
- fix userbar hider overlapping language preference on login page (thanks @erikdesjardins and @andytuba)
- preserve whitespace and embedded HTML at beginning of source (thanks @erikdesjardins)
- nightmode fixes for post report messages (thanks @TravisMarx and @gavin19, honorable mention to @TravisMarx)
- nightmode fixes for report reasons, .gold-accent and "you paid for X server time" info boxes (thanks @TravisMarx and @andytuba)
- optional colored separate bar between top-level comments (thanks @ribolzisalvador and @andytuba)
- new_markdown_style nightmode fixes (thanks @mc10 and @gavin19)
- search subreddit by flair when clicking on flair (thanks @erikdesjardins)
- don't show "Use subreddit style" checkbox on top of reddit cover overlays (thanks @erikdesjardins)

### Housekeeping

- Major command line refactoring (Thanks /u/andytuba)
- Options list subtypes infrastructure, listType: subreddit (thanks /u/andytuba)
- Options description proofreading (thanks /u/erikdesjardins)
- Updated changelog in Git repo (thanks @allthefoxes)
- Optimization!
	- Typo fixing!
	- General janitoring!
	- And a few hugs too!


## [v4.5.2](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.5.2)

### New features

- new expando button image for "html5 gif" (silent videos) / gifv (thanks @erikdesjardins)
- imgur gifv support; load gifv instead of gif (thanks @honestbleeps)
- gifyoutube support (thanks @honestbleeps)
- show gfycat on "view all images" (if silent) (thanks @honestbleeps)
- added /r/random keyboard shortcut (g,alt+y) (thanks @kwakie, @andytuba)
- for large albums, use the prev/next "slideshow" view even if loadAllInAlbum is enabled (thanks @andytuba)
- added "Reddit Classic" orangered/periwinkle comment score coloring (thanks @erikdesjardins)

### Bug fixes

- show save-RES button on comments which are initially collapsed (thanks @andytuba)
- better support for /r/subreddit/comments listings, particularly vote colors (Thanks @honestbleeps)
- better support for reddit.com/comments/12345 comments page (no subreddit) (thanks @honestbleeps)
- better support for reddit's upcoming native functionality for "full comments" and "unread messages" (thanks @honestbleeps)
- only use https imgur if using https reddit (thanks @honestbleeps)
- SSL support for account switcher (thanks @calvinli)
- fixed neverendingreddit pause button across pageloads (thanks @honestbleeps)
- opera12 bugfix to keep usertagger (and other modules) from breaking (thanks @andytuba)
- added a delay to the subreddit shortcut edit/delete button dropdown (thanks @andytuba)
- fixed Never-Ending Reddit not loading p2+ if betteReddit was disabled but showUnreadFavicon was enabled
- always show Comment Navigator when navigating comments, instead of breaking when using keyboard shortcuts when Comment Nav is closed (thanks @andytuba)
- fixed "comment navigator" not jumping to the next comment consistently when pinHeader is enabled (@thanks honestbleeps)
- allow shift-click on subreddit shortcuts (thanks @mc10)
- support subreddit shortcuts like sub1/about/messages+sub2/new (thanks @andytuba)
- fix labeling imgur gifs as .gif to fix convertGifToGfycat and other similar extensions (thanks @honestbleeps)
- tweaked NP message for subreddit subscribers (thanks @andytuba)
- tweaked /r/RESissues+Enhancement/submit text for readability (thanks @mc10 and @andytuba)
- improve post rank number size/truncating (thanks @calvinli @andytuba)
- fixed subreddit stylesheets not re-appearing when using https reddit (thanks @honestbleeps)
- nightmode css cleanup (thanks @erikdesjardins, @gavin19)
- fix centering on "loading image" throbber (thanks /u/andrey_shipilov / @tezro)
- removed opaque backgrounds on nightmode arrows (thanks @erikdesjardins)
- revert "last edited" to relative time after mouse off (thanks @andytuba)
- janitoring (thanks @erikdesjardins, @mc10, @darkstar21)
- ... and as always, various code cleanup and other minor fixes / performance enhancements.


## [v4.5.1](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.5.1)

### New features

- Added full HTTPS support now that reddit supports it
- Switched out a lot of RES image resources to use HTTPS now that it's fully supported
- Added HTTPS support for imgur and some other image hosts -- note: not all image hosts support it, you will sometimes see "mixed content" warnings because of this.
- Changed default behavior of post / comment score highlighting (turned off)
- Handy-dandy edit/delete buttons on subreddit shortcuts (thanks @andytuba)
- Added an option to hide formatting tools on comment preview (bold, italic, etc) (thanks @andytuba)
- Updated on/off toggles to be more colorblind friendly (thanks @andytuba)
- Comment navigator now tracks scroll position and updates as you move through the page
- Keyboard navigation commands added for comment navigator (N to toggle, shift-up/down to navigate)
- Updates to redditbooru support (thanks @dxprog)
- Apply filters to multireddits (thanks @Dashed)
- Expandos for 500px.org (thanks @Melraidin)
- Sort tables in posts, comments, sidebar, wiki by clicking on headers (thanks @danny)
- Improve night mode appearance of markdown editor (thanks @githue)
- Added loading spinner for image galleries for a better UX when changing images
- Added compatibility with Tree Style Tabs extension for Firefox (thanks @CyberShadow)
- UX tweaks to RES options search results (thanks @githue)
- Comment Tool options to hide formatting tools (thanks @andytuba)
- Make settings console openable from NP module (thanks @andytuba)
- Changed how autoplay works for MediaCrush videos (thanks @SirCmpwn)
- Removed bitcointip module as the bitcointip service is retired
- Added a tips/tricks box to subreddit style editing page for moderators to help guide them toward help dealing with styling for RES
- Add support for Giphy.com (thanks @alexchung)
- Added a subreddit style toggle box to the toolbar for Firefox - now present in Chrome, Firefox and Opera - no more suffering from pesky moderators who hide it!

### Bug fixes

- MediaCrush and gfycat expandos fixed
- MediaCrush elements no longer open when "view images" is clicked as they may be video
- Fixed navigate by IAmA, broken by a reddit change
- Fixed navigate by popular feature of comment navigator, also broken by a reddit change (thanks @andytuba)
- Fixed a bug where converted gfycat images would overlap content
- Fix comma-separated imgur "album" links (thanks @isstabb)
- Fix tumblr and other remote text posts that contain iframes
- RES command line console fixed in Firefox
- More reliable CSS toggle in toolbar (Chrome and Opera 15+ only)
- Restore original text when mouse leaves timestamps
- Fix occasionally broken whitelisting of subreddit stylesheets in night mode
- Auto-sort vote score user coloration
- Mark gifs as visited with showImages convertGifsToGfycat option enabled (thanks @wT-)
- Fixed a bug where the 'save' button on a dashboard widget got scrolled off screen when creating a very large widget
- fixed a subreddit tagger case sensitivity bug where some subs would not get tagged (thanks @gavin19)
- Fixed a bug where expanded images would cover the user tagger form
- Fixed a bug that caused multiple 'source' buttons to be rendered
- Fixed the background color of the flair selector in night mode
- Fixed reddit's all new report form for night mode (thanks @gavin19)
- Fixed an issue with private messages from ignored users (thanks @andytuba)
- Show all RES options by default (thanks @mc10)
- Fix convertGifToGfycat causing duplicate images when users click twice (during loading) (thanks @SirCmpwn)
- Some CSS fixes for media shown on wiki pages
- Add the ability to upvote/downvote without toggle behavior (shift-A / shift-Z) (thanks @andytuba)
- ... and as always, various code cleanup and other minor fixes / performance enhancements.


## [v4.5.0.2](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.5.0.2)

### New features

- NOTE: we've changed the default setting for moving images to use ctrl-arrow keys rather than shift and arrow keys to avoid a common conflict for users (thanks in part to @squarific)
- Updated the "No Participation" module based on feedback from moderators of various subs (thanks @andytuba)
- Added an option to turn off the CSS icon in the address bar (allows you to toggle subreddit styles)
- Added a bit more helpful guidance to users reporting bugs
- Various code cleanup and triage (thanks @mc10)

### Bug fixes

- Got rid of protectRESElements option that was causing content to disappear for users with zoom on
- Fixed an issue with conserveMemory option causing page shift when scrolling past large images - if you turned this off, we recommend you re-enable it!
- Fixes to gfycat module
- Stop GIFs from resetting to first frame on mouse scroll
- Fix to giflike (thanks @mtsgrd)
- Add some more foolproof error checking to avoid problems with bad data in filteReddit
- Fix "disable animations" causing problems for some users (thanks @andytuba)
- Fix "sort comments temporaily" (thankns @matheod)


## [v4.5.0.1](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.5.0.1)

- Fixed a couple of issues with night mode coloring
- Fixed a few issues with "use subreddit stylesheet" for some users
- Various other small / emergency bug fixes


## [v4.5.0](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.5.0.0)

### New features

- Massive memory reduction (optional) for "View Images" users with Never Ending Reddit
- Preloading of albums is now off by default to save memory/bandwidth - you can turn this back on in the inline image viewer preferences if you wish
- Support for several new image and video hosts
- Support for native HTML5 audio and video formats (thanks @sgtfrankieboy)
- Fancy new comment editor buttons for visual goodness
- Add the ability to move images with shift-drag or arrow keys (thanks @gablank)
- Added support for Photobucket (thanks @mpalermo)
- Expand YouTube links in comments (work by @patricksnape, @thybag, improvements by @honestbleeps)
- Added "No Participation" module to help remind redditors to be better citizens when visiting via meta-links (thanks @andytuba)
- Added the "vote enhancement" module that provides a number of options for coloring/highlighting and enhancing vote information (thanks @matheod)
- Added "m" keyboard shortcut to modmail (g, m in "go mode")
- Automatically toggle night mode based on time (thanks @mc10)
- Subreddit sidebar search: add sort/time range dropdowns (thanks @andytuba)
- Console now uses nicer color inputs (thanks @matheod)
- Option to have the reddit logo link to /r/all (thanks @matheod)
- Option to disable CSS3 animations (thanks @andytuba)
- Option to navigate by Gilded with Comment Navigator (thanks @matheod)
- Settings console now has advanced options hidden for a simplified view (thanks @matheod)
- User tag now displayed next to "commenting as" nickname. (thanks @matheod)
- Add a link on user profile to see posts of the user from the subreddit we come from (thanks @matheod)
- Add modmail option to dashboard (thanks @matheod)
- Visually distinguish "source" textarea from "edit" (thanks @matheod)
- Added commandline command for "me" or "me/X" to navigate to your profile quickly (thanks @matheod)
- Added "Context" module that allows easy breakout to full context from deeply linked comments (thanks @matheod)
- Add "show full link flair" option that forces full link flair to be displayed instead of cut off (thanks @matheod)
- Show time until hidden scores will be revealed on hover (thanks @matheod)
- Added option to navigate by highlighted user - hover the username to highlight, then use comment navigator (thanks @matheod)
- Add a Table button to easily create and edit table in commentTools (thanks @matheod)
- Add a search widget on dashboard (thanks @matheod)
- Option to uncheck "send replies [to this submission] to my inbox" (thanks @m-xbutterfly)
- User tag link is now clickable (thanks @matheod)
- Highlight "commenting as" when posting from an alt account (thanks @matheod)
- Console now shows default value of options on hover for easy reference (thanks @matheod)
- ... and loads of other minor fixes here and there ...

### Bug fixes

- Fixed broken subreddit filters
- Allow clearing of keybindings with backspace (thanks @matheod)
- Various fixes to video autoplay related stuff (thanks @thybag, help / updates from @honestbleeps)
- Comment Navigator - changing categories repeatedly breaks navigator	(fixed
- Fixed an issue with broken imgur links loading a wrong/different image
- Fixed a problem with mediaBrowseMode behaving poorly when "view images" is clicked
- When expanding multiple video / audio expandos only the first one should now autoplay
- Fixed an issue with audio ads playing in the background via imgur (was only a bug in Safari)
- Fixed videos autoplaying on saved links/comments pages
- Fixed toolbarfix functionality to remove the reddit toolbar from sites that break it
- fix launching user tagger from command line	(thanks @andytuba)
- various useful triage (thanks @bronzle)
- Subreddit manager once again shows [+shortcut] button on reddit.com/reddits
- "source" button should not be the first button on post buttons list
- ... and DOZENS of others ...


## v4.3.2

### New features

- New "Media Browse Mode" for Keyboard Navigation - if the current expando is open, hitting j or k will close it and open the next one automatically!
- HTML5 videos (MediaCrush, gfycat, fitbamob) can be clicked+dragged to resize
- HTML5 videos now have a prettier UI (thanks @MediaCrush, @joey5755 / gfycat)
- Option to always allow subreddit styles in night mode (thanks @andytuba)
- Giflike inline image support (thanks @mtsgrd)
- Imgflip inline image support (thanks @dylanwenzlau)
	- Inline YouTube (in comments too!), Vimeo, Soundbutt, and MemeDad support (thanks @thybag)
- Improved colored username support (thanks @andytuba)
- Show view count on YouTube links (off by default) (thanks @markekraus)
- Change "sort by" in comments just for the current page (thanks @andytuba)

### Bug fixes

- Fixes several bugs in MediaCrush support (thanks @MediaCrush)
- Don't run RES on mobile/compact pages (thanks @andytuba)
- Fix instragram support in night mode (thanks @gavin19)
- Fixes to Reddit over https (thanks @andrewachen)
- Pause MediaCrush expandos when closed (thanks @MediaCrush)
- Fix Twitter expandos (thanks @honestbleeps)
- Fix subreddit bar failing to load for shadowbanned users (thanks @sircmpwn)
- Improved HTML rendering for showImages (thanks @largenocream)
- Loads of other, smaller fixes...

### Other

- Of interest to developers - RES has been split into many files for better organization, etc. More workflow improvements are on the way!


## v4.3.1.2

### New features

- Added "go mode" to avoid accidental navigation to pages (this can be turned off if you don't care for it) - now, hit "g" than "f", for example, to go to the front page.

### Bug fixes

- Fix to positioning of source button (thanks @mc10)
- Fix to width of rank column (thanks @gavin19)
- Fix for appearance of organic ad spots in night mode
- Fixed an issue where your own top level comments weren't counted in the new comment counter
- Fix to inline imageviewer feature that auto expands images in selfText - albums now work!
- Various fixes to night mode (thanks @gavin19)
- Various housekeeping and code cleanup (thanks @mc10)
- Fix to allowNSFW feature (thanks @andytuba)
- Fix to NSFW CSS if module is disabled (thanks @andytuba)
- Fixed mediacru.sh support to obey maxWidth/maxHeight settings
- Fix for account switcher in Chrome incognito
- Fix for Chrome storing image viewer images in history even in incognito
- Fix to drag/sort on /r/Dashboard (thanks @sircmpwn)
- mediacru.sh support updates (thanks @sircmpwn)
- Fix to clickFocus restricting to a smaller area
- Fix to night mode on traffic pages (thanks @gavin19)


## v4.3.1.1

### Bug fixes

- Fixed an issue affecting many buttons (view source, flair selection, etc)
- Fixed an issue with keyboard navigation parent buttons (thanks @gavin19)
- Fixed an issue with j key navigation on dashboard
- Fixed character counter on big editor
- For now, snoonet module is disabled - stay tuned for an exciting new development soon, though!


## v4.3.1

### New features

- Updated Twitter expando functionality to use Chrome's optional permissions because of a change on twitter's end from http to https
- Added the ability to individually enable/disable image hosts (thanks @dxprog)
- Added the option to choose between imgur album types (RES-style, or reddit's new built in one)
- Added soundbutt to the list of domains that toolbarFix fixes
- Removed Vine from the inline image viewer since Reddit added native support
- Clicking labels now selects radio buttons (thanks @ericsubach)
- Update to Tinycon to support Retina (thanks @ggPeti)
- ESC key will now dismiss tips dialogs (thanks @mc10)
- Updates to Never Ending Reddit to better handle future changes on reddit's side (thanks @andytuba)
- Added subredditInfo hover to subreddit links in comments (thanks @gavin19)
- Added an option to ditch the "view images" tab but still use image viewer (thanks @theinternetftw)
- Fixed voting on parent hovers (thanks @mc10)

### Bug fixes

- Fixes for Safari 6.1 and 7 (thanks @phriedrich)
- Fixed an issue with passwords with certain characters failing (thanks @aidanhs)
- Fixed fadeDelay in subredditInfo popup (thanks, @gavin19)
- Fixed inability to unsave already-saved links (thanks, @mc10)
- Fixed an issue where clicking expanded images wouldn't open them in a new tab
- Fixed an issue where certain dashboard widgets would fail to hide the scrim after loading
- Fix to imgur.com/gallery links bringing up the wrong image due to a change at imgur
- Lots of code cleanup / organization (HUGE thanks to @mc10 for a ton of housekeeping, also thanks as always to @andytuba, @gavin19)
- Fix for subreddit info popup not working on Never Ending Reddit pages (thanks @andytuba)
- Fix steam domain detection (thanks @themichaellai)
- Fixed an issue with CSS causing problems on other sites in Firefox (NetVibes, Yahoo Mail)
- Fixed a few issues with mediacru.sh support (thanks @sircmpwn)
- Updated chrome API use (replaced deprecated calls) (thanks @chizu)
- Fixed a bug that could stop RES from functioning with the userbar collapsed
- All sorts of other small, misc bug fixes, thanks to any/all of the above who contributed...


## v4.3.0.4

### New features

- added subscribe button to subreddit hover popup
- added m.imgur.com support

### Bug fixes

- various fixes for Firefox 23+
- fixed a flickr expando issue
- CSS fix for hidden userbar toggle
- fixed an issue with hyphens in usernames
- fixed an issue with +shortcut button not appearing at /subreddits (formerly /reddits)
- various code cleanup / housekeeping (thanks @mc10!)
- Yet more Opera 12.* specific tweaks to regain functionality in Opera


## [v4.3.0.3](https://github.com/honestbleeps/Reddit-Enhancement-Suite/releases/tag/v4.3.0.3)

### New features

- added keyboard shortcuts to increase/decrease image size (- and =, with shift for fine-tuning)
- added support for gfycat.com
- enhancements and fixes to macro dropdown - thanks @andytuba
- hovering over a gallery expando now shows the # of images - thanks @andytuba
- subreddit hovers now also work in comment links
- added new username coloring features to the userHighlight module - thanks @andytuba
- updated bitcointip module - thanks @skeeto
- now showing +shortcut button on reddit.com/reddits - thanks @mc10
- background overlay for big editor for easier reading - thanks @Zren
- better preloading of images from galleries (reduces memory usage) - thanks @MikeRogers0
- various additional night mode fixes/tweaks - thanks @gavin19

### Bug fixes

- fix for broken colorBlindFriendly option
- fix for broken "night mode whitelist" - clicking "use subreddit style" while using night mode on subs that aren't yet specified as night mode friendly should now stick upon page reloads
- various additional night mode CSS tweaks/improvements
- additional CSS fix for expando buttons on comments page
- various Opera 12.* specific tweaks to regain functionality in Opera
- settings console search also returns module names - thanks @andytuba
- dropbox links no longer tagged as users - thanks @gavin19
- various username hider fixes - thanks @gavin19
- never ending reddit was reloading if you refreshed even if you were only on the first page (#page=1)
- a great deal of housekeeping niceties thanks to @mc10


## v4.3.0.1

### Bug fixes

- fix for broken colorBlindFriendly option
- fix for broken "night mode whitelist" - clicking "use subreddit style" while using night mode on subs that aren't yet specified as night mode friendly should now stick upon page reloads
- various additional night mode CSS tweaks/improvements
- additional CSS fix for expando buttons on comments page


## v4.3.0

### New features

- support for 3 new image hosts: mediacru.sh, memegen.com and makeameme.org
- support for vine videos
- "Show parent comment" shows the whole thread (as much as is visible)
- Moderators can add custom "filter by title" tabs to subreddit
- Moderators can specify whether or not their subreddit is "night mode compatible" (RES will disable the stylesheet in subreddits that don't do this)
- Keyboard console support for navigating to multi-reddits
- Keyboard console support for toggling nsfw filter
- Keyboard console command to go to user profile
- Opera 15+ support (with caveats: there are known issues with Account Switcher, adding image links to history, etc - Opera hasn't entirely replicated Chrome here so some things will need work)
- Post filter notification
- Option to disable image captions on expando
- Comment tools, big editor, live preview broken into separate modules
- Custom keyboard shortcuts for macros when editing post/comments
- /u/username autocompletion when editing post/comments
- Custom categories for macros with separate dropdown menus
- Notifications sometimes include links into settings
- Never-Ending Reddit more user-friendly when paused
- User info popup's "give gold" link opens "gild comment" box on comment page
- Superscript comment editor tool improved
- Re-order rows in settings console tables with drag-and-drop
- "My subreddits" dropdown loads quicker (and caches properly)
- clicking outside of the "My Subreddits" dropdown now closes it
- Pink user tag color

### Bug fixes

- Significant updates to Never Ending Reddit's feature that attempts you to scroll you back where you were upon return from the back button. It's never going to be perfect (for crazy technical reasons), but in my testing thus far, this has worked pretty well.
- Settings console subreddit autocomplete dropdown visible again
- account switcher works for passwords containing +
- "limit search to subreddit" works in multi-reddits
- hiding posts works in multi-subreddits
- image gallery expandos don't show the wrong caption if the image lacks a caption
- tumblr expando in comments toggles properly instead of opening several times
- flickr expando improvements
- Comment "show source" loading/toggling fixed
- Excessive saves to localStorage less excessive (how often, not how much)
- Night mode CSS tidied up, added multireddit support
- "hide child comments" works when "gift gold" is open
- Keyboard navigation's 'go to link' only observes real links
- Username hider doesn't break mod pages
- Private mode respected in Firefox
- Upvote/downvote count fixed on /r/subreddit/comments page
- fixed broken memegen support, livememe support
- fix for broken selftext toggles
- fix for wrong-sized tumblr and other buttons on certain pages
- all sorts of other small bugs/quirks


## v4.2.0.1

### Bug fixes

- Temporarily removed bitcointip module due to server load issues
- Tweaks to night mode
- added back option for users to have border on keyhighlight
- Fixed a bug where "use subreddit stylesheet" option showed up in places it shouldn't.


## v4.2.0

### New features

- Added a "donate to RES" button to the settings dropdown since many people have told me they didn't know there was a donation page!
- Settings console now has a search feature (contributed by @andytuba with improvements from @honestbleeps)
- Big editor for all of your long comment typing needs! @gamefreak
- Changed drag to resize behavior to avoid having to hide the sidebar - @honestbleeps
- bitcointip integration - makes it even easier to send and view bitcointips! (contributed by @skeeto with updates and improvements by @honestbleeps and @andytuba)
- Highlight user feature - allows you to highlight a user's username within a comment thread for easier spotting (contributed by @andytuba)
- Account-switcher is case-insensitive - @allanlw
- Imgur album gallery preloads images - @MikeRogers0
- YouTube expando improved - @darlose
- twitter expando improved - @honestbleeps
- Subreddit/user hover info has been made prettier and less obtrusive to clicking the username - @honestbleeps
- Username hider improved - thanks @alphanovember
- Added /myrandom link to subreddit manager (if you have it) - @andytuba
- Safari - open new tabs location improved - @robitor
- Distinguished save-RES button from reddit save comment button - @honestbleeps
- Image zoom doesn't hide side bar - @honestbleeps
- Whitelist subreddits from NSFW filter: show those subreddits' posts everywhere or only when browsing that subreddit - @andytuba, assist from @honestbleeps and @patricksnape
- Sort subreddit shortcuts - @patricksnape, assist from @honestbleeps
- Keyboard navigation "currently highlighted thing" gussied up - @honestbleeps (**Subreddit moderators** should update your CSS.)
- Private browsing enhancements for Chrome and Firefox
- Lots of new tips added to RES Tips and Tricks module - @andytuba
- Added cloudpix support to inline image viewer - @honestbleeps
- Various code cleanup and efficiency improvements - @honestbleeps

### Bug fixes

- Improved appearance of keyboard navigation along with a classname change to un-break it on many subreddits - @honestbleeps
- Fix for auto-population of link when tagging a user for the first time - sometimse the link wasn't getting populated
- Firefox 20/21 support - @patricksnape
- Fixed account switcher which broke when Reddit made a change - @patricksnape
- Fixed "link" comment editor tool - @gamefreak
- "Watch for new elements" fixes - @honestbleeps
- Night mode, notifications, other CSS/JavaScript cleanup - thanks @gavin19 (**Subreddit moderators** should update your CSS.)
- "Use subreddit style" checkbox should stay under popup and zoomed images - @andytuba and @honestbleeps
- Icon source more stable
- Expandos appear inside self-text expando - @honestbleeps
- Flickr expando improved to work on some additional types of pages - @dshafik
- Expandos don't disappear after showing/hiding comment - @honestbleeps
- Imgur album title punctuation fixed - @gamefreak
- Show parent comment when hovering over "parent" button fixed
- Show correct date on user/subreddit age
- reddit "save" comment button fixed - @infused
- Private messages "source" button gets correct message - @honestbleeps
- Clicking envelope when not orangered takes you to all messages again
- Fixed a bug where angle brackets made text disappear when using subreddit tagger - @honestbleeps
- For unread messages, fixed up favicon badge and fixed Safari's title turning to (#)
- Lots of other tiny little stuff here and there...


## v4.1.5 (RIP 4.1.4)

### New features

- Added "me" to comment navigator - allows scrolling through your own posts on a thread
- RANDNSFW link is now hidden if NSFW filter is on
- Added a few new keyboard navigation features thanks to urhereimnot's contribution
- Added a new option to allow orangered envelope to link to full inbox, instead of /unread (this is off by default), thanks to andytuba's contribution

### Bug fixes

- Security fixes to prevent XSS attacks via external sources
- Fixed a few issues with Opera - Now REQUIRES Opera 12.10
- Fixed "Show parent on hover", which broke when Reddit's HTML changed
- Fixed doubling up of "full comments" on friends/comments page (also due to reddit change)
- Fixed an issue that broke twitter expandos for some users
- Fixed a bug in Safari related to XHR (thanks Gamefreak)
- Updated snuownd per Gamefreak
- Bugfixes for nested instances of "load more comments" not getting applied RES functions
- Updates for compatibility with newer versions of Firefox Addon SDK (aka jetpack)
- Broke out plugins into separate files
- Using Mutationobserver instead of DOMNodeInserted when available for greater efficiency
- Cleanup of keyboard index storage for greater efficiency
- Some various cleanup to CSS


## v.4.1.3

### New features

- Added the ability to filter by flair (e.g. "gore")
- Several significant efficiency improvements that should make RES run a bit smoother.
- Improvements to keyboard navigation annotations to not be triggered by commonly used reddit "emoticons" (thanks DanGe42)
- A few style tweaks for the header (thanks Marcel)
- Added length display of text/title fields on submission page (thanks gamefreak)
- Added picshd.com support to image viewer.
- Added comma separated album functionality to imgur posts (thanks gamefreak)
- Added the ability for subreddits to trigger RES to enable gonewild filter functionality (thanks gamefreak)
- Improvements to image zooming functionality (thanks gamefreak)
- A number of other minor/less visible inline image viewer tweaks/improvements (thanks gamefreak)
- Added the ability to edit dashboard widgets.
- Zero padding gallery numbers in image galleries to avoid cursor jump.
- Improvements to the behavior of auto sidebar hiding when images are expanded.
- Added "delete" button to table-type options in the console (e.g. accounts in account switcher, etc)
- Updates to imgur support (less reliance on API calls)
- Drastically improved flickr support
- Added "ignored" column to user tagger table in Dashboard
- A large collection of CSS tweaks/fixes. (thanks gavin19)
- Added keyboard navigation option to automatically move to the next post after voting (thanks gavin19)
- Added keyboard navigation shortcut for inbox in a new tab (thanks gavin19)
- Added keyboard navigation shortcut for opening subreddit in a new tab (thanks cpettit)
- Added support for scrolling subreddit dropdown (thanks spencerhakim)
- Semantic improvements to HTML for certain RES elements for friendlier subreddit styling.

### Bug fixes

- Fixed a bug with imgur links not working when they had parameters after them (e.g. ?1)
- A number of new preventative measures to combat subreddits trying to hide the "use subreddit stylesheet" button (thanks Krenair)
- Fixed new comment count overwriting localizations on comments page
- Fixed a bug with Never Ending Reddit not returning users to the correct page after viewing a Reddit comments page.
- Fixed comment hide persistor in Firefox
- Fix for the pesky userbar toggle button size getting messed up in certain situations when closed.
- fix for username links with non-username text bringing up wrong info
- Fixed a bug caused by hiding many links in rapid succession.
- Fixes to live comment preview in Snuownd parser (thanks gamefreak)
- Fixed an issue with the sidebar being hidden on user pages even if expanded images weren't large.
- Fixed an issue with saving filteReddit options for users moving from old versions of RES
- Fixed saved comments tab not showing up on locale subdomains
- Fixed username hider on edited comments (thanks thelinmichael)
- Fixed user tagger on hyphenated usernames.
- Fixed a bug with < and > buttons scrolling too far sometimes.
- Update to remove new message count when needed. (thanks dxprog)
- Fix for comment preview not showing up on edit.
- Fixed an issue with subreddit hover popup on never ending reddit pages


## v4.1.2

### New features

- DeviantART and Tumblr links are no longer rewritten - thanks to a huge improvement made in Firefox, this will only detrimentally affect Opera and Safari users who use "view all images" on pages full of these links...
- Made some huge performance improvements in Opera
- Direct link to users' links and comments now exist in the user hover tooltip

### Bug fixes

- Reddit made a breaking change (moving location of saved links) making it impossible for RES users to get to saved comments - this is fixed.
- Fixed a bug causing the "About RES" panel not to display in the console for Firefox users
- Fixed an issue with live comment preview and attachment to the top level comment even when not necessary
- Fixed a few CSS issues (thanks gavin19!)
- Uppers and downers now work on user profile pages past page #1
- Some new updates to back button detection for Never Ending Reddit should make it a little smoother
- A number of other minor/misc tweaks and bugfixes


## v4.1.1

### New features

- Account Switcher menu can now be switched between snoo (the alien) and a dropdown
- Account Switcher menu has returned to being "click to open", rather than rollover
- User tag list on the Dashboard now has pagination (thanks, gamefreak!)
- Macros now support multiple lines of text
- Macro rollover has been changed to click to activate to avoid accidentally opening
- Users now have the ability to disable +dashboard and +shortcut links in the sidebar
- Subscription checking is now more efficient thanks to a different Reddit API call
- Image galleries now have a unique icon so you can tell it's a gallery
- Support for picsarus.com image host
- Added the option for users to disable the display of image captions in gallery view
- Firefox should get a great performance improvement on long pages of never ending reddit with many images open thanks to a new method of tracking history

### Bug fixes

- A small subset of people were experiencing RES-ERROR localStorage messages in Firefox, this should be fixed
- A different small subset of Chrome users were having RES periodically not run due to a crash in the SnuOwnd live comment preview markdown parser
- A number of tweaks were made to how inline image viewer works to restore it to proper functionality
- Fixed an issue with +dashboard / +shortcut buttons in the modqueue
- Fixed an issue related to deleting subreddit shortcuts
- CSS tweaks to night mode (spoiler tags and a few other fixes, thanks, gavin19!)
- Some additional bug fixes were made for Never Ending Reddit's back button detection (specifically to avoid thinking you've come from the back button on a page refresh
- Fixed a bug preventing users from subscribing to threads that had 0 comments
- Fixed another bug relating to subreddit highlighting on the user bar
- Fix for some edge cases of displaying negative values for new user account ages
- Fix for accidental triggering of never ending reddit via keyboard
- A number of other minor bugfixes too tiny and/or numerous to list...


## v4.1.0

### New features

- Major overhaul to how and when certain parts of RES are executed - this MAY result in getting rid of the dreaded "flash of unstyled content", such as a white page before night mode kicks in, in some cases!
- Major additions to Dashboard - you can now see all of your user tags and subscribed threads there!
- Some efficiency improvements specific to the Firefox addon including: compiling with a new addon SDK version (biggest help), some adjustments to how storage is handled between tabs, and eliminating some code
- Added "fadespeed" option to user hover tooltip so that users can have it fade in/out faster (or just instantly appear)
- User tagger now stores a link to the link or comment you tagged a user from by default
- Added easy-access NSFW filter toggle to dropdown menu
- Now calling more HTTPS stuff to play nicer with addons like HTTPS Everywhere (note: compatibility is still not guaranteed)
- Added a way to dynamically grab known/popular bug reports and feature requests for when people try to submit to Enhancement or RESIssues
- Updated account switcher dropdown for easier access and more UI consistency
- Completely overhauled how uppers/downers are displayed - no more JSON request required, which means it's faster!
- Added "turbo selftext" option - which will make selftext expandos much faster after the first one you load on any given page
- Adjusted clickable area for selecting comments
- Added new subreddit tooltip - allows easy filtering, adding of shortcuts/dashboard widgets, etc
- New module: Comment hide persistor - keeps track of collapsed comments and re-collapses them when you return to a thread - thanks, umbrae!
- Added the ability to add custom macro buttons to comment preview toolbar
- Added "source" button to inbox
- Adding a class of .res to the BODY tag to help moderators better style their subreddits with RES in mind
- Added app=res to all calls to Reddit, so that the Reddit admins can more easily measure RES's impact
- Major overhaul of inline image viewer - improved code, support for a few more sites (deviantart, imgclean, picsarus, i.qkme), etc.
- Added a checkbox to more easily disable RES tips and tricks
- User tagger hover tip now works on /u/username links
- Added a few more URL patterns that will break out of the Reddit Toolbar since they don't play nice together
- Updated Never Ending Reddit with "friendlier" error messaging and easier reloading
- No longer auto-linking subreddits since Reddit now does it itself
- "Hard ignore" option in User Tagger now collapses sub comments as well
- Disabling "spam button" module by default due to misuse/abuse. If enabled, button now reads "rts" so as not to conflict with newly added "spam" button from Reddit itself
- Made a few code changes that should allow older versions of Firefox (via Greasemonkey) to still work. I cannot actively support this with a lot of time, but a cursory test shows you should be able to run RES with FF3.6+GM now.
- Added code to allow saving of comments even if they're from deleted users.
- Added user tagger / hover tip to flair page for moderators
- Added the ability for filteReddit and dashboard subreddits to be added even if they don't exist in Reddit's autocomplete feature
- Improved multireddit experience - now including +dashboard and +shortcut buttons for each reddit in the sidebar, etc
- Added "reddiquette" button to comment preview toolbar
- Updates to Reddit API calls to maintain current location protocol (should mean less problems browsing https with pay.reddit.com)
- Added a few more optional links to the subreddit manager: DASHBOARD, FRONT, MODQUEUE, RANDNSFW (thanks to Signe for the last 2)
- Added "View Images" tab to Dashboard
- Added the ability to control how long thread subscriptions last (in New Comments Count module)
- Added "refresh all" function to dashboard
- Added the ability to show current username in account switcher (thanks, Lugghawk!)

### Bug Fixes

- Reddit changed how karma is displayed, which made Comment Karma not show in RES - this is now fixed.
- Reddit added a new feature, "link flair" which broke RES - this is now fixed.
- Fixed an issue for international users having problems with keyboard shortcuts blocking their extended charsets
- Added a MAJOR fix for Safari users who often used the back button resulting in a broken RES
- Fixed a bug where "view images" broke when encountering a post from an ignored user
- Preventing autoload of next page when using keyboard navigation and autoload is disabled
- Several misc bug fixes with user tagger
- Fix for misaligned userbar icon when not using navTop
- Minor bug fix with commandline sorting
- Fixed an issue that messed up the flair dropdown for moderators in some cases
- More tweaks to Night Mode to style some elements that were overlooked
- Inline image viewer history recording should work in Firefox now that it's compiled with a newer Addon SDK version
- Changed structure of settings dropdown menu to not block other buttons from being clicked
- Adjusted how Firefox handles tab communication of settings changes - should be much more efficient
- Never Ending Reddit no longer relies on rewriting the current URL to keep track of what page you're on, which should alleviate ctrl-f borking out in Chrome, and also a caching/history problem in Chrome
- Added a fix for "username hider" module not applying to multiple pages of Never Ending Reddit
- Documentation updates for a few unclear keyboard commands
- Some fixes for user hover tooltip placement / alignment
- Fixed a couple of minor issues with Never Ending Reddit
- Complete overhaul of live comment preview using new markdown engine, etc.
- Major fixes to filteReddit - exclusive/inclusive filters often broke other filters
- Added option to disable keyboard shortcuts for bold/italic/strikethrough in comment preview module
- Added user hover tip to moderator box in sidebar
- Bugfix to highlighting of current subreddit in subreddit manager
- Updated new comment count cache to be cleared more often
- Further "protection" of subreddit style checkbox
- Timezone fix for date function
- Added support for cmd-click of subreddit shortcuts on OSX
- Fixed duplicate "full comments" link on Never Ending Reddit on user pages
- A lot of other minor bug fixes, UI fixes, etc - really, I've lost track....


## v4.0.3

- added an additional fix for hiding the sidebar on resizing images which were sometimes still getting cut off.
- keyboard navigation now handles "continue this thread" links (thanks gavin19)
- current subreddit now highlighted on shortcut bar (thanks gavin19)
- adjusted positioning of user detail dialog for better alignment of username
- added new commandline command, srstyle, to toggle subreddit styles on and off.
- added close button to never ending reddit modal in case it fails and you get stuck there.
- fixed an problem with Safari and cross-domain versus non-cross-domain XHR causing Never Ending Reddit issues
- checking for existing video times before adding new ones...
- added unread message count to never ending reddit floating mail indicator
- added deviantart and memecrunch to inline image viewer (thanks gamefreak)
- fixed account switcher in chrome incognito mode
- fixed ability to save links in multireddits (thanks calaveraDeluxe)
- added "home" link option in subreddit manager (thanks s-quark)
- CPU usage fix for some users whose scrolling + updating localStorage was causing locks (thanks gamefreak)
- added flickr.com and github.com to toolbarFix since they also seem to break the reddit toolbar
- Firefox XPI only: compiled using patched FF addon-sdk to get around a bug in their SDK that caused problems for the user tagger when a color was selected
- set drag/resized images to only even pixel widths to get around a Firefox bug...
- fixed a bug with uppers and downers when logged out caused by a change in reddit's html
- fixed an issue where subscription notifications were obscured when pinHeader option is on
- other fixes related to pinHeader (thanks s-quark)
- fixed another mail icon sprite issue
- more night mode fixes (thanks gavin19)
- added option to pin subreddit bar and userbar together (thanks gavin19)
- removed linkifysubreddits option, as Reddit now does this natively
- fixed a XSS threat, huge thanks to I_know_HTML for reporting it anonymously and with detail


## v4.0.2

- Fixed a last minute issue with reddit's new sprite system (changed 11/14/11) messing up mail display for showUnreadCount
- A number of fixes to night mode (thanks gavin19!)
- Changed how Never Ending Reddit remembers pages to get around a Chrome bug that was breaking scrolling and find in page searches that caused scrolls...
- Fixed inconsistency on subreddit tagger, especially on subsequent never ending reddit pages
- Fixed an opera specific bug in subreddit tagger that was placing "undefined" in link titles
- Chrome no longer marks images as visited when in incognito mode
- Fixed 404 issues with dashboard on mail and user widgets when default sort was changed.
- Now allowing sorting by new/hot/top/controversial on user widgets
- Fixed an issue with account switcher menu alignment when pinUserBar was set
- Fixed a bug with dashboard on sorting widgets that had multireddits causing data to be corrupted...
- Fixed a bug with how live preview renders h3 tags (i.e. ###text)
- Fixed a bug with commandline console and sorting from users' profile pages
- Fixed a bug with trying to get info of a logged in user when not logged in (reddit's HTML change broke this)
- Fixed an issue where toggled userbars in some browsers grew by a couple of pixels (thanks gavin19)
- Fixed a filteReddit bug with domains / keyword radio buttons
- Fixed a bug where never ending reddit wasn't updating the right mail icon if you had the full header pinned


## v4.0.1

- Adjusted how the console scrim is handled to avoid a slow scrolling bug in Opera
- Hiding links with keyboard nav with onHideMoveDown wasn't moving down.. fixed.
- Removed unnecessary defaultMark option from past instances of user tagger
- Fixed a bug disallowing slashes in subreddit shortcuts on subreddit manager
- Fixed some night mode issues
- Fixed user tagger bug when a color was set (only affected Firefox)
- Addressed safari/osx issue where keyboard shortcuts were being blocked
- Fixed an issue where users who have youtube blocked (corporate firewall, etc) were getting error messages.
- Opera: fixed a bug where account switcher wouldn't work in Opera - but that means not using https...
- Opera: fixed a bug with save options button sometimes not appearing properly
- Fixed a bug where filteReddit on specific subreddits was case sensitive and shouldn't have been
- Got rid of the (u) indicator since all browsers now auto update.
- Fixed a bug where never ending reddit page numbers weren't recording right with certain options set
- Fixed navTop=off incompatibility with pin options


## v3.4

### New features

- General
	- Reddit Enhancement Suite is now officially (and properly) released under the GPL
	- All modules now work via HTTPS
	- Added some additional debug tools to make it easier for users to fix corrupt JSON data
- Account Switcher
	- Added detection of Reddit API rate limiting so you know if you've been submitting the wrong password too many times / too fast
- betteReddit
	- New features for subreddit bar! Try creating a group (i.e. pics+videos+entertainment), just try it :)
	- You can now delete subreddit shortcuts by giving them a blank name
	- New option (defaults to on) to show unread orangered count!
- Inline Image Viewer
	- Scanning on link pages is now much faster (it is kept slower on comments pages intentionally since so much is hitting your CPU)
	- Added a "View Images" tab to search result pages
- New Comment Count
	- New comment counts are now displayed on the comment page (just the count, you still need Reddit Gold for highlighting)
- Comment Navigator
	- Added two new search methods:
		- Friend - click through posts from friends
		- Popular - clicks through posts in order of popularity (point total)

### Bug fixes

- General (well, actually Keyboard Navigation but that's non-obvious)
	- Fixed an issue where links with mixed-case protocols (i.e. "Http") were not opening properly in some browsers
- betteReddit
	- Fixed an issue where giving a subreddit shortcuts a blank name made it impossible to grab/edit
	- Fixed an issue where adding/removing subreddit shortcuts sometimes wasn't working properly
	- Middle clicking subreddit shortcuts is fixed - they open in new tabs
- User Tagger
	- Fixed an issue tallying votes on archived comments (that can no longer be voted on)
	- Fixed a bug with odd display on blank user pages
- Live Comment Preview
	- Fixed a longstanding bug where immediately editing a posted comment didn't have a preview
- Username Hider
	- If enabled, "Commenting as" in the Live Comment Preview won't be displayed
- Inline Image Viewer
	- Fixed an issue where some Flickr images would show at the wrong aspect ratio before resizing


## v3.3

### New features

- General
	- Added error handling to avoid killing RES when your JSON data gets corrupted, you will now get a dialog allowing you to clear it out
		- **NOTE**: If you see such an error popup, you may want to copy/paste this data and save it in a text file! The error popup does say this :-)
- betteReddit
	- Subreddit Manager has been updated, now supports "display names" (to rename shortcuts)
	- Double click a subreddit shortcut to edit it!
	- Added links to the "Edit subscriptions" page
	- You can now enable/disable any of the ALL / RANDOM / FRIENDS / MOD links
- Uppers and Downers Enhanced
	- updated timestamp hover to only take effect on the actual time rather than the whole row
	- updated timestamp hover setting to affect both comments and posts
- Live Comment Preview
	- Added "commenting as" with your logged in username to avoid confusion for frequent account switchers
	- Added option to turn "commenting as" text off for those who don't want to see it

### Bug fixes

- betteReddit
	- Fixed some CSS annoyances on the subreddit bar for some users
	- Fixed an issue where shortcuts with a period in them wouldn't save properly
- Inline Image Viewer
	- Fixed a bug where preview thumbnails sometimes got stuck open


## v3.2

### New features

- betteReddit
	- updated style of < + > buttons as people didn't like the icons
	- added "Edit subscriptions" link to the add subreddit form (click the +)
- Inline Image Viewer
	- Added an option to disable the Thumbnail Preview as it's not useful for people without Compressed Link Display on
- Uppers and Downers Enhanced
	- Added an option to disable the tooltip for time/date a comment was written
- User Tagger
	- Added a new option to have +/-[number] instead of [vw] for vote weight

### Bug fixes

- General
	- Fixed an issue where Firefox wasn't storing float values properly (which caused RES to always think there was an update)
	- Fixed RES from breaking on "multi reddits"
	- Fixed an issue with "private" reddits screwing up RES because there were no "reply" links in comments
- betteReddit
	- fixed a minor bug where some people had to click the + button twice to add a subreddit


## v3.1

### Bug fixes

- Style Tweaks
	- Fixed a bug that caused RES to break for users who had never ignored a subreddit stylesheet.


## v3.0

### New features

- General
	- Completely overhauled how settings are stored, separately for each browser, to hopefully avoid losing settings when private data is cleared.
		- Chrome, Opera, Safari: Each using their respective extension background page to store settings
		- Firefox: Using Greasemonkey's GM_setValue / GM_getValue to store settings
	- Some other miscellaneous architecture changes that should speed things up a bit
	- Added some code to adjust the order of "save", "source" links etc so they're more consistent with each other
- Comment Navigator **NEW MODULE!
	- When browsing long comment threads, the Comment Navigator provides an easy way to scan for posts by Submitted, Moderator or Admin
- betteReddit
	- Added "Manage Subreddits" option, which provides an editable subreddit bar
		- NOTE: All browsers except Opera will support drag/drop editing of this bar.  Opera unfortunately has chosen not to support drag events yet.
- Keyboard Navigation
	- Added a new commandline command: user [username] goes to that user's profile page
	- Added "s" shortcut to save a link when the link (on a comments page) is selected
	- "s" shortcut will save/unsave comments when a comment is selected
	- Updated style of "selected" keyboard nav item so it doesn't "take space" and jiggle text around... (except in Opera due to a CSS quirk, sorry Opera users)
- Inline Image Viewer
	- Added thumbnail preview (when hovering over an image expander button)
	- Updated placement of images on link list pages to avoid "jumping" on expansion and/or drag and drop
- Save Comments
	- Changed how saved comments are stored in prep for RES Pro sync
- Style Tweaks
	- replaced commentBoxHover with a new name so people can still turn it on if they like it, but now it defaults to off - it's a CPU hog.
- Uppers and Downers Enhanced
	- Added date/time of submissions on rollover (thanks to semanticist for the contribution!)
	- Module now also runs on a user's "liked" tab

### Bug fixes

- General
	- fixed [check for update] button in RES console in Opera
- Show Parent
	- Parent links on "load more comments" now work properly.
- Style Tweaks
	- Fixed some overlooked items on Dark theme (thanks FillInTheBlank)
- SingleClick Opener
	- Fixed an issue opening javascript:void(0) tabs on middle click
- Inline image viewer
	- Fixed to work properly on user pages again


## v2.7

### New features

- Keyboard Navigation
	- Added the keyNav commandline!  Hit "." on any page to bring it up.
		- typing r/[subreddit] sends you to that subreddit
		- typing a number on a selected comment clicks that link
		- typing a number on a link list page clicks the link with that ranking number
		- typing tag bob would tag the currently highlighted user as "bob"
		- typing m takes you to your messages
		- typing mm takes you to your moderator messages
		- typing sw funkypants would switch you to the user "funkypants" in Account Switcher
		- typing ls toggles the lightSwitch function
- Account Switcher
	- Added "keep me logged in" option to account switcher (default is false for security reasons)
- Never Ending Reddit
	- Finally added error detection! Now when NER fails to get an actual page from its load, you'll know! You can then click to try again.
	- Also added the ability to click the NER box just in case the content isn't large enough to allow you to scroll (which is what normally triggers it)
- Inline Image Viewer
	- Updated HTML/CSS so that inline image links do not take up the whole "row"
- Spam Button
	- Added the spam button to comment pages and user profile pages
- Save Comments
	- Changed the way saved comments are stored in preparation for exciting new functionality... :)
- User Tagger
	- Changed the way user tags / vote info are stored, also in preparation for exciting new functionality!

### Bug fixes

- General
	- Better detection of localStorage failure to let the user know why RES won't work - hopefully a "graceful" failure now.
	- MAJOR efficiency update for Firefox users due to its slow performance on localStorage.setItem()
- Keyboard Navigation
	- Fixed an issue where clicking occasionally messed up certain keynav features on comments pages
- betteReddit
	- Since reddit changed their HTML source, I had to make a change to un-break the ability to save/unsave links
- Inline Image Viewer
	- Fixed a bug that would not allow inline images to close after a certain sequence of events
	- Fixed a bug that caused images in the sidebar of subreddits to also get scanned on certain pages
- User Tagger
	- Finally came up with a good way to ensure scores don't get messed up when following a certain sequence of clicks on the same post
- Live Preview
	- Fixed a bug where viewing source on a permalinked comment showed the wrong info
	- Fixed a bug where no view source links appeared on root level comments...
- Spam Button
	- Spam Button now properly works with Never Ending Reddit
- Save Comments
	- Now hiding next/prev buttons on saved comments page
- Single Click Opener
	- Fixed a bug where certain characters would mess up l+c links


## v2.6

### New features

- Inline Image Viewer
	- Restricted "drag to zoom" to the left mouse button only
	- Added a fix to make drags not get stuck for some users
	- Added a toggle to disable the ability to drag to zoom in case you try the fix and still hate it!
	- Added support for quickmeme.com meme images
- Spam Button
	- Added spam link to comments page of an individual link
- Keyboard Navigation
	- Added the option to *not* automatically move to the next post when hitting the "hide" keyboard shortcut

### Bug fixes

- Account Switcher
	- Made a change that allows this module to run properly in Opera as a native extension.
- Never Ending Reddit
	- Made a change that allows this module to run properly in Opera as a native extension.
- Uppers and Downers Enhanced
	- Made a change that allows this module to run properly in Opera as a native extension.
- Show Parent
	- Made a change that allows this module to run properly in Opera as a native extension.
- betteReddit
	- Fixed the name of the module in the RES console.
	- Fixed an issue where in certain browsers, clicking the reddit search box didn't clear out the "search reddit" text


## v2.5

### New features

- General
	- RES 2.5 is now available as a native Opera extension!
		- Opera users please note: You must first remove the userscript, or the two will conflict and cause havoc!
	- This is the first release of RES that should be auto-updated to users of Chrome and Safari - exciting!
	- A number of performance tweaks (hopefully improvements) have been made
- BetteReddit **NEW MODULE!
	- Full Comments linker has been renamed to BetteReddit, which will contain things considered to be "UI fixes" on Reddit
	- The first UI fix: "save" buttons on links now become "unsave" buttons, and vice versa, upon clicking them.
	- Adds a checkbox below search box in subreddits to automatically restrict search to that subreddit by default
- Spam Button **NEW MODULE!
	- New module - adds a "spam" button to posts for easy reporting to /r/reportthespammers
- Style Tweaks
	- Added a toggle for a colorblind friendly orangered envelope
- Keyboard Navigation
	- Added the following new key functions:
		- "x" key on a comment with images in it expands/contracts all the images
		- "p" key on a comment moves back up to the parent comment
		- "enter" key when a link is selected on a comments page will follow the link
	- Usability tweaks
		- When hitting "x" to trigger an expando, that link is scrolled to the top of your browser so the expando is in view
		- When hitting "h" to hide a link, the next link will automatically be selected
- Inline Image Viewer
	- Added drag to zoom support!
	- Added min.us support for galleries / other links that are not direct image links
	- Added support for links to Flickr that are not direct image links
	- Added further Keyboard Navigation integration (see notes for that module)
	- Now scans expando-loaded selftext for images, too!
		- There is also a setting to automatically expand these images (or not).
- User Tagger
	- For friendlier playing with spam scripts, no longer adding a trailing slash to profile links in user hover tooltip
- SingleClick Opener
	- Added support for ctrl-click to open in background tabs (works everywhere but Firefox, sorry)
- Save Comments
	- "Save" link now becomes "Unsave" when you click it.
	- Updated style sheets for viewing saved comments, fixed some display issues

### Bug fixes

- New Comments Count
	- Fixed a bug where new counts weren't showing on certain sorting methods
- filteReddit
	- Fixed a bug where post titles were hidden by filteReddit when viewing their comments page
- Style Tweaks
	- Fixed a CSS conflict with comment boxes and the dark style (if comment boxes are off, no more boxes in dark style)
	- Updated support for Twitter expandos, which broke when Twitter changed its URL structure a bit.
- Comment Preview / View Source
	- Fixed a bug where you couldn't hide the source of self posts
	- Fixed a bug where clicking "source" button multiple times displayed multiple copies of the source


## v2.4

### New features

- General
	- Added support for non-www subdomains of reddit.com - note: this may cause weird behavior for people using unorthodox subdomains I haven't heard of...
	- Added auto updating for Safari and Chrome (haven't had the chance to test.. hope it works! You won't see it until v2.5+)
- Uppers and Downers
	- Added uppers/downers to links pages!
	- Added ability for users to custom style links (with CSS)
- Show Parent
	- Got Show Parent to work on comments loaded via "load more comments" button
- Never Ending Reddit
	- Added the ability to turn off "Return to last page" function

### Bug fixes

- filteReddit
	- Fixed a bug where filters weren't applied to 2nd/3rd etc pages of links
	- Fixed a bug where /all/[sort type] wasn't being filtered
- Never Ending Reddit
	- Fixed a bug that caused orangered envelopes to not always be orangered!
- Show Parent
	- Re-fixed a cosmetic issue for users with Comment Boxes turned off for people w/Style Tweaks totally disabled
- Keyboard Navigation
	- Fixed a bug where certain number links wouldn't open.
- Inline Image Viewer
	- Fixed a bug with toggling hide/show all while some images were open
	- Stopped false detection of Wikipedia images that can't be opened inline
- Live Comment Preview
	- Fixed a bug where mixed italics/bold with asterisks broke live preview
	- Fixed a bug where "view source" on a selftext post showed the source of the first comment instead
- Save Comments
	- Fixed a bug where the same comment could be saved multiple times
- Hide Child Comments
	- Fixed a bug that wouldn't allow child comments to be hidden if you had clicked reply


## v2.3

### New features

- Style Tweaks
	- Twitter links now have expandos to view inline (unless you use Opera, sorry. It doesn't allow me to do cross domain XHR)
- Keyboard Navigation
	- Better support for Chrome and Safari's ability to let you divert comment links to new tabs (or choose not to)
	- "Load new comments links" now work with the keyboard!
- Uppers and Downers
	- Now they load on "load new comments" comments!
		- Note: This only works on "nested" comments, not the links at the bottom of the page. Long story.
- Inline Image Viewer
	- Removed the "useSmallImage" option and replaced it with "imageSize" - pick any size image from imgur! Great for low bandwidth connections, and smaller screens like netbooks.
- Live Comment Preview
	- Surprise! Live preview of tables!

### Bug fixes

- General
	- Fixed a settings issue that was causing problems in Chrome dev builds. More a bug with Chrome in my opinion, but whatever. ;-)
- User Tagger
	- Fixed that nagging issue where a tooltip stays up if you move the mouse out while it's fading in -- BUT:
		- I cannot for the life of me figure out a good way to stop this from happening when you scroll your mousewheel but do not move the mouse. Sorry.
- Keyboard Navigation
	- Fixed a conflict between inline image viewer and keyboard navigation in comment links
- Show Parent
	- Fixed a cosmetic issue for users with Comment Boxes turned off
- Live Comment Preview
	- Fixed a few minor bugs with quirky use of markdown, but a couple of minor things are oustanding and seem to be beyond my regexp capabilities for now.
- Style Tweaks
	- Made some updates to RedditDark for users with Comment Boxes turned off
- Save Comments
	- Fixed a bug where "what's hot" in subreddits didn't work correctly


## v2.2

### New features

- Keyboard Navigation
	- Added a new key, "x" by default, to expand image/text/video expandos. Note RES can't autoplay videos because they're in iFrames.
	- Updated the commentLinksNewTab option so that if it's off, you can use regular/middle click to choose whether or not to open in a new tab.
- Live Comment Preview
	- Added ~~strikethrough~~ and super^script support
	- Updated to be in line with the bug-fixed version of markdown that Reddit has upgraded to (fixes things like look_of_disapproval) making _of_ italicized.
	- Added "source" button to show markdown source of other comments...
	- Removed referral link from [Promote] button because some users were concerned about it looking 'spammy'

### Bug fixes

- General
	- Fixed an obscure bug related to google searches for Reddit URLs.
- New Comment Count
	- Fixed a bug where borked localstorage values caused a js error and stopped the rest of RES from running
- Subreddit tagger
	- Fixed a bug where blank lines in config settings caused subreddit tagger to break
- Live Comment Preview
	- Fixed a situation with repeated looks of disapproval looking wrong.
	- Fixed a problem with < and > characters not rendering right in the live preview.
- Inline Image Viewer
	- Fixed a bug that was excluding it from running on /user/username/submitted
- Style Tweaks
	- Fixed a few more minor issues with Dark style


## v2.1

### New features

- Live Comment Preview
	- Added preview to self/text posts
- New Comment Count
	- Now incrementing comment count when you submit a comment, so that your own posted comments don't count as "new"
- Inline Image Viewer
	- Increased efficiency (to avoid locking the browser while loading big comments pages) by scanning the page in chunks, as other modules are doing...
- SingleClick opener
	- Middle click now works in Chrome and Safari to open links+comments in a background tab.
	- NOTE: Firefox and opera simply do  not support controlling this with Javascript. Firefox users: you can go to about:config and set browser.tabs.loadDivertedInBackground to true if you like. Note that this means ALL new tabs will be unfocused. Not just from RES.
- Keyboard Nav
	- Shift-L (for singleclick opener keyboard shortcut) opens links+comments in background tab
	- NOTE: Same browser restrictions apply. Firefox/Opera just can't do this.

### Bug fixes

- General
	- Fixed a bug where some console gobbeldygook came out on broken reddit pages
	- Updated some stylesheets that left Opera support for border-radius out
- Account Switcher
	- Fixed a bug with placement of the dropdown menu
- Style Tweaks
	- Fixed an issue with deeper threads and reddit dark
- filteReddit
	- Added filtering on Never Ending Reddit loads...
- Save Comments
	- Fixed the behavior of the 'saved' link when saving a comment
	- Fixed some CSS as well


## v2.0

### New features

- Performance
	- massive performance increases gained by using a few different techniques
		- Caching CSS before adding it to the page
		- Redid every single for loop in the script to be more efficient
- filteReddit
	- NSFW toggle on/off to auto-hide NSFW links (links only, not comments!)
	- Filter links by domain or keyword in title
	- Filter subreddits out of /r/all
- New Comment Count
	- Shows the number of new comments since your last visit
	- Cleans out saved comment counts for sites you haven't visited in a week
		- This is configurable - you can set the # of days you want to keep this information stored
- Never Ending Reddit
	- Added place-saving scrolly goodness when you hit the back button, it'll return you to where you were (as best it can)
- Hide Comments
	- Updated to only display show/hide if the comment has children
- Inline image viewer
	- Drastic upgrades to imgur image detection, should be much smarter about not linking imgur galleries, etc.
	- Also completely replaced imgureddit, which has become obsolete
	- Add "use smaller image" option to use smaller images from imgur to save bandwidth
- Style Tweaks
	- Killed off the old Comment Boxes addon that was just too slow performing, and replaced with a popular/common one with my own tweaks to it.
	- Added the ability to choose how far comments are indented
	- Added the ability to ignore subreddit-specific stylesheets on a case by case basis (see the new checkbox under subreddit names)
	- Updated Comment Boxes to play nicer with subreddit stylesheets
	- Added an option (on by default) to give video and text "expando buttons" back to users with compressed link display on
	- Added userbar hider to collapse it in case it's overlapping with things, etc.
	- New dark-theme expando images for video, selftext, and photos
- Comment Preview
	- Added look of disapproval button... because... why not?
	- Added "promote RES" button... because... also why not?
- General
	- Added cheat code

### Bug fixes

- Save comments
	- Fixed a bug that stopped clicking "overview" on your profile page from working...
- Never Ending Reddit
	- Fixed a big that was hiding the browse links in 'featured links' at the top of the main page
- Inline image viewer
	- Fixed a bug where images were collapsed by loading a new page of Never Ending Reddit
- Style Tweaks
	- Some fixes to Dark theme to make it better, cover a few things I overlooked
	- Adjusted comment boxes margin issue on some subreddits
- Keyboard Navigation
	- Reddit changed their HTML, so the Next / Prev keyboard shortcuts broke. This is now fixed.
	- Fixed a bug where replying to the first item in your inbox caused a javascript error


## v1.86

### Bug fixes

- Core code
	- Fixed a bug that affected gold users who turned off ads (console wouldn't open)
- Inline Image Viewer
	- Fixed a minor bug with the sprite sheet for show/hide images.


## v1.85

### New features

- Core code
	- Perhaps something between a 'new feature' and a 'bug fix' - now hiding the ad bar when bringing up the console so there aren't overlap problems preventing you from saving preferences.
- Style Tweaks
	- Lightswitch! Switch on demand between a light/dark theme. Note that there's unfortunately nothing I can do about the wait to convert from light to dark when loading a page in the dark theme. Sorry. Nature of userscripts.
	- Updated Comment Boxes with the option to round corners
	- Also updated Comment Boxes to not expand the full width of the browser, per user request
	- One more comment boxes thing: Default turns off the dropshadows, in the name of performance.
- RES Tips
	- New - a tips and tricks tooltip will pop up no more than once every 24 hours, teaching you something you may not already know about RES!
	- You can also access tips from the console - click [RES], then the help (?) icon in the console.

### Bug fixes

- Inline Image Viewer
	- Fixed a few miscellaneous bugs - a minor image search bug, and a bug with overlap in webkit browsers with images/menus
- Core code
	- Fixed a broken link to the API, oops!
- User tagger
	- Fixed a date bug with the rollover


## v1.8

### New features

- Safari - now a native extension! No more need for Ninjakit or Greasekit
- Inline Image Viewer
	- Updated to have a nice little +/- icon, and moved the link to show/hide images.

### Bug fixes

- Inline Image Viewer
	- Fixed [duplicate image ignored] bug where it was showing up all sorts of unsavory places
	- Fixed inline image viewing in comments
- Account Switcher
	- Added an alert message if you have set your username/password incorrectly.
- Save Comments
	- Fixed an issue with international reddit users not seeing the 'saved comments' tab.
- User Tagger
	- Fixed an issue where up/downvote tracking was still happening even if colorUser was turned off.
	- Fixed a date bug in the user info rollover


## v1.75

### New features

- Account Switcher
	- NEW!  Added a new module, Account Switcher, that allows quick and seamless switching between accounts.
- Inline Image Viewer
	- Completely revamped to make it a bit more efficient
	- Now displays the total # of images found on the "view images" button
	- Added the ability to show/hide individual images (see [show img] link after links with images)
- User Tagger
	- Enhanced the "redditor since" information on user rollovers
	- Added configuration options for hover delay and fade delay on rollovers
	- Added configuration optns for date display on rollovers
	- Added years/months/days since user became a redditor to rollovers
- Style Tweaks
	- Added the ability to remove box shadows from comment boxes (may help performance on slower machines)
	- Added the ability to disable the mouse hover feature in comment boxes (also may help performance on slower machines)

### Bug fixes

- Core Code
	- Fixed a bug with saving empty table preferences
	- Fixed a few scattered bugs in modules that I've lost track of and failed to document. D'oh!


## v1.7

### New features

- Core Code
	- Opera Compatibility!*
		- * With minor limitations because Opera doesn't support cross-domain requests in user scripts...
			- Part of the inline image viewer that converts imgur links for more reliable image display will not work, as this requires a cross domain request.
	- Added a sanity check on URLs because some people's "include" settings are being ignored and the script is running on non-reddit sites.
- User Tagger
	- Added new rollover amazingness!  You'll just have to roll over a username and see for yourself.
- Style Tweaks
	- Drastically increased efficiency of comment boxes styling on large comment pages so it won't freeze up your browser while it renders...

### Bug fixes

- Inline Image Viewer / Keyboard Navigation
	- Fixed a bug where keyboard navigation was causing issues with inline image viewer (borking middle click to open in a "passive" tab)


## v1.67

### New features

- Inline Image Viewer
	- Integrated inline image viewer with Never Ending Reddit - keep scrolling, and keep viewing!
	- Made further improvements to detecting images on a page
- Never Ending Reddit
	- Orangered follows you down the page! See if you've got new mail when a new chunk 'o reddit loads!
- User Highlighter
	- RES's first community contributed module, thanks to MrDerk!
	- User highlighter puts a nice subtle highlight on original posters, admins, moderators and friends
- Style Tweaks
	- An all new module that combines some of reddit's most requested and/or favorite style tweaks
		- Comment Boxes
		- Username bar to top (great for netbooks where tabs bunch up!)

### Bug fixes

- Inline Image Viewer
	- Fixed a bug where hiding images occasionally didn't work right.


## v1.66

### New features

- Keyboard Navigation
	- Added "Next" and "Prev" keyboard shortcuts (n and p respectively) for link pages.

### Bug fixes

- Keyboard Nav
	- Fixed a bug where relative links weren't working in chrome.


## v1.65

### New features

- Core Code
	- Made some more improvements to efficiency in a few modules to release control of the browser
		- Specifically, delegated chunking of applying DOM changes to really large pages.
- Inline Image Viewer
	- The image viewer now skips over images it has already revealed (so you won't see the same image twice)
- Save Comments
	- Moved "save" button before "reply" button to avoid accidental link saving.
- Keyboard Navigation
	- Added the option for comment links (numbered links) to open in a new tab/window - this is the default

### Bug fixes

- Subreddit Tagger
	- Fixed a bug where subreddits with mixed case weren't being tagged properly
- Hide Comments
	- Fixed a problem where the "automatic" setting wasn't functioning properly


## v1.62

### Bug fixes

- Hide Child Comments
	- Embarassingly released this completely broken in 1.61 - it's fixed now.


## v1.61

### Bug fixes

- Keyboard Navigation
	- Fixed an issue with numbered comment links not working in Firefox


## v1.6

### New features

- User Tagger
	- Not a new feature, exactly, but I've increased the efficiency of this module significantly, even on first scan.
- Save Comments
	- Surprise! I've added a module that allows you to save comments.
	- Note: Comments are saved just like preferences, on your local machine, not somehow magically to your reddit account.
- Hide Child Comments
	- Updated the interface to toggle states, rather than just saying "toggle", says "hide" or "show", whichever is appropriate.

### Bug fixes

- Keyboard Navigation
	- Finally figured out what was going on with Mac's command key, added support for that - no more Apple-F taking you to the homepage, I hope.


## v1.52

### Bug fixes

- Never Ending Reddit
	- Fixed a bug on pages with Sponsored Links - reddit is misbehaving here, outputting two divs with the same ID - bad reddit! Bad!
- SingleClick Opener
	- Fixed a bug with l+c links not being shown on links from Never Ending Reddit
- Keyboard Navigation
	- Fixed basically the same thing as with Never Ending Reddit on pages with sponsored links.


## v1.51

### Bug fixes

- Live Comment Preview
	- Fixed a bug where the bold/italic bar didn't go away after submitting a comment
- User Tagger
	- Color coded vote weight now a separate element [v] to avoid CSS conflicts
	- Drastically increased efficiency of rescanning when new data is pulled in
- Keyboard Navigation
	- Drastically increased efficiency of rescanning when new data is pulled in


## v1.5

### New features

- Never Ending Reddit
	- Similar to scripts like River of Reddit and Auto Pager - automatically loads more reddit when you get to the bottom. Mmmm, more reddit.
- Keyboard Nav
	- Added the ability to visit links within comments!
		- When focused on a comment, you'll see numbers (0-9) for next to links within that comment. Hit that number to follow it!
	- Updated to support Never Ending Reddit
- User Tagger
	- Now, users are (optionally) automatically colored based on how often you upvote them!
	- Updated to support Never Ending Reddit

### Bug fixes

- A number of miscellaneous minor fixes, too minute and numerous to list.


## v1.1

### New features

- Image Viewer
	- Added ability to toggle images back off
	- Added an option to not show images tagged as NSFW
- Keyboard Nav
	- Added the following new keys:
		- l - clicks the l+c link (opens link and comments in new tabs)
		- h - hides the link
		- r - goes to subreddit of selected link (link pages only)
- User Tagger
	- Added the ability to ignore a user's posts and comments.

### Bug fixes

- Username Hider / Show Comment Karma
	- Fixed a bug where these items conflicted.
- Keyboard Nav
	- Swapped J and K keys to match VI defaults at community's request.
	- Fixed a bug where downvoting didn't work for users with thumbnails visible.
- Live Comment Preview
	- Fixed a bug where live comments weren't visible on edits of a reply that was just posted


## v1.0

### New features

- Core functionality
	- Added "table" data types as a new option type
		- If you've used the subreddit tagger, you've seen this. It allows you to create a set of data for which you might have multiple rows...
- Subreddit Tagger
	- Settings are now integrated in the [RES] console.  The [tag] link is gone!
	- Your old settings should be automatically copied into the new format.
- Hide Child Comments
	- Added a new module that allows you to hide all comments but responses to the original poster.

### Bug fixes

- General
	- Fixed a number of minor bugs, mostly just things that caused warnings, etc.


## v0.98

### New features

- Core functionality
	- Added the ability to check for updates manually
	- Added enumerated data types as a new option type
		- This means you can make an option that would warrant a radio button, for example
- SingleClick opener
	- Added an option to determine the order the links are opened (link then comments, or comments then link)
	- Added an option to hide the [l=c] link when it's the same as the comments link.
- Keyboard Navigation
	- Added new key commands:
		- Jump to Inbox (Default is i)
		- Jump to Front page (Default is f)
		- Jump to top link (default is shift-J)
		- Jump to bottom link (default is shift-K)
	- Added the ability to customize the border and background color of the keyboard-focused element.
- Show Comment Karma
	- Added the ability to customize the separator character

### Bug fixes

- Inline Image View
	- Fixed a bug caused by a change in Reddit's DOM that made images sometimes not show.


## v0.97

### Bug fixes

- Core system
	- Fixed a bug where the script would stop checking for auto updates.


## v0.96

### New Features

- Uppers and Downers
	- Added the option to show +/- signs by karma points (see preferences)
- Keyboard Navigation
	- Updated how it works for comments page - added the ability to move up to the original post and hit reply.
	- Also, in "sub comments pages" (i.e. a context link), hitting reply when the original post is selected goes to the main comments page so you can reply.
	- Added the ability to "Load more comments" just like expanding/collapsing comments -- caveat: you won't be able to keyboard nav through them just yet... that's going to be challenging to add.
- Inline Image View
	- Now shows total images found

### Bug fixes

- Core
	- Fixed a bug where RES was checking for updates too often
- Keyboard Navigation
	- Fixed a bug where you couldn't up/downvote links that had thumbnails
	- Fixed a bug where keyboard navigation wasn't active on non-subreddit comments page (I didn't even know those existed!)
	- Un-broke following links/comments in a new tab - they're now configurable as separate keycodes, too.
- Inline Image View
	- Fixed a bug where images in comments weren't detected properly


## v0.95

### New features

- Inline Image View
	- New feature!  Adapted from "Show Imgur Images", but mostly rewritten.
	- Integrated imgureddit for double goodness...
		- Included a bug fix to imgureddit, too!
	- Has better regexp support for image detection than the original
	- Added options:
		- max width of image to display inline
		- max height of image to display inline
		- option to open images in a new window when clicked
- Keyboard Navigation
	- Added the ability to expand/collapse comments (enter key by default)
	- Added the ability to move up/down comments by "sibling" (skipping to the next comment at the same level)
	- Added inbox keys / navigation
	- Added the ability to click on a link or comment box to move keyboard focus there
	- Completely revamped the way keys are stored, it's much better now!
- Live Comment Preview
	- Now hiding the preview until you've typed something, also hiding it if you've cleared out your comment.
	- Added support for inbox (it wasn't showing up there)
- Display Comment Karma
	- Concept originally from http://userscripts.org/scripts/show/66505 - but it's been rewritten.

### Bug fixes

- Keyboard Navigation
	- Fixed a bug with the help toggle
	- Fixed moving up/down through comments to skip through hidden comments
- Subreddit Tagger
	- Fixed a bug that would sometimes cause tags not to be applied
- Full Comments Linker
	- Fixed support for inbox, the URL regex match was wrong. Oops :(
- SingleClick opener
	- Fixed a busted regex exclude - now it won't show up on a comments page...


## v0.90

Initial release!



[Unreleased]: https://github.com/honestbleeps/Reddit-Enhancement-Suite/compare/v4.6.0...HEAD
