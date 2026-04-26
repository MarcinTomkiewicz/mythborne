import {
  GameServerKind,
  GameServerStatus,
  GlobalRoleKey,
  SERVER_SANDBOX_KEY,
  ServerSortRank,
} from '../enums/active-server.enum';
import {
  GameServerSummary,
  ResolvedActiveServerState,
  SelectedGameServer,
  ServerAccessState,
  ActiveServerRows,
} from '../interfaces/server/active-server.interface';
import { Row } from '../types/supabase.types';

export function resolveActiveServerState(
  rows: ActiveServerRows,
  userId: string | null,
  currentServer: SelectedGameServer | null,
): ResolvedActiveServerState {
  const globalRoleKey = resolveGlobalRoleKey(
    rows.userData[0]?.role_id ?? null,
    rows.roles,
  );
  const selectedServers = toAccessibleServers(
    rows.servers,
    rows.memberships,
    rows.staffAssignments,
    userId,
    globalRoleKey,
  );
  const selectedServer = resolveSelectedServer(selectedServers, currentServer);

  return {
    selectedServers,
    selectedServer,
    access: toAccessState(userId, globalRoleKey, selectedServer),
  };
}

export function toAccessState(
  userId: string | null,
  globalRoleKey: GlobalRoleKey | null,
  selectedServer: SelectedGameServer | null,
): ServerAccessState {
  const isAdmin = globalRoleKey === GlobalRoleKey.Admin;
  const isOperator = globalRoleKey === GlobalRoleKey.Operator;
  const isTester = globalRoleKey === GlobalRoleKey.Tester;
  const isModerator = globalRoleKey === GlobalRoleKey.Moderator;
  const isServerStaff = !!selectedServer?.staffRole;

  return {
    userId,
    globalRoleKey,
    isAdmin,
    isOperator,
    isTester,
    isModerator,
    isServerStaff,
    canAccessSandbox:
      isAdmin ||
      isOperator ||
      isTester ||
      (selectedServer?.canUseAsSandbox ?? false),
    canManageSelectedServer: selectedServer?.canManage ?? false,
  };
}

export function emptyServerAccessState(): ServerAccessState {
  return {
    userId: null,
    globalRoleKey: null,
    isAdmin: false,
    isOperator: false,
    isTester: false,
    isModerator: false,
    isServerStaff: false,
    canAccessSandbox: false,
    canManageSelectedServer: false,
  };
}

function toAccessibleServers(
  servers: Row<'game_servers'>[],
  memberships: Row<'server_memberships'>[],
  staffAssignments: Row<'server_staff_assignments'>[],
  userId: string | null,
  globalRoleKey: GlobalRoleKey | null,
): SelectedGameServer[] {
  const membershipByServer = new Map(
    memberships.map((entry) => [entry.server_id, entry]),
  );
  const staffByServer = new Map(
    staffAssignments.map((entry) => [entry.server_id, entry]),
  );
  const globalAccess = toGlobalAccess(globalRoleKey);

  return servers
    .filter((server) => {
      if (globalAccess.canSeeAllServers) {
        return true;
      }

      const hasStaffAssignment = staffByServer.has(server.id);
      const isPublicStandard =
        server.kind === GameServerKind.Standard &&
        (server.status === GameServerStatus.Scheduled ||
          server.status === GameServerStatus.Live);
      const isSandboxOrTesting =
        server.kind === GameServerKind.Sandbox ||
        server.status === GameServerStatus.Testing;

      return (
        isPublicStandard ||
        hasStaffAssignment ||
        (globalAccess.canUseTestServers && isSandboxOrTesting)
      );
    })
    .map((server) => {
      const staff = staffByServer.get(server.id) ?? null;
      const membership = membershipByServer.get(server.id) ?? null;
      const canManage = globalAccess.canSeeAllServers || !!staff;
      const canUseAsSandbox =
        server.kind === GameServerKind.Sandbox &&
        (globalAccess.canUseTestServers || !!staff);

      return {
        ...toGameServerSummary(server),
        membershipStatus: membership?.status ?? null,
        staffRole: staff?.role ?? null,
        canManage,
        canUseAsSandbox,
      };
    })
    .sort((left, right) => compareServers(left, right, userId));
}

function resolveSelectedServer(
  servers: SelectedGameServer[],
  currentServer: SelectedGameServer | null,
): SelectedGameServer | null {
  if (currentServer && servers.some((server) => server.id === currentServer.id)) {
    return servers.find((server) => server.id === currentServer.id) ?? null;
  }

  return (
    servers.find(
      (server) => server.canUseAsSandbox && server.key === SERVER_SANDBOX_KEY,
    ) ??
    servers.find(
      (server) =>
        server.kind === GameServerKind.Standard &&
        server.status === GameServerStatus.Live,
    ) ??
    servers.find(
      (server) =>
        server.kind === GameServerKind.Standard &&
        server.status === GameServerStatus.Scheduled,
    ) ??
    servers[0] ??
    null
  );
}

function resolveGlobalRoleKey(
  roleId: number | null,
  roles: Row<'roles'>[],
): GlobalRoleKey | null {
  if (roleId === null) {
    return null;
  }

  const roleKey = roles.find((role) => role.id === roleId)?.key;

  return isGlobalRoleKey(roleKey) ? roleKey : null;
}

function isGlobalRoleKey(
  value: string | null | undefined,
): value is GlobalRoleKey {
  return Object.values(GlobalRoleKey).includes(value as GlobalRoleKey);
}

function toGlobalAccess(globalRoleKey: GlobalRoleKey | null): {
  canSeeAllServers: boolean;
  canUseTestServers: boolean;
} {
  const canSeeAllServers = globalRoleKey === GlobalRoleKey.Admin;
  const canUseTestServers =
    canSeeAllServers ||
    globalRoleKey === GlobalRoleKey.Operator ||
    globalRoleKey === GlobalRoleKey.Tester;

  return {
    canSeeAllServers,
    canUseTestServers,
  };
}

function toGameServerSummary(server: Row<'game_servers'>): GameServerSummary {
  return {
    id: server.id,
    key: server.key,
    name: server.name,
    kind: server.kind,
    status: server.status,
    description: server.description,
    launchedAt: server.launched_at,
    archivedAt: server.archived_at,
  };
}

function compareServers(
  left: SelectedGameServer,
  right: SelectedGameServer,
  userId: string | null,
): number {
  const leftPriority = serverPriority(left, userId);
  const rightPriority = serverPriority(right, userId);

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  return left.name.localeCompare(right.name);
}

function serverPriority(
  server: SelectedGameServer,
  userId: string | null,
): number {
  if (server.canUseAsSandbox && server.key === SERVER_SANDBOX_KEY) {
    return ServerSortRank.Sandbox;
  }

  if (
    server.kind === GameServerKind.Standard &&
    server.status === GameServerStatus.Live
  ) {
    return userId
      ? ServerSortRank.StandardLiveForUser
      : ServerSortRank.StandardLiveForGuest;
  }

  if (
    server.kind === GameServerKind.Standard &&
    server.status === GameServerStatus.Scheduled
  ) {
    return ServerSortRank.StandardScheduled;
  }

  if (server.status === GameServerStatus.Testing) {
    return ServerSortRank.Testing;
  }

  if (server.status === GameServerStatus.Draft) {
    return ServerSortRank.Draft;
  }

  return ServerSortRank.Fallback;
}
