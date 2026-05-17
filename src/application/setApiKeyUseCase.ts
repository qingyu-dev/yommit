import { ConfigPort, SecretPort } from './ports';

/** Stores the current provider API key through the configured secret adapter. */
export class SetApiKeyUseCase {
  constructor(
    private readonly secrets: SecretPort,
    private readonly config: ConfigPort,
  ) {}

  execute(): Promise<void> {
    return this.secrets.setApiKey(this.config.getConfig().provider);
  }
}
