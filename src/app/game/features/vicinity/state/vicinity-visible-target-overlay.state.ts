import { effect, inject, Injectable, signal } from '@angular/core';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { PvpVisibleAddressTargetOverlayInput } from '../../../../core/types/vicinity.types';
import { activeHeroContextKey } from '../../../../core/utils/request-token';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { RequestToken } from '../../../../core/utils/request-token';
import { VicinityRangeState } from './vicinity-range.state';

@Injectable()
export class VicinityVisibleTargetOverlayState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly range = inject(VicinityRangeState);
  private readonly requests = new RequestToken();
  private lastInput: PvpVisibleAddressTargetOverlayInput | null = null;

  readonly isLoading = signal(false);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly targets = signal<PvpTargetCandidate[]>([]);

  constructor() {
    effect(() => {
      const range = this.range.vicinityRange();

      if (!range) {
        return;
      }

      this.load({
        districtCode: range.district.districtCode,
        fromAddressNumber: range.fromAddressNumber,
        toAddressNumber: range.toAddressNumber,
      });
    });
  }

  load(input: PvpVisibleAddressTargetOverlayInput): void {
    this.lastInput = input;
    this.loadInput(input, true);
  }

  refresh(): void {
    const input = this.lastInput;

    if (input) {
      this.loadInput(input, false);
    }
  }

  private loadInput(
    input: PvpVisibleAddressTargetOverlayInput,
    resetLoaded: boolean,
  ): void {
    const requestToken = this.requests.next();
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

    this.isLoading.set(true);
    this.error.set(null);

    if (resetLoaded) {
      this.loaded.set(false);
    }

    if (!requestContextKey) {
      this.targets.set([]);
      this.error.set('Brak aktywnego bohatera do wczytania celów PvP.');
      this.isLoading.set(false);
      this.loaded.set(true);
      return;
    }

    this.playerPvp.getVisibleAddressTargetOverlay(input).subscribe({
      next: (targets) => {
        if (
          !this.requests.isCurrent(requestToken)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.targets.set(targets);
        this.isLoading.set(false);
        this.loaded.set(true);
      },
      error: (error: unknown) => {
        if (
          !this.requests.isCurrent(requestToken)
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.targets.set([]);
        this.error.set(getErrorMessage(error, 'Nie udało się wczytać celów PvP w widocznym zakresie.'));
        this.isLoading.set(false);
        this.loaded.set(true);
      },
    });
  }
}
