import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  GenerateCommitMessageUseCase,
} = require('../out/application/generateCommitMessageUseCase.js');
const { AuthenticationError } = require('../out/application/errors.js');

const baseConfig = {
  provider: 'DeepSeek',
  model: 'deepseek-v4-flash',
  baseUrl: 'https://api.deepseek.com',
  language: 'zh',
  useGitmoji: true,
  useConventionalType: false,
};

function createWorkspace(folder = { name: 'repo', path: '/repo' }) {
  return {
    async getCurrentWorkspaceFolder() {
      return folder;
    },
  };
}

function createGit(overrides = {}) {
  return {
    async isGitRepository() {
      return true;
    },
    async getStagedChanges() {
      return {
        stat: 'src/example.ts | 1 +',
        files: 'src/example.ts',
        diff: 'diff --git a/src/example.ts b/src/example.ts\n+export const ok = true;',
      };
    },
    ...overrides,
  };
}

function createSecrets(overrides = {}) {
  return {
    async getOrPromptForApiKey() {
      return 'secret';
    },
    async setApiKey() {},
    async clearApiKey() {},
    ...overrides,
  };
}

function createConfig(overrides = {}) {
  return {
    getConfig() {
      return { ...baseConfig, ...overrides };
    },
  };
}

function createChatModel(overrides = {}) {
  return {
    async generateCommitMessage() {
      return '✨ add generator';
    },
    ...overrides,
  };
}

function createScm(overrides = {}) {
  return {
    calls: [],
    async writeCommitMessage(workspacePath, commitMessage) {
      this.calls.push({ workspacePath, commitMessage });
    },
    ...overrides,
  };
}

function createUi(overrides = {}) {
  return {
    warnings: [],
    errors: [],
    authProviders: [],
    showWarning(message) {
      this.warnings.push(message);
    },
    showError(message) {
      this.errors.push(message);
    },
    async withGeneratingProgress(task) {
      return task(undefined);
    },
    async handleAuthError(provider) {
      this.authProviders.push(provider);
    },
    ...overrides,
  };
}

describe('GenerateCommitMessageUseCase', () => {
  it('writes the generated commit message to SCM', async () => {
    const scm = createScm();
    const useCase = new GenerateCommitMessageUseCase(
      createWorkspace(),
      createGit(),
      createSecrets(),
      createConfig(),
      createChatModel(),
      scm,
      createUi(),
    );

    await useCase.execute();

    assert.deepEqual(scm.calls, [{ workspacePath: '/repo', commitMessage: '✨ add generator' }]);
  });

  it('stops early when no staged changes exist', async () => {
    const ui = createUi();
    const chatModel = createChatModel({
      async generateCommitMessage() {
        assert.fail('chat model should not be called when no staged changes exist');
      },
    });
    const useCase = new GenerateCommitMessageUseCase(
      createWorkspace(),
      createGit({
        async getStagedChanges() {
          return { stat: '', files: '', diff: '   ' };
        },
      }),
      createSecrets(),
      createConfig(),
      chatModel,
      createScm(),
      ui,
    );

    await useCase.execute();

    assert.deepEqual(ui.warnings, ['No staged changes found. Stage changes with git add first.']);
  });

  it('routes authentication failures to the UI recovery flow', async () => {
    const ui = createUi();
    const scm = createScm();
    const useCase = new GenerateCommitMessageUseCase(
      createWorkspace(),
      createGit(),
      createSecrets(),
      createConfig({ provider: 'Alibaba (China)' }),
      createChatModel({
        async generateCommitMessage() {
          throw new AuthenticationError('unauthorized');
        },
      }),
      scm,
      ui,
    );

    await useCase.execute();

    assert.deepEqual(ui.authProviders, ['Alibaba (China)']);
    assert.deepEqual(ui.errors, []);
    assert.deepEqual(scm.calls, []);
  });

  it('surfaces non-auth errors to the user', async () => {
    const ui = createUi();
    const useCase = new GenerateCommitMessageUseCase(
      createWorkspace(),
      createGit(),
      createSecrets(),
      createConfig(),
      createChatModel({
        async generateCommitMessage() {
          throw new Error('service unavailable');
        },
      }),
      createScm(),
      ui,
    );

    await useCase.execute();

    assert.deepEqual(ui.errors, ['service unavailable']);
  });
});
