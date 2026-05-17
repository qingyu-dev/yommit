import { ConfigPort, ModelSelectionPort, UiPort } from './ports';
import { getProviderDefaults } from '../domain/modelProvider';

/** Lets the user pick a model for the current provider and persists the selection. */
export class SelectModelUseCase {
  constructor(
    private readonly config: ConfigPort,
    private readonly modelSelection: ModelSelectionPort,
    private readonly ui: UiPort,
  ) {}

  async execute(): Promise<void> {
    const { provider } = this.config.getConfig();
    const providerDefaults = getProviderDefaults(provider);
    const currentModel = this.modelSelection.getSelectedModel(provider) ?? providerDefaults.model;
    const selectedModel = await this.ui.pickModel({
      provider,
      currentModel,
      options: providerDefaults.models,
    });

    if (!selectedModel) {
      return;
    }

    await this.modelSelection.setSelectedModel(provider, selectedModel);
    this.ui.showInformation(`Using ${selectedModel} for ${providerDefaults.label}.`);
  }
}
