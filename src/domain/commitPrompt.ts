import { CommitLanguage } from './commitLanguage';
import { GITMOJI_REFERENCE } from './gitmojiReference';
import { StagedChanges } from './stagedChanges';

export const MAX_DIFF_CHARS = 12000;

/** Builds the model prompt from staged changes and the selected summary language. */
export function buildCommitPrompt(stagedChanges: StagedChanges, language: CommitLanguage): string {
  const isTruncated = stagedChanges.diff.length > MAX_DIFF_CHARS;
  const diff = isTruncated ? stagedChanges.diff.slice(0, MAX_DIFF_CHARS) : stagedChanges.diff;
  const summaryLanguage = language === 'en' ? 'English' : 'Chinese';
  const summaryRule =
    language === 'en'
      ? '- Write the short summary in English, imperative mood, lower-case where natural.'
      : '- Write the short summary in Chinese, concise and action-oriented.';

  return [
    'Generate one Git commit message from the staged Git changes.',
    '',
    'Format:',
    '<gitmoji> <short summary>',
    '',
    'Rules:',
    '- Use the most appropriate gitmoji from the gitmoji.dev reference below.',
    '- Do not include Conventional Commit types such as feat:, fix:, docs:, chore:, or refactor:.',
    '- The selected gitmoji must match the staged changes.',
    `- Summary language: ${summaryLanguage}.`,
    summaryRule,
    '- Keep the entire line under 72 characters when possible.',
    '- Return only the commit message line.',
    '',
    'Gitmoji reference:',
    GITMOJI_REFERENCE.map((item) => `- ${item}`).join('\n'),
    '',
    isTruncated
      ? 'The diff is truncated because it is large. Use the stat and file list for context.'
      : 'The full staged diff is included.',
    '',
    'Git diff --cached --stat:',
    stagedChanges.stat || '(empty)',
    '',
    'Staged files:',
    stagedChanges.files || '(empty)',
    '',
    'Git diff --cached:',
    diff,
  ].join('\n');
}
