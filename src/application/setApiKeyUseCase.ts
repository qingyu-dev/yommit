import { SecretPort } from './ports';

/** Stores the Aliyun API key through the configured secret adapter. */
export class SetApiKeyUseCase {
  constructor(private readonly secrets: SecretPort) {}

  execute(): Promise<void> {
    return this.secrets.setApiKey();
  }
}
