import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
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

@Injectable()
export class ExplorationEncounterRewardActionsState {
  private readonly admin = inject(ExplorationEncounterAdmin);
  private readonly page = inject(ExplorationEncountersPageState);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly saveToken = new RequestToken();

  readonly selectedAssignmentId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly selectedAssignment = computed(() => {
    const assignmentId = this.selectedAssignmentId();

    return this.page.rewardAssignments().find((row) => row.assignment.id === assignmentId) ?? null;
  });
  readonly assignmentForm = createEncounterRewardAssignmentForm();

  constructor() {
    effect(() => {
      this.page.selectedEncounterId();
      this.selectedAssignmentId.set(null);
      this.resetAssignmentForm();
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
    const metadataJson = parseMetadataJson(
      this.assignmentForm.controls.metadataJsonText.value,
      (message) => this.page.error.set(message),
    );

    if (!encounter || metadataJson === null) {
      this.page.error.set(encounter ? this.page.error() : 'Select an encounter definition first.');
      return;
    }

    try {
      const guard = this.currentAssignmentGuard();
      const reason = requiredFormValue(this.assignmentForm.controls.reason.value, 'Reason');
      const token = this.saveToken.next();

      this.isSaving.set(true);
      this.page.error.set(null);
      this.admin
        .upsertRewardProfileAssignment({
          assignmentId: this.assignmentForm.controls.assignmentId.value,
          encounterDefinitionId: encounter.encounter.id,
          rewardProfileId: requiredFormValue(
            this.assignmentForm.controls.rewardProfileId.value,
            'Reward profile',
          ),
          outcomeKind: requiredFormValue(this.assignmentForm.controls.outcomeKind.value, 'Outcome kind'),
          difficultyKey: this.assignmentForm.controls.difficultyKey.value,
          districtCode: this.assignmentForm.controls.districtCode.value,
          description: trimToNull(this.assignmentForm.controls.description.value),
          helperText: trimToNull(this.assignmentForm.controls.helperText.value),
          sortOrder: this.assignmentForm.controls.sortOrder.value,
          isActive: this.assignmentForm.controls.isActive.value,
          metadataJson,
          reason,
        })
        .pipe(
          finalize(() => {
            if (this.saveToken.isCurrent(token)) {
              this.isSaving.set(false);
            }
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (assignment) => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.toast.show('success', 'Exploration encounters', 'Encounter reward assignment saved.');
            this.selectedAssignmentId.set(assignment.id);
            this.page.loadInitialData();
          },
          error: (error: unknown) => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.page.error.set(getErrorMessage(error, 'Encounter configuration action failed.'));
          },
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

    try {
      const guard = this.currentAssignmentGuard();
      const reason = requiredFormValue(this.assignmentForm.controls.reason.value, 'Reason');
      const token = this.saveToken.next();

      this.isSaving.set(true);
      this.page.error.set(null);
      this.admin
        .deactivateRewardProfileAssignment(assignment.assignment.id, reason)
        .pipe(
          finalize(() => {
            if (this.saveToken.isCurrent(token)) {
              this.isSaving.set(false);
            }
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.toast.show('success', 'Exploration encounters', 'Encounter reward assignment deactivated.');
            this.page.loadInitialData();
          },
          error: (error: unknown) => {
            if (!this.saveToken.isCurrent(token) || !guard()) {
              return;
            }

            this.page.error.set(getErrorMessage(error, 'Encounter configuration action failed.'));
          },
        });
    } catch (error: unknown) {
      this.page.error.set(getErrorMessage(error, 'Reward assignment validation failed.'));
    }
  }

  private syncAssignmentForm(row: EncounterRewardAssignmentAdminView | null): void {
    this.assignmentForm.reset(assignmentFormValue(row));
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
