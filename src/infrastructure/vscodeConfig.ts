import * as vscode from 'vscode';
import { ConfigPort, ExtensionConfig, ModelSelectionPort } from '../application/ports';
import { toCommitLanguage } from '../domain/commitLanguage';
import { DEFAULT_PROVIDER, getProviderDefaults, toModelProvider } from '../domain/modelProvider';

/** Adapts VS Code settings into the extension's runtime configuration. */
export class VscodeConfig implements ConfigPort {
  constructor(private readonly modelSelection: ModelSelectionPort) {}

  getConfig(): ExtensionConfig {
    const configuration = vscode.workspace.getConfiguration('yommit');
    const provider = toModelProvider(configuration.get<string>('provider', DEFAULT_PROVIDER));
    const providerDefaults = getProviderDefaults(provider);

    return {
      provider,
      model: this.modelSelection.getSelectedModel(provider) ?? providerDefaults.model,
      baseUrl: providerDefaults.baseUrl,
      language: toCommitLanguage(configuration.get<string>('language', 'zh')),
      useGitmoji: configuration.get<boolean>('useGitmoji', true),
      useConventionalType: configuration.get<boolean>('useConventionalType', false),
    };
  }
}
