import { computed, inject, Injectable, signal } from '@angular/core';
import { PvpAttackResult } from '../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText } from '../../../core/utils/normalize-text';

export type PvpAttackResultReadStatus =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'missing-or-not-accessible'
  | 'access-denied'
  | 'error';

@Injectable()
export class PvpAttackResultState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private loadRequestId = 0;

  readonly result = signal<PvpAttackResult | null>(null);
  readonly status = signal<PvpAttackResultReadStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly requestedAttackResultId = signal<string | null>(null);
  readonly isLoading = computed(() => this.status() === 'loading');
  readonly hasResult = computed(() => this.result() !== null);
  readonly isUnavailable = computed(() =>
    this.status() === 'missing-or-not-accessible'
      || this.status() === 'access-denied',
  );

  load(attackResultId: string | null | undefined): void {
    const normalizedAttackResultId = trimText(attackResultId);
    const requestId = ++this.loadRequestId;
    const requestContextKey = this.currentContextKey();

    this.result.set(null);
    this.requestedAttackResultId.set(normalizedAttackResultId);
    this.error.set(null);

    if (!normalizedAttackResultId) {
      this.status.set('missing-or-not-accessible');
      this.error.set('PvP attack result id is required.');
      return;
    }

    this.status.set('loading');

    if (!requestContextKey) {
      this.status.set('missing-or-not-accessible');
      this.error.set('No active hero for PvP attack result.');
      return;
    }

    this.playerPvp.getMyAttackResult(normalizedAttackResultId).subscribe({
      next: (result) => {
        if (!this.acceptsLoadResponse(requestId, requestContextKey)) {
          return;
        }

        this.result.set(result);
        this.status.set('loaded');
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, requestContextKey)) {
          return;
        }

        const status = classifyAttackResultError(error);
        this.result.set(null);
        this.status.set(status);
        this.error.set(
          status === 'missing-or-not-accessible'
            ? 'PvP attack result was not found or is not accessible.'
            : getErrorMessage(error, 'Failed to load PvP attack result.'),
        );
      },
    });
  }

  clear(): void {
    this.loadRequestId++;
    this.result.set(null);
    this.status.set('idle');
    this.error.set(null);
    this.requestedAttackResultId.set(null);
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsLoadResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.loadRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.result.set(null);
      this.status.set('missing-or-not-accessible');
      this.error.set('PvP attack result context changed.');
      return false;
    }

    return true;
  }
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}

function classifyAttackResultError(
  error: unknown,
): Exclude<PvpAttackResultReadStatus, 'idle' | 'loading' | 'loaded'> {
  const message = getErrorMessage(error, '').toLowerCase();

  if (message.includes('returned no pvp row')) {
    return 'missing-or-not-accessible';
  }

  if (
    message.includes('permission denied')
    || message.includes('access denied')
    || message.includes('not authorized')
    || message.includes('row-level security')
  ) {
    return 'access-denied';
  }

  return 'error';
}
