<p align="center">
  <img src="https://raw.githubusercontent.com/qingyu-dev/yommit/main/assets/icon.png" alt="Yommit logo" width="128" height="128" />
</p>

<h1 align="center">Yommit</h1>

<p align="center">
  Generate commit messages from staged Git changes with optional Gitmoji and Conventional Commit prefixes using DeepSeek or Aliyun.
</p>

<p align="center">
  English | <a href="https://github.com/qingyu-dev/yommit/blob/main/README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="#installation">Installation</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#settings">Settings</a>
</p>

Yommit is a VS Code extension that generates commit messages from your staged Git changes.

It reads the current staged diff, sends the change summary to the configured DeepSeek or Aliyun Bailian OpenAI-compatible model, and writes the generated message back to the VS Code Source Control commit input.

## Inspiration

This project is inspired by [carloscuesta/gitmoji](https://github.com/carloscuesta/gitmoji), which provides a clear and expressive emoji guide for Git commit messages.

## Features

- Generate commit messages from staged Git changes.
- Write the result directly into the VS Code Source Control input box.
- Support plain summaries, Gitmoji, Conventional Commit prefixes, or both together.
- Store DeepSeek and Aliyun API keys with VS Code SecretStorage.
- Support Chinese and English commit summaries.
- Toggle Gitmoji and Conventional Commit type output.
- Use DeepSeek by default, with Aliyun Bailian available as an alternative provider.

Example output:

```text
✨ add commit message generation entry
✨ feat: add commit message generation entry
🐛 handle empty staged changes
♻️ split commit generation use case
```

## Usage

1. Open a Git repository in VS Code.
2. Stage your changes with `git add` or the Source Control panel.
3. Keep the default `yommit.provider` as `DeepSeek` or switch it to `Alibaba (China)`.
4. Run `Yommit: Set API Key` and enter the API key for the selected provider.
5. Click the sparkle button in the Source Control title bar.
6. Review the generated commit message before committing.

You can also run `Yommit: Generate Commit Message` from the Command Palette.

## Installation

Install Yommit from the VS Code Marketplace:

1. Open the Extensions view in VS Code.
2. Search for `Yommit`.
3. Click `Install`.

## Settings

| Setting                      | Default          | Description                                      |
| ---------------------------- | ---------------- | ------------------------------------------------ |
| `yommit.provider`            | `DeepSeek`       | Model provider: `DeepSeek` or `Alibaba (China)`. |
| `yommit.model`               | provider default | Optional model override.                         |
| `yommit.baseUrl`             | provider default | Optional base URL override.                      |
| `yommit.language`            | `zh`             | Commit summary language: `zh` or `en`.           |
| `yommit.useGitmoji`          | `true`           | Add a Gitmoji at the start of the message.       |
| `yommit.useConventionalType` | `false`          | Add a type like `feat:` to the message.          |

Provider defaults:

| Provider          | Default model       | Default base URL                                    |
| ----------------- | ------------------- | --------------------------------------------------- |
| `DeepSeek`        | `deepseek-v4-flash` | `https://api.deepseek.com`                          |
| `Alibaba (China)` | `qwen3.6-flash`     | `https://dashscope.aliyuncs.com/compatible-mode/v1` |

API keys are stored in VS Code SecretStorage and are not written to `settings.json`.

Output format depends on the Gitmoji and Conventional Commit type settings, and all four combinations are supported:

| Gitmoji | Conventional type | Format                                   |
| ------- | ----------------- | ---------------------------------------- |
| on      | off               | `✨ add commit message generation`       |
| on      | on                | `✨ feat: add commit message generation` |
| off     | off               | `add commit message generation`          |
| off     | on                | `feat: add commit message generation`    |

## Privacy and Security

Yommit reads the staged diff from the current Git repository and sends that change content to your configured DeepSeek or Aliyun Bailian endpoint to generate a commit message. Do not stage secrets, credentials, customer data, or sensitive company code if that content must not be sent to an external model service.

API keys are stored locally through VS Code SecretStorage. Yommit does not write them to `settings.json`, log them, or upload them separately.

## Commands

| Command                           | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| `Yommit: Generate Commit Message` | Generate a commit message from staged changes.         |
| `Yommit: Set API Key`             | Save or replace the API key for the selected provider. |
| `Yommit: Clear API Key`           | Remove the API key for the selected provider.          |

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
├─ infrastructure/  # VS Code, Git CLI, SecretStorage, and model-provider adapters
└─ extension.ts     # Command registration and dependency wiring
```

This keeps the domain rules independent from VS Code APIs and external model providers.

## Notes

- Only staged changes are used. If there is no staged diff, the extension asks you to run `git add` first.
- Large diffs are truncated before being sent to the model.
- Generation can be cancelled from the VS Code progress notification, and network requests time out after 45 seconds.
- If the VS Code Git SCM input is unavailable, the generated message is copied to the clipboard.
