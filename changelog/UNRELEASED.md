
### New Features

- New FilteReddit filterline for complex filters on demand (click the "∀" tab on a post listing to try it out) (thanks @larsjohnsen)
- osu.ppy.sh/ss/ media host (thanks @Dexesttp)
- Display "saved" shortcut in subreddit manager (thanks @spezzino)
- New media host for dropbox.com direct links (thanks @larsjohnsen)
- New option markSelftextVisited to mark text posts as visited on expand (thanks @larsjohnsen)
- Display gold status in userbar (thanks @bruno207)
- New {{linkflair}} macro placeholder (thanks @amews)
- New option swapBigEditorLayout to swap position of editor and preview pane in big editor (thanks @dhensche)
- Display more friendly names for settings rather than camelCase (thanks @dhensche)
- FilteReddit now does not filter your own posts by default (thanks @ssonal)
- Add user highlighting for reddit alumni (thanks @chewong)
- More detailed options for controlling auto-expansion of expandos: autoExpandTypes and dependant options (thanks @larsjohnsen)
- Improve responsiveness of Keyboard Navigation (thanks @larsjohnsen)

### Bug Fixes

- Fix last visited column still being displayed when the storeSubredditVisit option was disabled (thanks @Jtfinlay)
- Fix expandos not loading on wiki pages (thanks @larsjohnsen)
- Fix gallery navigation arrows having the wrong cursor on Edge (thanks @wojtekmaj)
- Fix RES-saving comments (thanks @larsjohnsen)
- Fix gallery navigation not working properly when multiple galleries are on screen (thanks @larsjohnsen)
- Fix Comment Tools not working on live threads (thanks @tao-lu)
- Fix navigating to posts after completing the Konami code (thanks @jvtrigueros)
- Fix score left time appearing negative when the score has been revealed (thanks @nyuszika7h)
- Fix Quick Message dialog appearing when clicking "message the moderators" even when a modifier key is held (thanks @sionide21)

### Housekeeping / Other

- Show "return to originating expando" button after auto-scrolling to previously opened expando (thanks @larsjohnsen)
- Add gears linking to settings on /r/Dashboard tabs (thanks @dhensche)
- Update some dependencies (thanks @BenMcGarry)
- Use native browser implementations instead of babel-runtime (thanks @erikdesjardins)
- Add tests and marginally improve performance of messaging API wrapper (thanks @erikdesjardins)
- More precise handling of comments linklistings, e.g. reddit.com/comments (thanks @larsjohnsen)
- Do not display notifications for /r/RESAnnouncements posts if they are browser-specific and do not apply to the current browser (thanks @michaelskiles)
- Remove the last usage of Gulp from the build process (thanks @erikdesjardins)
- Set up integration tests (thanks @erikdesjardins)
