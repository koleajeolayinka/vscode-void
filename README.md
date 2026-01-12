# Void

**Void** is a privacy-focused extension for Visual Studio Code designed to obscure sensitive information within your editor. Whether you are screen-sharing, live streaming, or working in a public environment, Void ensures your code and secrets remain private.

## Key Features

- **Blur All Mode:** Automatically blurs the entire file content to prevent accidental data leaks during presentations.
- **Smart Whitelist:** Automatically keeps safe files readable (such as documentation and logs) even when Blur Mode is active.
- **Secret Detection:** Uses regex patterns to identify and obscure API keys, tokens, and passwords specifically.
- **Secure Vault:** Allows you to copy obscured secrets to your clipboard without revealing them on the screen.
- **Status Bar Toggle:** Quickly enable or disable the extension via the status bar.

## Configuration

You can customize Void in your VS Code settings:

| Setting | Default | Description |
| :--- | :--- | :--- |
| `void.blurMode` | `"all"` | Choose "all" to blur everything or "secrets" to blur only detected keys. |
| `void.excludedFiles` | `["**/*.md", ...]` | Patterns for files that should remain readable. |
| `void.customPatterns` | `[]` | Add custom regex patterns to blur specific internal tokens. |

## Usage

1. **Toggle:** Click the "Eye" icon in the bottom right status bar to turn Void on or off.
2. **Copy:** Hover over any blurred text and select "Copy to Clipboard" to retrieve the value safely.
3. **Customize:** Access the Extension Settings to modify blur behavior and whitelists.

## Feedback and Contributions

Void is an open-source project. We value your feedback to make this tool better for the developer community. If you have suggestions or encounter bugs, please submit them via the GitHub Issues page.

---
**Void** — Privacy for Developers.
