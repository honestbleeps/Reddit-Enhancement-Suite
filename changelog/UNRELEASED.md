### New Features

- Very preliminary support for the reddit redesign
	- Account Switcher (thanks @andytuba)
	- User tags (thanks @erikdesjardins)
	- Settings menu (thanks @andytuba)
- New hidePinnedRedditVideos option to hide reddit's video overlay that appears when you scroll down (thanks @overdodactyl)
- New Orangered faviconUseLegacy option to use the old Reddit favicon (thanks @corylulu)
- New Keyboard Navigation linkNumberAltModeModifier option to disable or change the alt-number shortcuts (thanks @larsjohnsen)
- New option for redditLogoDestination to make the reddit logo link to /hot instead of the new /best sort (thanks @BenMcGarry)
- New "toggle" command line command for custom toggles (thanks @larsjohnsen, @octagonal)
- New "front" command line command (thanks @vogon101)
- New shift-C keyboard shortcut to hide all child comments (thanks @honestbleeps)
- User Tagger supports creating preset tags (thanks @pll33)
- Account Switcher will prompt for your password if you leave the field blank (thanks @qenya)
- Filterline comment filters can be used for comment navigation (thanks @larsjohnsen)
- Toggling a custom toggle updates all tabs where supported (thanks @larsjohnsen)
- NSFW toggle state updates across tabs (thanks @larsjohnsen)
- Options which refer to Custom Toggles are now selectable from a dropdown (thanks @larsjohnsen)
- Media Hosts
	- vlipsy.com (thanks @matt2legit)
	- streamja.com (thanks @ngdio)

### Bug Fixes

- Fix Hide Child Comments remembering "hide all" state for newly-loaded comments (thanks @larsjohnsen)
- Fix scrolling in subreddit dropdown also scrolling the page (thanks @Alexendoo)
- Fix [l+c] Single Click Opener button opening duplicate tabs for i.redd.it images (thanks @tersers)
- Fix unloading media breaking resizing (thanks @larsjohnsen)
- Fix extra right margin on hidden usernames in some situations (thanks @okdana)
- Fix Night Mode getting disabled everywhere when loading a page in the redesign (thanks @erikdesjardins)
- Fix Go Mode panel showing keyboard shortcuts that don't work on the current page (thanks @corylulu)
- Fix media downloads in Chrome (thanks @erikdesjardins)
- Fix nonfunctional Night Mode CSS being enabled in the Reddit Alpha when toggling it (thanks @larsjohnsen)
- Fix continuous redirect when navigating back from redirected profile page (thanks @mudkip908)
- Fix multiple User Tagger icons appearing on users in the redesign (thanks @andytuba)

### Housekeeping / Other

- Remove Firefox beta deployment, since Mozilla is removing the ability to release beta versions
- New Comment Count filter counts all comments in unopened threads as new (thanks @larsjohnsen)
- Minor update to contributing docs (thanks @BenMcGarry)
- Codeclimate updates (thanks @mc10)
- Use ResizeObserver where supported for improved expando resizing performance (thanks @larsjohnsen)
- Avoid triggering another automatic backup on the pageload after restoring (thanks @erikdesjardins)
- Make clicking to open expandos slightly faster (thanks @larsjohnsen)
- Switch numeric keycodes to named keys (thanks @mc10)
- Lint config tweaks (thanks @mc10)
- Make Keyboard Navigation help panel animation smoother (thanks @jeromew21)
- Voting keyboard shortcuts are disabled on archived posts (thanks @erikdesjardins)
- Reload opened duplicate iframe media instead of scrolling to it (thanks @larsjohnsen)
- Cleanup Show Images (thanks @larsjohnsen)
- Remove dead media hosts (thanks @BenMcGarry)
- Update redesign API usage (thanks @andytuba)
- Update dependencies, tweak build (thanks @mc10)
- Fix tests (thanks @andytuba)
