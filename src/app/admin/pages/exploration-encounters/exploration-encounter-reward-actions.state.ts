import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { EncounterRewardAssignmentAdminView } from '../../../core/domain/exploration/exploration-encounter-admin.model';
import { ExplorationEncounterAdmin } from '../../../core/services/exploration/exploration-encounter-admin';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  assignmentFormValue,
  createEncounterRewardAssignmentForm,
} from './exploration-encounters-forms';
import { ExplorationEncountersPageState } from './exploration-encounters-page.state';
import { parseMetadataJson, requiredFormValue } from './exploration-encounter-action-utils';
import {
  markReasonInvalid,
  nextSortOrder,
  runEncounterWorkflowAction,
} from './exploration-encounter-workflow-actions';

@Injectable()
export class ExplorationEncounterRewardActionsState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly page = inject(ExplorationEncountersPageState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly saveToken = new RequestToken();

  readonly selectedAssignmentId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);
  readonly selectedAssignment = computed(() => {
    const assignmentId = this.selectedAssignmentId();

    return this.page.rewardAssignments().find((row) => row.assignment.id === assignmentId) ?? null;
  });
  readonly assignmentForm = createEncounterRewardAssignmentForm();

  constructor() {
    effect(() => {
      this.page.selectedEncounterId();
      untracked(() => {
        this.selectedAssignmentId.set(null);
        this.resetAssignmentForm();
      });
    });
  }

  selectAssignment(assignmentId: string | null): void {
    this.selectedAssignmentId.set(assignmentId);
    this.syncAssignmentForm(this.selectedAssignment());
  }

  startNewAssignment(): void {
    this.selectedAssignmentId.set(null);
    this.resetAssignmentForm();
  }

  saveAssignment(): void {
    const encounter = this.page.selectedEncounter();
    this.page.error.set(null);
    const metadataJson = parseMetadataJson(
      this.assignmentForm.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    if (metadataJson === null) {
      return;
    }

    if (!encounter) {
      this.page.error.set('Select an encounter definition first.');
      return;
    }

    this.assignmentForm.markAllAsTouched();
    const hasInvalidReason = markReasonInvalid(this.reasonError, this.assignmentForm.controls.reason);

    if (this.assignmentForm.invalid || hasInvalidReason) {
      return;
    }

    if (!this.page.hasRewardProfiles()) {
      this.page.error.set('No reward profiles configured; create or activate a reward profile first.');
      return;
    }

    try {
      const guard = this.currentAssignmentGuard();
      const reason = requiredFormValue(this.assignmentForm.controls.reason.value, 'Reason');

      runEncounterWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () =>
          this.admin.upsertRewardProfileAssignment({
            assignmentId: this.assignmentForm.controls.assignmentId.value,
            encounterDefinitionId: encounter.encounter.id,
            rewardProfileId: requiredFormValue(
              this.assignmentForm.controls.rewardProfileId.value,
              'Reward profile',
            ),
            outcomeKind: requiredFormValue(
              this.assignmentForm.controls.outcomeKind.value,
              'Outcome kind',
            ),
            difficultyKey: this.assignmentForm.controls.difficultyKey.value,
            difficultyMatchKind: requiredFormValue(
              this.assignmentForm.controls.difficultyMatchKind.value,
              'Difficulty match mode',
            ),
            maxDifficultyKey: this.assignmentForm.controls.maxDifficultyKey.value,
            districtCode: this.assignmentForm.controls.districtCode.value,
            districtMatchKind: requiredFormValue(
              this.assignmentForm.controls.districtMatchKind.value,
              'District match mode',
            ),
            maxDistrictCode: this.assignmentForm.controls.maxDistrictCode.value,
            description: trimToNull(this.assignmentForm.controls.description.value),
            helperText: trimToNull(this.assignmentForm.controls.helperText.value),
            sortOrder: this.assignmentForm.controls.sortOrder.value,
            isActive: this.assignmentForm.controls.isActive.value,
            metadataJson,
            reason,
          }),
        successMessage: 'Encounter reward assignment saved.',
        failureMessage: 'Encounter configuration action failed.',
        onSuccess: (assignment) => this.selectedAssignmentId.set(assignment.id),
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Reward assignment validation failed.'));
    }
  }

  deactivateAssignment(): void {
    const assignment = this.selectedAssignment();

    if (!assignment) {
      this.page.error.set('Select a reward assignment first.');
      return;
    }

    this.page.error.set(null);
    this.assignmentForm.markAllAsTouched();
    if (markReasonInvalid(this.reasonError, this.assignmentForm.controls.reason)) {
      return;
    }

    try {
      const guard = this.currentAssignmentGuard();
      const reason = requiredFormValue(this.assignmentForm.controls.reason.value, 'Reason');

      runEncounterWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () => this.admin.deactivateRewardProfileAssignment(assignment.assignment.id, reason),
        successMessage: 'Encounter reward assignment deactivated.',
        failureMessage: 'Encounter configuration action failed.',
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Reward assignment validation failed.'));
    }
  }

  private syncAssignmentForm(row: EncounterRewardAssignmentAdminView | null): void {
    this.reasonError.set(null);
    this.assignmentForm.reset(assignmentFormValue(row));

    if (!row) {
      this.assignmentForm.controls.sortOrder.setValue(
        nextSortOrder(this.page.rewardAssignments(), (entry) => entry.assignment.sortOrder),
      );
    }
  }

  private resetAssignmentForm(): void {
    this.syncAssignmentForm(null);
  }

  private currentAssignmentGuard(): () => boolean {
    const selectedEncounterId = this.page.selectedEncounterId();
    const selectedAssignmentId = this.selectedAssignmentId();
    const formAssignmentId = this.assignmentForm.controls.assignmentId.value;

    return () =>
      this.page.selectedEncounterId() === selectedEncounterId &&
      this.selectedAssignmentId() === selectedAssignmentId &&
      this.assignmentForm.controls.assignmentId.value === formAssignmentId;
  }
}
