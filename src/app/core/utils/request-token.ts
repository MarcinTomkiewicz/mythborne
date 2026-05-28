import { ActiveHeroState } from '../interfaces/hero/active-hero.interface';

export class RequestToken {
  private current = 0;

  next(): number {
    this.current += 1;
    return this.current;
  }

  isCurrent(token: number): boolean {
    return token === this.current;
  }
}

export function activeHeroContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
