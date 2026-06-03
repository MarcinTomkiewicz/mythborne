import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';

export function activeHeroContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
