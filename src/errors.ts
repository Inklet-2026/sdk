export interface InkletErrorOptions {
  code: string;
  status?: number | undefined;
  requestId?: string | undefined;
  cause?: unknown;
}

/**
 * Base class for every error produced by the SDK.
 *
 * `requestId` can be passed to Inklet support without exposing credentials.
 */
export class InkletError extends Error {
  readonly code: string;
  readonly status: number | undefined;
  readonly requestId: string | undefined;

  constructor(message: string, options: InkletErrorOptions) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.code = options.code;
    this.status = options.status;
    this.requestId = options.requestId;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      requestId: this.requestId,
    };
  }
}

export class ConfigurationError extends InkletError {
  constructor(message: string, options: Omit<InkletErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "invalid_configuration" });
  }
}

export class BrowserEnvironmentError extends InkletError {
  constructor() {
    super(
      "Inklet Project Secret Keys can only be used in trusted server environments. Move this request to a server, serverless function, or controlled local service.",
      { code: "browser_environment" },
    );
  }
}

export class AuthenticationError extends InkletError {}

export class InvalidSecretKeyError extends AuthenticationError {
  constructor(options: Omit<InkletErrorOptions, "code"> = {}) {
    super(
      "Inklet authentication failed. Check that the Project Secret Key is valid and belongs to the intended project.",
      { ...options, code: "invalid_secret_key" },
    );
  }
}

export class RevokedSecretKeyError extends AuthenticationError {
  constructor(options: Omit<InkletErrorOptions, "code"> = {}) {
    super(
      "The Inklet Project Secret Key has been revoked. Create a new key and update the server configuration.",
      { ...options, code: "revoked_secret_key" },
    );
  }
}

export class PermissionDeniedError extends InkletError {
  constructor(message: string, options: Omit<InkletErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "permission_denied" });
  }
}

export class NotFoundError extends InkletError {
  constructor(message: string, options: Omit<InkletErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "not_found" });
  }
}

export class RateLimitError extends InkletError {
  constructor(message: string, options: Omit<InkletErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "rate_limited" });
  }
}

export class ApiError extends InkletError {
  constructor(message: string, options: Omit<InkletErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "api_error" });
  }
}

export class InvalidResponseError extends InkletError {
  constructor(options: Omit<InkletErrorOptions, "code"> = {}) {
    super("Inklet returned a response that the SDK could not parse.", {
      ...options,
      code: "invalid_response",
    });
  }
}

export class NetworkError extends InkletError {
  constructor(message: string, options: Omit<InkletErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "network_error" });
  }
}
