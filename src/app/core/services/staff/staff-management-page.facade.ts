import { DestroyRef, Injectable, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameServerKind, GameServerStatus } from '../../enums/active-server.enum';
import { resolveStaffAccessPolicy } from '../../utils/staff-access-policy';
import { ActiveServer } from '../server/active-server';
import { StaffAssignmentDraftActions } from './staff-assignment-draft.actions';
import { StaffAssignmentListState } from './staff-assignment-list.state';
import { StaffCandidateSearchState } from './staff-candidate-search.state';
import { StaffRevokeActions } from './staff-revoke.actions';
import { StaffScopeAssignmentActions } from './staff-scope-assignment.actions';

@Injectable()
export class StaffManagementPageFacade {
  private readonly activeServer = inject(ActiveServer);
  private readonly destroyRef = inject(DestroyRef);

  readonly candidateSearch = inject(StaffCandidateSearchState);
  readonly assignmentList = inject(StaffAssignmentListState);
  readonly assignmentDraft = inject(StaffAssignmentDraftActions);
  readonly revoke = inject(StaffRevokeActions);
  readonly scopeAssignment = inject(StaffScopeAssignmentActions);
  readonly selectedServer = this.activeServer.selectedServer;
  readonly access = this.activeServer.access;
  readonly selectedServerId = computed(() => this.selectedServer()?.id ?? null);
  readonly staffAccessPolicy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.access(),
      selectedServer: this.selectedServer(),
    }),
  );
  readonly canManageStaff = computed(() =>
    this.staffAccessPolicy().isGlobalAdmin || this.staffAccessPolicy().canManageSelectedServer,
  );
  readonly isSandboxOrTestingServer = computed(() => {
    const server = this.selectedServer();

    return (
      server?.kind === GameServerKind.Sandbox ||
      server?.status === GameServerStatus.Testing
    );
  });
  readonly serverContextMessage = computed(() =>
    this.isSandboxOrTestingServer()
      ? 'Sandbox/testing context: staff gameplay and staff assignment checks allow test workflows.'
      : 'Standard server: users with a hero on this server cannot be assigned as staff here.',
  );
  readonly error = computed(
    () =>
      this.candidateSearch.error() ??
      this.assignmentList.error() ??
      this.assignmentDraft.error() ??
      this.revoke.error() ??
      this.scopeAssignment.error(),
  );

  private lastServerId: string | null = null;

  constructor() {
    effect(() => {
      const serverId = this.selectedServerId();

      if (serverId === this.lastServerId) {
        return;
      }

      this.lastServerId = serverId;
      this.candidateSearch.reset();
      this.assignmentList.reset();
      this.revoke.cancelRevoke();
      this.scopeAssignment.cancelScopeEdit();

      if (serverId) {
        this.loadAssignments();
        this.loadPermissionScopes();
      }
    });
  }

  loadInitialData(): void {
    if (this.activeServer.servers().length === 0 && !this.activeServer.isLoading()) {
      this.activeServer
        .loadAccessibleServers()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }

    if (this.selectedServerId()) {
      this.loadAssignments();
      this.loadPermissionScopes();
    }
  }

  searchCandidates(): void {
    this.candidateSearch.searchCandidates(this.selectedServerId(), this.canManageStaff());
  }

  assignSelectedCandidate(): void {
    this.assignmentDraft.assignSelectedCandidate(
      this.selectedServerId(),
      this.canManageStaff(),
    );
  }

  canSubmitSelectedCandidate(): boolean {
    return this.assignmentDraft.canSubmitSelectedCandidate(
      this.selectedServerId(),
      this.canManageStaff(),
    );
  }

  revokeSelectedAssignment(): void {
    this.revoke.revokeSelectedAssignment(this.selectedServerId(), this.canManageStaff());
  }

  saveScopes(): void {
    this.scopeAssignment.saveScopes(this.selectedServerId(), this.canManageStaff());
  }

  loadAssignments(): void {
    this.assignmentList.loadAssignments(this.selectedServerId(), this.canManageStaff());
  }

  loadPermissionScopes(): void {
    this.assignmentList.loadPermissionScopes(this.canManageStaff());
  }
}
