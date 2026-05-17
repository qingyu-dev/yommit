export class AuthenticationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AuthenticationError';
  }
}

export class RequestTimeoutError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RequestTimeoutError';
  }
}

export class EmptyCommitMessageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'EmptyCommitMessageError';
  }
}
