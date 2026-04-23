import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize, forkJoin, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { IStat } from '../../../core/interfaces/i-stats/i-stats';
import { Hero } from '../../../core/services/hero/hero';
import { StatProgressionService } from '../../../core/services/progression/stat-progression';
import { StatsService } from '../../../core/services/stats/stats';
import { ToastService } from '../../../core/services/ui/toast';
import { StatProgressionRules } from '../../../core/domain/progression/stat-progression.model';
import { getErrorMessage } from '../../../core/utils/error-message';

interface AttributeAllocationRow {
  key: string;
  label: string;
  description: string | null;
  currentValue: number;
  plannedValue: number;
  pendingLevels: number;
  nextLevelCost: number | null;
  maxAllowedValue: number | null;
  canIncrease: boolean;
  canDecrease: boolean;
  increaseReason: string | null;
  formulaError: string | null;
}

@Component({
  selector: 'app-hero-attributes-page',
  standalone: true,
  imports: [ButtonModule, ProgressSpinnerModule, TableModule, TooltipModule],
  templateUrl: './attributes-page.html',
})
export class HeroAttributesPage implements OnInit {
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
      rules.capFormula.expression
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
      : Math.max(1, Math.round(capPreview.value ?? 1));

    return this.statsList().map((stat) => {
      const currentValue = this.baseStats()[stat.key] ?? 0;
      const plannedValue = this.draftStats()[stat.key] ?? currentValue;
      const pendingLevels = Math.max(0, plannedValue - currentValue);
      const nextLevelCostResult = this.statProgression.evaluateNextLevelCost(
        plannedValue,
        rules.costFormula.expression
      );
      const nextLevelCost =
        nextLevelCostResult.error || nextLevelCostResult.value === null
          ? null
          : Math.max(0, Math.round(nextLevelCostResult.value));

      let increaseReason: string | null = null;

      if (capPreview.error) {
        increaseReason = capPreview.error;
      } else if (maxAllowedValue !== null && plannedValue >= maxAllowedValue) {
        increaseReason = `Cap reached for hero level ${this.heroLevel()}.`;
      } else if (nextLevelCostResult.error) {
        increaseReason = nextLevelCostResult.error;
      } else if (nextLevelCost !== null && nextLevelCost > remainingHeroPoints) {
        increaseReason = 'Not enough hP for the next level.';
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

  ngOnInit(): void {
    this.loadData();
  }

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
        take(1),
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

  private loadData() {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      hero: this.heroService.getHeroData(),
      derived: this.heroService.getHeroDerived(),
      stats: this.heroService.getHeroStats(),
      definitions: this.statsService.getStats(),
      rules: this.statProgression.getRules(),
    })
      .pipe(
        take(1),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ({ hero, derived, stats, definitions, rules }) => {
          this.heroLevel.set(Math.max(1, hero.level ?? 1));
          this.heroPoints.set(Math.max(0, derived.hp ?? 0));
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
      const cost = this.statProgression.getNextLevelCost(level, costFormula);

      if (cost === null) {
        return Number.POSITIVE_INFINITY;
      }

      total += cost;
    }

    return total;
  }
}
