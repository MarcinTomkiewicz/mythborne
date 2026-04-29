import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  STAFF_CANDIDATE_DEFAULT_LIMIT,
  STAFF_CANDIDATE_MIN_QUERY_LENGTH,
} from '../../constants/staff-management.const';
import { TABLES } from '../../constants/tables.const';
import {
  AssignGlobalRoleInput,
  AssignServerStaffInput,
  RevokeServerStaffInput,
  ServerStaffAssignmentWithScopes,
  SetServerStaffPermissionScopesInput,
  StaffPermissionScope,
  StaffRoleDefinition,
  StaffUserAccount,
  StaffUserCandidate,
} from '../../domain/staff/staff-management.model';
import { FilterOperator } from '../../enums/filter-operators';
import { SearchServerStaffCandidateRow } from '../../types/staff-management-row.types';
import { Row } from '../../types/supabase.types';
import {
  joinServerStaffAssignmentsWithScopes,
  mapServerStaffAssignment,
  mapServerStaffAssignmentScope,
  mapStaffPermissionScope,
  mapStaffRole,
  mapStaffUserAccount,
  mapStaffUserCandidate,
  toAssignGlobalRoleRpcArgs,
  toAssignServerStaffRpcArgs,
  toCanHaveModeratorScopeRpcArgs,
  toRevokeServerStaffRpcArgs,
  toSearchServerStaffCandidatesRpcArgs,
  toSetServerStaffPermissionScopesRpcArgs,
  toUserHasHeroOnServerRpcArgs,
  toUserHasStaffDisqualifyingHistoryRpcArgs,
} from '../../utils/staff-management';
import { trimToNull } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class StaffManagement {
  private readonly backend = inject(Backend);

  getRoles(): Observable<StaffRoleDefinition[]> {
    return this.backend
      .getAll<Row<'roles'>>({
        table: TABLES.roles,
        orderBy: { column: 'id' },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapStaffRole)));
  }

  searchUserCandidates(
    serverId: string,
    query: string | null,
    limit = STAFF_CANDIDATE_DEFAULT_LIMIT,
  ): Observable<StaffUserCandidate[]> {
    const normalizedQuery = trimToNull(query);

    if (!normalizedQuery || normalizedQuery.length < STAFF_CANDIDATE_MIN_QUERY_LENGTH) {
      return of([]);
    }

    return this.backend
      .rpc<SearchServerStaffCandidateRow[]>(
        RPC.search_server_staff_candidates,
        toSearchServerStaffCandidatesRpcArgs(serverId, normalizedQuery, limit),
      )
      .pipe(
        map((rows) => rows.map(mapStaffUserCandidate)),
      );
  }

  getPermissionScopes(): Observable<StaffPermissionScope[]> {
    return this.backend
      .getAll<Row<'staff_permission_scopes'>>({
        table: TABLES.staff_permission_scopes,
        filters: { isActive: { operator: FilterOperator.EQ, value: true } },
        orderBy: { column: 'sort_order' },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapStaffPermissionScope)));
  }

  getServerStaffAssignments(
    serverId: string,
  ): Observable<ServerStaffAssignmentWithScopes[]> {
    return this.backend
      .getAll<Row<'server_staff_assignments'>>({
        table: TABLES.server_staff_assignments,
        filters: { serverId: { operator: FilterOperator.EQ, value: serverId } },
        orderBy: { column: 'created_at' },
        camelCase: false,
      })
      .pipe(
        map((rows) => rows.map(mapServerStaffAssignment)),
        switchMap((assignments) => {
          if (!assignments.length) {
            return of([]);
          }

          return this.getAssignmentScopes(assignments.map((assignment) => assignment.id)).pipe(
            map((scopes) => joinServerStaffAssignmentsWithScopes(assignments, scopes)),
          );
        }),
      );
  }

  assignGlobalRole(input: AssignGlobalRoleInput): Observable<StaffUserAccount> {
    return this.backend
      .rpc<Row<'user_data'>>(RPC.assign_global_role, toAssignGlobalRoleRpcArgs(input))
      .pipe(map(mapStaffUserAccount));
  }

  assignServerStaff(input: AssignServerStaffInput): Observable<ServerStaffAssignmentWithScopes> {
    return this.backend
      .rpc<Row<'server_staff_assignments'>>(
        RPC.assign_server_staff,
        toAssignServerStaffRpcArgs(input),
      )
      .pipe(
        map(mapServerStaffAssignment),
        map((assignment) => ({ ...assignment, scopes: [] })),
      );
  }

  revokeServerStaff(input: RevokeServerStaffInput): Observable<string> {
    return this.backend.rpc<string>(
      RPC.revoke_server_staff,
      toRevokeServerStaffRpcArgs(input),
    );
  }

  canHaveModeratorScope(serverId: string, scopeKey: string): Observable<boolean> {
    return this.backend.rpc<boolean>(
      RPC.can_have_moderator_scope,
      toCanHaveModeratorScopeRpcArgs(serverId, scopeKey),
    );
  }

  setServerStaffPermissionScopes(
    input: SetServerStaffPermissionScopesInput,
  ): Observable<ServerStaffAssignmentWithScopes> {
    return this.backend
      .rpc<Row<'server_staff_assignment_scopes'>[]>(
        RPC.set_server_staff_permission_scopes,
        toSetServerStaffPermissionScopesRpcArgs(input),
      )
      .pipe(
        map((rows) => rows.map(mapServerStaffAssignmentScope)),
        switchMap((scopes) =>
          this.getServerStaffAssignment(input.staffAssignmentId).pipe(
            map((assignment) => ({ ...assignment, scopes })),
          ),
        ),
      );
  }

  userHasHeroOnServer(serverId: string, userId: string): Observable<boolean> {
    return this.backend.rpc<boolean>(
      RPC.user_has_hero_on_server,
      toUserHasHeroOnServerRpcArgs(serverId, userId),
    );
  }

  userHasStaffDisqualifyingHistory(userId: string): Observable<boolean> {
    return this.backend.rpc<boolean>(
      RPC.user_has_staff_disqualifying_history,
      toUserHasStaffDisqualifyingHistoryRpcArgs(userId),
    );
  }

  private getServerStaffAssignment(
    assignmentId: string,
  ): Observable<ServerStaffAssignmentWithScopes> {
    return forkJoin({
      assignments: this.backend.getAll<Row<'server_staff_assignments'>>({
        table: TABLES.server_staff_assignments,
        filters: { id: { operator: FilterOperator.EQ, value: assignmentId } },
        range: { from: 0, to: 0 },
        camelCase: false,
      }),
      scopes: this.getAssignmentScopes([assignmentId]),
    }).pipe(
      map(({ assignments, scopes }) => {
        const assignment = assignments[0] ?? null;

        if (!assignment) {
          throw new Error(`Server staff assignment "${assignmentId}" was not found.`);
        }

        return {
          ...mapServerStaffAssignment(assignment),
          scopes,
        };
      }),
    );
  }

  private getAssignmentScopes(assignmentIds: string[]) {
    return this.backend
      .getAll<Row<'server_staff_assignment_scopes'>>({
        table: TABLES.server_staff_assignment_scopes,
        filters: {
          staffAssignmentId: { operator: FilterOperator.IN, value: assignmentIds },
        },
        orderBy: { column: 'scope_key' },
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapServerStaffAssignmentScope)));
  }
}
