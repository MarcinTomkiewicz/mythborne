import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrialCombatCandidateAdminView } from '../../../core/domain/exploration/exploration-trial-admin.model';
import { ExplorationTrialAdmin } from '../../../core/services/exploration/exploration-trial-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { parseMetadataJson } from '../../../core/utils/admin-form-helpers';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import { toSlug } from '../../../core/utils/slug';
import { ExplorationTrialFormFactory } from './exploration-trial-form.factory';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';
import {
  markReasonInvalid,
  runTrialWorkflowAction,
} from './exploration-trial-workflow-actions';

@Injectable()
export class ExplorationTrialsActionsState {
  private readonly admin = inject(ExplorationTrialAdmin);
  private readonly page = inject(ExplorationTrialsPageState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formFactory = inject(ExplorationTrialFormFactory);
  private readonly saveToken = new RequestToken();
  private isSyncingForm = false;

  readonly selectedCandidateId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly trialReasonError = signal<string | null>(null);
  readonly candidateReasonError = signal<string | null>(null);
  readonly draftMinigameKey = signal<string | null>(null);
  readonly selectedCandidate = computed(() => {
    const candidateId = this.selectedCandidateId();

    return this.page.combatCandidates().find((row) => row.candidate.id === candidateId) ?? null;
  });
  readonly draftIsCombatTrial = computed(() => this.draftMinigameKey() === 'combat');
  readonly hasUnsavedMinigameChange = computed(() => {
    if (this.trialForm.controls.trialDefinitionId.value !== this.page.selectedTrialId()) {
      return false;
    }

    const saved = this.page.selectedTrial()?.trial.minigameKey ?? null;
    const draft = this.draftMinigameKey();

    return !!this.page.selectedTrialId() && saved !== draft;
  });

  readonly trialForm = this.formFactory.createTrialDefinitionForm();
  readonly candidateForm = this.formFactory.createTrialCombatCandidateForm();

  constructor() {
    effect(() => {
      this.page.selectedTrialId();
      untracked(() => this.syncFormsFromSelection());
    });

    this.trialForm.controls.label.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((label) => this.syncGeneratedKey(label));
    this.trialForm.controls.minigameKey.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((minigameKey) => this.draftMinigameKey.set(minigameKey));
  }

  selectCandidate(candidateId: string | null): void {
    this.selectedCandidateId.set(candidateId);
    this.syncCandidateForm(this.selectedCandidate());
  }

  startNewTrial(): void {
    this.page.selectTrial(null);
    this.selectedCandidateId.set(null);
    this.trialForm.reset(this.formFactory.trialValue(this.page.data(), null));
    this.draftMinigameKey.set(this.trialForm.controls.minigameKey.value);
    this.resetCandidateForm();
  }

  startNewCandidate(): void {
    this.selectedCandidateId.set(null);
    this.resetCandidateForm();
  }

  saveTrial(): void {
    this.page.error.set(null);
    const metadataJson = parseMetadataJson(
      this.trialForm.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    if (metadataJson === null) {
      return;
    }

    this.trialForm.markAllAsTouched();
    if (markReasonInvalid(this.trialReasonError, this.trialForm.controls.reason) || this.trialForm.invalid) {
      return;
    }

    try {
      const guard = this.currentTrialGuard();
      const reason = requiredFormValue(this.trialForm.controls.reason.value, 'Reason');

      runTrialWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () => this.admin.upsertTrialDefinition({
          trialDefinitionId: this.trialForm.controls.trialDefinitionId.value,
          key: this.trialForm.controls.key.value,
          label: this.trialForm.controls.label.value,
          description: this.trialForm.controls.description.value,
          helperText: trimToNull(this.trialForm.controls.helperText.value),
          adminDescription: trimToNull(this.trialForm.controls.adminDescription.value),
          testedStatKey: requiredFormValue(this.trialForm.controls.testedStatKey.value, 'Tested stat'),
          minigameKey: requiredFormValue(this.trialForm.controls.minigameKey.value, 'Minigame'),
          sortOrder: this.trialForm.controls.sortOrder.value,
          isActive: this.trialForm.controls.isActive.value,
          metadataJson,
          reason,
        }),
        successMessage: 'Trial definition saved.',
        failureMessage: 'Trial configuration action failed.',
        onSuccess: (trial) => {
          this.page.selectTrial(trial.id);
          this.page.loadInitialData();
        },
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Trial definition validation failed.'));
    }
  }

  saveCandidate(): void {
    const trial = this.page.selectedTrial();

    if (this.hasUnsavedMinigameChange()) {
      this.page.error.set('Save the trial definition before editing combat candidates for the changed minigame.');
      return;
    }

    if (!trial?.isCombatTrial) {
      this.page.error.set('Combat candidates can be edited only for combat trials.');
      return;
    }

    const candidateKind = this.candidateForm.controls.candidateKind.value;
    this.page.error.set(null);
    this.candidateForm.markAllAsTouched();
    if (markReasonInvalid(this.candidateReasonError, this.candidateForm.controls.reason)) {
      return;
    }

    try {
      const guard = this.currentCandidateGuard();
      const reason = requiredFormValue(this.candidateForm.controls.reason.value, 'Reason');

      runTrialWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () => this.admin.upsertTrialCombatCandidate({
          candidateId: this.candidateForm.controls.candidateId.value,
          trialDefinitionId: trial.trial.id,
          candidateKind,
          opponentDefinitionId:
            candidateKind === 'opponent'
              ? this.candidateForm.controls.opponentDefinitionId.value
              : null,
          familyKey: candidateKind === 'family' ? this.candidateForm.controls.familyKey.value : null,
          scalingFormulaId: this.candidateForm.controls.scalingFormulaId.value,
          difficultyMultiplier: this.candidateForm.controls.difficultyMultiplier.value,
          weight: this.candidateForm.controls.weight.value,
          minHeroLevel: this.candidateForm.controls.minHeroLevel.value,
          maxHeroLevel: this.candidateForm.controls.maxHeroLevel.value,
          sortOrder: this.candidateForm.controls.sortOrder.value,
          isActive: this.candidateForm.controls.isActive.value,
          reason,
        }),
        successMessage: 'Combat candidate saved.',
        failureMessage: 'Trial configuration action failed.',
        onSuccess: (candidate) => {
          this.selectedCandidateId.set(candidate.id);
          this.page.loadInitialData();
        },
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Combat candidate validation failed.'));
    }
  }

  deactivateCandidate(): void {
    const candidate = this.selectedCandidate();

    if (!candidate) {
      this.page.error.set('Select a combat candidate first.');
      return;
    }

    try {
      const guard = this.currentCandidateGuard();
      const reason = requiredFormValue(this.candidateForm.controls.reason.value, 'Reason');

      runTrialWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () => this.admin.deactivateTrialCombatCandidate(candidate.candidate.id, reason),
        successMessage: 'Combat candidate deactivated.',
        failureMessage: 'Trial configuration action failed.',
        onSuccess: () => this.page.loadInitialData(),
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Combat candidate validation failed.'));
    }
  }

  private syncFormsFromSelection(): void {
    this.isSyncingForm = true;
    this.trialForm.reset(this.formFactory.trialValue(this.page.data(), this.page.selectedTrialId()));
    this.draftMinigameKey.set(this.trialForm.controls.minigameKey.value);
    this.isSyncingForm = false;
    this.selectedCandidateId.set(null);
    this.resetCandidateForm();
  }

  private syncCandidateForm(row: TrialCombatCandidateAdminView | null): void {
    this.candidateReasonError.set(null);
    this.candidateForm.reset(this.formFactory.candidateValue(row));
  }

  private resetCandidateForm(): void {
    this.syncCandidateForm(null);
  }

  private syncGeneratedKey(label: string): void {
    if (this.isSyncingForm) {
      return;
    }

    if (this.page.selectedTrialId() || this.trialForm.controls.trialDefinitionId.value) {
      return;
    }

    if (this.trialForm.controls.allowKeyOverride.value) {
      return;
    }

    const nextKey = toSlug(label);

    if (this.trialForm.controls.key.value !== nextKey) {
      this.trialForm.controls.key.setValue(nextKey, { emitEvent: false });
    }
  }

  private currentTrialGuard(): () => boolean {
    const selectedTrialId = this.page.selectedTrialId();
    const formTrialId = this.trialForm.controls.trialDefinitionId.value;

    return () =>
      this.page.selectedTrialId() === selectedTrialId &&
      this.trialForm.controls.trialDefinitionId.value === formTrialId;
  }

  private currentCandidateGuard(): () => boolean {
    const selectedTrialId = this.page.selectedTrialId();
    const selectedCandidateId = this.selectedCandidateId();
    const formCandidateId = this.candidateForm.controls.candidateId.value;

    return () =>
      this.page.selectedTrialId() === selectedTrialId &&
      this.selectedCandidateId() === selectedCandidateId &&
      this.candidateForm.controls.candidateId.value === formCandidateId;
  }

}

function requiredFormValue(value: string | null, label: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}
