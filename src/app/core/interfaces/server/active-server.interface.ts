import { GlobalRoleKey } from '../../enums/active-server.enum';
import { Row } from '../../types/supabase.types';

export type GameServerKindValue = Row<'game_servers'>['kind'];
export type GameServerStatusValue = Row<'game_servers'>['status'];
export type ServerMembershipStatusValue = Row<'server_memberships'>['status'];
export type ServerStaffRoleValue = Row<'server_staff_assignments'>['role'];

export interface ServerMembershipState {
  status: ServerMembershipStatusValue;
  suspendedUntil: string | null;
  suspensionReason: string | null;
  banReason: string | null;
}

export interface GameServerSummary {
  id: string;
  key: string;
  name: string;
  kind: GameServerKindValue;
  status: GameServerStatusValue;
  description: string | null;
  launchedAt: string | null;
  archivedAt: string | null;
}

export interface SelectedGameServer extends GameServerSummary {
  membershipStatus: ServerMembershipStatusValue | null;
  membership: ServerMembershipState | null;
  staffRole: ServerStaffRoleValue | null;
  canManage: boolean;
  canUseAsSandbox: boolean;
}

export interface ServerAccessState {
  userId: string | null;
  globalRoleKey: GlobalRoleKey | null;
  membershipStatus: ServerMembershipStatusValue | null;
  membership: ServerMembershipState | null;
  serverStaffRole: ServerStaffRoleValue | null;
  isAdmin: boolean;
  isOperator: boolean;
  isTester: boolean;
  isModerator: boolean;
  isServerStaff: boolean;
  isMembershipActive: boolean;
  isMembershipSuspended: boolean;
  isMembershipBanned: boolean;
  isMembershipBlocked: boolean;
  canAccessSandbox: boolean;
  canManageSelectedServer: boolean;
}

export interface ActiveServerRows {
  servers: Row<'game_servers'>[];
  memberships: Row<'server_memberships'>[];
  staffAssignments: Row<'server_staff_assignments'>[];
  globalRoleKey: GlobalRoleKey | null;
}

export interface ResolvedActiveServerState {
  selectedServers: SelectedGameServer[];
  selectedServer: SelectedGameServer | null;
  access: ServerAccessState;
}
