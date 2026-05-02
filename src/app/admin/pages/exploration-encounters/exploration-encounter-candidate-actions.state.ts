import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { EncounterCombatCandidateAdminView } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { RequestToken } from '../../../core/utils/request-token';
import { ExplorationEncounterFormFactory } from './exploration-encounter-form.factory';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';
import { requiredFormValue } from './exploration-encounter-action-utils';
import { ExplorationEncounterDefinitionActionsState } from './exploration-encounter-definition-actions.state';
import {
  markReasonInvalid,
  runEncounterWorkflowAction,
} from './exploration-encounter-workflow-actions';

@Injectable()
export class ExplorationEncounterCandidateActionsState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly page = inject(ExplorationEncountersPageState);
  private readonly definitionActions = inject(ExplorationEncounterDefinitionActionsState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formFactory = inject(ExplorationEncounterFormFactory);
  private readonly saveToken = new RequestToken();

  readonly selectedCandidateId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);
  readonly selectedCandidate = computed(() => {
    const candidateId = this.selectedCandidateId();

    return this.page.combatCandidates().find((row) => row.candidate.id === candidateId) ?? null;
  });
  readonly candidateForm = this.formFactory.createEncounterCombatCandidateForm();

  constructor() {
    effect(() => {
      this.page.selectedEncounterId();
      this.selectedCandidateId.set(null);
      this.resetCandidateForm();
    });
  }

  selectCandidate(candidateId: string | null): void {
    this.selectedCandidateId.set(candidateId);
    this.syncCandidateForm(this.selectedCandidate());
  }

  startNewCandidate(): void {
    this.selectedCandidateId.set(null);
    this.resetCandidateForm();
  }

  saveCandidate(): void {
    const encounter = this.page.selectedEncounter();

    if (!encounter?.isCombatEncounter) {
      this.page.error.set('Combat candidates can be edited only for combat encounters.');
      return;
    }

    if (this.definitionActions.hasUnsavedEncounterKindChange()) {
      this.page.error.set('Save the encounter definition kind before editing kind-specific configuration.');
      return;
    }

    this.page.error.set(null);
    this.candidateForm.markAllAsTouched();
    const hasInvalidReason = markReasonInvalid(this.reasonError, this.candidateForm.controls.reason);

    if (this.candidateForm.invalid || hasInvalidReason) {
      return;
    }

    try {
      const guard = this.currentCandidateGuard();
      const reason = requiredFormValue(this.candidateForm.controls.reason.value, 'Reason');
      const candidateKind = this.candidateForm.controls.candidateKind.value;

      runEncounterWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () =>
          this.admin.upsertEncounterCombatCandidate({
            candidateId: this.candidateForm.controls.candidateId.value,
            encounterDefinitionId: encounter.encounter.id,
            candidateKind,
            opponentDefinitionId:
              candidateKind === 'opponent'
                ? this.candidateForm.controls.opponentDefinitionId.value
                : null,
            familyKey:
              candidateKind === 'family' ? this.candidateForm.controls.familyKey.value : null,
            scalingFormulaId: this.candidateForm.controls.scalingFormulaId.value,
            difficultyMultiplier: this.candidateForm.controls.difficultyMultiplier.value,
            weight: this.candidateForm.controls.weight.value,
            minHeroLevel: this.candidateForm.controls.minHeroLevel.value,
            maxHeroLevel: this.candidateForm.controls.maxHeroLevel.value,
            sortOrder: this.candidateForm.controls.sortOrder.value,
            isActive: this.candidateForm.controls.isActive.value,
            reason,
          }),
        successMessage: 'Encounter combat candidate saved.',
        failureMessage: 'Encounter configuration action failed.',
        onSuccess: (candidate) => this.selectedCandidateId.set(candidate.id),
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

    this.page.error.set(null);
    this.candidateForm.markAllAsTouched();
    if (markReasonInvalid(this.reasonError, this.candidateForm.controls.reason)) {
      return;
    }

    try {
      const guard = this.currentCandidateGuard();
      const reason = requiredFormValue(this.candidateForm.controls.reason.value, 'Reason');

      runEncounterWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () => this.admin.deactivateEncounterCombatCandidate(candidate.candidate.id, reason),
        successMessage: 'Encounter combat candidate deactivated.',
        failureMessage: 'Encounter configuration action failed.',
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Combat candidate validation failed.'));
    }
  }

  private syncCandidateForm(row: EncounterCombatCandidateAdminView | null): void {
    this.reasonError.set(null);
    this.candidateForm.reset(this.formFactory.candidateValue(row));
  }

  private resetCandidateForm(): void {
    this.syncCandidateForm(null);
  }

  private currentCandidateGuard(): () => boolean {
    const selectedEncounterId = this.page.selectedEncounterId();
    const selectedCandidateId = this.selectedCandidateId();
    const formCandidateId = this.candidateForm.controls.candidateId.value;

    return () =>
      this.page.selectedEncounterId() === selectedEncounterId &&
      this.selectedCandidateId() === selectedCandidateId &&
      this.candidateForm.controls.candidateId.value === formCandidateId;
  }
}
