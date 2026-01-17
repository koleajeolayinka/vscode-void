# Change Log

All notable changes to the "Void" extension will be documented in this file.

## [0.0.5] - 2026-01-17
### Added
- **Smart Key Visibility:** In "Secrets Mode", variable names (e.g., `STRIPE_KEY`) now remain visible while only the values are blurred.
- **Smart Whitelist:** Introduced `void.excludedFiles` setting. Files matching these patterns (e.g., `README.md`, `package-lock.json`) are now readable by default.
- **Copy Icon:** Updated the hover tooltip to use the standard VS Code `$(copy)` icon for a cleaner look.

### Changed
- **Default Mode:** Changed the default `void.blurMode` from `"all"` to `"secrets"` for a better out-of-the-box experience.
- **Hover Logic:** Refactored the hover provider to prevent duplicate "Copy" buttons from appearing when toggling the extension.

### Removed
- **Custom Patterns:** Removed `void.customPatterns` to simplify configuration and rely on the new smart detection logic.

## [0.0.4] - 2026-01-11
### Added
- **Blur All Mode:** New default setting (`void.blurMode: "all"`) that blurs the entire file content for maximum privacy.
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