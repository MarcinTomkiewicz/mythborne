import {
  GameServerKind,
  GameServerStatus,
  ServerStaffRole,
} from '../enums/active-server.enum';
import { SelectedGameServer } from '../interfaces/server/active-server.interface';
import {
  StaffAccessPolicy,
  StaffAccessPolicyInput,
} from '../types/staff-access-policy.types';

export function resolveStaffAccessPolicy(
  input: StaffAccessPolicyInput,
): StaffAccessPolicy {
  const { access, selectedServer } = input;
  const isGlobalAdmin = access.isAdmin;
  const isGlobalOperator = access.isOperator;
  const isGlobalTester = access.isTester;
  const isGlobalModerator = access.isModerator;
  const hasSelectedServer = !!selectedServer;
  const staffRole = hasSelectedServer ? access.serverStaffRole : null;
  const isAssignedStaffOnSelectedServer = !!staffRole;
  const isSelectedServerOwner = staffRole === ServerStaffRole.Owner;
  const isSelectedServerOperator = staffRole === ServerStaffRole.Operator;
  const isSelectedServerModerator = staffRole === ServerStaffRole.Moderator;
  const isSelectedServerTester = staffRole === ServerStaffRole.Tester;
  const isSandboxOrTestingServer = isSandboxOrTesting(selectedServer);
  const hasSelectedServerManagementAuthority =
    isGlobalAdmin || isSelectedServerOwner || isSelectedServerOperator;
  const hasSelectedServerModerationAuthority =
    hasSelectedServerManagementAuthority || isSelectedServerModerator;
  const hasSelectedServerTestingAccess =
    isGlobalAdmin ||
    (isSandboxOrTestingServer &&
      (isGlobalTester || isSelectedServerTester || isAssignedStaffOnSelectedServer));
  const isStaffGameplayBlocked =
    isAssignedStaffOnSelectedServer && !isSandboxOrTestingServer;

  return {
    isGlobalAdmin,
    isGlobalOperator,
    isGlobalTester,
    isGlobalModerator,
    isAssignedStaffOnSelectedServer,
    isSelectedServerOwner,
    isSelectedServerOperator,
    isSelectedServerModerator,
    isSelectedServerTester,
    isSandboxOrTestingServer,
    hasSelectedServerManagementAuthority,
    hasSelectedServerModerationAuthority,
    hasSelectedServerTestingAccess,
    canAccessAdminShell:
      hasSelectedServerManagementAuthority ||
      hasSelectedServerModerationAuthority ||
      hasSelectedServerTestingAccess,
    canAccessSelectedServerStaffTools:
      hasSelectedServer && hasSelectedServerManagementAuthority,
    canManageSelectedServer: hasSelectedServer && hasSelectedServerManagementAuthority,
    canModerateSelectedServer:
      hasSelectedServer && hasSelectedServerModerationAuthority,
    canTestSelectedServer: hasSelectedServer && hasSelectedServerTestingAccess,
    canAccessPlayerGameplay:
      !access.isMembershipBlocked && !isStaffGameplayBlocked,
    isStaffGameplayBlocked,
  };
}

function isSandboxOrTesting(server: SelectedGameServer | null): boolean {
  return (
    server?.kind === GameServerKind.Sandbox ||
    server?.status === GameServerStatus.Testing
  );
}
