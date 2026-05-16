import { SecretPort } from './ports';

/** Removes the saved Aliyun API key through the configured secret adapter. */
export class ClearApiKeyUseCase {
  constructor(private readonly secrets: SecretPort) {}

  execute(): Promise<void> {
    return this.secrets.clearApiKey();
  }
}
