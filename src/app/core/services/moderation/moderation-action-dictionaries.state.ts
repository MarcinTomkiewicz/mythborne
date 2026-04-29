import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ModerationActionType } from '../../domain/moderation/moderation-action.model';
import { StaffPermissionScope } from '../../domain/staff/staff-management.model';
import { StaffAccessPolicy } from '../../types/staff-access-policy.types';
import { StaffManagement } from '../staff/staff-management';
import { ModerationActions } from './moderation-actions';

@Injectable()
export class ModerationActionDictionariesState {
  private readonly moderationActions = inject(ModerationActions);
  private readonly staffManagement = inject(StaffManagement);
  private readonly destroyRef = inject(DestroyRef);

  readonly actionTypes = signal<ModerationActionType[]>([]);
  readonly permissionScopes = signal<StaffPermissionScope[]>([]);
  readonly allowedScopeKeys = signal<ReadonlySet<string>>(new Set());
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  load(serverId: string | null, canModerate: boolean): void {
    if (!serverId || !canModerate) {
      this.reset();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    forkJoin({
      actionTypes: this.moderationActions.getActionTypes(),
      scopes: this.staffManagement.getPermissionScopes(),
    })
      .pipe(
        switchMap(({ actionTypes, scopes }) =>
          this.loadAllowedScopes(serverId, scopes).pipe(
            map((allowedScopeKeys) => ({ actionTypes, scopes, allowedScopeKeys })),
          ),
        ),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ actionTypes, scopes, allowedScopeKeys }) => {
          this.actionTypes.set(actionTypes);
          this.permissionScopes.set(scopes);
          this.allowedScopeKeys.set(allowedScopeKeys);
        },
        error: (error) => this.handleError(error),
      });
  }

  reset(): void {
    this.actionTypes.set([]);
    this.permissionScopes.set([]);
    this.allowedScopeKeys.set(new Set());
  }

  visibleActionTypes(policy: StaffAccessPolicy): ModerationActionType[] {
    return this.actionTypes().filter((type) => {
      if (policy.isGlobalAdmin) {
        return true;
      }

      if (policy.canManageSelectedServer) {
        return type.operatorCanApply || type.moderatorCanApply;
      }

      return policy.canModerateSelectedServer && type.moderatorCanApply;
    });
  }

  selectedActionType(actionTypeKey: string): ModerationActionType | null {
    return this.actionTypes().find((entry) => entry.key === actionTypeKey) ?? null;
  }

  scopeOptions(): StaffPermissionScope[] {
    return this.permissionScopes().filter((scope) =>
      this.allowedScopeKeys().has(scope.key),
    );
  }

  actionTypeLabel(key: string): string {
    return this.actionTypes().find((entry) => entry.key === key)?.label ?? key;
  }

  scopeLabel(key: string | null): string {
    if (!key) {
      return 'No scope';
    }

    return this.permissionScopes().find((entry) => entry.key === key)?.label ?? key;
  }

  private loadAllowedScopes(
    serverId: string,
    scopes: readonly StaffPermissionScope[],
  ): Observable<ReadonlySet<string>> {
    if (!scopes.length) {
      return of(new Set<string>());
    }

    return forkJoin(
      scopes.map((scope) =>
        this.moderationActions.canApplyLocalAction(serverId, scope.key).pipe(
          map((allowed) => ({ key: scope.key, allowed })),
        ),
      ),
    ).pipe(
      map(
        (results) =>
          new Set(results.filter((result) => result.allowed).map((result) => result.key)),
      ),
    );
  }

  private handleError(error: unknown): void {
    this.error.set(
      error instanceof Error ? error.message : 'Failed to load moderation dictionaries.',
    );
  }
}
