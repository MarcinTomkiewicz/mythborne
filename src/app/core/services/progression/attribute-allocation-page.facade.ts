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
  readonly characterPoints = signal(0);
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

  readonly statCapSummaryError = computed(() => {
    const capPreview = this.capPreview();

    if (capPreview.error) {
      return capPreview.error;
    }

    return capPreview.value === null
      ? 'Stat level cap cannot be calculated because the active formula returned no value.'
      : null;
  });

  readonly hasStatCapViolation = computed(() => {
    const capPreview = this.capPreview();

    if (capPreview.error || capPreview.value === null) {
      return true;
    }

    const maxAllowedValue = positiveInteger(capPreview.value);

    return this.statsList().some((stat) => {
      const currentValue = this.baseStats()[stat.key] ?? 0;
      const plannedValue = this.draftStats()[stat.key] ?? currentValue;
      return plannedValue > maxAllowedValue;
    });
  });

  readonly spentCharacterPoints = computed<number | null>(() => {
    const rules = this.progressionRules();

    if (!rules) {
      return 0;
    }

    let total = 0;

    for (const stat of this.statsList()) {
      const spent = this.getSpentPointsForStat(stat.key, rules.costFormula.expression);

      if (spent === null) {
        return null;
      }

      total += spent;
    }

    return total;
  });

  readonly remainingCharacterPoints = computed<number | null>(() => {
    const spent = this.spentCharacterPoints();

    return spent === null ? null : this.characterPoints() - spent;
  });

  readonly characterPointSummaryError = computed(() =>
    this.spentCharacterPoints() === null
      ? 'Stat upgrade cost cannot be calculated because the active formula configuration is broken.'
      : null
  );

  readonly hasPendingChanges = computed(() =>
    this.statsList().some((stat) => {
      const currentValue = this.baseStats()[stat.key] ?? 0;
      const plannedValue = this.draftStats()[stat.key] ?? currentValue;
      return currentValue !== plannedValue;
    })
  );

  readonly canSaveDraft = computed(() => {
    const remainingCharacterPoints = this.remainingCharacterPoints();

    return (
      this.hasPendingChanges() &&
      remainingCharacterPoints !== null &&
      remainingCharacterPoints >= 0 &&
      !this.hasStatCapViolation()
    );
  });

  readonly statRows = computed<AttributeAllocationRow[]>(() => {
    const rules = this.progressionRules();

    if (!rules) {
      return [];
    }

    const remainingCharacterPoints = this.remainingCharacterPoints();
    const capPreview = this.capPreview();
    const maxAllowedValue = capPreview.error || capPreview.value === null
      ? null
      : positiveInteger(capPreview.value);

    return this.statsList().map((stat) => {
      const currentValue = this.baseStats()[stat.key] ?? 0;
      const plannedValue = this.draftStats()[stat.key] ?? currentValue;
      const pendingLevels = Math.max(0, plannedValue - currentValue);
      const nextLevelCostResult = this.statProgression.evaluateNextLevelCost(
        plannedValue,
        rules.costFormula.expression,
        {
          target: rules.costTarget,
        }
      );
      const nextLevelCost =
        nextLevelCostResult.error || nextLevelCostResult.value === null
          ? null
          : nonNegativeInteger(nextLevelCostResult.value);

      let increaseReason: string | null = null;

      if (capPreview.error || capPreview.value === null) {
        increaseReason = this.statCapSummaryError();
      } else if (maxAllowedValue !== null && plannedValue > maxAllowedValue) {
        increaseReason =
          `Cap exceeded for hero level ${this.heroLevel()}. Lower this stat to ${maxAllowedValue} or less before saving.`;
      } else if (maxAllowedValue !== null && plannedValue >= maxAllowedValue) {
        increaseReason = `Cap reached for hero level ${this.heroLevel()}.`;
      } else if (nextLevelCostResult.error) {
        increaseReason = nextLevelCostResult.error;
      } else if (remainingCharacterPoints === null) {
        increaseReason =
          this.characterPointSummaryError() ?? 'Stat upgrade cost cannot be calculated.';
      } else if (nextLevelCost !== null && nextLevelCost > remainingCharacterPoints) {
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
        formulaError: this.statCapSummaryError() ?? nextLevelCostResult.error,
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
    const remainingCharacterPoints = this.remainingCharacterPoints();

    if (!this.canSaveDraft() || remainingCharacterPoints === null) {
      const capError = this.statCapSummaryError();

      if (capError) {
        this.toast.show('error', 'Formula error', capError);
        return;
      }

      if (this.hasStatCapViolation()) {
        this.toast.show(
          'error',
          'Stat cap exceeded',
          'One or more planned stats are above the current formula-driven cap.',
        );
      }

      return;
    }

    const invalidRow = this.statRows().find((row) => row.formulaError);

    if (invalidRow?.formulaError) {
      this.toast.show('error', 'Formula error', invalidRow.formulaError);
      return;
    }

    const nextCharacterPoints = remainingCharacterPoints;
    const nextStats = {
      ...this.draftStats(),
    };
    const previousCharacterPoints = this.characterPoints();

    this.isSaving.set(true);

    this.heroService
      .saveProgressionDraft(nextStats, nextCharacterPoints, {
        previousCharacterPoints,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (result) => {
          this.baseStats.set(result.stats);
          this.draftStats.set({
            ...result.stats,
          });
          this.characterPoints.set(result.characterPointsAfter);
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
          this.characterPoints.set(nonNegativeInteger(hero.character_points ?? 0));
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

  private getSpentPointsForStat(statKey: string, costFormula: string): number | null {
    const currentValue = this.baseStats()[statKey] ?? 0;
    const plannedValue = this.draftStats()[statKey] ?? currentValue;

    if (plannedValue <= currentValue) {
      return 0;
    }

    let total = 0;

    for (let level = currentValue; level < plannedValue; level += 1) {
      const cost = this.statProgression.getNextLevelCost(level, costFormula, {
        target: this.progressionRules()?.costTarget ?? undefined,
      });

      if (cost === null) {
        return null;
      }

      total += cost;
    }

    return total;
  }
}

