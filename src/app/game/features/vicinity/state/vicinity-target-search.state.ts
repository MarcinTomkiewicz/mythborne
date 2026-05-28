import { inject, Injectable, signal } from '@angular/core';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import { VICINITY_TARGET_LIMIT } from '../../../../core/configs/vicinity.config';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { activeHeroContextKey } from '../../../../core/utils/request-token';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { trimText, trimToNull } from '../../../../core/utils/normalize-text';
import { RequestToken } from '../../../../core/utils/request-token';

@Injectable()
export class VicinityTargetSearchState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly requests = new RequestToken();

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  private readonly candidates = signal<PvpTargetCandidate[]>([]);
  readonly districtCode = signal<string | null>(null);
  readonly search = signal('');

  load(onLoaded?: (candidates: readonly PvpTargetCandidate[]) => void): void {
    const requestToken = this.requests.next();
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

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
        if (
          !this.requests.isCurrent(requestToken)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.candidates.set(candidates);
        this.isLoading.set(false);
        onLoaded?.(candidates);
      },
      error: (error: unknown) => {
        if (
          !this.requests.isCurrent(requestToken)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
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
