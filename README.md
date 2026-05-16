<p align="center">
  <img src="assets/icon.png" alt="Yommit logo" width="128" height="128" />
</p>

<h1 align="center">Yommit</h1>

<p align="center">
  Generate Gitmoji commit messages from staged Git changes with AI.
</p>

<p align="center">
  English | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="#installation">Installation</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#settings">Settings</a>
</p>

Yommit is a VS Code extension that generates Gitmoji commit messages from your staged Git changes.

It reads the current staged diff, sends the change summary to an Aliyun Bailian OpenAI-compatible model, and writes the generated message back to the VS Code Source Control commit input.

## Inspiration

This project is inspired by [carloscuesta/gitmoji](https://github.com/carloscuesta/gitmoji), which provides a clear and expressive emoji guide for Git commit messages.

## Features

- Generate commit messages from staged Git changes.
- Write the result directly into the VS Code Source Control input box.
- Use a concise Gitmoji format.
- Store the Aliyun API key with VS Code SecretStorage.
- Support Chinese and English commit summaries.
- Use `qwen3.6-flash` by default for a faster and cheaper lightweight workflow.

Example output:

```text
✨ add commit message generation entry
🐛 handle empty staged changes
♻️ split commit generation use case
```

## Usage

1. Open a Git repository in VS Code.
2. Stage your changes with `git add` or the Source Control panel.
3. Run `Yommit: Set Aliyun API Key` and enter your Aliyun Bailian API key.
4. Click the sparkle button in the Source Control title bar.
5. Review the generated commit message before committing.

You can also run `Yommit: Generate Commit Message` from the Command Palette.

## Installation

Build a local VSIX package:

```bash
npm install
npm run package
```

Install it into VS Code:

```bash
code --install-extension yommit-0.0.1.vsix --force
```

## Settings

| Setting           | Default                                             | Description                                |
| ----------------- | --------------------------------------------------- | ------------------------------------------ |
| `yommit.model`    | `qwen3.6-flash`                                     | Aliyun Bailian model name.                 |
| `yommit.baseUrl`  | `https://dashscope.aliyuncs.com/compatible-mode/v1` | OpenAI-compatible Aliyun Bailian base URL. |
| `yommit.language` | `zh`                                                | Commit summary language: `zh` or `en`.     |

The API key is stored in VS Code SecretStorage and is not written to `settings.json`.

## Privacy and Security

Yommit reads the staged diff from the current Git repository and sends that change content to your configured Aliyun Bailian OpenAI-compatible endpoint to generate a commit message. Do not stage secrets, credentials, customer data, or sensitive company code if that content must not be sent to an external model service.

The API key is stored locally through VS Code SecretStorage. Yommit does not write the API key to `settings.json`, log it, or upload it separately.

## Commands

| Command                           | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| `Yommit: Generate Commit Message` | Generate a commit message from staged changes. |
| `Yommit: Set Aliyun API Key`      | Save or replace the Aliyun API key.            |
| `Yommit: Clear Aliyun API Key`    | Remove the saved Aliyun API key.               |

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and contribution details.

Common checks:

```bash
npm run format:check
npm run lint
npm test
```

Build a local VSIX:

```bash
npm run package
```

## Architecture

The project uses a lightweight DDD-style structure:

```text
src/
├─ application/     # Use cases and ports
├─ domain/          # Prompt, Gitmoji, and commit-message rules
├─ infrastructure/  # VS Code, Git CLI, SecretStorage, and Aliyun adapters
└─ extension.ts     # Command registration and dependency wiring
```

This keeps the domain rules independent from VS Code APIs and external model providers.

## Notes

- Only staged changes are used. If there is no staged diff, the extension asks you to run `git add` first.
- Large diffs are truncated before being sent to the model.
- Generation can be cancelled from the VS Code progress notification, and network requests time out after 45 seconds.
- If the VS Code Git SCM input is unavailable, the generated message is copied to the clipboard.
