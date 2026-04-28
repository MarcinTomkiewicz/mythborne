import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ServerStaffAssignmentWithScopes } from '../../domain/staff/staff-management.model';
import { ToastService } from '../ui/toast';
import { StaffAssignmentListState } from './staff-assignment-list.state';
import { StaffManagement } from './staff-management';

@Injectable()
export class StaffRevokeActions {
  private readonly staffManagement = inject(StaffManagement);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly assignmentList = inject(StaffAssignmentListState);

  readonly revokeForm = this.formBuilder.nonNullable.group({
    assignmentId: '',
    reason: ['', Validators.required],
  });
  readonly selectedRevokeAssignment = signal<ServerStaffAssignmentWithScopes | null>(null);
  readonly isRevoking = signal(false);
  readonly error = signal<string | null>(null);

  startRevoke(assignment: ServerStaffAssignmentWithScopes): void {
    this.selectedRevokeAssignment.set(assignment);
    this.revokeForm.reset({ assignmentId: assignment.id, reason: '' });
    this.revokeForm.markAsPristine();
    this.revokeForm.markAsUntouched();
  }

  cancelRevoke(): void {
    this.selectedRevokeAssignment.set(null);
    this.revokeForm.reset({ assignmentId: '', reason: '' });
  }

  revokeSelectedAssignment(serverId: string | null, canManageStaff: boolean): void {
    const assignment = this.selectedRevokeAssignment();

    this.revokeForm.markAllAsTouched();

    if (!canManageStaff || !serverId || !assignment || this.revokeForm.invalid) {
      this.toast.show(
        'warn',
        'Revoke reason required',
        'Provide a reason before revoking staff access.',
      );
      return;
    }

    this.isRevoking.set(true);
    this.error.set(null);
    this.staffManagement
      .revokeServerStaff({
        staffAssignmentId: assignment.id,
        reason: this.revokeForm.controls.reason.value,
      })
      .pipe(
        finalize(() => this.isRevoking.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Staff revoked', 'The staff assignment was revoked.');
          this.cancelRevoke();
          this.assignmentList.loadAssignments(serverId, canManageStaff);
        },
        error: (error) => this.handleError('Staff revoke failed', error),
      });
  }

  private handleError(summary: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error.set(message);
    this.toast.show('error', summary, message);
  }
}
