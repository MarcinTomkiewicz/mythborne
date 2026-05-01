import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import { ExplorationTrialAdminData } from '../../../core/domain/exploration/exploration-trial-admin.model';
import { ExplorationTrialAdmin } from '../../../core/services/exploration/exploration-trial-admin';
import {
  toTrialCombatCandidateAdminViews,
  toTrialDefinitionAdminView,
} from '../../../core/utils/exploration-trial-admin-mappers';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';

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

  readonly trialOptions = computed(() =>
    (this.data()?.trials ?? []).map((trial) => ({
      label: `${trial.label} (${trial.key})${trial.isActive ? '' : ' - inactive'}`,
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
  readonly hasTrials = computed(() => (this.data()?.trials.length ?? 0) > 0);
  readonly canEditCombatCandidates = computed(() => this.selectedTrial()?.isCombatTrial ?? false);

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

  private syncSelectedTrial(data: ExplorationTrialAdminData): void {
    const selected = this.selectedTrialId();

    if (selected && data.trials.some((trial) => trial.id === selected)) {
      this.selectTrial(selected);
      return;
    }

    this.selectTrial(data.trials[0]?.id ?? null);
  }

}
