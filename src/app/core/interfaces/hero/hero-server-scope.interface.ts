export interface HeroServerScope {
  heroId: string;
  serverId: string;
}

export interface HeroServerScopeErrorCodes {
  contextChanged: string;
  scopeMismatch: string;
}

export interface MatchingIdGuard {
  actual: string | null;
  expected: string;
  errorCode: string;
}
