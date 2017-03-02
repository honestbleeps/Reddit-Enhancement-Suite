
### New Features

- Never Ending Reddit reloads the previous page immediately when navigating back (thanks @larsjohnsen)
- New hideLinkInstant option to immediately remove hidden posts (without Reddit's fade-out) (thanks @larsjohnsen)
- New openFrontpage option to open the subreddit's front page when clicking \[l=c\] (thanks @alexvanolst)
- New beam.pro media host (thanks @BenMcGarry)
- New masterypoints.com media host (thanks @Crecket)

### Bug Fixes

- Fix vote score moving in the wrong direction in Show Parent hover (thanks @mc10)
- Fix Spam Button autofilling an invalid URL (thanks @larsjohnsen)
- Fix Comment Tools appearing on Source Snudown textarea (thanks @larsjohnsen)
- Fix filterSubredditsFrom description not mentioning /r/popular (which it does support) (thanks @erikdesjardins)
- Fix FilteReddit allowNsfw (thanks @larsjohnsen)
- Fix Account Switcher in Firefox private browsing mode also logging you out in normal mode (thanks @erikdesjardins)
- Fix Save Comments save-RES button disappearing when unsaving (thanks @larsjohnsen)
- Fix expandos for Gyazo gifs/videos (thanks @lhofmann)
- Fix Keyboard Nav link number annotations not appearing on self posts (thanks @larsjohnsen)
- Fix fragment and schemaless links in Wikipedia expandos (thanks @larsjohnsen)

### Housekeeping / Other

- Throttled loading continues in non-focused tabs (thanks @larsjohnsen)
- Improve diagnostic check to avoid adding duplicate debug info in more situations (thanks @lhofmann)
- Imgur host treats direct links to .jpeg the same as .jpg, .png, etc. (thanks @ATMarcks)
- Streamline submit issue flow (thanks @andytuba)
- Add trailing slash to /r/popular link to avoid a redirect (thanks @andytuba)
- Reduce impact of translations on startup time (thanks @erikdesjardins)
- Hide the Page Navigator link dropdown when using Keyboard Nav to move up/down (thanks @larsjohnsen)
- Avoid some forced reflows due to querying viewport size (thanks @larsjohnsen)
- Add "unofficial" verbiage to onboarding (thanks @andytuba)
- Finish preparing all module options for translation (they are not all translated yet) (thanks @erikdesjardins, @roshkins)
- Update repo issue template (thanks @andytuba)
- Minor browser manifest/dependency maintenance (thanks @BenMcGarry, @erikdesjardins)
