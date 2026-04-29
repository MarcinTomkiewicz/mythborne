import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormRecord, Validators } from '@angular/forms';
import { finalize, forkJoin, map } from 'rxjs';
import {
  ServerStaffAssignmentWithScopes,
  StaffPermissionScope,
} from '../../domain/staff/staff-management.model';
import { ServerStaffRole } from '../../enums/active-server.enum';
import { ToastService } from '../ui/toast';
import { StaffAssignmentListState } from './staff-assignment-list.state';
import { StaffManagement } from './staff-management';

@Injectable()
export class StaffScopeAssignmentActions {
  private readonly staffManagement = inject(StaffManagement);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly assignmentList = inject(StaffAssignmentListState);

  readonly scopeForm = this.formBuilder.nonNullable.group({
    reason: ['', Validators.required],
    scopes: new FormRecord<FormControl<boolean>>({}),
  });
  readonly selectedScopeAssignment = signal<ServerStaffAssignmentWithScopes | null>(null);
  readonly allowedScopeKeys = signal<ReadonlySet<string> | null>(null);
  readonly isLoadingScopeAccess = signal(false);
  readonly isSavingScopes = signal(false);
  readonly error = signal<string | null>(null);

  canEditScopes(assignment: ServerStaffAssignmentWithScopes): boolean {
    return assignment.role === ServerStaffRole.Moderator;
  }

  startScopeEdit(
    assignment: ServerStaffAssignmentWithScopes,
    serverId: string | null,
    scopes: readonly StaffPermissionScope[],
  ): void {
    if (!this.canEditScopes(assignment)) {
      this.toast.show(
        'warn',
        'Scopes unavailable',
        'Only moderator assignments use permission scopes.',
      );
      return;
    }

    this.selectedScopeAssignment.set(assignment);
    this.resetScopeControls(scopes, assignment.scopes.map((scope) => scope.scopeKey));
    this.scopeForm.patchValue({ reason: '' });
    this.scopeForm.markAsPristine();
    this.scopeForm.markAsUntouched();
    this.loadAllowedScopes(serverId, scopes);
  }

  cancelScopeEdit(): void {
    this.selectedScopeAssignment.set(null);
    this.allowedScopeKeys.set(null);
    this.scopeForm.reset({ reason: '' });
    this.clearScopeControls();
  }

  isScopeAllowed(scopeKey: string): boolean {
    const allowed = this.allowedScopeKeys();
    return allowed === null || allowed.has(scopeKey);
  }

  scopeControl(scopeKey: string): FormControl<boolean> {
    const control = this.scopeForm.controls.scopes.controls[scopeKey];

    if (!control) {
      throw new Error(`Scope form control "${scopeKey}" is not registered.`);
    }

    return control;
  }

  saveScopes(serverId: string | null, canManageStaff: boolean): void {
    const assignment = this.selectedScopeAssignment();

    this.scopeForm.markAllAsTouched();

    if (!canManageStaff || !serverId || !assignment || this.scopeForm.invalid) {
      this.toast.show(
        'warn',
        'Scope update incomplete',
        'Select a moderator assignment and provide a reason before saving scopes.',
      );
      return;
    }

    this.isSavingScopes.set(true);
    this.error.set(null);
    this.staffManagement
      .setServerStaffPermissionScopes({
        staffAssignmentId: assignment.id,
        scopeKeys: this.scopeKeysFromForm(),
        reason: this.scopeForm.controls.reason.value,
      })
      .pipe(
        finalize(() => this.isSavingScopes.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.show('success', 'Scopes updated', 'Moderator permission scopes were updated.');
          this.cancelScopeEdit();
          this.assignmentList.loadAssignments(serverId, canManageStaff);
        },
        error: (error) => this.handleError('Scope update failed', error),
      });
  }

  private loadAllowedScopes(
    serverId: string | null,
    scopes: readonly StaffPermissionScope[],
  ): void {
    if (!serverId || !scopes.length) {
      this.allowedScopeKeys.set(new Set());
      return;
    }

    this.isLoadingScopeAccess.set(true);
    forkJoin(
      scopes.map((scope) =>
        this.staffManagement.canHaveModeratorScope(serverId, scope.key).pipe(
          map((allowed) => ({ key: scope.key, allowed })),
        ),
      ),
    )
      .pipe(
        finalize(() => this.isLoadingScopeAccess.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (results) => {
          this.allowedScopeKeys.set(
            new Set(results.filter((result) => result.allowed).map((result) => result.key)),
          );
          this.syncDisallowedScopeControls();
        },
        error: () => {
          this.allowedScopeKeys.set(null);
          this.toast.show(
            'warn',
            'Scope access check unavailable',
            'The backend will validate scope changes when you save.',
          );
        },
      });
  }

  private handleError(summary: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.error.set(message);
    this.toast.show('error', summary, message);
  }

  private resetScopeControls(
    scopes: readonly StaffPermissionScope[],
    selectedScopeKeys: readonly string[],
  ): void {
    this.clearScopeControls();

    for (const scope of scopes) {
      const control = new FormControl(
        { value: selectedScopeKeys.includes(scope.key), disabled: true },
        { nonNullable: true },
      );

      this.scopeForm.controls.scopes.addControl(scope.key, control);
    }
  }

  private clearScopeControls(): void {
    const scopeControls = this.scopeForm.controls.scopes;
    const controls = scopeControls.controls;

    for (const key of Object.keys(controls)) {
      scopeControls.removeControl(key as never);
    }
  }

  private syncDisallowedScopeControls(): void {
    const allowed = this.allowedScopeKeys();

    if (allowed === null) {
      return;
    }

    for (const key of Object.keys(this.scopeForm.controls.scopes.controls)) {
      const control = this.scopeForm.controls.scopes.controls[key];

      if (!control) {
        continue;
      }

      if (allowed.has(key)) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    }
  }

  private scopeKeysFromForm(): string[] {
    const allowed = this.allowedScopeKeys();

    return Object.entries(this.scopeForm.controls.scopes.controls)
      .filter(
        ([key, control]) =>
          control.value && !control.disabled && (allowed === null || allowed.has(key)),
      )
      .map(([key]) => key);
  }
}
