### New Features

- neverEndingReddit: Add a link to the loaded page in the page marker (thanks @fenuks, @larsjohnsen)
- Ignored users: (Re)implement placeholder as an alternative to hiding (see option [usersMatchAction](https://www.reddit.com/#res:settings/filteReddit/usersMatchAction)) (thanks @larsjohnsen)

### Bug Fixes

- Apply custom styles in the settings console (thanks @larsjohnsen)
- Fix legacyFavicon (@thanks corylulu)
- Fix filters initializing before upgrade migration is done (thanks @larsjohnsen)
- Fix neverEndingReddit regression on inbox 'all messages' and moderation log (thanks @larsjohnsen)
- Fix subreddit styles sometimes not being removed quickly enough when with nightmode enabled (thanks @larsjohnsen)
- Restore user tags on all locations, and never close widget automatically (thanks @larsjohnsen)
- Fix Edge failing to load background listeners (thanks @larsjohnsen)
- Fix RES believing some comments are hidden even when they are selected (thanks @larsjohnsen)

### Housekeeping / Other

- Open settings console in a new tab when it can't be embedded (as may happen when using NoScript, Firefox's Content Blocking, Chrome's "Block third-party cookies" etc) (thanks @larsjohnsen)
- Try loading icon font again if the first attempt failed (thanks @larsjohnsen)
- Optimize settingsConsole performance (especially noticeable on the filteReddit page when many subreddits/users have been filtered) (thanks @larsjohnsen)
- settingsConsole: Don't reply to internal messaging meant for background (thanks @larsjohnsen)
- settingsConsole: Only show permission prompt if not already granted (thanks @larsjohnsen)
- Improve tolerance to filteReddit migration bugs (thanks @larsjohnsen)
- Add locking system to migration, to avoid multiple tabs initiating it (thanks @larsjohnsen)
- Try to repair bad migrations that happened to filters due to process being disturbed (e.g. closing the tab or navigation before it was done), though note that this might disable some legitimate filters (thanks @larsjohnsen)
- Fix Edge manifest validation issue (thanks @BenMcGarry)
