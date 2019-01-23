### New Features

- New module: Request all optional permissions ([requestPermissions](https://www.reddit.com/#res:settings/requestPermissions)) (thanks @larsjohnsen)
- Add option to collapse replies to ignored users ([usersMatchRepliesAction](https://www.reddit.com/#res:settings/filteReddit/usersMatchRepliesAction)) (thanks @larsjohnsen)
- redesign: Make logoLink usable (thanks @schilkyl, @Jarob22)

### Bug Fixes

- Fix NSFWfilter not being applied in some situations (thanks @larsjohnsen)
- Fix accountSwitch missing a scrollbar when the dropdown is taller than the window (thanks @larsjohnsen)
- Fix backup to Google Drive not working for some Firefox users (thanks @larsjohnsen)
- Fix neverEndingReddit hideDupes (thanks @larsjohnsen)
- Fix neverEndingReddit incompatibility with Edge 17 (thanks @larsjohnsen)
- Fix neverEndingReddit returnToPrev for Firefox fallback triggering loggedInUser too early (thanks @larsjohnsen)
- Fix styleTweaks controls sometimes not appearing on first load (thanks @larsjohnsen)
- Fix user autocomplete being very slow and sometimes freezing (thanks @larsjohnsen)
- Fix userTagger sometimes duplicating tag icons (thanks @larsjohnsen)
- Fix userTagger widget in Firefox disappearing when selecting tag color (thanks @larsjohnsen)
- keyboardNavigation: Prevent expando toggling from scrolling in undesired directions (thanks @larsjohnsen)

### Housekeeping / Other

- Assume that promoted links are hidden (thanks @larsjohnsen)
- Optimize filteReddit list filters (such as users and subreddits) (thanks @larsjohnsen)
- Prevent Firefox reloading extension on already active pages (thanks @larsjohnsen)
- filteReddit: Move option allowNSFW closer to NSFWfilter (thanks @larsjohnsen)
- utils bodyClasses: Make sure classes are applied to document.body (thanks @larsjohnsen)
