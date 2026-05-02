import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExplorationTrialAdmin } from '../../../core/services/exploration/exploration-trial-admin';
import { TrialRewardAssignmentAdminView } from '../../../core/domain/exploration/exploration-trial-admin.model';
import { ToastService } from '../../../core/services/ui/toast';
import { parseMetadataJson } from '../../../core/utils/admin-form-helpers';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText, trimToNull } from '../../../core/utils/normalize-text';
import { RequestToken } from '../../../core/utils/request-token';
import {
  clearHiddenMatchControls,
  shouldShowMatchMaximum,
  shouldShowMatchValue,
  validateDifficultyRange,
  validateDistrictRange,
} from './exploration-trial-form-rules';
import { ExplorationTrialFormFactory } from './exploration-trial-form.factory';
import { ExplorationTrialsPageState } from './exploration-trials-page.state';
import {
  markReasonInvalid,
  nextSortOrder,
  runTrialWorkflowAction,
} from './exploration-trial-workflow-actions';

@Injectable()
export class ExplorationTrialRewardActionsState {
  private readonly admin = inject(ExplorationTrialAdmin);
  private readonly page = inject(ExplorationTrialsPageState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formFactory = inject(ExplorationTrialFormFactory);
  private readonly saveToken = new RequestToken();

  readonly selectedAssignmentId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly reasonError = signal<string | null>(null);
  readonly difficultyRangeError = signal<string | null>(null);
  readonly districtRangeError = signal<string | null>(null);
  readonly selectedAssignment = computed(() => {
    const assignmentId = this.selectedAssignmentId();

    return this.page.rewardAssignments().find((row) => row.assignment.id === assignmentId) ?? null;
  });

  readonly form = this.formFactory.createTrialRewardAssignmentForm();

  constructor() {
    effect(() => {
      this.page.selectedTrialId();
      untracked(() => {
        this.selectedAssignmentId.set(null);
        this.resetAssignmentForm();
      });
    });

    this.form.controls.difficultyMatchKind.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((matchKind) => this.reconcileDifficultyControls(matchKind));
    this.form.controls.districtMatchKind.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((matchKind) => this.reconcileDistrictControls(matchKind));
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
    const trial = this.page.selectedTrial();
    this.page.error.set(null);
    const metadataJson = parseMetadataJson(
      this.form.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    if (metadataJson === null) {
      return;
    }

    if (!trial) {
      this.page.error.set('Select a trial definition first.');
      return;
    }

    this.form.markAllAsTouched();
    const hasInvalidReason = markReasonInvalid(this.reasonError, this.form.controls.reason);
    this.reconcileHiddenMatchControls();
    const hasInvalidRanges = this.markInvalidRanges();

    if (this.form.invalid || hasInvalidReason || hasInvalidRanges) {
      return;
    }

    if (!this.page.hasRewardProfiles()) {
      this.page.error.set('No reward profiles configured; create or activate a reward profile first.');
      return;
    }

    try {
      const guard = this.currentAssignmentGuard();
      const reason = requiredFormValue(this.form.controls.reason.value, 'Reason');

      runTrialWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () =>
          this.admin.upsertRewardProfileAssignment({
            assignmentId: this.form.controls.assignmentId.value,
            trialDefinitionId: trial.trial.id,
            rewardProfileId: requiredFormValue(
              this.form.controls.rewardProfileId.value,
              'Reward profile',
            ),
            outcomeKind: requiredFormValue(this.form.controls.outcomeKind.value, 'Outcome kind'),
            difficultyKey: this.form.controls.difficultyKey.value,
            difficultyMatchKind: requiredFormValue(
              this.form.controls.difficultyMatchKind.value,
              'Difficulty match mode',
            ),
            maxDifficultyKey: this.form.controls.maxDifficultyKey.value,
            districtCode: this.form.controls.districtCode.value,
            districtMatchKind: requiredFormValue(
              this.form.controls.districtMatchKind.value,
              'District match mode',
            ),
            maxDistrictCode: this.form.controls.maxDistrictCode.value,
            description: trimToNull(this.form.controls.description.value),
            helperText: trimToNull(this.form.controls.helperText.value),
            sortOrder: this.form.controls.sortOrder.value,
            isActive: this.form.controls.isActive.value,
            metadataJson,
            reason,
          }),
        successMessage: 'Trial reward assignment saved.',
        failureMessage: 'Trial configuration action failed.',
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
    this.form.markAllAsTouched();
    if (markReasonInvalid(this.reasonError, this.form.controls.reason)) {
      return;
    }

    try {
      const guard = this.currentAssignmentGuard();
      const reason = requiredFormValue(this.form.controls.reason.value, 'Reason');

      runTrialWorkflowAction({
        token: this.saveToken,
        destroyRef: this.destroyRef,
        page: this.page,
        toast: this.toast,
        isSaving: this.isSaving,
        guard,
        call: () => this.admin.deactivateRewardProfileAssignment(assignment.assignment.id, reason),
        successMessage: 'Trial reward assignment deactivated.',
        failureMessage: 'Trial configuration action failed.',
      });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Reward assignment validation failed.'));
    }
  }

  showDifficultyValue(): boolean {
    return shouldShowMatchValue(this.form.controls.difficultyMatchKind.value);
  }

  showDifficultyMaximum(): boolean {
    return shouldShowMatchMaximum(this.form.controls.difficultyMatchKind.value);
  }

  showDistrictValue(): boolean {
    return shouldShowMatchValue(this.form.controls.districtMatchKind.value);
  }

  showDistrictMaximum(): boolean {
    return shouldShowMatchMaximum(this.form.controls.districtMatchKind.value);
  }

  private syncAssignmentForm(row: TrialRewardAssignmentAdminView | null): void {
    this.reasonError.set(null);
    this.difficultyRangeError.set(null);
    this.districtRangeError.set(null);
    this.form.reset(this.formFactory.assignmentValue(row));
    this.reconcileHiddenMatchControls();

    if (!row) {
      this.form.controls.sortOrder.setValue(
        nextSortOrder(this.page.rewardAssignments(), (entry) => entry.assignment.sortOrder),
      );
    }
  }

  private resetAssignmentForm(): void {
    this.syncAssignmentForm(null);
  }

  private currentAssignmentGuard(): () => boolean {
    const selectedTrialId = this.page.selectedTrialId();
    const selectedAssignmentId = this.selectedAssignmentId();
    const formAssignmentId = this.form.controls.assignmentId.value;

    return () =>
      this.page.selectedTrialId() === selectedTrialId &&
      this.selectedAssignmentId() === selectedAssignmentId &&
      this.form.controls.assignmentId.value === formAssignmentId;
  }

  private reconcileHiddenMatchControls(): void {
    this.reconcileDifficultyControls(this.form.controls.difficultyMatchKind.value);
    this.reconcileDistrictControls(this.form.controls.districtMatchKind.value);
  }

  private reconcileDifficultyControls(matchKind: string | null): void {
    clearHiddenMatchControls(
      matchKind,
      this.form.controls.difficultyKey,
      this.form.controls.maxDifficultyKey,
    );
    this.difficultyRangeError.set(null);
  }

  private reconcileDistrictControls(matchKind: string | null): void {
    clearHiddenMatchControls(
      matchKind,
      this.form.controls.districtCode,
      this.form.controls.maxDistrictCode,
    );
    this.districtRangeError.set(null);
  }

  private markInvalidRanges(): boolean {
    const difficulty = this.showDifficultyMaximum()
      ? validateDifficultyRange(
        this.page.data(),
        this.form.controls.difficultyKey.value,
        this.form.controls.maxDifficultyKey.value,
      )
      : { valid: true, message: null };
    const district = this.showDistrictMaximum()
      ? validateDistrictRange(
        this.page.data(),
        this.form.controls.districtCode.value,
        this.form.controls.maxDistrictCode.value,
      )
      : { valid: true, message: null };

    this.difficultyRangeError.set(difficulty.message);
    this.districtRangeError.set(district.message);

    if (!difficulty.valid) {
      this.form.controls.maxDifficultyKey.markAsTouched();
    }

    if (!district.valid) {
      this.form.controls.maxDistrictCode.markAsTouched();
    }

    return !difficulty.valid || !district.valid;
  }
}

function requiredFormValue(value: string | null, label: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}
