import * as cp from 'node:child_process';
import * as util from 'node:util';
import { GitPort } from '../application/ports';
import { MAX_STAGED_DIFF_CHARS, StagedChanges } from '../domain/stagedChanges';

const execFile = util.promisify(cp.execFile);
const GIT_OUTPUT_BUFFER = 1024 * 1024;

/** Reads repository state by shelling out to the Git CLI. */
export class GitCliRepository implements GitPort {
  async isGitRepository(cwd: string): Promise<boolean> {
    try {
      const { stdout } = await execFile('git', ['rev-parse', '--is-inside-work-tree'], { cwd });
      return stdout.trim() === 'true';
    } catch {
      return false;
    }
  }

  async getStagedChanges(cwd: string): Promise<StagedChanges> {
    const [statResult, nameOnlyResult, diff] = await Promise.all([
      execFile('git', ['diff', '--cached', '--stat'], { cwd, maxBuffer: GIT_OUTPUT_BUFFER }),
      execFile('git', ['diff', '--cached', '--name-only'], { cwd, maxBuffer: GIT_OUTPUT_BUFFER }),
      readGitOutput(cwd, ['diff', '--cached'], MAX_STAGED_DIFF_CHARS + 1),
    ]);

    return {
      stat: statResult.stdout.trim(),
      files: nameOnlyResult.stdout.trim(),
      diff,
    };
  }
}

function readGitOutput(cwd: string, args: string[], maxChars: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = cp.spawn('git', args, { cwd });
    let stdout = '';
    let stderr = '';
    let reachedLimit = false;

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk: string) => {
      if (reachedLimit) {
        return;
      }

      const remainingChars = maxChars - stdout.length;
      if (chunk.length > remainingChars) {
        stdout += chunk.slice(0, remainingChars);
        reachedLimit = true;
        child.kill();
        return;
      }

      stdout += chunk;
      if (stdout.length >= maxChars) {
        reachedLimit = true;
        child.kill();
      }
    });

    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (reachedLimit || code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(`git ${args.join(' ')} failed with ${code}: ${stderr.trim()}`));
    });
  });
}
