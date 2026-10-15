/**
 * Framework-agnostic session bridge.
 *
 * Holds the access token **in memory only** (never localStorage/sessionStorage) and
 * decouples the Axios client from React/Zustand: the request interceptor reads the token
 * here, and the refresh flow reports terminal failure via `onUnauthenticated`. This avoids
 * import cycles between the HTTP client and the auth store.
 */

let accessToken: string | null = null;
let onUnauthenticated: (() => void) | null = null;

export const session = {
  getAccessToken(): string | null {
    return accessToken;
  },
  setAccessToken(token: string | null): void {
    accessToken = token;
  },
  clear(): void {
    accessToken = null;
  },
  /** Registers the handler invoked when the session cannot be recovered (refresh failed). */
  setOnUnauthenticated(handler: (() => void) | null): void {
    onUnauthenticated = handler;
  },
  notifyUnauthenticated(): void {
    onUnauthenticated?.();
  },
};
