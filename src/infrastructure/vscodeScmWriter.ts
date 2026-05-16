import * as vscode from 'vscode';
import { ScmPort } from '../application/ports';

type GitExtension = vscode.Extension<{
  getAPI(version: 1): GitAPI;
}>;

type GitAPI = {
  repositories: GitRepository[];
};

type GitRepository = {
  inputBox: {
    value: string;
  };
  rootUri: vscode.Uri;
};

/** Writes generated messages to VS Code's built-in Git SCM input box. */
export class VscodeScmWriter implements ScmPort {
  async writeCommitMessage(workspacePath: string, commitMessage: string): Promise<void> {
    const repository = await this.getGitRepository(workspacePath);
    if (repository) {
      repository.inputBox.value = commitMessage;
      vscode.window.showInformationMessage('Commit message generated.');
      return;
    }

    await vscode.env.clipboard.writeText(commitMessage);
    vscode.window.showWarningMessage(
      'Generated commit message was copied to clipboard because the Git SCM input box is unavailable.',
    );
  }

  private async getGitRepository(workspacePath: string): Promise<GitRepository | undefined> {
    const gitExtension = vscode.extensions.getExtension('vscode.git') as GitExtension | undefined;
    if (!gitExtension) {
      return undefined;
    }

    const extension = gitExtension.isActive ? gitExtension.exports : await gitExtension.activate();
    const gitApi = extension.getAPI(1);
    return (
      gitApi.repositories.find((repository) => repository.rootUri.fsPath === workspacePath) ??
      undefined
    );
  }
}
