import { GlobalRoleKey, ServerStaffRole } from '../enums/active-server.enum';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../interfaces/server/active-server.interface';
import { resolveStaffAccessPolicy } from './staff-access-policy';

describe('staff access policy', () => {
  it('keeps normal players out of admin and allows standard gameplay', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess(),
      selectedServer: createServer(),
    });

    expect(policy.canAccessAdminShell).toBeFalse();
    expect(policy.canManageSelectedServer).toBeFalse();
    expect(policy.canModerateSelectedServer).toBeFalse();
    expect(policy.canAccessPlayerGameplay).toBeTrue();
  });

  it('gives global admin full admin authority without requiring staff assignment', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess({ globalRoleKey: GlobalRoleKey.Admin, isAdmin: true }),
      selectedServer: createServer(),
    });

    expect(policy.isGlobalAdmin).toBeTrue();
    expect(policy.canAccessAdminShell).toBeTrue();
    expect(policy.canManageSelectedServer).toBeTrue();
    expect(policy.canModerateSelectedServer).toBeTrue();
    expect(policy.canAccessPlayerGameplay).toBeTrue();
  });

  it('keeps selected-server action flags disabled without selected server context', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess({ globalRoleKey: GlobalRoleKey.Admin, isAdmin: true }),
      selectedServer: null,
    });

    expect(policy.canAccessAdminShell).toBeTrue();
    expect(policy.canManageSelectedServer).toBeFalse();
    expect(policy.canModerateSelectedServer).toBeFalse();
    expect(policy.canTestSelectedServer).toBeFalse();
  });

  it('does not treat staff access as selected-server staff without selected server context', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess({
        serverStaffRole: ServerStaffRole.Moderator,
        isServerStaff: true,
      }),
      selectedServer: null,
    });

    expect(policy.isAssignedStaffOnSelectedServer).toBeFalse();
    expect(policy.isStaffGameplayBlocked).toBeFalse();
    expect(policy.canManageSelectedServer).toBeFalse();
    expect(policy.canModerateSelectedServer).toBeFalse();
    expect(policy.canTestSelectedServer).toBeFalse();
  });

  it('treats selected-server operator assignment as management authority', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess({
        serverStaffRole: ServerStaffRole.Operator,
        isServerStaff: true,
      }),
      selectedServer: createServer({ staffRole: ServerStaffRole.Operator }),
    });

    expect(policy.isAssignedStaffOnSelectedServer).toBeTrue();
    expect(policy.canManageSelectedServer).toBeTrue();
    expect(policy.canModerateSelectedServer).toBeTrue();
    expect(policy.isStaffGameplayBlocked).toBeTrue();
  });

  it('does not treat selected-server moderator assignment as management authority', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess({
        serverStaffRole: ServerStaffRole.Moderator,
        isServerStaff: true,
      }),
      selectedServer: createServer({ staffRole: ServerStaffRole.Moderator }),
    });

    expect(policy.canAccessAdminShell).toBeTrue();
    expect(policy.canManageSelectedServer).toBeFalse();
    expect(policy.canModerateSelectedServer).toBeTrue();
    expect(policy.isStaffGameplayBlocked).toBeTrue();
  });

  it('does not treat selected-server tester assignment as management authority', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess({
        serverStaffRole: ServerStaffRole.Tester,
        isServerStaff: true,
      }),
      selectedServer: createServer({ staffRole: ServerStaffRole.Tester }),
    });

    expect(policy.canAccessAdminShell).toBeFalse();
    expect(policy.canManageSelectedServer).toBeFalse();
    expect(policy.canModerateSelectedServer).toBeFalse();
    expect(policy.canTestSelectedServer).toBeFalse();
    expect(policy.isStaffGameplayBlocked).toBeTrue();
  });

  it('limits global tester access to sandbox and testing contexts', () => {
    const standardPolicy = resolveStaffAccessPolicy({
      access: createAccess({
        globalRoleKey: GlobalRoleKey.Tester,
        isTester: true,
      }),
      selectedServer: createServer(),
    });
    const sandboxPolicy = resolveStaffAccessPolicy({
      access: createAccess({
        globalRoleKey: GlobalRoleKey.Tester,
        isTester: true,
      }),
      selectedServer: createServer({ kind: 'sandbox' }),
    });

    expect(standardPolicy.canTestSelectedServer).toBeFalse();
    expect(standardPolicy.canAccessAdminShell).toBeFalse();
    expect(sandboxPolicy.canTestSelectedServer).toBeTrue();
    expect(sandboxPolicy.canAccessAdminShell).toBeTrue();
  });

  it('allows assigned staff gameplay in sandbox and testing contexts', () => {
    const sandboxPolicy = resolveStaffAccessPolicy({
      access: createAccess({
        serverStaffRole: ServerStaffRole.Moderator,
        isServerStaff: true,
      }),
      selectedServer: createServer({
        kind: 'sandbox',
        staffRole: ServerStaffRole.Moderator,
      }),
    });
    const testingPolicy = resolveStaffAccessPolicy({
      access: createAccess({
        serverStaffRole: ServerStaffRole.Operator,
        isServerStaff: true,
      }),
      selectedServer: createServer({
        status: 'testing',
        staffRole: ServerStaffRole.Operator,
      }),
    });

    expect(sandboxPolicy.isStaffGameplayBlocked).toBeFalse();
    expect(sandboxPolicy.canAccessPlayerGameplay).toBeTrue();
    expect(testingPolicy.isStaffGameplayBlocked).toBeFalse();
    expect(testingPolicy.canAccessPlayerGameplay).toBeTrue();
  });

  it('keeps suspended or banned membership as a separate gameplay block', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess({
        membershipStatus: 'banned',
        isMembershipBanned: true,
        isMembershipBlocked: true,
      }),
      selectedServer: createServer(),
    });

    expect(policy.isStaffGameplayBlocked).toBeFalse();
    expect(policy.canAccessPlayerGameplay).toBeFalse();
  });

  it('does not give global operator selected-server authority without assignment', () => {
    const policy = resolveStaffAccessPolicy({
      access: createAccess({
        globalRoleKey: GlobalRoleKey.Operator,
        isOperator: true,
      }),
      selectedServer: createServer(),
    });

    expect(policy.isGlobalOperator).toBeTrue();
    expect(policy.canManageSelectedServer).toBeFalse();
    expect(policy.canModerateSelectedServer).toBeFalse();
  });
});

function createAccess(
  overrides: Partial<ServerAccessState> = {},
): ServerAccessState {
  return {
    userId: 'user-1',
    globalRoleKey: null,
    membershipStatus: 'active',
    membership: null,
    serverStaffRole: null,
    isAdmin: false,
    isOperator: false,
    isTester: false,
    isModerator: false,
    isServerStaff: false,
    isMembershipActive: true,
    isMembershipSuspended: false,
    isMembershipBanned: false,
    isMembershipBlocked: false,
    canAccessSandbox: false,
    canManageSelectedServer: false,
    ...overrides,
  };
}

function createServer(
  overrides: Partial<SelectedGameServer> = {},
): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'athens',
    name: 'Athens',
    kind: 'standard',
    status: 'live',
    description: null,
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: false,
    ...overrides,
  };
}
