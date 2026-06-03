import { computed, inject, Injectable, signal } from '@angular/core';
import { VICINITY_HEADER_SUMMARY_ROWS } from '../../../../core/configs/vicinity.config';
import { HeroPvpDailyAttackState } from '../../../../core/domain/pvp/pvp.model';
import { BuildingJobs } from '../../../../core/services/buildings/building-jobs';
import type { HeroEstateRuntimeStateReadModel } from '../../../../core/services/buildings/building-jobs-read-model';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { VicinityRangeState } from './vicinity-range.state';
import { activeProtectionLabel } from '../utils/vicinity-runtime-summary-labels';

@Injectable()
export class VicinityHeaderSummaryState {
  private readonly activeHero = inject(ActiveHero);
  private readonly buildingJobs = inject(BuildingJobs);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly range = inject(VicinityRangeState);
  private dailyAttackRequestId = 0;
  private estateRuntimeRequestId = 0;

  readonly isDailyAttackLoading = signal(false);
  readonly isEstateRuntimeLoading = signal(false);
  readonly dailyAttackState = signal<HeroPvpDailyAttackState | null>(null);
  readonly dailyAttackError = signal<string | null>(null);
  readonly estateRuntimeState = signal<HeroEstateRuntimeStateReadModel | null>(null);
  readonly estateRuntimeError = signal<string | null>(null);
  readonly dailyAttackLabel = computed(() => {
    const state = this.dailyAttackState();

    return state
      ? `${state.remainingDailyAttacks}/${state.dailyAttackLimit}`
      : 'Brak danych z backendu';
  });
  readonly attackProtectionLabel = computed(() => {
    const state = this.estateRuntimeState();

    return activeProtectionLabel({
      isActive: state?.attackProtectionActive,
      expiresAt: state?.attackProtectionExpiresAt,
    });
  });
  readonly siegeProtectionLabel = computed(() => {
    const state = this.estateRuntimeState();

    return state?.siegeProtectionSource !== 'not_modeled'
      ? activeProtectionLabel({
          isActive: state?.siegeProtectionActive,
          expiresAt: state?.siegeProtectionExpiresAt,
        })
      : 'Brak aktywnej ochrony';
  });
  readonly headerSummaryRows = computed(() => {
    const values = {
      dailyAttacks: this.dailyAttackLabel(),
      currentAddress: this.range.currentAddressLabel(),
      attackProtection: this.attackProtectionLabel(),
      siegeProtection: this.siegeProtectionLabel(),
    };

    return VICINITY_HEADER_SUMMARY_ROWS.map((row) => ({
      label: row.label,
      value: values[row.key],
    }));
  });

  loadDailyAttackState(): void {
    const requestId = ++this.dailyAttackRequestId;
    const requestContextKey = activeHeroContextKey(this.activeHero.state());

    this.isDailyAttackLoading.set(true);
    this.dailyAttackError.set(null);

    if (!requestContextKey) {
      this.dailyAttackState.set(null);
      this.dailyAttackError.set('Brak aktywnego bohatera do wczytania dziennych ataków.');
      this.isDailyAttackLoading.set(false);
      return;
    }

    this.playerPvp.getDailyAttackState().subscribe({
      next: (state) => {
        if (
          requestId !== this.dailyAttackRequestId
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.dailyAttackState.set(state);
        this.isDailyAttackLoading.set(false);
      },
      error: (error: unknown) => {
        if (
          requestId !== this.dailyAttackRequestId
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.dailyAttackState.set(null);
        this.dailyAttackError.set(
          getErrorMessage(error, 'Nie udało się wczytać dziennej liczby ataków.'),
        );
        this.isDailyAttackLoading.set(false);
      },
    });
  }

  loadEstateRuntimeState(): void {
    const requestId = ++this.estateRuntimeRequestId;
    const activeHeroState = this.activeHero.state();
    const requestContextKey = activeHeroContextKey(activeHeroState);
    const heroId = activeHeroState?.heroId ?? null;

    this.isEstateRuntimeLoading.set(true);
    this.estateRuntimeError.set(null);

    if (!requestContextKey || !heroId) {
      this.estateRuntimeState.set(null);
      this.estateRuntimeError.set('Brak aktywnego bohatera do wczytania ochrony posiadłości.');
      this.isEstateRuntimeLoading.set(false);
      return;
    }

    this.buildingJobs.getHeroEstateRuntimeState(heroId).subscribe({
      next: (state) => {
        if (
          requestId !== this.estateRuntimeRequestId
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.estateRuntimeState.set(state);
        this.isEstateRuntimeLoading.set(false);
      },
      error: (error: unknown) => {
        if (
          requestId !== this.estateRuntimeRequestId
          || requestContextKey !== activeHeroContextKey(this.activeHero.state())
        ) {
          return;
        }

        this.estateRuntimeState.set(null);
        this.estateRuntimeError.set(
          getErrorMessage(error, 'Nie udało się wczytać ochrony posiadłości.'),
        );
        this.isEstateRuntimeLoading.set(false);
      },
    });
  }
}
