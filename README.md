# Void for VS Code

**Void** is a privacy-focused extension that blurs sensitive information in your editor. Whether you are screen-sharing, live streaming, or working in a public cafe, Void ensures your secrets (and code) remain private.

![Void Demo](https://placehold.co/600x400?text=Void+Extension+Demo)

## 🚀 Key Features

- **Blur All Mode (Default):** Automatically blurs the entire file content to prevent accidental leaks during presentations.
- **Smart Whitelist:** Automatically keeps safe files readable (e.g., `README.md`, logs, `package-lock.json`), even in "Blur All" mode.
- **Secret Detection:** Uses regex to specifically identify and blur API keys, tokens, and passwords if you prefer "Secrets Only" mode.
- **Secure Vault:** Copy blurred secrets to your clipboard safely without revealing them on screen.
- **Status Bar Toggle:** Quickly enable/disable Void with a single click on the "Eye" icon.
- **Custom Patterns:** Add your own regex rules to blur proprietary internal tokens.

## ⚙️ Configuration

You can customize Void in your VS Code `settings.json`:

| Setting | Default | Description |
| :--- | :--- | :--- |
| `void.blurMode` | `"all"` | Choose `"all"` to blur everything or `"secrets"` to blur only detected keys. |
| `void.excludedFiles` | `["**/*.md", ...]` | Glob patterns for files that should **NEVER** be blurred. |
| `void.customPatterns` | `[]` | Add your own regex patterns (e.g., `"MY_COMPANY_KEY_\\w+"`). |
| `void.filesToScan` | `["**/.env*", ...]` | Files to scan when in `"secrets"` mode. |

## 🛡️ Usage

1. **Toggle On/Off:** Click the **Eye Icon** `$(eye)` in the bottom right status bar.
2. **Copy a Secret:** Hover over any blurred text and click **"Copy to Clipboard"**.
3. **Customize:** Go to Settings (`Cmd+,`) -> Search "Void".

## 📦 Installation

Search for **"Void"** in the VS Code Marketplace and click Install.

## 🔒 Security Note

Void runs entirely locally. No data is ever sent to a server. Secrets are stored in memory only while the session is active.

---
*Current Version: v0.0.5*
