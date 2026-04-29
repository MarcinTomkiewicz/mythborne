import {
  AssignGlobalRoleInput,
  AssignServerStaffInput,
  RevokeServerStaffInput,
  ServerStaffAssignment,
  ServerStaffAssignmentScope,
  ServerStaffAssignmentWithScopes,
  SetServerStaffPermissionScopesInput,
  StaffPermissionScope,
  StaffRoleDefinition,
  StaffUserAccount,
  StaffUserCandidate,
} from '../domain/staff/staff-management.model';
import {
  AssignGlobalRoleRpcArgs,
  AssignServerStaffRpcArgs,
  CanHaveModeratorScopeRpcArgs,
  RevokeServerStaffRpcArgs,
  SearchServerStaffCandidatesRpcArgs,
  SetServerStaffPermissionScopesRpcArgs,
  UserHasHeroOnServerRpcArgs,
  UserHasStaffDisqualifyingHistoryRpcArgs,
} from '../types/staff-management-rpc.types';
import {
  SearchServerStaffCandidateRow,
  StaffUserAccountRow,
} from '../types/staff-management-row.types';
import { Row } from '../types/supabase.types';
import { trimText, trimToNull } from './normalize-text';

export function mapStaffRole(row: Row<'roles'>): StaffRoleDefinition {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
  };
}

export function mapStaffUserAccount(row: StaffUserAccountRow): StaffUserAccount {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    roleId: row.role_id,
    photoUrl: row.photo_url,
  };
}

export function mapStaffUserCandidate(
  row: SearchServerStaffCandidateRow,
): StaffUserCandidate {
  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    globalRoleKey: normalizeNullableText(row.global_role_key),
    existingStaffAssignmentId: normalizeNullableText(row.existing_staff_assignment_id),
    existingStaffRole: normalizeNullableText(row.existing_staff_role) as StaffUserCandidate['existingStaffRole'],
    hasHeroOnServer: row.has_hero_on_server,
    hasStaffDisqualifyingHistory: row.has_staff_disqualifying_history,
    isEligibleForServerStaff: row.is_eligible_for_server_staff,
    eligibilityReason: normalizeNullableText(row.eligibility_reason),
    eligibilityMessage: toStaffEligibilityMessage(
      row.is_eligible_for_server_staff,
      normalizeNullableText(row.eligibility_reason),
    ),
  };
}

export function mapStaffPermissionScope(
  row: Row<'staff_permission_scopes'>,
): StaffPermissionScope {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapServerStaffAssignment(
  row: Row<'server_staff_assignments'>,
): ServerStaffAssignment {
  return {
    id: row.id,
    serverId: row.server_id,
    userId: row.user_id,
    role: row.role,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function mapServerStaffAssignmentScope(
  row: Row<'server_staff_assignment_scopes'>,
): ServerStaffAssignmentScope {
  return {
    id: row.id,
    staffAssignmentId: row.staff_assignment_id,
    scopeKey: row.scope_key,
    grantedByUserId: row.granted_by_user_id,
    createdAt: row.created_at,
  };
}

export function joinServerStaffAssignmentsWithScopes(
  assignments: readonly ServerStaffAssignment[],
  scopes: readonly ServerStaffAssignmentScope[],
): ServerStaffAssignmentWithScopes[] {
  const scopesByAssignmentId = new Map<string, ServerStaffAssignmentScope[]>();

  for (const scope of scopes) {
    const current = scopesByAssignmentId.get(scope.staffAssignmentId) ?? [];
    current.push(scope);
    scopesByAssignmentId.set(scope.staffAssignmentId, current);
  }

  return assignments.map((assignment) => ({
    ...assignment,
    scopes: scopesByAssignmentId.get(assignment.id) ?? [],
  }));
}

export function toAssignGlobalRoleRpcArgs(
  input: AssignGlobalRoleInput,
): AssignGlobalRoleRpcArgs {
  return {
    p_user_id: requiredText(input.userId, 'userId'),
    p_role_key: requiredText(input.roleKey, 'roleKey'),
    p_reason: requiredText(input.reason, 'reason'),
  };
}

export function toAssignServerStaffRpcArgs(
  input: AssignServerStaffInput,
): AssignServerStaffRpcArgs {
  const args: AssignServerStaffRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_user_id: requiredText(input.userId, 'userId'),
    p_role: input.role,
    p_reason: requiredText(input.reason, 'reason'),
  };
  const notes = trimToNull(input.notes);

  if (notes) {
    args.p_notes = notes;
  }

  return args;
}

export function toRevokeServerStaffRpcArgs(
  input: RevokeServerStaffInput,
): RevokeServerStaffRpcArgs {
  return {
    p_staff_assignment_id: requiredText(input.staffAssignmentId, 'staffAssignmentId'),
    p_reason: requiredText(input.reason, 'reason'),
  };
}

export function toCanHaveModeratorScopeRpcArgs(
  serverId: string,
  scopeKey: string,
): CanHaveModeratorScopeRpcArgs {
  return {
    p_server_id: requiredText(serverId, 'serverId'),
    p_scope_key: requiredText(scopeKey, 'scopeKey'),
  };
}

export function toSearchServerStaffCandidatesRpcArgs(
  serverId: string,
  query: string,
  limit: number,
): SearchServerStaffCandidatesRpcArgs {
  return {
    p_server_id: requiredText(serverId, 'serverId'),
    p_query: requiredText(query, 'query'),
    p_limit: normalizePositiveLimit(limit),
  };
}

export function toSetServerStaffPermissionScopesRpcArgs(
  input: SetServerStaffPermissionScopesInput,
): SetServerStaffPermissionScopesRpcArgs {
  return {
    p_staff_assignment_id: requiredText(input.staffAssignmentId, 'staffAssignmentId'),
    p_scope_keys: uniqueRequiredTexts(input.scopeKeys, 'scopeKey'),
    p_reason: requiredText(input.reason, 'reason'),
  };
}

export function toUserHasHeroOnServerRpcArgs(
  serverId: string,
  userId: string,
): UserHasHeroOnServerRpcArgs {
  return {
    p_server_id: requiredText(serverId, 'serverId'),
    p_user_id: requiredText(userId, 'userId'),
  };
}

export function toUserHasStaffDisqualifyingHistoryRpcArgs(
  userId: string,
): UserHasStaffDisqualifyingHistoryRpcArgs {
  return {
    p_user_id: requiredText(userId, 'userId'),
  };
}

function requiredText(value: string, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for staff management workflow.`);
  }

  return normalized;
}

function uniqueRequiredTexts(values: readonly string[], field: string): string[] {
  return Array.from(new Set(values.map((value) => requiredText(value, field))));
}

function normalizeNullableText(value: string | null | undefined): string | null {
  return trimToNull(value);
}

function normalizePositiveLimit(value: number): number {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0 ? Math.floor(normalized) : 25;
}

function toStaffEligibilityMessage(
  isEligible: boolean,
  reason: string | null,
): string {
  if (isEligible) {
    return 'User can be assigned as staff on this server.';
  }

  switch (reason) {
    case 'already_staff_on_server':
      return 'User is already assigned as staff on this server.';
    case 'staff_disqualifying_history':
      return 'User has staff-disqualifying moderation history.';
    case 'has_hero_on_standard_server':
      return 'User has a hero on this standard server and cannot be assigned as staff here.';
    default:
      return 'User is not eligible for staff assignment in this server context.';
  }
}
