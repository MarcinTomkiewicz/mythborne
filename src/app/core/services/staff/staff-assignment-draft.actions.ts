import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { SERVER_STAFF_ROLE_OPTIONS } from '../../constants/staff-management.const';
import {
  AssignServerStaffInput,
  ServerStaffRoleKey,
} from '../../domain/staff/staff-management.model';
import { ServerStaffRole } from '../../enums/active-server.enum';
import { ToastService } from '../ui/toast';
import { StaffAssignmentListState } from './staff-assignment-list.state';
import { StaffCandidateSearchState } from './staff-candidate-search.state';
import { StaffManagement } from './staff-management';

@Injectable()
export class StaffAssignmentDraftActions {
  private readonly staffManagement = inject(StaffManagement);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly candidateSearch = inject(StaffCandidateSearchState);
  private readonly assignmentList = inject(StaffAssignmentListState);

  readonly assignmentForm = this.formBuilder.nonNullable.group({
    role: [ServerStaffRole.Moderator as ServerStaffRoleKey, Validators.required],
    reason: ['', Validators.required],
    notes: '',
  });
  readonly roleOptions = [...SERVER_STAFF_ROLE_OPTIONS];
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  canSubmitSelectedCandidate(serverId: string | null, canManageStaff: boolean): boolean {
    const candidate = this.candidateSearch.selectedCandidate();

    return (
      canManageStaff &&
      !!serverId &&
      !!candidate &&
      candidate.isEligibleForServerStaff &&
      !this.isSubmitting()
    );
  }

  assignSelectedCandidate(serverId: string | null, canManageStaff: boolean): void {
    const candidate = this.candidateSearch.selectedCandidate();

    this.assignmentForm.markAllAsTouched();

    if (
      !canManageStaff ||
      !serverId ||
      !candidate ||
      !candidate.isEligibleForServerStaff ||
      this.assignmentForm.invalid
    ) {
      this.toast.show(
        'warn',
        'Staff assignment incomplete',
        'Select an eligible user, staff role and reason.',
      );
      return;
    }

    const input: AssignServerStaffInput = {
      serverId,
      userId: candidate.userId,
      role: this.assignmentForm.controls.role.value,
      reason: this.assignmentForm.controls.reason.value,
      notes: this.assignmentForm.controls.notes.value,
    };

    this.isSubmitting.set(true);
    this.error.set(null);
    this.staffManagement
      .assignServerStaff(input)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.show(
            'success',
            'Staff assigned',
            `${candidate.displayName} was assigned to this server.`,
          );
          this.assignmentForm.patchValue({ reason: '', notes: '' });
          this.assignmentForm.markAsPristine();
          this.assignmentForm.markAsUntouched();
          this.candidateSearch.reset();
          this.assignmentList.loadAssignments(serverId, canManageStaff);
        },
        error: (error) => this.handleError('Staff assignment failed', error),
      });
  }

  private handleError(summary: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error.set(message);
    this.toast.show('error', summary, message);
  }
}
