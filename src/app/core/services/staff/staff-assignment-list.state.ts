import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  ServerStaffAssignmentWithScopes,
  StaffPermissionScope,
} from '../../domain/staff/staff-management.model';
import { ToastService } from '../ui/toast';
import { StaffManagement } from './staff-management';

@Injectable()
export class StaffAssignmentListState {
  private readonly staffManagement = inject(StaffManagement);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly assignments = signal<ServerStaffAssignmentWithScopes[]>([]);
  readonly permissionScopes = signal<StaffPermissionScope[]>([]);
  readonly isLoadingAssignments = signal(false);
  readonly error = signal<string | null>(null);

  loadAssignments(serverId: string | null, canManageStaff: boolean): void {
    if (!serverId || !canManageStaff) {
      this.assignments.set([]);
      return;
    }

    this.isLoadingAssignments.set(true);
    this.error.set(null);
    this.staffManagement
      .getServerStaffAssignments(serverId)
      .pipe(
        finalize(() => this.isLoadingAssignments.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (assignments) => this.assignments.set(assignments),
        error: (error) => this.handleError('Staff assignments unavailable', error),
      });
  }

  loadPermissionScopes(canManageStaff: boolean): void {
    if (!canManageStaff) {
      this.permissionScopes.set([]);
      return;
    }

    this.staffManagement
      .getPermissionScopes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (scopes) => this.permissionScopes.set(scopes),
        error: (error) => this.handleError('Staff permission scopes unavailable', error),
      });
  }

  reset(): void {
    this.assignments.set([]);
    this.error.set(null);
  }

  scopeLabel(scopeKey: string): string {
    return (
      this.permissionScopes().find((scope) => scope.key === scopeKey)?.label ??
      scopeKey
    );
  }

  private handleError(summary: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error.set(message);
    this.toast.show('error', summary, message);
  }
}
