import * as vscode from 'vscode';
import { ConfigPort, ExtensionConfig } from '../application/ports';
import { toCommitLanguage } from '../domain/commitLanguage';
import { DEFAULT_PROVIDER, getProviderDefaults, toModelProvider } from '../domain/modelProvider';

/** Adapts VS Code settings into the extension's runtime configuration. */
export class VscodeConfig implements ConfigPort {
  getConfig(): ExtensionConfig {
    const configuration = vscode.workspace.getConfiguration('yommit');
    const provider = toModelProvider(configuration.get<string>('provider', DEFAULT_PROVIDER));
    const providerDefaults = getProviderDefaults(provider);

    return {
      provider,
      model: getConfiguredString(configuration, 'model') ?? providerDefaults.model,
      baseUrl: providerDefaults.baseUrl,
      language: toCommitLanguage(configuration.get<string>('language', 'zh')),
      useGitmoji: configuration.get<boolean>('useGitmoji', true),
      useConventionalType: configuration.get<boolean>('useConventionalType', false),
    };
  }
}

function getConfiguredString(
  configuration: vscode.WorkspaceConfiguration,
  key: string,
): string | undefined {
  const inspected = configuration.inspect<string>(key);
  const value =
    inspected?.workspaceFolderValue ?? inspected?.workspaceValue ?? inspected?.globalValue;

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
