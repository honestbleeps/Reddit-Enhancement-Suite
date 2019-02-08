### New Features

- New host Peertube (thanks @aliceinwire)
- showImages: New option [startVideosMuted](#res:settings/showImages/startVideosMuted) for muting RES videos (e.g, imgur, gfycat, streamable) by default (thanks @larsjohnsen)

### Bug Fixes

- Fix announcements link in certain contexts (thanks @andytuba)
- Fix filteReddit partial match for flair / domain (thanks @larsjohnsen)
- Fix filteReddit filter evaluation order causing slowdown (thanks @larsjohnsen)

### Housekeeping / Other

- selectedEntry: Make autoSelect react faster, make initial select cheaper (thanks @larsjohnsen)
- neverEndingReddit: Always reset pauseAfterPages when changing page (thanks @larsjohnsen)
- neverEndingReddit: Don't store the last page in history.storage (thanks @larsjohnsen)
- Some settings console optimizations (thanks @larsjohnsen)
- Use a more aggressive fade curve on hover widgets (thanks @larsjohnsen)
- Display notice when migrations are in progress (thanks @larsjohnsen)
- Storage: New clean-up interface, clean unchanged preferences regularly to improve initialization performance (thanks @larsjohnsen)
