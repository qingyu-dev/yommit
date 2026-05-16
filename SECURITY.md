# Security Policy

## Supported Versions

Yommit is currently in early local-development stage. Security fixes are handled on the latest `main` branch.

## Reporting a Vulnerability

Please report security issues privately instead of opening a public issue.

If you do not have a private contact channel yet, open a GitHub issue with a brief note that you need to report a security vulnerability, but do not include secrets, exploit details, logs, screenshots, or sensitive repository content in the issue.

## Sensitive Data

Yommit reads staged Git diffs and sends that content to the configured Aliyun Bailian OpenAI-compatible endpoint. Do not stage secrets, credentials, customer data, or private company code if that content must not be sent to an external model service.

API keys are stored through VS Code SecretStorage. Do not add code paths that write API keys to `settings.json`, logs, fixtures, screenshots, or committed files.
