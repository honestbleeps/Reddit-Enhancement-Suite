<!-- e.g. "fixes #1234", see https://github.com/blog/1506-closing-issues-via-pull-requests -->
Relevant issue: 
Tested in browser: 

If this PR touches `lib/environment/`, browser manifests, or build target logic, complete this before marking it review-ready:

- [ ] Chrome smoke: injects on old Reddit, settings persist, toolbar style toggle works, `showImages` works, downloads remain managed, history-dependent behavior still works
- [ ] Firefox smoke: injects on old Reddit, settings persist, toolbar style toggle works, `showImages` works, downloads remain managed, history-dependent behavior still works, Firefox-specific auth/storage behavior still matches expectations
- [ ] Safari smoke (if applicable): use the Safari checklist in `CONTRIBUTING.md`
