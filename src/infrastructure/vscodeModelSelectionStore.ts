import * as vscode from 'vscode';
import { ModelSelectionPort } from '../application/ports';
import { isProviderModel, ModelProvider } from '../domain/modelProvider';

/** Stores per-provider model choices in extension state instead of the settings UI. */
export class VscodeModelSelectionStore implements ModelSelectionPort {
  constructor(private readonly context: vscode.ExtensionContext) {}

  getSelectedModel(provider: ModelProvider): string | undefined {
    const selectedModel = this.context.globalState.get<string>(getModelSelectionKey(provider));
    if (selectedModel) {
      return selectedModel;
    }

    const legacyModel = vscode.workspace.getConfiguration('yommit').get<string>('model', '').trim();
    if (legacyModel && isProviderModel(provider, legacyModel)) {
      return legacyModel;
    }

    return undefined;
  }

  async setSelectedModel(provider: ModelProvider, model: string): Promise<void> {
    await this.context.globalState.update(getModelSelectionKey(provider), model);
  }
}

function getModelSelectionKey(provider: ModelProvider): string {
  return `yommit.selectedModel.${provider}`;
}
