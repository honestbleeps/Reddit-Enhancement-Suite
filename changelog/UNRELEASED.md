### New Features

- New media host: Peertube (thanks @aliceinwire)
- showImages: New option [startVideosMuted](https://www.reddit.com/#res:settings/showImages/startVideosMuted) for muting RES generated videos (imgur, gfycat, streamable etc) by default (thanks @larsjohnsen)

### Bug Fixes

- Fix announcements link in certain contexts (thanks @andytuba)
- Fix filteReddit partial match for flair / domain (thanks @larsjohnsen)
- Fix filteReddit evaluation order not being sorted by speed (thanks @larsjohnsen)

### Housekeeping / Other

- selectedEntry: Make autoSelect react faster, make initial selection cheaper (thanks @larsjohnsen)
- neverEndingReddit: Always reset pauseAfterPages when changing page (thanks @larsjohnsen)
- neverEndingReddit: Don't store the last page in history.storage (thanks @larsjohnsen)
- Some settings console optimizations (thanks @larsjohnsen)
- Use a more aggressive fade curve on hover widgets (thanks @larsjohnsen)
- Display notice when migrations are being processed (thanks @larsjohnsen)
- Tweak font loading process to improve likelyhood that it actually loads (thanks @larsjohnsen)
- Storage: New clean-up interface, clean unchanged preferences regularly to improve initialization performance (thanks @larsjohnsen)
