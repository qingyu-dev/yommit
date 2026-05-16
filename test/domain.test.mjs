import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { normalizeCommitMessage } = require('../out/domain/commitMessage.js');
const { toCommitLanguage } = require('../out/domain/commitLanguage.js');
const { buildCommitPrompt } = require('../out/domain/commitPrompt.js');

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

describe('buildCommitPrompt', () => {
  it('includes staged metadata and English language rules', () => {
    const prompt = buildCommitPrompt(
      {
        stat: 'src/example.ts | 2 ++',
        files: 'src/example.ts',
        diff: 'diff --git a/src/example.ts b/src/example.ts\n+export const ok = true;',
      },
      'en',
    );

    assert.match(prompt, /Summary language: English/);
    assert.match(prompt, /<gitmoji> <short summary>/);
    assert.match(prompt, /Do not include Conventional Commit types/);
    assert.match(prompt, /src\/example\.ts \| 2 \+\+/);
    assert.match(prompt, /Return only the commit message line/);
  });

  it('truncates large diffs while preserving file context', () => {
    const prompt = buildCommitPrompt(
      {
        stat: 'large.ts | 1 +',
        files: 'large.ts',
        diff: 'a'.repeat(13_000),
      },
      'zh',
    );

    assert.match(prompt, /The diff is truncated because it is large/);
    assert.match(prompt, /large\.ts/);
    assert.ok(prompt.length < 20_000);
  });
});
