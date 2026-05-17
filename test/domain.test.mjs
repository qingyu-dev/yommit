import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { normalizeCommitMessage } = require('../out/domain/commitMessage.js');
const { toCommitLanguage } = require('../out/domain/commitLanguage.js');
const { buildCommitPrompt } = require('../out/domain/commitPrompt.js');
const { MAX_STAGED_DIFF_CHARS } = require('../out/domain/stagedChanges.js');
const {
  DEFAULT_PROVIDER,
  getProviderDefaults,
  isProviderModel,
  toModelProvider,
} = require('../out/domain/modelProvider.js');

const stagedChanges = {
  stat: 'src/example.ts | 2 ++',
  files: 'src/example.ts',
  diff: 'diff --git a/src/example.ts b/src/example.ts\n+export const ok = true;',
};

describe('normalizeCommitMessage', () => {
  it('returns the first non-empty one-line commit message', () => {
    assert.equal(
      normalizeCommitMessage('\n\n`✨ add generator`\n\nextra explanation'),
      '✨ add generator',
    );
  });

  it('returns an empty string for empty model output', () => {
    assert.equal(normalizeCommitMessage('   \n\t'), '');
  });
});

describe('toCommitLanguage', () => {
  it('keeps English and defaults unsupported values to Chinese', () => {
    assert.equal(toCommitLanguage('en'), 'en');
    assert.equal(toCommitLanguage('fr'), 'zh');
    assert.equal(toCommitLanguage(undefined), 'zh');
  });
});

describe('modelProvider', () => {
  it('defaults unsupported values to DeepSeek', () => {
    assert.equal(DEFAULT_PROVIDER, 'DeepSeek');
    assert.equal(toModelProvider('DeepSeek'), 'DeepSeek');
    assert.equal(toModelProvider('Alibaba (China)'), 'Alibaba (China)');
    assert.equal(toModelProvider('other'), 'DeepSeek');
    assert.equal(toModelProvider(undefined), 'DeepSeek');
  });

  it('returns provider-specific defaults', () => {
    assert.deepEqual(getProviderDefaults('DeepSeek'), {
      label: 'DeepSeek',
      model: 'deepseek-v4-flash',
      baseUrl: 'https://api.deepseek.com',
      secretKey: 'yommit.deepseekApiKey',
      models: [
        {
          id: 'deepseek-v4-flash',
          label: 'deepseek-v4-flash',
          description: 'Default. Fast and low-cost for everyday commit messages.',
        },
        {
          id: 'deepseek-v4-pro',
          label: 'deepseek-v4-pro',
          description: 'Higher capability model for harder diffs and stricter summaries.',
        },
      ],
    });
    assert.deepEqual(getProviderDefaults('Alibaba (China)'), {
      label: 'Alibaba (China)',
      model: 'qwen3.6-flash',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      secretKey: 'yommit.aliyunApiKey',
      models: [
        {
          id: 'qwen3.6-flash',
          label: 'qwen3.6-flash',
          description: 'Default. Fast and cost-effective Qwen option.',
        },
        {
          id: 'qwen3.6-plus',
          label: 'qwen3.6-plus',
          description: 'Balanced capability, latency, and cost.',
        },
        {
          id: 'qwen3-max',
          label: 'qwen3-max',
          description: 'Most capable Qwen option for more complex changes.',
        },
      ],
    });
  });

  it('checks whether a model belongs to a provider', () => {
    assert.equal(isProviderModel('DeepSeek', 'deepseek-v4-flash'), true);
    assert.equal(isProviderModel('DeepSeek', 'qwen3.6-flash'), false);
    assert.equal(isProviderModel('Alibaba (China)', 'qwen3-max'), true);
  });
});

describe('buildCommitPrompt', () => {
  it('includes staged metadata and English language rules', () => {
    const prompt = buildCommitPrompt(stagedChanges, {
      language: 'en',
      useGitmoji: true,
      useConventionalType: false,
    });

    assert.match(prompt, /Summary language: English/);
    assert.match(prompt, /<gitmoji> <short summary>/);
    assert.match(prompt, /Do not include Conventional Commit types/);
    assert.match(prompt, /src\/example\.ts \| 2 \+\+/);
    assert.match(prompt, /Return only the commit message line/);
  });

  it('includes conventional type rules after gitmoji when enabled', () => {
    const prompt = buildCommitPrompt(stagedChanges, {
      language: 'en',
      useGitmoji: true,
      useConventionalType: true,
    });

    assert.match(prompt, /<gitmoji> <type>: <short summary>/);
    assert.match(
      prompt,
      /Choose exactly one Conventional Commit type from: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert/,
    );
    assert.match(prompt, /Place the Conventional Commit type after the gitmoji/);
    assert.match(prompt, /Gitmoji reference:/);
  });

  it('omits gitmoji reference and forbids emoji when gitmoji is disabled', () => {
    const prompt = buildCommitPrompt(stagedChanges, {
      language: 'zh',
      useGitmoji: false,
      useConventionalType: false,
    });

    assert.match(prompt, /<short summary>/);
    assert.match(prompt, /Do not include emoji or gitmoji/);
    assert.doesNotMatch(prompt, /Gitmoji reference:/);
  });

  it('uses conventional type without gitmoji when only type is enabled', () => {
    const prompt = buildCommitPrompt(stagedChanges, {
      language: 'zh',
      useGitmoji: false,
      useConventionalType: true,
    });

    assert.match(prompt, /<type>: <short summary>/);
    assert.match(prompt, /Choose exactly one Conventional Commit type/);
    assert.doesNotMatch(prompt, /<gitmoji>/);
    assert.doesNotMatch(prompt, /Gitmoji reference:/);
  });

  it('truncates large diffs while preserving file context', () => {
    const prompt = buildCommitPrompt(
      {
        stat: 'large.ts | 1 +',
        files: 'large.ts',
        diff: 'a'.repeat(MAX_STAGED_DIFF_CHARS + 1_000),
      },
      {
        language: 'zh',
        useGitmoji: true,
        useConventionalType: false,
      },
    );

    assert.match(prompt, /The diff is truncated because it is large/);
    assert.match(prompt, /large\.ts/);
    assert.ok(prompt.length < 20_000);
  });
});
