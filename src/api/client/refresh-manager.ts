/**
 * Single-flight refresh coordinator.
 *
 * Multiple concurrent 401s must share ONE `/auth/refresh` call. The actual refresh
 * implementation is registered by the auth store (inversion of control) so this module
 * never imports the store or the HTTP client — keeping the dependency graph acyclic.
 */

type RefreshHandler = () => Promise<string>;

let refreshHandler: RefreshHandler | null = null;
let inFlight: Promise<string> | null = null;

/** Registers the function that performs an actual token refresh and returns the new token. */
export function registerRefreshHandler(handler: RefreshHandler): void {
  refreshHandler = handler;
}

/**
 * Returns a shared in-flight refresh promise. Concurrent callers receive the same promise;
 * a new one is created only after the previous settles.
 */
export function refreshAccessToken(): Promise<string> {
  if (!refreshHandler) {
    return Promise.reject(new Error('No refresh handler registered'));
  }
  if (!inFlight) {
    inFlight = refreshHandler().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
