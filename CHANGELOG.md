# Change Log

All notable changes to the "Void" extension will be documented in this file.

## [0.0.5] - 2026-01-11
### Added
- **Smart Whitelist:** Introduced `void.excludedFiles` setting. Files matching these patterns (e.g., `README.md`, `package-lock.json`) are now readable by default, even in "Blur All" mode.
- **Configuration Listener:** The extension now dynamically updates whitelisted files without requiring a reload.

### Fixed
- Fixed an issue where documentation and log files were unreadable in the default configuration.

## [0.0.4] - 2026-01-11
### Added
- **Blur All Mode:** New default setting (`void.blurMode: "all"`) that blurs the entire file content for maximum privacy.
- **Custom Patterns:** Users can now define their own regex rules in `void.customPatterns`.
- **Status Bar Toggle:** Added an interactive "Eye" icon in the status bar to quickly enable/disable the extension.
- **Secure Vault:** Implemented an in-memory vault for secret storage, ensuring copied secrets are never exposed in command arguments.

### Changed
- **Build System:** Migrated from Webpack to standard TypeScript (`tsc`) for cleaner builds and easier debugging.
- **Architecture:** Refactored secret detection to use a `Map` based storage instead of direct string manipulation.

## [0.0.3] - 2026-01-05
### Added
- Initial release of Void.
- Basic secret scanning for `.env` files.
- "Frosted Glass" CSS decoration style.
