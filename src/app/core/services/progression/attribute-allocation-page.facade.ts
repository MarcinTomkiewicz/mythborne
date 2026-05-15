import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import {
  attributeAllocationPreviewManifestError,
  isUsableAttributeAllocationPreviewManifest,
} from '../../domain/progression/attribute-allocation-preview-manifest.mapper';
import { mapAttributeAllocationPreviewRows } from '../../domain/progression/attribute-allocation-preview.interpreter';
import {
  AttributeAllocationPreviewManifest,
  AttributeAllocationPreviewRow,
} from '../../domain/progression/attribute-allocation-preview-manifest.model';
import { StatProgressionRules } from '../../domain/progression/stat-progression.model';
import { mapBaseStatSnapshots } from '../../domain/stats/base-stat.mapper';
import { BaseStatSnapshot } from '../../domain/stats/base-stat.model';
import { getErrorMessage } from '../../utils/error-message';
import { nonNegativeInteger, positiveInteger } from '../../utils/number';
import { Hero } from '../hero/hero';
import { HeroDashboardRuntimeStats } from '../hero/hero-dashboard-runtime-stats';
import { StatsService } from '../stats/stats';
import { ToastService } from '../ui/toast';
import { StatProgressionService } from './stat-progression';

@Injectable()
export class AttributeAllocationPageFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly heroService = inject(Hero);
  private readonly runtimeStatsService = inject(HeroDashboardRuntimeStats);
  private readonly statsService = inject(StatsService);
  private readonly statProgression = inject(StatProgressionService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly heroName = signal('');
  readonly heroLevel = signal(1);
  readonly characterPoints = signal(0);
  readonly draftStats = signal<Record<string, number>>({});
  readonly progressionRules = signal<StatProgressionRules | null>(null);
  readonly previewManifest = signal<AttributeAllocationPreviewManifest | null>(null);
  readonly previewManifestError = signal<string | null>(null);
  private readonly baseStats = signal<BaseStatSnapshot[]>([]);

  readonly tooltipFallback = 'Description for this stat is not configured yet. Tooltip is ready for admin-managed descriptions.';

  readonly capPreview = computed(() => {
    const rules = this.progressionRules();
    return rules
      ? this.statProgression.evaluateStatCap(
          this.heroLevel(),
          rules.capFormula.expression,
          rules.capTarget,
        )
      : { value: null, error: 'Stat progression rules are not loaded.' };
  });

  readonly statCapSummaryError = computed(() => {
    const cap = this.capPreview();
    return cap.error ?? (cap.value === null
      ? 'Stat level cap cannot be calculated because the active formula returned no value.'
      : null);
  });

  readonly spentCharacterPoints = computed<number | null>(() => {
    const expression = this.progressionRules()?.costFormula.expression;
    if (!expression) {
      return 0;
    }

    let total = 0;
    for (const stat of this.baseStats()) {
      const spent = this.getSpentPointsForStat(stat, expression);
      if (spent === null) {
        return null;
      }
      total += spent;
    }
    return total;
  });

  readonly remainingCharacterPoints = computed<number | null>(() =>
    this.spentCharacterPoints() === null ? null : this.characterPoints() - this.spentCharacterPoints()!,
  );

  readonly characterPointSummaryError = computed(() => this.spentCharacterPoints() === null
    ? 'Stat upgrade cost cannot be calculated because the active formula configuration is broken.'
    : null);

  readonly derivedStatRows = computed<AttributeAllocationPreviewRow[]>(() => {
    const manifest = this.previewManifest();
    return isUsableAttributeAllocationPreviewManifest(manifest)
      ? mapAttributeAllocationPreviewRows(
          manifest,
          this.currentBaseStatValues(),
          this.draftBaseStatValues(),
        )
      : [];
  });

  readonly derivedPreviewBadge = computed(() =>
    this.derivedStatRows().length > 0 ? 'Allocation preview' : 'Current preview only',
  );

  readonly derivedPreviewDescription = computed(() =>
    this.derivedStatRows().length > 0
      ? 'Current values and unsaved stat changes are shown below where preview data is available.'
      : 'Current values for allocation-related stats are not available for this hero yet.',
  );

  readonly hasPendingChanges = computed(() =>
    this.baseStats().some((stat) => stat.currentValue !== this.plannedValue(stat)),
  );

  readonly hasStatCapViolation = computed(() => {
    const cap = this.currentStatCap();
    return cap === null || this.baseStats().some((stat) => this.plannedValue(stat) > cap);
  });

  readonly canSaveDraft = computed(() => {
    const remaining = this.remainingCharacterPoints();
    return this.hasPendingChanges() && remaining !== null && remaining >= 0 && !this.hasStatCapViolation();
  });

  readonly statRows = computed(() => {
    const rules = this.progressionRules();
    if (!rules) {
      return [];
    }

    const cap = this.currentStatCap();
    const remaining = this.remainingCharacterPoints();
    return this.baseStats().map((stat) => {
      const plannedValue = this.plannedValue(stat);
      const cost = this.statProgression.getNextLevelCost(
        plannedValue,
        rules.costFormula.expression,
        { target: rules.costTarget },
      );

      return {
        key: stat.key,
        label: stat.label,
        description: stat.description,
        currentValue: stat.currentValue,
        plannedValue,
        pendingLevels: Math.max(0, plannedValue - stat.currentValue),
        nextLevelCost: cost,
        canIncrease: cap !== null && plannedValue < cap && cost !== null && remaining !== null && cost <= remaining,
        canDecrease: plannedValue > stat.currentValue,
      };
    });
  });

  incrementStat(statKey: string): void {
    const row = this.statRows().find((entry) => entry.key === statKey);
    if (row?.canIncrease) {
      this.draftStats.update((stats) => ({ ...stats, [statKey]: row.plannedValue + 1 }));
    }
  }

  decrementStat(statKey: string): void {
    const row = this.statRows().find((entry) => entry.key === statKey);
    if (row?.canDecrease) {
      this.draftStats.update((stats) => ({ ...stats, [statKey]: row.plannedValue - 1 }));
    }
  }

  resetDraft(): void {
    this.draftStats.set(Object.fromEntries(
      this.baseStats().map((stat) => [stat.key, stat.currentValue]),
    ));
    this.toast.show('info', 'Allocation reset', 'Unsaved stat changes were discarded.');
  }

  saveDraft(): void {
    const remaining = this.remainingCharacterPoints();
    if (!this.canSaveDraft() || remaining === null) {
      this.showSaveBlockedMessage(remaining);
      return;
    }

    this.isSaving.set(true);
    this.heroService
      .saveProgressionDraft(
        { ...this.draftStats() },
        remaining,
        { previousCharacterPoints: this.characterPoints() },
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (result) => {
          this.baseStats.update((stats) => stats.map((stat) => ({
            ...stat,
            currentValue: nonNegativeInteger(result.stats[stat.key] ?? stat.currentValue),
          })));
          this.draftStats.set({ ...result.stats });
          this.characterPoints.set(result.characterPointsAfter);
          this.loadPreviewManifest();
          this.toast.show('success', 'Attributes saved', 'Stat allocation was saved.');
        },
        error: (error: unknown) => {
          this.toast.show('error', 'Save failed', getErrorMessage(error, 'Failed to save attribute allocation.'));
        },
      });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      hero: this.heroService.getHeroData(),
      stats: this.heroService.getHeroStats(),
      definitions: this.statsService.getStats(),
      rules: this.statProgression.getRules(),
      previewManifest: this.previewManifestResult(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: ({ hero, stats, definitions, rules, previewManifest }) => {
          this.heroName.set(hero.name);
          this.heroLevel.set(positiveInteger(hero.level ?? 1));
          this.characterPoints.set(nonNegativeInteger(hero.character_points ?? 0));
          this.baseStats.set(mapBaseStatSnapshots(definitions, stats));
          this.draftStats.set({ ...stats });
          this.progressionRules.set(rules);
          this.previewManifest.set(previewManifest.manifest);
          this.previewManifestError.set(
            previewManifest.error
              ?? attributeAllocationPreviewManifestError(previewManifest.manifest),
          );
        },
        error: (error: unknown) => {
          const message = getErrorMessage(error, 'Failed to load hero progression.');
          this.loadError.set(message);
          this.toast.show('error', 'Attribute screen unavailable', message);
        },
      });
  }

  private showSaveBlockedMessage(remaining: number | null): void {
    const formulaError = this.statCapSummaryError() ?? this.characterPointSummaryError();
    if (formulaError || remaining === null) {
      this.toast.show('error', 'Formula error', formulaError ?? 'Stat upgrade cost cannot be calculated.');
      return;
    }

    if (!this.hasPendingChanges()) {
      this.toast.show('info', 'No allocation changes', 'Change at least one base stat before saving.');
      return;
    }

    const capViolation = this.hasStatCapViolation();
    this.toast.show(
      'error',
      capViolation ? 'Stat cap exceeded' : 'Not enough Character Points',
      capViolation
        ? 'One or more planned stats are above the current formula-driven cap.'
        : 'Lower the draft allocation before saving.',
    );
  }

  private loadPreviewManifest(): void {
    this.previewManifestError.set(null);
    this.previewManifestResult()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ manifest, error }) => {
        this.previewManifest.set(manifest);
        this.previewManifestError.set(
          error ?? attributeAllocationPreviewManifestError(manifest),
        );
      });
  }

  private previewManifestResult() {
    return this.runtimeStatsService.getActiveHeroAttributeAllocationPreviewManifest().pipe(
      map((manifest) => ({ manifest, error: null })),
      catchError((error: unknown) =>
        of({
          manifest: null,
          error: getErrorMessage(error, 'Derived preview could not be loaded.'),
        }),
      ),
    );
  }

  private currentStatCap(): number | null {
    const cap = this.capPreview();
    return cap.error || cap.value === null ? null : positiveInteger(cap.value);
  }

  private getSpentPointsForStat(stat: BaseStatSnapshot, expression: string): number | null {
    let total = 0;
    for (let level = stat.currentValue; level < this.plannedValue(stat); level += 1) {
      const cost = this.statProgression.getNextLevelCost(
        level,
        expression,
        { target: this.progressionRules()?.costTarget ?? undefined },
      );
      if (cost === null) {
        return null;
      }
      total += cost;
    }
    return total;
  }

  private plannedValue(stat: BaseStatSnapshot): number {
    return this.draftStats()[stat.key] ?? stat.currentValue;
  }

  private currentBaseStatValues(): Record<string, number> {
    return Object.fromEntries(this.baseStats().map((stat) => [stat.key, stat.currentValue]));
  }

  private draftBaseStatValues(): Record<string, number> {
    return {
      ...this.currentBaseStatValues(),
      ...this.draftStats(),
    };
  }
}
