import * as vscode from 'vscode';
import { ConfigPort, ExtensionConfig } from '../application/ports';
import { toCommitLanguage } from '../domain/commitLanguage';

/** Adapts VS Code settings into the extension's runtime configuration. */
export class VscodeConfig implements ConfigPort {
  getConfig(): ExtensionConfig {
    const configuration = vscode.workspace.getConfiguration('yommit');

    return {
      model: configuration.get<string>('model', 'qwen3.6-flash'),
      baseUrl: trimTrailingSlash(
        configuration.get<string>('baseUrl', 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
      ),
      language: toCommitLanguage(configuration.get<string>('language', 'zh')),
      useGitmoji: configuration.get<boolean>('useGitmoji', true),
      useConventionalType: configuration.get<boolean>('useConventionalType', false),
    };
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
