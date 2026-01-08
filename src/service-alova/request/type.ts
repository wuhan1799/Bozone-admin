export interface RequestInstanceState {
  /** the request error message stack */
  errMsgStack: string[];
}

export interface RequestMeta {
  /** auth role: none, accessToken, refreshToken */
  authRole?: 'none' | 'accessToken' | 'refreshToken';
  /** is blob response */
  isBlob?: boolean;
}
