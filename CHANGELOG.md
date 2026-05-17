# Changelog

All notable changes to Yommit will be documented in this file.

## 0.0.2

- Add provider-based commit message generation for DeepSeek and Alibaba (China).
- Replace direct model string settings with command-based model selection per provider.
- Remove the user-facing `baseUrl` override to simplify provider configuration.
- Type chat-model errors and tighten application and infrastructure boundaries.
- Add a GitHub release workflow that packages and uploads the VSIX artifact on version tags.
- Publish GitHub release notes from the matching `CHANGELOG.md` version entry.

## 0.0.1

- Initial local VS Code extension release.
- Generate Gitmoji commit messages from staged Git changes.
- Store Aliyun Bailian API keys with VS Code SecretStorage.
- Support Chinese and English commit summaries.
