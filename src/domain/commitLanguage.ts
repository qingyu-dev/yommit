export type CommitLanguage = 'zh' | 'en';

/** Normalizes arbitrary setting values into a supported commit summary language. */
export function toCommitLanguage(value: string | undefined): CommitLanguage {
  return value === 'en' ? 'en' : 'zh';
}
