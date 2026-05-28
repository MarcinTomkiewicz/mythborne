import { inject, Injectable, signal } from '@angular/core';
import { PvpTargetCandidate } from '../../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { PvpVisibleAddressTargetOverlayInput } from '../../../../core/types/vicinity.types';
import { getErrorMessage } from '../../../../core/utils/error-message';

@Injectable()
export class VicinityVisibleTargetOverlayState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private requestId = 0;
  private lastInput: PvpVisibleAddressTargetOverlayInput | null = null;

  readonly isLoading = signal(false);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly targets = signal<PvpTargetCandidate[]>([]);

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
    const requestId = ++this.requestId;
    const requestContextKey = toContextKey(this.activeHero.state());

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
        if (requestId !== this.requestId || requestContextKey !== toContextKey(this.activeHero.state())) {
          return;
        }

        this.targets.set(targets);
        this.isLoading.set(false);
        this.loaded.set(true);
      },
      error: (error: unknown) => {
        if (requestId !== this.requestId || requestContextKey !== toContextKey(this.activeHero.state())) {
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

function toContextKey(state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
