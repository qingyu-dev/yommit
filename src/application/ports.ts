import { CommitLanguage } from '../domain/commitLanguage';
import { ModelProvider } from '../domain/modelProvider';
import { StagedChanges } from '../domain/stagedChanges';

/** Runtime options read from VS Code settings. */
export type ExtensionConfig = {
  provider: ModelProvider;
  model: string;
  baseUrl: string;
  language: CommitLanguage;
  useGitmoji: boolean;
  useConventionalType: boolean;
};

/** Workspace data needed by application use cases. */
export type WorkspaceFolder = {
  name: string;
  path: string;
};

/** Provides the workspace context used by the extension. */
export interface WorkspacePort {
  getCurrentWorkspaceFolder(): Promise<WorkspaceFolder | undefined>;
}

/** Reads Git repository state required for commit message generation. */
export interface GitPort {
  isGitRepository(cwd: string): Promise<boolean>;
  getStagedChanges(cwd: string): Promise<StagedChanges>;
}

/** Manages provider API keys without exposing storage details to use cases. */
export interface SecretPort {
  getOrPromptForApiKey(provider: ModelProvider): Promise<string | undefined>;
  setApiKey(provider: ModelProvider): Promise<void>;
  clearApiKey(provider: ModelProvider): Promise<void>;
}

/** Reads extension configuration without coupling use cases to VS Code APIs. */
export interface ConfigPort {
  getConfig(): ExtensionConfig;
}

/** Generates commit text from a prompt using an external chat model. */
export interface ChatModelPort {
  generateCommitMessage(input: {
    apiKey: string;
    baseUrl: string;
    model: string;
    prompt: string;
    signal?: AbortSignal;
  }): Promise<string>;
}

/** Writes the generated commit message back to the editor source-control UI. */
export interface ScmPort {
  writeCommitMessage(workspacePath: string, commitMessage: string): Promise<void>;
}

/** Shows user-facing progress, warnings, errors, and auth recovery actions. */
export interface UiPort {
  showWarning(message: string): void;
  showError(message: string): void;
  withGeneratingProgress<T>(task: (signal: AbortSignal) => Promise<T>): Promise<T>;
  handleAuthError(provider: ModelProvider): Promise<void>;
}
