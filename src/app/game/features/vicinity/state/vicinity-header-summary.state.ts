import { computed, inject, Injectable, signal } from '@angular/core';
import { VICINITY_HEADER_SUMMARY_ROW_KEYS } from '../../../../core/configs/vicinity.config';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import { HeroPvpDailyAttackState } from '../../../../core/domain/pvp/pvp.model';
import { GamePageSummaryRow } from '../../../../core/interfaces/game-page-summary-row.interface';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../../core/services/pvp/player-pvp';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { formatTimeOfDayLabel } from '../../../../core/utils/pending-timer';
import { VicinityRangeState } from './vicinity-range.state';

@Injectable()
export class VicinityHeaderSummaryState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly range = inject(VicinityRangeState);
  private dailyAttackRequestId = 0;

  readonly isDailyAttackLoading = signal(false);
  readonly isEstateRuntimeLoading = signal(false);
  readonly dailyAttackState = signal<HeroPvpDailyAttackState | null>(null);
  readonly dailyAttackError = signal<string | null>(null);
  readonly estateRuntimeError = signal<string | null>(null);
  readonly dailyAttackLabel = computed(() => {
    const state = this.dailyAttackState();
    const copy = this.range.copyJson();

    return state
      ? `${state.remainingDailyAttacks}/${state.dailyAttackLimit}`
      : copy?.summary.backendDataUnavailableLabel ?? '';
  });
  readonly attackProtectionLabel = computed(() =>
    protectionDisplay({
      isActive: this.range.estateRuntimeState()?.attackProtectionActive,
      expiresAt: this.range.estateRuntimeState()?.attackProtectionExpiresAt,
      inactiveLabel: this.range.copyJson()?.summary.noActiveProtectionLabel ?? '',
      unavailableLabel: this.range.copyJson()?.summary.backendDataUnavailableLabel ?? '',
    }),
  );
  readonly siegeProtectionLabel = computed(() => {
    const state = this.range.estateRuntimeState();
    const copy = this.range.copyJson();

    if (state?.siegeProtectionSource === 'not_modelled' || state?.siegeProtectionSource === 'not_modeled') {
      return copy?.summary.backendDataUnavailableLabel ?? '';
    }

    return protectionDisplay({
      isActive: state?.siegeProtectionActive,
      expiresAt: state?.siegeProtectionExpiresAt,
      inactiveLabel: copy?.summary.noActiveProtectionLabel ?? '',
      unavailableLabel: copy?.summary.backendDataUnavailableLabel ?? '',
    });
  });
  readonly headerSummaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const copy = this.range.copyJson();

    if (!copy) {
      return [];
    }

    const rows: Record<typeof VICINITY_HEADER_SUMMARY_ROW_KEYS[number], GamePageSummaryRow> = {
      dailyAttacks: {
        key: 'dailyAttacks',
        label: copy.summary.dailyAttacksLabel,
        value: this.dailyAttackLabel(),
      },
      currentAddress: {
        key: 'currentAddress',
        label: copy.summary.currentAddressLabel,
        value: this.range.currentAddressDisplay(),
      },
      attackProtection: {
        key: 'attackProtection',
        label: copy.summary.attackProtectionLabel,
        value: this.attackProtectionLabel(),
      },
      siegeProtection: {
        key: 'siegeProtection',
        label: copy.summary.siegeProtectionLabel,
        value: this.siegeProtectionLabel(),
      },
    };

    return VICINITY_HEADER_SUMMARY_ROW_KEYS.map((key) => rows[key]);
  });

  loadDailyAttackState(): void {
    const requestId = ++this.dailyAttackRequestId;
    const requestContextKey = activeHeroContextKey(this.activeHero.state());
    const copy = this.range.copyJson();

    this.isDailyAttackLoading.set(true);
    this.dailyAttackError.set(null);

    if (!requestContextKey) {
      this.dailyAttackState.set(null);
      this.dailyAttackError.set(copy?.page.errorLabel ?? null);
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
        this.dailyAttackError.set(getErrorMessage(error, this.range.copyJson()?.page.errorLabel ?? ''));
        this.isDailyAttackLoading.set(false);
      },
    });
  }

  loadEstateRuntimeState(): void {
    this.estateRuntimeError.set(null);
  }
}

function protectionDisplay(input: {
  isActive: boolean | null | undefined;
  expiresAt: string | null | undefined;
  inactiveLabel: string;
  unavailableLabel: string;
}): string {
  if (!input.isActive) {
    return input.inactiveLabel;
  }

  return input.expiresAt
    ? formatTimeOfDayLabel(input.expiresAt)
    : input.unavailableLabel;
}
