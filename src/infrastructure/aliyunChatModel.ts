import { ChatModelPort } from '../application/ports';
import { normalizeCommitMessage } from '../domain/commitMessage';

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const REQUEST_TIMEOUT_MS = 45_000;

/** Calls Aliyun Bailian's OpenAI-compatible chat completions API. */
export class AliyunChatModel implements ChatModelPort {
  async generateCommitMessage(input: {
    apiKey: string;
    baseUrl: string;
    model: string;
    prompt: string;
    signal?: AbortSignal;
  }): Promise<string> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);
    const cancelListener = () => abortController.abort();
    input.signal?.addEventListener('abort', cancelListener, { once: true });

    let response: Response;
    try {
      response = await fetch(`${input.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
        body: JSON.stringify({
          model: input.model,
          messages: [
            {
              role: 'system',
              content: [
                'You write concise Git commit messages.',
                'Return exactly one line.',
                'Do not include markdown, quotes, explanations, alternatives, or trailing punctuation unless required by the message.',
              ].join(' '),
            },
            {
              role: 'user',
              content: input.prompt,
            },
          ],
          temperature: 0.2,
        }),
      });
    } catch (error) {
      if (abortController.signal.aborted) {
        throw new Error('Aliyun request was cancelled or timed out.', { cause: error });
      }

      throw error;
    } finally {
      clearTimeout(timeout);
      input.signal?.removeEventListener('abort', cancelListener);
    }

    const body = (await response.json().catch(() => undefined)) as
      | ChatCompletionResponse
      | undefined;

    if (!response.ok) {
      const message = body?.error?.message ?? response.statusText;
      throw new Error(`Aliyun request failed with ${response.status}: ${message}`);
    }

    const content = body?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('The model returned an empty commit message.');
    }

    return normalizeCommitMessage(content);
  }
}
