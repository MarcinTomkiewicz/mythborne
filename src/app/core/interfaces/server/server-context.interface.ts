import { GlobalRoleKey } from '../../enums/server-context.enum';
import { Row } from '../../types/supabase.types';

export type GameServerKindValue = Row<'game_servers'>['kind'];
export type GameServerStatusValue = Row<'game_servers'>['status'];
export type ServerMembershipStatus = Row<'server_memberships'>['status'];
export type ServerStaffRoleValue = Row<'server_staff_assignments'>['role'];

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
  membershipStatus: ServerMembershipStatus | null;
  staffRole: ServerStaffRoleValue | null;
  canManage: boolean;
  canUseAsSandbox: boolean;
}

export interface ServerAccessContext {
  userId: string | null;
  globalRoleKey: GlobalRoleKey | null;
  isAdmin: boolean;
  isOperator: boolean;
  isTester: boolean;
  isModerator: boolean;
  isServerStaff: boolean;
  canAccessSandbox: boolean;
  canManageSelectedServer: boolean;
}

export interface ServerContextRows {
  servers: Row<'game_servers'>[];
  userData: Array<Pick<Row<'user_data'>, 'role_id'>>;
  roles: Row<'roles'>[];
  memberships: Row<'server_memberships'>[];
  staffAssignments: Row<'server_staff_assignments'>[];
}

export interface ResolvedServerContext {
  selectedServers: SelectedGameServer[];
  selectedServer: SelectedGameServer | null;
  access: ServerAccessContext;
}
