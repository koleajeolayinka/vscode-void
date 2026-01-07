# Change Log

All notable changes to the "vscode-void" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.3] - 2026-01-07

### Added
- **Status Bar Toggle:** Added a clickable "Eye" icon in the status bar to globally enable/disable Void.
- **Secure Vault Architecture:** Implemented an in-memory map to store secrets. When copying a secret, the extension now references a temporary token ID instead of exposing the raw secret in the command URI.
- **Smart Configuration:** Added `void.filesToScan` setting. Users can now configure Void to scan specific file patterns (e.g., `**/*.json`, `**/*.js`) beyond just `.env`.
- **Hover Tooltip:** Added a "Hidden Value" tooltip when hovering over blurred text.
- **Copy-to-Clipboard:** Added a secure `[Copy]` button inside the hover tooltip.

### Changed
- **Performance:** Optimized the scanning engine using `WeakMap` caching to reduce CPU usage when switching tabs.
- **Visuals:** Updated the blur effect to use a "Frosted Glass" style (transparent color with text-shadow) for better aesthetics.
- **Startup:** Adjusted activation events to ensure secrets are blurred immediately upon window load (preventing "flash" of visible text).

### Fixed
- Fixed an issue where JSON keys wrapped in quotes (e.g., `"API_KEY":`) were not being detected by the regex scanner.

## [0.0.2]

- Internal release for testing the "Blur Engine" core logic.

## [0.0.1]

- Initial scaffold and release.