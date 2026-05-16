import * as vscode from 'vscode';
import { SecretPort } from '../application/ports';

const SECRET_KEY = 'yommit.aliyunApiKey';

/** Stores and prompts for the Aliyun API key using VS Code SecretStorage. */
export class VscodeSecretStore implements SecretPort {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async getOrPromptForApiKey(): Promise<string | undefined> {
    const storedApiKey = await this.context.secrets.get(SECRET_KEY);
    if (storedApiKey) {
      return storedApiKey;
    }

    const action = await vscode.window.showInformationMessage(
      'Aliyun API key is required to generate commit messages.',
      'Set API Key',
    );

    if (action !== 'Set API Key') {
      return undefined;
    }

    await this.setApiKey();
    return this.context.secrets.get(SECRET_KEY);
  }

  async setApiKey(): Promise<void> {
    const apiKey = await vscode.window.showInputBox({
      title: 'Set Aliyun Bailian API Key',
      prompt: 'Enter your Aliyun Bailian API key. It will be stored in VS Code SecretStorage.',
      password: true,
      ignoreFocusOut: true,
      validateInput: (value) => (value.trim() ? undefined : 'API key is required.'),
    });

    if (!apiKey) {
      return;
    }

    await this.context.secrets.store(SECRET_KEY, apiKey.trim());
    vscode.window.showInformationMessage('Aliyun API key saved.');
  }

  async clearApiKey(): Promise<void> {
    await this.context.secrets.delete(SECRET_KEY);
    vscode.window.showInformationMessage('Aliyun API key cleared.');
  }
}
