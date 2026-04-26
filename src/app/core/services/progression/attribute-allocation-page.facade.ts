import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { Hero } from '../hero/hero';
import { StatProgressionService } from './stat-progression';
import { StatsService } from '../stats/stats';
import { ToastService } from '../ui/toast';
import {
  AttributeAllocationRow,
  StatProgressionRules,
} from '../../domain/progression/stat-progression.model';
import { getErrorMessage } from '../../utils/error-message';
import { nonNegativeInteger, positiveInteger } from '../../utils/number';

@Injectable()
export class AttributeAllocationPageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly heroService = inject(Hero);
  private readonly statsService = inject(StatsService);
  private readonly statProgression = inject(StatProgressionService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly heroLevel = signal(1);
  readonly heroPoints = signal(0);
  readonly statsList = signal<IStat[]>([]);
  readonly baseStats = signal<Record<string, number>>({});
  readonly draftStats = signal<Record<string, number>>({});
  readonly progressionRules = signal<StatProgressionRules | null>(null);

  readonly tooltipFallback =
    'Description for this stat is not configured yet. Tooltip is ready for admin-managed descriptions.';

  readonly capPreview = computed(() => {
    const rules = this.progressionRules();

    if (!rules) {
      return {
        value: null,
        error: 'Stat progression rules are not loaded.',
      };
    }

    return this.statProgression.evaluateStatCap(
      this.heroLevel(),
      rules.capFormula.expression,
      rules.capTarget
    );
  });

  readonly spentHeroPoints = computed(() => {
    const rules = this.progressionRules();

    if (!rules) {
      return 0;
    }

    const total = this.statsList().reduce(
      (sum, stat) => sum + this.getSpentPointsForStat(stat.key, rules.costFormula.expression),
      0
    );

    return Number.isFinite(total) ? total : 0;
  });

  readonly remainingHeroPoints = computed(() => this.heroPoints() - this.spentHeroPoints());

  readonly hasPendingChanges = computed(() =>
    this.statsList().some((stat) => {
      const currentValue = this.baseStats()[stat.key] ?? 0;
      const plannedValue = this.draftStats()[stat.key] ?? currentValue;
      return currentValue !== plannedValue;
    })
  );

  readonly statRows = computed<AttributeAllocationRow[]>(() => {
    const rules = this.progressionRules();

    if (!rules) {
      return [];
    }

    const remainingHeroPoints = this.remainingHeroPoints();
    const capPreview = this.capPreview();
    const maxAllowedValue = capPreview.error
      ? null
      : positiveInteger(capPreview.value ?? 1);

    return this.statsList().map((stat) => {
      const currentValue = this.baseStats()[stat.key] ?? 0;
      const plannedValue = this.draftStats()[stat.key] ?? currentValue;
      const pendingLevels = Math.max(0, plannedValue - currentValue);
      const nextLevelCostResult = this.statProgression.evaluateNextLevelCost(
        plannedValue,
        rules.costFormula.expression,
        {
          heroLevel: this.heroLevel(),
          statLevel: plannedValue,
          target: rules.costTarget,
        }
      );
      const nextLevelCost =
        nextLevelCostResult.error || nextLevelCostResult.value === null
          ? null
          : nonNegativeInteger(nextLevelCostResult.value);

      let increaseReason: string | null = null;

      if (capPreview.error) {
        increaseReason = capPreview.error;
      } else if (maxAllowedValue !== null && plannedValue >= maxAllowedValue) {
        increaseReason = `Cap reached for hero level ${this.heroLevel()}.`;
      } else if (nextLevelCostResult.error) {
        increaseReason = nextLevelCostResult.error;
      } else if (nextLevelCost !== null && nextLevelCost > remainingHeroPoints) {
              increaseReason = 'Not enough Character Points for the next level.';
      }

      return {
        key: stat.key,
        label: stat.label,
        description: stat.description,
        currentValue,
        plannedValue,
        pendingLevels,
        nextLevelCost,
        maxAllowedValue,
        canIncrease: !increaseReason,
        canDecrease: plannedValue > currentValue,
        increaseReason,
        formulaError: capPreview.error ?? nextLevelCostResult.error,
      };
    });
  });

  incrementStat(statKey: string) {
    const row = this.statRows().find((entry) => entry.key === statKey);

    if (!row || !row.canIncrease) {
      return;
    }

    this.draftStats.update((previous) => ({
      ...previous,
      [statKey]: row.plannedValue + 1,
    }));
  }

  decrementStat(statKey: string) {
    const row = this.statRows().find((entry) => entry.key === statKey);

    if (!row || !row.canDecrease) {
      return;
    }

    this.draftStats.update((previous) => ({
      ...previous,
      [statKey]: row.plannedValue - 1,
    }));
  }

  resetDraft() {
    this.draftStats.set({
      ...this.baseStats(),
    });
    this.toast.show('info', 'Allocation reset', 'Unsaved stat changes were discarded.');
  }

  saveDraft() {
    if (!this.hasPendingChanges() || this.remainingHeroPoints() < 0) {
      return;
    }

    const invalidRow = this.statRows().find((row) => row.formulaError);

    if (invalidRow?.formulaError) {
      this.toast.show('error', 'Formula error', invalidRow.formulaError);
      return;
    }

    const nextHeroPoints = this.remainingHeroPoints();
    const nextStats = {
      ...this.draftStats(),
    };

    this.isSaving.set(true);

    this.heroService
      .saveProgressionDraft(nextStats, nextHeroPoints)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.baseStats.set(nextStats);
          this.draftStats.set({
            ...nextStats,
          });
          this.heroPoints.set(nextHeroPoints);
          this.toast.show('success', 'Attributes saved', 'Stat allocation was saved.');
        },
        error: (error: unknown) => {
          this.toast.show(
            'error',
            'Save failed',
            getErrorMessage(error, 'Failed to save attribute allocation.')
          );
        },
      });
  }

  loadData() {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      hero: this.heroService.getHeroData(),
      stats: this.heroService.getHeroStats(),
      definitions: this.statsService.getStats(),
      rules: this.statProgression.getRules(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ hero, stats, definitions, rules }) => {
          this.heroLevel.set(positiveInteger(hero.level ?? 1));
          this.heroPoints.set(nonNegativeInteger(hero.character_points ?? 0));
          this.statsList.set(definitions);
          this.baseStats.set({
            ...stats,
          });
          this.draftStats.set({
            ...stats,
          });
          this.progressionRules.set(rules);
        },
        error: (error: unknown) => {
          console.error('[HeroAttributesPage] loadData failed', error);
          const message = getErrorMessage(error, 'Failed to load hero progression.');
          this.loadError.set(message);
          this.toast.show('error', 'Attribute screen unavailable', message);
        },
      });
  }

  private getSpentPointsForStat(statKey: string, costFormula: string): number {
    const currentValue = this.baseStats()[statKey] ?? 0;
    const plannedValue = this.draftStats()[statKey] ?? currentValue;

    if (plannedValue <= currentValue) {
      return 0;
    }

    let total = 0;

    for (let level = currentValue; level < plannedValue; level += 1) {
      const cost = this.statProgression.getNextLevelCost(level, costFormula, {
        heroLevel: this.heroLevel(),
        statLevel: level,
        target: this.progressionRules()?.costTarget ?? undefined,
      });

      if (cost === null) {
        return Number.POSITIVE_INFINITY;
      }

      total += cost;
    }

    return total;
  }
}

