export interface RequestInstanceState {
  /** the promise of refreshing token */
  refreshTokenPromise: Promise<boolean> | null;
  /** the request error message stack */
  errMsgStack: string[];
  /** the retry count for preventing infinite loops */
  retryCount: number;
  [key: string]: unknown;
}
