import * as vscode from 'vscode';
import { SecretPort } from '../application/ports';
import { getProviderDefaults, ModelProvider } from '../domain/modelProvider';

/** Stores and prompts for provider API keys using VS Code SecretStorage. */
export class VscodeSecretStore implements SecretPort {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async getOrPromptForApiKey(provider: ModelProvider): Promise<string | undefined> {
    const providerDefaults = getProviderDefaults(provider);
    const storedApiKey = await this.context.secrets.get(providerDefaults.secretKey);
    if (storedApiKey) {
      return storedApiKey;
    }

    const action = await vscode.window.showInformationMessage(
      `${providerDefaults.label} API key is required to generate commit messages.`,
      'Set API Key',
    );

    if (action !== 'Set API Key') {
      return undefined;
    }

    await this.setApiKey(provider);
    return this.context.secrets.get(providerDefaults.secretKey);
  }

  async setApiKey(provider: ModelProvider): Promise<void> {
    const providerDefaults = getProviderDefaults(provider);
    const apiKey = await vscode.window.showInputBox({
      title: `Set ${providerDefaults.label} API Key`,
      prompt: `Enter your ${providerDefaults.label} API key. It will be stored in VS Code SecretStorage.`,
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => (value.trim() ? undefined : 'API key is required.'),
    });

    if (!apiKey) {
      return;
    }

    await this.context.secrets.store(providerDefaults.secretKey, apiKey.trim());
    vscode.window.showInformationMessage(`${providerDefaults.label} API key saved.`);
  }

  async clearApiKey(provider: ModelProvider): Promise<void> {
    const providerDefaults = getProviderDefaults(provider);
    await this.context.secrets.delete(providerDefaults.secretKey);
    vscode.window.showInformationMessage(`${providerDefaults.label} API key cleared.`);
  }
}
