import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import type { SelectItem } from 'primeng/api';
import { finalize, map, Observable, switchMap } from 'rxjs';
import { activeHeroContextKey } from '../../../../core/domain/hero/active-hero-context';
import {
  PvpRankingContext,
  PvpRankingContextInput,
  PvpRankingCopy,
  PvpRankingDistrictKey,
  PvpRankingPageChangeEvent,
} from '../../../../core/domain/pvp/pvp-ranking.model';
import type { GamePageSummaryRow } from '../../../../core/interfaces/game-page-summary-row.interface';
import type { DataRow } from '../../../../core/types/data-row.types';
import { GameCopyService } from '../../../../core/services/game-copy/game-copy.service';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import type { RequiredActiveHeroState } from '../../../../core/interfaces/hero/active-hero.interface';
import { PlayerPvpRanking } from '../../../../core/services/pvp/player-pvp-ranking';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { trimToNull } from '../../../../core/utils/normalize-text';
import { toPvpRankingDataRow } from '../../../../core/utils/pvp-ranking-display';
import { RequestToken } from '../../../../core/utils/request-token';
import { isRankingDataRow } from '../../../../core/utils/data-row';
import { PvpRankingActionsState } from './pvp-ranking-actions.state';

@Injectable()
export class PvpRankingPageState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeHero = inject(ActiveHero);
  private readonly actions = inject(PvpRankingActionsState);
  private readonly gameCopy = inject(GameCopyService);
  private readonly ranking = inject(PlayerPvpRanking);
  private readonly contextRequests = new RequestToken();

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly districtControl = new FormControl<PvpRankingDistrictKey | null>(null);
  readonly copy = signal<PvpRankingCopy | null>(null);
  readonly context = signal<PvpRankingContext | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly districtOptions = computed<SelectItem<PvpRankingDistrictKey>[]>(() => {
    const copy = this.copy();
    const context = this.context();

    if (!copy || !context) {
      return [];
    }

    return context.filters.districtOptions.map((option) => ({
      label: copy.filters.districtOptions[option.key],
      value: option.key,
      disabled: !option.enabled,
    }));
  });
  readonly headerSummaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const copy = this.copy();
    const context = this.context();

    if (!copy || !context) {
      return [];
    }

    const activeHero = context.activeHero;

    return [
      {
        key: 'dailyAttackLimit',
        label: copy.playerStatus.labels.dailyAttackLimit,
        value: `${activeHero.dailyAttackLimitRemaining}/${activeHero.dailyAttackLimitMax}`,
      },
      {
        key: 'rankingPosition',
        label: copy.playerStatus.labels.rankingPosition,
        value: String(activeHero.rankingPosition),
      },
      {
        key: 'attackProtection',
        label: copy.playerStatus.labels.attackProtection,
        value: activeHero.attackProtectionDisplay
          ?? copy.common.emptyValues[copy.playerStatus.emptyValueKeys.attackProtection],
      },
      {
        key: 'siegeProtection',
        label: copy.playerStatus.labels.siegeProtection,
        value: activeHero.siegeProtectionDisplay
          ?? copy.common.emptyValues[copy.playerStatus.emptyValueKeys.siegeProtection],
      },
    ];
  });
  readonly selectedTarget = computed(() => this.context()?.selectedTarget ?? null);
  readonly rankingColumnLabels = computed<readonly string[]>(() => {
    const copy = this.copy();

    return copy
      ? [
          copy.table.columns.rankPosition,
          copy.table.columns.hero,
          copy.table.columns.level,
          copy.table.columns.address,
          copy.table.columns.attackDuration,
          copy.table.columns.spyDuration,
          copy.table.columns.actions,
        ]
      : [];
  });
  readonly rankingRows = computed<readonly DataRow[]>(() => {
    const copy = this.copy();
    const context = this.context();

    if (!copy || !context) {
      return [];
    }

    return context.ranking.rows.map((row) =>
      toPvpRankingDataRow(row, copy, this.actions.pendingAction()),
    );
  });
  readonly selectedTargetRow = computed<DataRow | null>(() => {
    const copy = this.copy();
    const selectedTarget = this.selectedTarget();

    return copy && selectedTarget
      ? toPvpRankingDataRow(selectedTarget, copy, this.actions.pendingAction())
      : null;
  });

  constructor() {
    this.districtControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((districtKey) => this.changeDistrict(districtKey));
  }

  loadInitial(): void {
    this.loadRankingContext(undefined, true);
  }

  applySearch(): void {
    this.loadContext({
      query: trimToNull(this.searchControl.value),
      districtKey: this.districtControl.value,
      offset: null,
      selectedTargetHeroId: null,
    });
  }

  jumpToMyPosition(): void {
    this.loadContext({
      query: null,
      districtKey: null,
      offset: null,
      selectedTargetHeroId: null,
    });
  }

  changePage(event: PvpRankingPageChangeEvent): void {
    const first = event.first;

    if (typeof first !== 'number') {
      return;
    }

    this.loadContext({
      ...this.currentContextInput(),
      offset: first,
    });
  }

  selectRow(row: DataRow): void {
    if (!isRankingDataRow(row)) {
      return;
    }

    this.loadContext({
      ...this.currentContextInput(),
      selectedTargetHeroId: row.rankingRow.heroId,
    });
  }

  private changeDistrict(districtKey: PvpRankingDistrictKey | null): void {
    const context = this.context();

    if (!context || context.filters.appliedDistrictKey === districtKey) {
      return;
    }

    this.loadContext({
      query: trimToNull(this.searchControl.value),
      districtKey,
      offset: null,
      selectedTargetHeroId: null,
    });
  }

  private loadContext(input: PvpRankingContextInput): void {
    this.loadRankingContext(input, false);
  }

  private loadRankingContext(
    input: PvpRankingContextInput | undefined,
    shouldLoadCopy: boolean,
  ): void {
    const token = this.contextRequests.next();

    this.isLoading.set(true);
    this.error.set(null);
    this.actions.clearFeedback();

    this.resolveHeroContext(shouldLoadCopy).pipe(
      switchMap((heroContext) => {
        const contextKey = activeHeroContextKey(heroContext);

        return this.ranking.getContextForHero(heroContext.heroId, input).pipe(
          map((context) => ({ context, contextKey })),
        );
      }),
      finalize(() => {
        if (this.contextRequests.isCurrent(token)) {
          this.isLoading.set(false);
        }
      }),
    ).subscribe({
      next: ({ context, contextKey }) => {
        if (!this.contextRequests.isCurrent(token) || !this.isCurrentHeroContext(contextKey)) {
          return;
        }

        this.applyContext(context);
      },
      error: (error: unknown) => {
        if (!this.contextRequests.isCurrent(token)) {
          return;
        }

        this.setContextError(error);
      },
    });
  }

  private resolveHeroContext(shouldLoadCopy: boolean): Observable<RequiredActiveHeroState> {
    if (!shouldLoadCopy) {
      return this.activeHero.requireActiveHero();
    }

    return this.gameCopy.getCopy('player.pvp.ranking', { locale: 'pl' }).pipe(
      switchMap((copy) => {
        this.copy.set(copy);

        return this.activeHero.requireActiveHero();
      }),
    );
  }

  private setContextError(error: unknown): void {
    const copy = this.copy();

    this.error.set(copy
      ? `${copy.feedback.searchFailed.summary}. ${copy.feedback.searchFailed.detail}`
      : getErrorMessage(error, ''));
  }

  private applyContext(context: PvpRankingContext): void {
    this.context.set(context);
    this.searchControl.setValue(context.filters.query ?? '', { emitEvent: false });
    this.districtControl.setValue(context.filters.appliedDistrictKey, { emitEvent: false });
  }

  private currentContextInput(): PvpRankingContextInput {
    const context = this.context();

    return {
      query: context?.filters.query ?? null,
      districtKey: context?.filters.appliedDistrictKey ?? null,
      offset: context?.ranking.offset ?? null,
      selectedTargetHeroId: context?.selectedTarget?.heroId ?? null,
    };
  }

  reloadCurrentContext(): void {
    this.loadContext(this.currentContextInput());
  }

  private isCurrentHeroContext(contextKey: string | null): boolean {
    return contextKey !== null
      && contextKey === activeHeroContextKey(this.activeHero.state());
  }
}
