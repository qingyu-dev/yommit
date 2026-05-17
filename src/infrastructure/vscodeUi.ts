import * as vscode from 'vscode';
import { SecretPort, UiPort } from '../application/ports';
import { getProviderDefaults, ModelProvider } from '../domain/modelProvider';

/** Adapts VS Code window APIs for user feedback and auth recovery. */
export class VscodeUi implements UiPort {
  constructor(private readonly secrets: SecretPort) {}

  showWarning(message: string): void {
    vscode.window.showWarningMessage(message);
  }

  showError(message: string): void {
    vscode.window.showErrorMessage(message);
  }

  withGeneratingProgress<T>(task: (signal: AbortSignal) => Promise<T>): Promise<T> {
    return Promise.resolve(
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating commit message',
          cancellable: true,
        },
        (_progress, token) => {
          const abortController = new AbortController();
          token.onCancellationRequested(() => abortController.abort());
          return task(abortController.signal);
        },
      ),
    );
  }

  async handleAuthError(provider: ModelProvider): Promise<void> {
    const providerDefaults = getProviderDefaults(provider);
    const action = await vscode.window.showErrorMessage(
      `${providerDefaults.label} API key may be invalid or unauthorized.`,
      'Set API Key',
      'Clear API Key',
    );

    if (action === 'Set API Key') {
      await this.secrets.setApiKey(provider);
    } else if (action === 'Clear API Key') {
      await this.secrets.clearApiKey(provider);
    }
  }
}
