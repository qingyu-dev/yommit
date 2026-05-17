import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  AuthenticationError,
  EmptyCommitMessageError,
  RequestTimeoutError,
} = require('../out/application/errors.js');
const { OpenAiCompatibleChatModel } = require('../out/infrastructure/openAiCompatibleChatModel.js');

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function createModel() {
  return new OpenAiCompatibleChatModel();
}

function createInput(overrides = {}) {
  return {
    apiKey: 'secret',
    baseUrl: 'https://api.example.com',
    model: 'test-model',
    prompt: 'Generate a commit message',
    ...overrides,
  };
}

describe('OpenAiCompatibleChatModel', () => {
  it('normalizes the first returned commit message line', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '\n`✨ add generator`\nextra explanation' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );

    const message = await createModel().generateCommitMessage(createInput());

    assert.equal(message, '✨ add generator');
  });

  it('maps 401 responses to AuthenticationError', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: { message: 'invalid key' } }), {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'Content-Type': 'application/json' },
      });

    await assert.rejects(
      () => createModel().generateCommitMessage(createInput()),
      AuthenticationError,
    );
  });

  it('maps empty completions to EmptyCommitMessageError', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: '   ' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    await assert.rejects(
      () => createModel().generateCommitMessage(createInput()),
      EmptyCommitMessageError,
    );
  });

  it('maps aborted requests to RequestTimeoutError', async () => {
    globalThis.fetch = async (_url, options) => {
      options.signal.throwIfAborted();
      await new Promise((resolve) => setImmediate(resolve));
      options.signal.throwIfAborted();
      throw new Error('request should have been aborted');
    };

    const signalController = new AbortController();
    const promise = createModel().generateCommitMessage(
      createInput({ signal: signalController.signal }),
    );
    signalController.abort();

    await assert.rejects(() => promise, RequestTimeoutError);
  });
});
