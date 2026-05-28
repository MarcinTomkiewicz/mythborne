import { inject, Injectable, signal } from '@angular/core';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../../core/interfaces/hero/active-hero.interface';
import { VICINITY_TARGET_LIMIT } from '../../../../core/configs/vicinity.config';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { trimText, trimToNull } from '../../../../core/utils/normalize-text';

@Injectable()
export class VicinityTargetSearchState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private requestId = 0;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  private readonly candidates = signal<PvpTargetCandidate[]>([]);
  readonly districtCode = signal<string | null>(null);
  readonly search = signal('');

  load(onLoaded?: (candidates: readonly PvpTargetCandidate[]) => void): void {
    const requestId = ++this.requestId;
    const requestContextKey = toContextKey(this.activeHero.state());

    this.isLoading.set(true);
    this.error.set(null);

    if (!requestContextKey) {
      this.candidates.set([]);
      this.error.set('Brak aktywnego bohatera do wyszukiwania celów PvP.');
      this.isLoading.set(false);
      return;
    }

    this.playerPvp.getTargetCandidates({
      districtCode: this.districtCode(),
      limit: VICINITY_TARGET_LIMIT,
      offset: 0,
      search: trimText(this.search()),
    }).subscribe({
      next: (candidates) => {
        if (requestId !== this.requestId || requestContextKey !== toContextKey(this.activeHero.state())) {
          return;
        }

        this.candidates.set(candidates);
        this.isLoading.set(false);
        onLoaded?.(candidates);
      },
      error: (error: unknown) => {
        if (requestId !== this.requestId || requestContextKey !== toContextKey(this.activeHero.state())) {
          return;
        }

        this.candidates.set([]);
        this.error.set(getErrorMessage(error, 'Nie udało się wczytać celów PvP.'));
        this.isLoading.set(false);
      },
    });
  }

  setDistrictCode(value: string | null): void {
    this.districtCode.set(trimToNull(value));
  }

  setSearch(value: string | null): void {
    this.search.set(trimText(value) ?? '');
  }
}

function toContextKey(state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
