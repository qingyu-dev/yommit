/** Staged Git change summary used as input for commit message generation. */
export type StagedChanges = {
  stat: string;
  files: string;
  diff: string;
};
