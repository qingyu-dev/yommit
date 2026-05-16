import * as vscode from 'vscode';
import { ClearApiKeyUseCase } from './application/clearApiKeyUseCase';
import { GenerateCommitMessageUseCase } from './application/generateCommitMessageUseCase';
import { SetApiKeyUseCase } from './application/setApiKeyUseCase';
import { AliyunChatModel } from './infrastructure/aliyunChatModel';
import { GitCliRepository } from './infrastructure/gitCliRepository';
import { VscodeConfig } from './infrastructure/vscodeConfig';
import { VscodeScmWriter } from './infrastructure/vscodeScmWriter';
import { VscodeSecretStore } from './infrastructure/vscodeSecretStore';
import { VscodeUi } from './infrastructure/vscodeUi';
import { VscodeWorkspace } from './infrastructure/vscodeWorkspace';

const COMMAND_GENERATE = 'yommit.generateCommitMessage';
const COMMAND_SET_API_KEY = 'yommit.setApiKey';
const COMMAND_CLEAR_API_KEY = 'yommit.clearApiKey';

/** Wires application use cases to VS Code commands when the extension activates. */
export function activate(context: vscode.ExtensionContext) {
  const secrets = new VscodeSecretStore(context);
  const generateCommitMessage = new GenerateCommitMessageUseCase(
    new VscodeWorkspace(),
    new GitCliRepository(),
    secrets,
    new VscodeConfig(),
    new AliyunChatModel(),
    new VscodeScmWriter(),
    new VscodeUi(secrets),
  );
  const setApiKey = new SetApiKeyUseCase(secrets);
  const clearApiKey = new ClearApiKeyUseCase(secrets);

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_GENERATE, () => generateCommitMessage.execute()),
    vscode.commands.registerCommand(COMMAND_SET_API_KEY, () => setApiKey.execute()),
    vscode.commands.registerCommand(COMMAND_CLEAR_API_KEY, () => clearApiKey.execute()),
  );
}

export function deactivate() {}
