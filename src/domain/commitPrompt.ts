import { CommitLanguage } from './commitLanguage';
import { GITMOJI_REFERENCE } from './gitmojiReference';
import { MAX_STAGED_DIFF_CHARS, StagedChanges } from './stagedChanges';

export type CommitPromptOptions = {
  language: CommitLanguage;
  useGitmoji: boolean;
  useConventionalType: boolean;
};

const CONVENTIONAL_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

/** Builds the model prompt from staged changes and the selected summary language. */
export function buildCommitPrompt(
  stagedChanges: StagedChanges,
  options: CommitPromptOptions,
): string {
  const isTruncated = stagedChanges.diff.length > MAX_STAGED_DIFF_CHARS;
  const diff = isTruncated
    ? stagedChanges.diff.slice(0, MAX_STAGED_DIFF_CHARS)
    : stagedChanges.diff;
  const { language, useGitmoji, useConventionalType } = options;
  const summaryLanguage = language === 'en' ? 'English' : 'Chinese';
  const summaryRule =
    language === 'en'
      ? '- Write the short summary in English, imperative mood, lower-case where natural.'
      : '- Write the short summary in Chinese, concise and action-oriented.';
  const format = getCommitFormat(useGitmoji, useConventionalType);
  const rules = [
    ...(useGitmoji
      ? [
          '- Use the most appropriate gitmoji from the gitmoji.dev reference below.',
          '- The selected gitmoji must match the staged changes.',
        ]
      : ['- Do not include emoji or gitmoji in the commit message.']),
    ...(useConventionalType
      ? [
          `- Choose exactly one Conventional Commit type from: ${CONVENTIONAL_TYPES.join(', ')}.`,
          '- Place the Conventional Commit type after the gitmoji when a gitmoji is present.',
        ]
      : [
          '- Do not include Conventional Commit types such as feat:, fix:, docs:, chore:, or refactor:.',
        ]),
    `- Summary language: ${summaryLanguage}.`,
    summaryRule,
    '- Keep the entire line under 72 characters when possible.',
    '- Return only the commit message line.',
  ];

  const sections = [
    'Generate one Git commit message from the staged Git changes.',
    '',
    'Format:',
    format,
    '',
    'Rules:',
    rules.join('\n'),
    '',
  ];

  if (useGitmoji) {
    sections.push(
      'Gitmoji reference:',
      GITMOJI_REFERENCE.map((item) => `- ${item}`).join('\n'),
      '',
    );
  }

  return [
    ...sections,
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

function getCommitFormat(useGitmoji: boolean, useConventionalType: boolean): string {
  if (useGitmoji && useConventionalType) {
    return '<gitmoji> <type>: <short summary>';
  }

  if (useGitmoji) {
    return '<gitmoji> <short summary>';
  }

  if (useConventionalType) {
    return '<type>: <short summary>';
  }

  return '<short summary>';
}
