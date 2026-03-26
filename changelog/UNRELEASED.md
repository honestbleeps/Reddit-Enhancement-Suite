### New Features

- None (thanks nobody)

### Bug Fixes

- Added a Safari build target, local Xcode conversion/validation workflow, and explicit Safari fallbacks for unsupported history/download APIs.
- Added Safari runtime diagnostics, a `debug.html` troubleshooting page, and non-fatal Safari toolbar/options fallbacks so runtime failures no longer fail silently.
- Added Safari diagnostics export/copy actions and GitHub issue links so Safari runtime failures can be reported with attached diagnostic context.

### Housekeeping / Other

- Documented the Safari smoke-test checklist and the current Safari-only support gaps for local validation and future releases.
- Added a macOS Safari validation lane in GitHub Actions so maintainers can verify the Xcode conversion path and collect Safari artifacts from CI.
