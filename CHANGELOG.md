# Changelog

## [0.91] — 2026-10-24

### Added

- `PAUSE_ON_UNLOAD` option: pauses in the DevTools debugger (`debugger;` in a `beforeunload` handler) before the page navigates away; off by default, a last-resort option that also pauses on page reload

### Fixed

- `Map` and `Set` in snapshots were logged as empty objects (`{}`); they are now copied as `Map` / `Set`, with circular references inside them marked `[circular]`

## [0.9] — 2026-09-30

Initial release.

### Added

- Logging of every `dataLayer.push` to the console, color-coded by type: `EVENT`, `gtm.*`, `GTAG`, `DATA`
- Detection of `gtag()` calls by `Arguments` object type
- Collapsed group with entries pushed before interception
- Snapshot of each push via recursive copy: circular references marked `[circular]`, DOM elements and functions replaced with readable strings
- `SHOW_GTAG` option to hide `gtag()` calls
- `SHOW_SOURCE` and `FRAMES` options to show the call stack of each push
- `COLORS` option to configure background and text color per type
- Protection against repeated interception, allowing use as a Live Expression
- Return value with container and tag IDs exposed via `google_tag_manager`
