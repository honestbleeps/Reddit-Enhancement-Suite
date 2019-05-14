### New Features

- Faster initialization by starting page mutations earlier (thanks @larsjohnsen)
- filteReddit: New option [hideUntilProcessed](https://www.reddit.com/#res:settings/filteReddit/hideUntilProcessed) to only show posts that have been processed through the filters, preventing FOUC (thanks @larsjohnsen)
- Support media host VLive.tv (thanks @sporksparks)

### Bug Fixes

- Prevent Reddit cloning RES elements when editing comments (thanks @larsjohnsen)
- commentPreview big editor: Improve open/close speed (thanks @larsjohnsen)
- commentTools autocomplete: Show also suggestions in the big editor (thanks @larsjohnsen)
- commentTools autocomplete: Improve suggestion speed, refactor (thanks @larsjohnsen)
- filteReddit: Allow for unicode regexes (thanks @larsjohnsen)
- filteReddit: Fix filter observer callback being invoked for every Thing, instead of only those necessary (thanks @larsjohnsen)
- hosts xkcd: Remove now unneeded workaround for alt-text encoding (thanks @larsjohnsen)
- init: Don't batch loading of options (may fix FOUC issue for Firefox users) (thanks @larsjohnsen)
- neverEndingComment: Remove delay for loading more comments (thanks @larsjohnsen)
- neverEndingReddit: Complete callbacks on current page before loading next page (thanks @larsjohnsen)
- neverEndingReddit: Display pause icon in the widget (thanks @larsjohnsen)
- redesign: Add support for sorting tables (thanks @CAVillalobos)
- redesign: Fix accountSwitcher not displaying the current logged in account (thanks @larsjohnsen)
- redesign: Fix link to dashboard (thanks @prakhar1912)
- redesign: Fix user tagger when not always closing when navigating between posts (thanks @prakhar1912)
- redesign: Make uncheckSendRepliesToInbox work (thanks @prakhar1912)
- redesign: Prevent duplication of user tags when navigating posts (thanks @prakhar1912)
- selectedEntry: Remove broken option selectLastThingOnLoad (thanks @larsjohnsen)
- selectedEntry: Try to select early if there's no previous selection (thanks @larsjohnsen)
- settingsConsole autostage: Use frameDebounce to make it react quicker (thanks @larsjohnsen)
- settingsNavigation options embed: Allow slower load without opening in new tab (thanks @larsjohnsen)
- showImages conserveMemory: Tweak IntersectionObserver setup to fix erronous unloading on Chromium (thanks @larsjohnsen)
- showImages: Remove badly-implemented text-based 'catch-all' icon (thanks @larsjohnsen)
- storage: Fix CAS not working on newer Chrome versions, and don't ignore the default value (thanks @erikdesjardins)
- userTagger: Rerender tags only if necessary (reducing reflows) (thanks @larsjohnsen)

### Housekeeping / Other

- Watchers use a just-in-time strategy for mutations (thanks @larsjohnsen)
  - Non-immediate watcher callbacks are executed when they are close to the viewport by using IntersectionObserver
  - Fewer requests to external providers are sent (e.g. expando host info is only fetched when necessary)
- New module init phase contentStart, invoked when the first Thing has been added to the DOM (thanks @larsjohnsen)
- Remove superfluous init stage bodyReady (thanks @larsjohnsen)
- Rename init phase `loadDynamicOptions` to `onInit` (thanks @larsjohnsen)

- Replace dependency momentjs with much lighter dayjs (thanks @larsjohnsen)
- Load fonts earlier to avoid additional reflow in case they are slow to load (thanks @larsjohnsen)
- CSS clean-up: Moves some rules from general stylesheet to the module stylesheets they are being used. (thanks @larsjohnsen)

- Optimize showImages by avoiding checking visibility on every scroll event (thanks @larsjohnsen)
- showImages expando: Optimize element generation (thanks @larsjohnsen)
- Thing: Add debug function `getThingIsVisibleInconsistencies` to check that method Thing#isVisible works correctly (thanks @larsjohnsen)
- Use interface CreateElement.fancyToggleButton to create fancy buttons (thanks @larsjohnsen)
- backAndRestore: Add searchable terminology: import/export (thanks @honestbleeps)
- betteReddit showVideoTimes: Refactor and add Host#getVideoData interface (thanks @larsjohnsen)
- selectedEntry is simplified; option scrollToSelectedThingOnLoad is removed (thanks @larsjohnsen)
- showImages: Remove unnecessary option bufferScreens (thanks @larsjohnsen)
- showImages: Unload media when collapsing where possible to reduce memory usage (thanks @larsjohnsen)

- storage wrapPrefix: Add option for auto batching `get` requests (thanks @larsjohnsen)
- utils throttle: Invoke when the microtask queue is empty rather than on `setTimeout` callback (thanks @larsjohnsen)
- utils waitForRemoval: Add option to disconnect observer (thanks @larsjohnsen)

- Limit api.twitter.com permission to the only endpoint we use (thanks @erikdesjardins)
- Reenable FF integration tests (thanks @erikdesjardins)
- Remove support for EdgeHTML (thanks @XenoBen)
- Update dependencies (thanks @larsjohnsen, @kevinji)
- ava: Move config from package.json to ava.config.js (thanks @kevinji)
- packageInfo gitDescription: Use `git rev-parse HEAD` as fallback for `git describe` (thanks @larsjohnsen)
- webpack: Remove now-unneeded object-rest-spread transform (thanks @erikdesjardins)
