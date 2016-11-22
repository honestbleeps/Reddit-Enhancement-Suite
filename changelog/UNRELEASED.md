
### New Features

- Add showTaggingIcon option to allow hiding the tag icon (when disabled, users can still be tagged by clicking the vote weight or an existing tag) (thanks @larsjohnsen)
- Add browsePreloadCount option to preload expandos of subsequent posts for faster browsing (thanks @larsjohnsen)
- HTML5 video expandos are paused when offscreen and unloaded when far offscreen (thanks @larsjohnsen)
- Add a badge displaying the number of multireddits a subreddit is in next to the subscribe button (thanks @dhensche)
- Add custom filter condition for the current date (thanks @andytuba)
- Allow iframe expandos (notably YouTube videos) to be resized (thanks @thybag)
- Add Profile Navigator module to quickly navigate to part of your profile by hovering on the userbar (thanks @andytuba)

### Bug Fixes

- Fix comment tools on the ban page (thanks @dhensche)
- Replace subreddit header icon when disabling subreddit style (thanks @Lakston, @erikdesjardins)
- Fix Never Ending Reddit pause notification showing on every pageload instead of when clicking the pause button (thanks @erikdesjardins)
- Fix some Imgur albums not loading if they were removed the the Imgur gallery (thanks @erikdesjardins)

### Housekeeping / Other

- Improve performance of loading new pages with Never Ending Reddit (thanks @larsjohnsen)
- Reduce impact on scrolling performance in browsers that support the IntersectionObserver API (thanks @larsjohnsen)
- Record module profiling with the performance timing API (thanks @erikdesjardins)
- Cleanup of some code in the Show Images module (thanks @mc10)
- Filterline styling tweaks (thanks @larsjohnsen)
- Add Flow typing (thanks @erikdesjardins)
