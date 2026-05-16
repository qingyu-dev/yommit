import * as vscode from 'vscode';
import { WorkspaceFolder, WorkspacePort } from '../application/ports';

/** Provides the active workspace folder from VS Code. */
export class VscodeWorkspace implements WorkspacePort {
  async getCurrentWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
      return undefined;
    }

    if (folders.length === 1) {
      return toWorkspaceFolder(folders[0]);
    }

    const activeUri = vscode.window.activeTextEditor?.document.uri;
    const activeFolder = activeUri ? vscode.workspace.getWorkspaceFolder(activeUri) : undefined;
    const selected = await vscode.window.showQuickPick(
      folders.map((folder) => ({
        label: folder.name,
        description: folder.uri.fsPath,
        folder,
        picked: folder === activeFolder,
      })),
      {
        title: 'Select workspace folder',
        placeHolder: 'Choose the Git repository to generate a commit message for',
      },
    );

    return selected ? toWorkspaceFolder(selected.folder) : undefined;
  }
}

function toWorkspaceFolder(folder: vscode.WorkspaceFolder): WorkspaceFolder {
  return {
    name: folder.name,
    path: folder.uri.fsPath,
  };
}
