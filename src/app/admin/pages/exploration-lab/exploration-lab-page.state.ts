import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import {
  TrialDefinitionReadModel,
} from '../../../core/domain/exploration/exploration-definition.model';
import {
  ChallengeAutoResolveSuccessChancePreview,
  RewardGeneratedItemPreview,
  RewardProfilePreview,
  TrialManifestationChancePreview,
  TrialOpportunityCurvePreview,
  TrialOpportunitySimulation,
} from '../../../core/domain/exploration/exploration-preview.model';
import { RewardProfileReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { ExplorationLabPreviews } from '../../../core/services/exploration/exploration-lab-previews';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';

interface SimulationSummary {
  totalRuns: number;
  foundCount: number;
  notFoundCount: number;
  foundRate: number;
  averageSteps: number;
}

interface SimulationStepDistribution {
  stepsTaken: number;
  runCount: number;
  foundCount: number;
  foundRate: number;
}

@Injectable()
export class ExplorationLabPageState {
  private readonly previews = inject(ExplorationLabPreviews);
  private readonly definitions = inject(ExplorationDefinitionsState);
  private readonly destroyRef = inject(DestroyRef);
  private readonly runToken = new RequestToken();

  private readonly previewError = signal<string | null>(null);
  readonly isRunning = signal(false);
  readonly error = computed(() => this.previewError() ?? this.definitions.error());
  readonly difficultyOptions = this.definitions.difficultyOptions;
  readonly districtOptions = this.definitions.districtOptions;
  readonly statOptions = this.definitions.statOptions;
  readonly itemBucketOptions = this.definitions.itemBucketOptions;
  readonly itemQualityOptions = computed(() => [
    { label: 'Database default', value: null },
    ...this.definitions.itemQualityOptions(),
  ]);
  readonly rewardProfileSuggestions = signal(this.definitions.rewardProfiles());
  readonly trialDefinitionSuggestions = signal(this.definitions.trialDefinitions());
  readonly hasActiveDifficulties = this.definitions.hasActiveDifficulties;
  readonly isLoading = computed(
    () => this.definitions.isLoadingDefinitions() || this.isRunning(),
  );

  readonly opportunityForm = new FormGroup({
    difficultyKey: new FormControl<string | null>(null),
    startingDryStepCount: new FormControl<number | null>(0),
    stepsToPreview: new FormControl<number | null>(8),
  });
  readonly manifestationForm = new FormGroup({
    difficultyKey: new FormControl<string | null>(null),
    districtCode: new FormControl<string | null>(null),
    trialDefinition: new FormControl<TrialDefinitionReadModel | null>(null),
    trialDefinitionId: new FormControl<string | null>(null),
    testedStatValue: new FormControl<number | null>(10),
    spiritualityValue: new FormControl<number | null>(0),
    luckValue: new FormControl<number | null>(0),
  });
  readonly autoResolveForm = new FormGroup({
    difficultyKey: new FormControl<string | null>(null),
    testedStatKey: new FormControl<string | null>(null),
    testedStatValue: new FormControl<number | null>(10),
    spiritualityValue: new FormControl<number | null>(0),
    luckValue: new FormControl<number | null>(0),
  });
  readonly generatedItemForm = new FormGroup({
    bucketProfileId: new FormControl<string | null>(null),
    maxQualityKey: new FormControl<string | null>(null),
    previewCount: new FormControl<number | null>(3),
  });
  readonly rewardProfileForm = new FormGroup({
    rewardProfile: new FormControl<RewardProfileReadModel | null>(null),
    rewardProfileId: new FormControl<string | null>(null),
    previewCount: new FormControl<number | null>(3),
  });
  readonly simulationForm = new FormGroup({
    difficultyKey: new FormControl<string | null>(null),
    startingDryStepCount: new FormControl<number | null>(0),
    maxStepsPerRun: new FormControl<number | null>(8),
    runCount: new FormControl<number | null>(20),
    includeRollHistory: new FormControl<boolean>(false, { nonNullable: true }),
  });

  readonly opportunityRows = signal<TrialOpportunityCurvePreview[]>([]);
  readonly manifestationRows = signal<TrialManifestationChancePreview[]>([]);
  readonly autoResolveRows = signal<ChallengeAutoResolveSuccessChancePreview[]>([]);
  readonly generatedItemRows = signal<RewardGeneratedItemPreview[]>([]);
  readonly rewardProfileRows = signal<RewardProfilePreview[]>([]);
  readonly simulationRows = signal<TrialOpportunitySimulation[]>([]);
  readonly simulationSummary = computed<SimulationSummary>(() => {
    const rows = this.simulationRows();
    const totalRuns = rows.length;
    const foundCount = rows.filter((row) => row.trialFound).length;
    const totalSteps = rows.reduce((sum, row) => sum + row.stepsTaken, 0);

    return {
      totalRuns,
      foundCount,
      notFoundCount: totalRuns - foundCount,
      foundRate: totalRuns ? foundCount / totalRuns : 0,
      averageSteps: totalRuns ? totalSteps / totalRuns : 0,
    };
  });
  readonly simulationStepDistribution = computed<SimulationStepDistribution[]>(() => {
    const rowsByStep = new Map<number, TrialOpportunitySimulation[]>();

    for (const row of this.simulationRows()) {
      rowsByStep.set(row.stepsTaken, [...(rowsByStep.get(row.stepsTaken) ?? []), row]);
    }

    return Array.from(rowsByStep.entries())
      .sort(([left], [right]) => left - right)
      .map(([stepsTaken, rows]) => {
        const foundCount = rows.filter((row) => row.trialFound).length;

        return {
          stepsTaken,
          runCount: rows.length,
          foundCount,
          foundRate: rows.length ? foundCount / rows.length : 0,
        };
      });
  });

  constructor() {
    effect(() => {
      this.applyDefinitionDefaults();
      this.rewardProfileSuggestions.set(this.definitions.rewardProfiles());
      this.trialDefinitionSuggestions.set(this.definitions.trialDefinitions());
    });
  }

  loadInitialData(): void {
    this.definitions.loadDefinitions();
    this.applyDefinitionDefaults();
  }

  searchRewardProfiles(query: string): void {
    this.rewardProfileSuggestions.set(this.definitions.filterRewardProfiles(query));
  }

  selectRewardProfile(profile: RewardProfileReadModel): void {
    this.rewardProfileForm.controls.rewardProfile.setValue(profile);
    this.rewardProfileForm.controls.rewardProfileId.setValue(profile.id);
  }

  clearRewardProfile(): void {
    this.rewardProfileForm.controls.rewardProfile.setValue(null);
    this.rewardProfileForm.controls.rewardProfileId.setValue(null);
  }

  searchTrialDefinitions(query: string): void {
    this.trialDefinitionSuggestions.set(this.definitions.filterTrialDefinitions(query));
  }

  selectTrialDefinition(trial: TrialDefinitionReadModel): void {
    this.manifestationForm.controls.trialDefinition.setValue(trial);
    this.manifestationForm.controls.trialDefinitionId.setValue(trial.id);
  }

  clearTrialDefinition(): void {
    this.manifestationForm.controls.trialDefinition.setValue(null);
    this.manifestationForm.controls.trialDefinitionId.setValue(null);
  }

  runOpportunityCurve(): void {
    this.runPreview(
      this.previews.previewTrialOpportunityCurve(this.opportunityForm.getRawValue()),
      this.opportunityRows,
    );
  }

  runManifestationChance(): void {
    const { trialDefinition: _trialDefinition, ...input } =
      this.manifestationForm.getRawValue();

    this.runPreview(
      this.previews.previewTrialManifestationChance(input),
      this.manifestationRows,
    );
  }

  runAutoResolveChance(): void {
    this.runPreview(
      this.previews.previewChallengeAutoResolveSuccessChance(
        this.autoResolveForm.getRawValue(),
      ),
      this.autoResolveRows,
    );
  }

  runGeneratedItemPreview(): void {
    this.runPreview(
      this.previews.previewRewardGeneratedItem(this.generatedItemForm.getRawValue()),
      this.generatedItemRows,
    );
  }

  runRewardProfilePreview(): void {
    const { rewardProfile: _rewardProfile, ...input } =
      this.rewardProfileForm.getRawValue();

    this.runPreview(
      this.previews.previewRewardProfile(input),
      this.rewardProfileRows,
    );
  }

  runTrialOpportunitySimulation(): void {
    this.runPreview(
      this.previews.simulateTrialOpportunityRuns(this.simulationForm.getRawValue()),
      this.simulationRows,
    );
  }

  private runPreview<T>(request: Observable<T[]>, target: { set(value: T[]): void }): void {
    const token = this.runToken.next();

    this.previewError.set(null);
    this.isRunning.set(true);
    request
      .pipe(
        finalize(() => {
          if (this.runToken.isCurrent(token)) {
            this.isRunning.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          if (!this.runToken.isCurrent(token)) {
            return;
          }

          target.set(rows);
        },
        error: (error: unknown) => {
          if (!this.runToken.isCurrent(token)) {
            return;
          }

          this.previewError.set(
            getErrorMessage(error, 'Exploration lab preview failed.'),
          );
        },
      });
  }

  private applyDefinitionDefaults(): void {
    const difficultyKey = this.definitions.difficulties()[0]?.key ?? null;
    const districtCode = this.definitions.districts()[0]?.code ?? null;
    const statKey = this.definitions.stats()[0]?.key ?? null;
    const bucketProfileId = this.definitions.itemBucketProfiles()[0]?.id ?? null;

    this.setControlDefault(this.opportunityForm.controls.difficultyKey, difficultyKey);
    this.setControlDefault(this.manifestationForm.controls.difficultyKey, difficultyKey);
    this.setControlDefault(this.manifestationForm.controls.districtCode, districtCode);
    this.setControlDefault(this.autoResolveForm.controls.difficultyKey, difficultyKey);
    this.setControlDefault(this.autoResolveForm.controls.testedStatKey, statKey);
    this.setControlDefault(this.generatedItemForm.controls.bucketProfileId, bucketProfileId);
    this.setControlDefault(this.simulationForm.controls.difficultyKey, difficultyKey);
  }

  private setControlDefault(control: FormControl<string | null>, value: string | null): void {
    if (!control.value && value) {
      control.setValue(value, { emitEvent: false });
    }
  }
}
