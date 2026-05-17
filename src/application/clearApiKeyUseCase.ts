import { ConfigPort, SecretPort } from './ports';

/** Removes the saved API key for the current provider through the configured secret adapter. */
export class ClearApiKeyUseCase {
  constructor(
    private readonly secrets: SecretPort,
    private readonly config: ConfigPort,
  ) {}

  execute(): Promise<void> {
    return this.secrets.clearApiKey(this.config.getConfig().provider);
  }
}
