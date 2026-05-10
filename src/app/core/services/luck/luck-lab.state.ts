import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, forkJoin, map } from 'rxjs';
import {
  LuckInfluencePreview,
  LuckLabInputState,
  LuckLabPreviewResult,
  TrialPowerRead,
} from '../../domain/luck/luck.model';
import { getErrorMessage } from '../../utils/error-message';
import { DEFAULT_LUCK_LAB_INPUT, mapLuckLabPreviewResult } from '../../utils/luck-lab-mappers';
import { RequestToken } from '../../utils/request-token';
import { LuckLabPreviews } from './luck-lab-previews';

export type LuckLabPreviewSection =
  | 'surfaces'
  | 'trialPower'
  | 'chancePreviews'
  | 'combat'
  | 'rewards'
  | 'dropDistribution';

type SectionRecord<T> = Record<LuckLabPreviewSection, T>;

const PREVIEW_SECTIONS: readonly LuckLabPreviewSection[] = [
  'surfaces',
  'trialPower',
  'chancePreviews',
  'combat',
  'rewards',
  'dropDistribution',
];

@Injectable({ providedIn: 'root' })
export class LuckLabState {
  private readonly previews = inject(LuckLabPreviews);
  private readonly destroyRef = inject(DestroyRef);
  private readonly previewToken = new RequestToken();
  private debounceHandle: ReturnType<typeof setTimeout> | null = null;

  readonly luckValue = signal(DEFAULT_LUCK_LAB_INPUT.luckValue);
  readonly testedStatValue = signal(DEFAULT_LUCK_LAB_INPUT.testedStatValue);
  readonly spiritualityValue = signal(DEFAULT_LUCK_LAB_INPUT.spiritualityValue);
  readonly difficultyKey = signal<string | null>(DEFAULT_LUCK_LAB_INPUT.difficultyKey);
  readonly districtCode = signal<string | null>(DEFAULT_LUCK_LAB_INPUT.districtCode);
  readonly testedStatKey = signal<string | null>(DEFAULT_LUCK_LAB_INPUT.testedStatKey);
  readonly trialDefinitionId = signal<string | null>(
    DEFAULT_LUCK_LAB_INPUT.trialDefinitionId,
  );
  readonly selectedCombatProfileKey = signal<string | null>(
    DEFAULT_LUCK_LAB_INPUT.selectedCombatProfileKey,
  );
  readonly rewardProfileId = signal<string | null>(DEFAULT_LUCK_LAB_INPUT.rewardProfileId);
  readonly bucketProfileId = signal<string | null>(DEFAULT_LUCK_LAB_INPUT.bucketProfileId);
  readonly maxQualityKey = signal<string | null>(DEFAULT_LUCK_LAB_INPUT.maxQualityKey);
  readonly previewCount = signal(DEFAULT_LUCK_LAB_INPUT.previewCount);
  readonly dryStepCount = signal(DEFAULT_LUCK_LAB_INPUT.dryStepCount);
  readonly stepsToPreview = signal(DEFAULT_LUCK_LAB_INPUT.stepsToPreview);

  readonly input = computed<LuckLabInputState>(() => ({
    luckValue: this.luckValue(),
    testedStatValue: this.testedStatValue(),
    spiritualityValue: this.spiritualityValue(),
    difficultyKey: this.difficultyKey(),
    districtCode: this.districtCode(),
    testedStatKey: this.testedStatKey(),
    trialDefinitionId: this.trialDefinitionId(),
    selectedCombatProfileKey: this.selectedCombatProfileKey(),
    rewardProfileId: this.rewardProfileId(),
    bucketProfileId: this.bucketProfileId(),
    maxQualityKey: this.maxQualityKey(),
    previewCount: this.previewCount(),
    dryStepCount: this.dryStepCount(),
    stepsToPreview: this.stepsToPreview(),
  }));
  readonly result = signal<LuckLabPreviewResult>(
    mapLuckLabPreviewResult({ input: DEFAULT_LUCK_LAB_INPUT }),
  );
  readonly loadingBySection = signal<SectionRecord<boolean>>(
    createSectionRecord(false),
  );
  readonly errorsBySection = signal<SectionRecord<string | null>>(
    createSectionRecord(null),
  );
  readonly isLoading = computed(() =>
    Object.values(this.loadingBySection()).some(Boolean),
  );
  readonly error = computed(() =>
    Object.values(this.errorsBySection()).find((message) => message !== null) ?? null,
  );

  setLuckValue(value: number): void {
    this.luckValue.set(normalizeNonNegativeInteger(value));
    this.schedulePreviewReload();
  }

  setTestedStatValue(value: number): void {
    this.testedStatValue.set(normalizeNonNegativeInteger(value));
    this.schedulePreviewReload();
  }

  setSpiritualityValue(value: number): void {
    this.spiritualityValue.set(normalizeNonNegativeInteger(value));
    this.schedulePreviewReload();
  }

  setDifficultyKey(value: string | null): void {
    this.difficultyKey.set(value);
    this.schedulePreviewReload();
  }

  setDistrictCode(value: string | null): void {
    this.districtCode.set(value);
    this.schedulePreviewReload();
  }

  setTestedStatKey(value: string | null): void {
    this.testedStatKey.set(value);
    this.schedulePreviewReload();
  }

  setTrialDefinitionId(value: string | null): void {
    this.trialDefinitionId.set(value);
    this.schedulePreviewReload();
  }

  setSelectedCombatProfileKey(value: string | null): void {
    this.selectedCombatProfileKey.set(value);
    this.schedulePreviewReload();
  }

  setRewardProfileId(value: string | null): void {
    this.rewardProfileId.set(value);
    this.schedulePreviewReload();
  }

  setBucketProfileId(value: string | null): void {
    this.bucketProfileId.set(value);
    this.schedulePreviewReload();
  }

  setMaxQualityKey(value: string | null): void {
    this.maxQualityKey.set(value);
    this.schedulePreviewReload();
  }

  setPreviewCount(value: number): void {
    this.previewCount.set(Math.max(1, normalizeNonNegativeInteger(value)));
    this.schedulePreviewReload();
  }

  setDryStepCount(value: number): void {
    this.dryStepCount.set(normalizeNonNegativeInteger(value));
    this.schedulePreviewReload();
  }

  setStepsToPreview(value: number): void {
    this.stepsToPreview.set(Math.max(1, normalizeNonNegativeInteger(value)));
    this.schedulePreviewReload();
  }

  reloadNow(): void {
    this.clearScheduledReload();
    this.runPreview(this.input());
  }

  schedulePreviewReload(delayMs = 250): void {
    this.clearScheduledReload();
    this.debounceHandle = setTimeout(() => {
      this.debounceHandle = null;
      this.runPreview(this.input());
    }, delayMs);
  }

  private runPreview(input: LuckLabInputState): void {
    const token = this.previewToken.next();

    this.loadingBySection.set(createSectionRecord(true));
    this.errorsBySection.set(createSectionRecord(null));
    this.runSection(token, 'surfaces', this.previews.getSurfaces(), (surfaces) =>
      this.patchResult(input, { surfaces }),
    );
    this.runSection(
      token,
      'trialPower',
      this.previews.previewTrialPower(input),
      (trialPowerRows) => {
        const trialPower = trialPowerRows[0] ?? null;

        this.patchResult(input, {
          luckInfluence: trialPower ? toLuckInfluencePreview(trialPower) : null,
          trialPower,
        });
      },
    );
    this.runSection(
      token,
      'chancePreviews',
      forkJoin([
        this.previews.previewTrialOpportunity(input),
        this.previews.previewTrialManifestation(input),
        this.previews.previewChallengeAutoResolve(input),
        this.previews.previewNonTrialEncounter(input),
        this.previews.previewExplorationRngChain(input),
      ]).pipe(map((rows) => rows.flat())),
      (chancePreviews) => this.patchResult(input, { chancePreviews }),
    );
    this.runSection(token, 'combat', this.previews.previewCombat(input), (rows) =>
      this.patchResult(input, { combatPreview: rows[0] ?? null }),
    );
    this.runSection(
      token,
      'rewards',
      forkJoin({
        rewardRangePreviews: this.previews.previewRewardProfile(input),
        generatedItemPreviews: this.previews.previewGeneratedItem(input),
      }),
      (rewards) => this.patchResult(input, rewards),
    );
    this.runSection(
      token,
      'dropDistribution',
      this.previews.previewDropDistribution(),
      (dropDistribution) => this.patchResult(input, { dropDistribution }),
    );
  }

  private clearScheduledReload(): void {
    if (this.debounceHandle !== null) {
      clearTimeout(this.debounceHandle);
      this.debounceHandle = null;
    }
  }

  private runSection<T>(
    token: number,
    section: LuckLabPreviewSection,
    request: Observable<T>,
    applyResult: (value: T) => void,
  ): void {
    request
      .pipe(
        finalize(() => {
          if (this.previewToken.isCurrent(token)) {
            this.patchSectionLoading(section, false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (value) => {
          if (this.previewToken.isCurrent(token)) {
            applyResult(value);
          }
        },
        error: (error: unknown) => {
          if (this.previewToken.isCurrent(token)) {
            this.patchSectionError(
              section,
              getErrorMessage(error, 'Luck Lab preview failed.'),
            );
          }
        },
      });
  }

  private patchResult(
    input: LuckLabInputState,
    patch: Partial<Pick<
      LuckLabPreviewResult,
      | 'surfaces'
      | 'luckInfluence'
      | 'trialPower'
      | 'chancePreviews'
      | 'combatPreview'
      | 'rewardRangePreviews'
      | 'generatedItemPreviews'
      | 'dropDistribution'
    >>,
  ): void {
    const current = this.result();

    this.result.set(
      mapLuckLabPreviewResult({
        input,
        surfaces: hasPatch(patch, 'surfaces') ? patch.surfaces : current.surfaces,
        luckInfluence: hasPatch(patch, 'luckInfluence')
          ? patch.luckInfluence
          : current.luckInfluence,
        trialPower: hasPatch(patch, 'trialPower')
          ? patch.trialPower
          : current.trialPower,
        chancePreviews: hasPatch(patch, 'chancePreviews')
          ? patch.chancePreviews
          : current.chancePreviews,
        combatPreview: hasPatch(patch, 'combatPreview')
          ? patch.combatPreview
          : current.combatPreview,
        rewardRangePreviews:
          hasPatch(patch, 'rewardRangePreviews')
            ? patch.rewardRangePreviews
            : current.rewardRangePreviews,
        generatedItemPreviews:
          hasPatch(patch, 'generatedItemPreviews')
            ? patch.generatedItemPreviews
            : current.generatedItemPreviews,
        dropDistribution: hasPatch(patch, 'dropDistribution')
          ? patch.dropDistribution
          : current.dropDistribution,
      }),
    );
  }

  private patchSectionLoading(
    section: LuckLabPreviewSection,
    isLoading: boolean,
  ): void {
    this.loadingBySection.update((current) => ({
      ...current,
      [section]: isLoading,
    }));
  }

  private patchSectionError(
    section: LuckLabPreviewSection,
    error: string | null,
  ): void {
    this.errorsBySection.update((current) => ({
      ...current,
      [section]: error,
    }));
  }
}

function createSectionRecord<T>(value: T): SectionRecord<T> {
  return PREVIEW_SECTIONS.reduce(
    (record, section) => ({
      ...record,
      [section]: value,
    }),
    {} as SectionRecord<T>,
  );
}

function normalizeNonNegativeInteger(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function hasPatch<T extends object, K extends keyof T>(
  patch: Partial<T>,
  key: K,
): patch is Partial<T> & Pick<T, K> {
  return Object.prototype.hasOwnProperty.call(patch, key);
}

function toLuckInfluencePreview(trialPower: TrialPowerRead): LuckInfluencePreview {
  return {
    luckValue: trialPower.luckValue,
    luckInfluence: trialPower.luckInfluence,
    formula: trialPower.luckInfluenceFormula,
    explanation: trialPower.explanation,
  };
}
