import { buildCommitPrompt } from '../domain/commitPrompt';
import {
  ChatModelPort,
  ConfigPort,
  GitPort,
  ScmPort,
  SecretPort,
  UiPort,
  WorkspacePort,
} from './ports';

/** Coordinates the full flow from staged Git changes to the VS Code commit input. */
export class GenerateCommitMessageUseCase {
  constructor(
    private readonly workspace: WorkspacePort,
    private readonly git: GitPort,
    private readonly secrets: SecretPort,
    private readonly config: ConfigPort,
    private readonly chatModel: ChatModelPort,
    private readonly scm: ScmPort,
    private readonly ui: UiPort,
  ) {}

  async execute(): Promise<void> {
    const workspaceFolder = await this.workspace.getCurrentWorkspaceFolder();
    if (!workspaceFolder) {
      this.ui.showWarning('Open a workspace folder before generating a commit message.');
      return;
    }

    const isGitRepository = await this.git.isGitRepository(workspaceFolder.path);
    if (!isGitRepository) {
      this.ui.showWarning('The current workspace folder is not a Git repository.');
      return;
    }

    const stagedChanges = await this.git.getStagedChanges(workspaceFolder.path);
    if (!stagedChanges.diff.trim()) {
      this.ui.showWarning('No staged changes found. Stage changes with git add first.');
      return;
    }

    const apiKey = await this.secrets.getOrPromptForApiKey();
    if (!apiKey) {
      return;
    }

    await this.ui.withGeneratingProgress(async (signal) => {
      try {
        const extensionConfig = this.config.getConfig();
        const prompt = buildCommitPrompt(stagedChanges, {
          language: extensionConfig.language,
          useGitmoji: extensionConfig.useGitmoji,
          useConventionalType: extensionConfig.useConventionalType,
        });
        const commitMessage = await this.chatModel.generateCommitMessage({
          apiKey,
          baseUrl: extensionConfig.baseUrl,
          model: extensionConfig.model,
          prompt,
          signal,
        });

        await this.scm.writeCommitMessage(workspaceFolder.path, commitMessage);
      } catch (error) {
        if (isAuthError(error)) {
          await this.ui.handleAuthError();
          return;
        }

        this.ui.showError(error instanceof Error ? error.message : String(error));
      }
    });
  }
}

function isAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('401') || message.includes('403');
}
