import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  HeroServerScope,
  HeroServerScopeErrorCodes,
  MatchingIdGuard,
} from '../../interfaces/hero/hero-server-scope.interface';

export function ensureCurrentHeroServerScopedResult<T extends HeroServerScope | null>(
  active: ActiveHeroState | null,
  selectedServerId: string | null,
  expected: HeroServerScope,
  result: T,
  errorCodes: HeroServerScopeErrorCodes,
  matchingIds: readonly MatchingIdGuard[] = [],
): T {
  if (
    !active ||
    active.heroId !== expected.heroId ||
    active.serverId !== expected.serverId ||
    selectedServerId !== expected.serverId
  ) {
    throw new Error(errorCodes.contextChanged);
  }

  if (
    result &&
    (
      result.heroId !== expected.heroId ||
      result.serverId !== expected.serverId
    )
  ) {
    throw new Error(errorCodes.scopeMismatch);
  }

  for (const matchingId of matchingIds) {
    if (matchingId.actual !== matchingId.expected) {
      throw new Error(matchingId.errorCode);
    }
  }

  return result;
}
