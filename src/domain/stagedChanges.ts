export const MAX_STAGED_DIFF_CHARS = 12_000;

/** Staged Git change summary used as input for commit message generation. */
export type StagedChanges = {
  stat: string;
  files: string;
  diff: string;
};
