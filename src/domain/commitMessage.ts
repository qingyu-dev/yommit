/** Extracts the first usable one-line commit message from model output. */
export function normalizeCommitMessage(content: string): string {
  return (
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean)
      ?.replace(/^["'`]+|["'`]+$/g, '')
      .trim() ?? ''
  );
}
