# Contributing

Thanks for your interest in improving Yommit.

## Development Setup

Install dependencies:

```bash
npm install
```

Run the extension in VS Code:

1. Open this repository in VS Code.
2. Press `F5` to start an Extension Development Host.
3. Open a Git repository in the Extension Development Host.
4. Stage changes and run `Yommit: Generate Commit Message`.

## Checks

Run the same checks used by CI:

```bash
npm run format:check
npm run lint
npm test
```

Format files before committing:

```bash
npm run format
```

## Packaging

Build a local VSIX package:

```bash
npm run package
```

Install it locally:

```bash
code --install-extension yommit-0.0.1.vsix --force
```

## Pull Requests

Before opening a pull request:

- Keep changes focused on one feature or fix.
- Update documentation when behavior changes.
- Do not commit API keys or local secrets.
- Run formatting, linting, and compilation checks.

## Security

This extension stores the Aliyun API key through VS Code SecretStorage. Do not add fallback code that writes API keys to `settings.json`, logs, fixtures, screenshots, or committed files.
