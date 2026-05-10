import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import { ExplorationTrialAdminData } from '../../../core/domain/exploration/exploration-trial-admin.model';
import { TrialReadinessReadModel } from '../../../core/domain/exploration/exploration-readiness.model';
import { ExplorationTrialAdmin } from '../../../core/services/exploration/exploration-trial-admin';
import {
  toTrialCombatCandidateAdminViews,
  toTrialDefinitionAdminView,
  toGlobalTrialRewardAssignmentAdminViews,
  toTrialRewardAssignmentAdminViews,
} from '../../../core/utils/exploration-trial-admin-mappers';
import { dictionaryOptions } from '../../../core/utils/dictionary-options';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import {
  REWARD_ASSIGNMENT_MATCH_KIND_FALLBACKS,
  REWARD_SOURCE_KIND,
} from '../../../core/constants/reward-runtime-keys.const';
import { ExplorationTrialUiMetadata } from './exploration-trial-ui-metadata';

@Injectable()
export class ExplorationTrialsPageState {
  private readonly admin = inject(ExplorationTrialAdmin);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadToken = new RequestToken();

  readonly data = signal<ExplorationTrialAdminData | null>(null);
  readonly selectedTrialId = signal<string | null>(null);
  readonly trialSelector = new FormControl<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly uiMetadata = new ExplorationTrialUiMetadata(
    () => this.data()?.uiMetadataEntries ?? [],
    () => this.selectedTrial()?.trial.label ?? null,
  );

  readonly trialOptions = computed(() =>
    (this.data()?.trials ?? []).map((trial) => ({
      label: `${trial.label} (${trial.key}) - ${this.readinessOptionLabel(trial.id)}`,
      value: trial.id,
    })),
  );
  readonly selectedTrial = computed(() => {
    const data = this.data();
    const trialId = this.selectedTrialId();

    return data && trialId ? toTrialDefinitionAdminView(data, trialId) : null;
  });
  readonly combatCandidates = computed(() => {
    const data = this.data();
    const trialId = this.selectedTrialId();

    return data && trialId ? toTrialCombatCandidateAdminViews(data, trialId) : [];
  });
  readonly rewardAssignments = computed(() => {
    const data = this.data();
    const trialId = this.selectedTrialId();

    return data && trialId ? toTrialRewardAssignmentAdminViews(data, trialId) : [];
  });
  readonly globalRewardAssignments = computed(() => {
    const data = this.data();

    return data ? toGlobalTrialRewardAssignmentAdminViews(data) : [];
  });
  readonly statOptions = computed(() =>
    (this.data()?.stats ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})`,
      value: entry.key,
    })),
  );
  readonly minigameOptions = computed(() =>
    (this.data()?.minigames ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.key,
    })),
  );
  readonly candidateKindOptions = [
    { label: 'Concrete opponent', value: 'opponent' },
    { label: 'Opponent family', value: 'family' },
  ];
  readonly opponentOptions = computed(() =>
    (this.data()?.opponents ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.id,
    })),
  );
  readonly familyOptions = computed(() =>
    (this.data()?.families ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isActive ? '' : ' - inactive'}`,
      value: entry.key,
    })),
  );
  readonly formulaOptions = computed(() => [
    { label: 'Default combat scaling', value: null },
    ...(this.data()?.formulas ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})${entry.isEnabled ? '' : ' - disabled'}`,
      value: entry.id,
    })),
  ]);
  readonly rewardProfileOptions = computed(() =>
    (this.data()?.rewardProfiles ?? [])
      .filter((entry) => entry.isActive)
      .map((entry) => ({
        label: `${entry.label} (${entry.key})`,
        value: entry.id,
      })),
  );
  readonly outcomeKindOptions = computed(() => {
    const options = (this.data()?.rewardOutcomeKinds ?? [])
      .filter((entry) => entry.isActive && entry.sourceKind === REWARD_SOURCE_KIND.trial)
      .map((entry) => ({
        label: `${entry.label} (${entry.key})`,
        value: entry.key,
      }));

    return options.length > 0 ? options : [{ label: 'Success (success)', value: 'success' }];
  });
  readonly rewardMatchKindOptions = computed(() =>
    dictionaryOptions(
      this.data()?.rewardAssignmentMatchKinds ?? [],
      REWARD_ASSIGNMENT_MATCH_KIND_FALLBACKS,
    ),
  );
  readonly difficultyOptions = computed(() =>
    (this.data()?.difficulties ?? []).map((entry) => ({
      label: `${entry.label} (${entry.key})`,
      value: entry.key,
    })),
  );
  readonly districtOptions = computed(() =>
    (this.data()?.districts ?? []).map((entry) => ({
      label: `${entry.name} (${entry.code})`,
      value: entry.code,
    })),
  );
  readonly hasTrials = computed(() => (this.data()?.trials.length ?? 0) > 0);
  readonly hasRewardProfiles = computed(() => (this.data()?.rewardProfiles.length ?? 0) > 0);
  readonly canEditCombatCandidates = computed(() => this.selectedTrial()?.isCombatTrial ?? false);
  readonly missingUiMetadataGaps = computed(() => this.uiMetadata.missingGaps());

  constructor() {
    this.trialSelector.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((trialId) => this.selectTrial(trialId));
  }

  loadInitialData(): void {
    const token = this.loadToken.next();

    this.isLoading.set(true);
    this.error.set(null);
    this.admin
      .getAdminData()
      .pipe(
        finalize(() => {
          if (this.loadToken.isCurrent(token)) {
            this.isLoading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.data.set(data);
          this.syncSelectedTrial(data);
        },
        error: (error: unknown) => {
          if (!this.loadToken.isCurrent(token)) {
            return;
          }

          this.error.set(getErrorMessage(error, 'Failed to load trial definitions.'));
        },
      });
  }

  selectTrial(trialId: string | null): void {
    this.selectedTrialId.set(trialId);

    if (this.trialSelector.value !== trialId) {
      this.trialSelector.setValue(trialId, { emitEvent: false });
    }
  }

  readinessForTrial(trialId: string): TrialReadinessReadModel | null {
    return this.data()?.trialReadiness.find((entry) => entry.definitionId === trialId) ?? null;
  }

  readinessStatusLabel(readiness: TrialReadinessReadModel | null): string {
    if (!readiness) {
      return 'Readiness not reported by DB';
    }

    if (readiness.statusKey === 'ready') {
      return 'Runtime-ready';
    }

    return readiness.statusKey === 'inactive' ? 'Inactive' : 'Incomplete';
  }

  readinessSeverity(readiness: TrialReadinessReadModel | null): 'success' | 'secondary' | 'warn' {
    if (!readiness || readiness.statusKey === 'inactive') {
      return 'secondary';
    }

    return readiness.statusKey === 'ready' ? 'success' : 'warn';
  }

  readinessSummary(readiness: TrialReadinessReadModel | null): string {
    if (!readiness) {
      return 'The readiness RPC did not return a row for this Trial.';
    }

    if (readiness.statusKey === 'ready') {
      return 'This Trial is complete and eligible for normal runtime selection.';
    }

    if (readiness.statusKey === 'inactive') {
      return 'This Trial is inactive and is not selected by normal runtime.';
    }

    return 'This Trial is incomplete and is not selected by normal runtime until blocking reasons are resolved.';
  }

  readinessReasonLabels(readiness: TrialReadinessReadModel | null): string[] {
    return (readiness?.reasons ?? []).map((reason) =>
      [
        reason.label ?? reason.key,
        reason.description,
        reason.isBlocking === true ? 'blocking' : null,
      ]
        .filter(Boolean)
        .join(' - '),
    );
  }

  private syncSelectedTrial(data: ExplorationTrialAdminData): void {
    const selected = this.selectedTrialId();

    if (selected && data.trials.some((trial) => trial.id === selected)) {
      this.selectTrial(selected);
      return;
    }

    this.selectTrial(data.trials[0]?.id ?? null);
  }

  private readinessOptionLabel(trialId: string): string {
    return this.readinessStatusLabel(this.readinessForTrial(trialId));
  }

}
