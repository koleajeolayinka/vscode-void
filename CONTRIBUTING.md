# Contributing to Void

First off, thank you for considering contributing to Void! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

Void is a "Zero-Trust" privacy tool for VS Code, and we welcome contributions from everyone, whether you're fixing a typo, adding a new file type for detection, or refactoring the core vault architecture.

## 🛠 Getting Started

### Prerequisites
You need the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Git](https://git-scm.com/)
* [VS Code](https://code.visualstudio.com/)

### Setting up the Environment
1.  **Fork** the repository on GitHub.
2.  **Clone** your fork to your local machine:
    ```bash
    git clone https://github.com/koleajeolayinka/void-vscode.git
    cd void-vscode
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```

### 🏃‍♂️ Running the Extension (Debug Mode)
VS Code extensions are unique because they run inside a special instance of VS Code called the "Extension Development Host."

1.  Open the project in VS Code: `code .`
2.  Press **F5** (or click "Run and Debug" on the left sidebar).
3.  A **new VS Code window** will open. This is the "Host" window where the extension is active.
4.  Open a file (like a `.env` file) in that new window to test the blurring functionality.
5.  **Reloading:** If you make changes to the code, go to the debug toolbar in the main window and click the green "Restart" icon (or Press `Ctrl+Shift+F5`).

## 📂 Project Structure
* **`src/extension.ts`**: The entry point. Handles activation and registering commands.
* **`src/vault.ts`** (or similar): Contains the logic for the secure memory storage.
* **`package.json`**: Defines the extension settings, activation events, and dependencies.

## 🐛 Found a Bug?
If you find a bug, please create an Issue on GitHub. Include:
* Your OS and VS Code version.
* Steps to reproduce the bug.
* Expected vs. Actual behavior.

## 💡 Want to Add a Feature?
1.  Check the **Issues** tab to see if anyone is already working on it.
2.  If it's a big change, open an Issue first to discuss it.
3.  If it's small (like adding support for `.xml` files), feel free to open a Pull Request!

##  pull Request Process
1.  Create a new branch: `git checkout -b feature/my-new-feature`
2.  Make your changes and commit them.
3.  Push to your fork: `git push origin feature/my-new-feature`
4.  Submit a Pull Request!

## 📜 License
By contributing, you agree that your contributions will be licensed under the MIT License.