# Safari Public Beta Rollout

This document covers the first broad Safari beta for RES. The public install path is **TestFlight only**. GitHub artifacts are for maintainers and code review, not for public installation.

## Preconditions

- Apple Developer Program enrollment is complete.
- App Store Connect access exists for the RES Safari container app.
- The Safari bundle identifiers remain:
  - `com.honestbleeps.redditenhancementsuitesafari`
  - `com.honestbleeps.redditenhancementsuitesafari.Extension`
- The branch has a draft PR open for code review and release context before the public beta link is shared.

## Release Checklist

1. Run local validation:
   - `yarn test`
   - `yarn eslint`
   - `yarn safari:validate`
2. Confirm the macOS GitHub Actions Safari validation job is green on the beta branch or draft PR.
3. Open `/dist/safari-xcode/Reddit Enhancement Suite Safari/Reddit Enhancement Suite Safari.xcodeproj` in Xcode.
4. Set the Apple team/signing configuration for the app target and extension target.
5. Archive the app from Xcode and upload it with Organizer to App Store Connect.
6. In App Store Connect, complete any required app metadata, privacy, and export-compliance fields before enabling testing.
7. Create an internal TestFlight group first and run the Safari smoke checklist:
   - extension enables in Safari
   - old Reddit injects correctly
   - settings open and persist
   - subreddit style toggle works on a styled subreddit
   - `showImages` expands media and the download fallback opens a new tab
   - file backup/restore works
   - private browsing does not crash
   - `debug.html` stays clean or captures actionable errors
8. Only after the internal pass is stable, create the external/public TestFlight group or public link.
9. Create a GitHub tracking issue or point testers to the Safari beta issue template before the external link is posted.
10. Publish the `/r/Enhancement` announcement only after the public TestFlight link works.

## TestFlight Metadata

### Beta App Description

```text
Reddit Enhancement Suite for Safari is in public beta on macOS. This build focuses on old Reddit support and best-effort parity with the existing Chrome and Firefox releases while Safari-specific gaps are still being validated.
```

### What to Test

```text
Please focus on old.reddit.com injection, settings persistence, subreddit style toggling, showImages media expansion, file backup/restore, and private browsing stability. If you hit an issue, open the RES Safari diagnostics page, copy or download the report, and include it in a GitHub Safari beta bug report.
```

### Known Limitations

```text
Safari currently does not support extension-managed browsing history, so history-dependent RES behavior is disabled. Downloads opened from showImages fall back to opening the asset in a new tab for manual save. Cloud backup may be limited to manual auth or file-based backup/restore only while Safari auth behavior is still being validated.
```

### Feedback Contact

App Store Connect requires a feedback email for TestFlight. Use the appropriate maintainer/team mailbox there, but direct actionable bug reports to the GitHub Safari beta issue template so reports stay searchable and triageable.

## Tester Feedback Path

- Primary bug intake: GitHub Safari beta issue template
- Community discussion and announcements: `/r/Enhancement`
- Required bug report data:
  - macOS version
  - Safari version
  - RES version/build
  - whether the issue is on old Reddit, new Reddit, or both
  - reproduction steps
  - actual vs expected behavior
  - diagnostics report from `debug.html`

## Reddit Announcement Checklist

The `/r/Enhancement` post should include:

- macOS and Safari version target
- install path: TestFlight only
- current Safari limitations
- link to the draft PR or beta tracking context for changelog/review visibility
- link to the GitHub Safari beta issue template for bug reports
- request to include the exported diagnostics report when filing issues
