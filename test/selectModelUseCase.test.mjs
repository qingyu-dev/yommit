import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { SelectModelUseCase } = require('../out/application/selectModelUseCase.js');

function createConfig(provider = 'DeepSeek') {
  return {
    getConfig() {
      return {
        provider,
        model: provider === 'DeepSeek' ? 'deepseek-v4-flash' : 'qwen3.6-flash',
        baseUrl:
          provider === 'DeepSeek'
            ? 'https://api.deepseek.com'
            : 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        language: 'zh',
        useGitmoji: true,
        useConventionalType: false,
      };
    },
  };
}

function createModelSelection(overrides = {}) {
  return {
    selected: undefined,
    updates: [],
    getSelectedModel() {
      return this.selected;
    },
    async setSelectedModel(provider, model) {
      this.updates.push({ provider, model });
    },
    ...overrides,
  };
}

function createUi(overrides = {}) {
  return {
    infos: [],
    async pickModel() {
      return undefined;
    },
    showInformation(message) {
      this.infos.push(message);
    },
    showWarning() {},
    showError() {},
    async withGeneratingProgress(task) {
      return task(undefined);
    },
    async handleAuthError() {},
    ...overrides,
  };
}

describe('SelectModelUseCase', () => {
  it('shows provider-specific options and stores the selected model', async () => {
    const modelSelection = createModelSelection({ selected: 'deepseek-v4-flash' });
    const ui = createUi({
      async pickModel(input) {
        assert.equal(input.provider, 'DeepSeek');
        assert.equal(input.currentModel, 'deepseek-v4-flash');
        assert.deepEqual(
          input.options.map((option) => option.id),
          ['deepseek-v4-flash', 'deepseek-v4-pro'],
        );
        return 'deepseek-v4-pro';
      },
    });
    const useCase = new SelectModelUseCase(createConfig(), modelSelection, ui);

    await useCase.execute();

    assert.deepEqual(modelSelection.updates, [{ provider: 'DeepSeek', model: 'deepseek-v4-pro' }]);
    assert.deepEqual(ui.infos, ['Using deepseek-v4-pro for DeepSeek.']);
  });

  it('falls back to the provider default when no model was stored yet', async () => {
    const ui = createUi({
      async pickModel(input) {
        assert.equal(input.currentModel, 'qwen3.6-flash');
        return undefined;
      },
    });
    const useCase = new SelectModelUseCase(
      createConfig('Alibaba (China)'),
      createModelSelection(),
      ui,
    );

    await useCase.execute();
  });

  it('does not persist anything when the picker is cancelled', async () => {
    const modelSelection = createModelSelection();
    const useCase = new SelectModelUseCase(createConfig(), modelSelection, createUi());

    await useCase.execute();

    assert.deepEqual(modelSelection.updates, []);
  });
});
