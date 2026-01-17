# Void

**Void** is a privacy-focused extension for Visual Studio Code designed to obscure sensitive information within your editor. Whether you are screen-sharing, live streaming, or working in a public environment, Void ensures your secrets remain private while keeping your context clear.

## Key Features

- **Smart Secret Detection:** Automatically detects API keys, tokens, and passwords, blurring *only the values* while keeping the variable names visible (e.g., `STRIPE_KEY = 🔒`).
- **Blur All Mode:** Option to blur the entire file content for maximum privacy during presentations.
- **Smart Whitelist:** Automatically keeps safe files readable (such as documentation and logs) even when privacy mode is active.
- **Secure Copy:** Hover over any hidden secret to safely copy the value to your clipboard without ever revealing it on screen.
- **Status Bar Toggle:** Quickly enable or disable the extension via the status bar.

## Configuration

You can customize Void in your VS Code settings:

| Setting | Default | Description |
| :--- | :--- | :--- |
| `void.blurMode` | `"secrets"` | Choose `"secrets"` to hide only sensitive values, or `"all"` to blur the entire file. |
| `void.excludedFiles` | `["**/*.md", ...]` | Glob patterns for files that should remain readable (e.g., READMEs, Lock files). |

## Usage

1. **Toggle:** Click the **Eye Icon** `$(eye)` in the bottom right status bar to turn Void on or off.
2. **Copy:** Hover over any blurred secret and click the **Copy** button to retrieve the value safely.
3. **Customize:** Access the Extension Settings (`Cmd+,`) to modify excluded files or switch blur modes.

## Support and Contributions

This is an open-source project. Contributions and bug reports are welcome to help improve the tool for the community. Please submit any issues or feature requests via the GitHub repository.

---
**Void** - Built with privacy in mind.