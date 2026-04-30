import {
  SelectedGameServer,
  ServerAccessState,
} from '../interfaces/server/active-server.interface';

export interface StaffAccessPolicyInput {
  access: ServerAccessState;
  selectedServer: SelectedGameServer | null;
}

export interface StaffAccessPolicy {
  isGlobalAdmin: boolean;
  isGlobalOperator: boolean;
  isGlobalTester: boolean;
  isGlobalModerator: boolean;
  isAssignedStaffOnSelectedServer: boolean;
  isSelectedServerOwner: boolean;
  isSelectedServerOperator: boolean;
  isSelectedServerModerator: boolean;
  isSelectedServerTester: boolean;
  isSandboxOrTestingServer: boolean;
  hasSelectedServerManagementAuthority: boolean;
  hasSelectedServerModerationAuthority: boolean;
  hasSelectedServerTestingAccess: boolean;
  canAccessAdminShell: boolean;
  canAccessSelectedServerStaffTools: boolean;
  canManageSelectedServer: boolean;
  canModerateSelectedServer: boolean;
  canTriageAntiAbuseSelectedServer: boolean;
  canTestSelectedServer: boolean;
  canAccessPlayerGameplay: boolean;
  isStaffGameplayBlocked: boolean;
}
