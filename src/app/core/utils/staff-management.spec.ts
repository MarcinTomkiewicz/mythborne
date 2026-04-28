import { ServerStaffRole } from '../enums/active-server.enum';
import { Row } from '../types/supabase.types';
import {
  joinServerStaffAssignmentsWithScopes,
  mapStaffUserCandidate,
  mapStaffPermissionScope,
  mapStaffRole,
  toAssignGlobalRoleRpcArgs,
  toAssignServerStaffRpcArgs,
  toSearchServerStaffCandidatesRpcArgs,
  toSetServerStaffPermissionScopesRpcArgs,
  toUserHasHeroOnServerRpcArgs,
} from './staff-management';

describe('staff management mappers', () => {
  it('maps role and permission scope dictionaries', () => {
    const role = mapStaffRole(createRoleRow());
    const scope = mapStaffPermissionScope(createScopeRow());

    expect(role.key).toBe('operator');
    expect(scope.key).toBe('trade');
    expect(scope.helperText).toBe('Trade investigations.');
  });

  it('joins server staff assignments with assigned scopes', () => {
    const assignments = [
      {
        id: 'assignment-1',
        serverId: 'server-1',
        userId: 'user-1',
        role: ServerStaffRole.Moderator,
        notes: null,
        createdBy: null,
        createdAt: '2026-04-28T00:00:00.000Z',
      },
    ];
    const scopes = [
      {
        id: 'scope-row-1',
        staffAssignmentId: 'assignment-1',
        scopeKey: 'trade',
        grantedByUserId: 'admin-1',
        createdAt: '2026-04-28T00:00:00.000Z',
      },
    ];

    const result = joinServerStaffAssignmentsWithScopes(assignments, scopes);

    expect(result[0].scopes.map((scope) => scope.scopeKey)).toEqual(['trade']);
  });

  it('maps staff candidate eligibility with human-readable messages', () => {
    const candidate = mapStaffUserCandidate({
      user_id: 'user-1',
      email: 'candidate@example.com',
      display_name: 'Candidate',
      global_role_key: 'player',
      existing_staff_assignment_id: 'assignment-1',
      existing_staff_role: ServerStaffRole.Moderator,
      has_hero_on_server: true,
      has_staff_disqualifying_history: false,
      is_eligible_for_server_staff: false,
      is_existing_staff_on_server: true,
      eligibility_reason: 'already_staff_on_server',
    });

    expect(candidate.userId).toBe('user-1');
    expect(candidate.existingStaffRole).toBe(ServerStaffRole.Moderator);
    expect(candidate.eligibilityMessage).toBe(
      'User is already assigned as staff on this server.',
    );
  });

  it('maps assign server staff rpc args with trimmed optional notes', () => {
    const args = toAssignServerStaffRpcArgs({
      serverId: ' server-1 ',
      userId: ' user-1 ',
      role: ServerStaffRole.Moderator,
      reason: ' staff coverage ',
      notes: ' watch trade reports ',
    });

    expect(args).toEqual({
      p_server_id: 'server-1',
      p_user_id: 'user-1',
      p_role: ServerStaffRole.Moderator,
      p_reason: 'staff coverage',
      p_notes: 'watch trade reports',
    });
  });

  it('maps global role and permission scope rpc args', () => {
    expect(
      toAssignGlobalRoleRpcArgs({
        userId: ' user-1 ',
        roleKey: ' operator ',
        reason: ' staffing ',
      }),
    ).toEqual({
      p_user_id: 'user-1',
      p_role_key: 'operator',
      p_reason: 'staffing',
    });

    expect(
      toSetServerStaffPermissionScopesRpcArgs({
        staffAssignmentId: ' assignment-1 ',
        scopeKeys: [' trade ', ' reports ', 'trade'],
        reason: ' scope update ',
      }),
    ).toEqual({
      p_staff_assignment_id: 'assignment-1',
      p_scope_keys: ['trade', 'reports'],
      p_reason: 'scope update',
    });
  });

  it('maps server-scoped staff candidate search rpc args', () => {
    expect(toSearchServerStaffCandidatesRpcArgs(' server-1 ', ' candidate ', 10)).toEqual({
      p_server_id: 'server-1',
      p_query: 'candidate',
      p_limit: 10,
    });
  });

  it('maps staff eligibility rpc args and validates required values', () => {
    expect(toUserHasHeroOnServerRpcArgs(' server-1 ', ' user-1 ')).toEqual({
      p_server_id: 'server-1',
      p_user_id: 'user-1',
    });

    expect(() => toUserHasHeroOnServerRpcArgs('', 'user-1')).toThrowError(
      'serverId is required for staff management workflow.',
    );
  });
});

function createRoleRow(overrides: Partial<Row<'roles'>> = {}): Row<'roles'> {
  return {
    id: 2,
    key: 'operator',
    name: 'Operator',
    description: 'Server operator.',
    ...overrides,
  };
}

function createScopeRow(
  overrides: Partial<Row<'staff_permission_scopes'>> = {},
): Row<'staff_permission_scopes'> {
  return {
    key: 'trade',
    label: 'Trade',
    description: 'Trade moderation scope.',
    helper_text: 'Trade investigations.',
    sort_order: 10,
    is_active: true,
    created_at: '2026-04-28T00:00:00.000Z',
    updated_at: '2026-04-28T00:00:00.000Z',
    ...overrides,
  };
}
