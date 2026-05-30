import {
  GameServerKind,
  GameServerStatus,
  GlobalRoleKey,
  SERVER_SANDBOX_KEY,
  ServerMembershipStatus,
  ServerSortRank,
} from '../enums/active-server.enum';
import { StartFlowServerAvailability } from '../domain/start-flow/start-flow.model';
import {
  GameServerSummary,
  GameServerKindValue,
  GameServerStatusValue,
  ResolvedActiveServerState,
  SelectedGameServer,
  ServerAccessState,
  ActiveServerRows,
  ServerMembershipStatusValue,
} from '../interfaces/server/active-server.interface';
import { Row } from '../types/supabase.types';
import {
  isMembershipActive,
  isMembershipBanned,
  isMembershipBlocked,
  isMembershipSuspended,
  toServerMembershipState,
} from './server-membership';

export function resolveActiveServerState(
  rows: ActiveServerRows,
  userId: string | null,
  currentServer: SelectedGameServer | null,
  preferredServerId: string | null = null,
): ResolvedActiveServerState {
  const selectedServers = toAccessibleServers(
    rows.servers,
    rows.memberships,
    rows.staffAssignments,
    userId,
    rows.globalRoleKey,
  );
  const selectedServer = resolveSelectedServer(
    selectedServers,
    currentServer,
    preferredServerId,
  );

  return {
    selectedServers,
    selectedServer,
    access: toAccessState(userId, rows.globalRoleKey, selectedServer),
  };
}

export function resolveActiveServerStateFromStartFlowAvailability(
  availability: StartFlowServerAvailability[],
  userId: string | null,
  globalRoleKey: GlobalRoleKey | null,
  currentServer: SelectedGameServer | null,
  preferredServerId: string | null = null,
): ResolvedActiveServerState {
  const selectedServers = availability
    .filter((entry) => entry.isVisible)
    .map(toSelectedServerFromStartFlowAvailability)
    .sort((left, right) => compareServers(left, right, userId));
  const selectedServer = resolveSelectedServer(
    selectedServers,
    currentServer,
    preferredServerId,
  );

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
  const membershipStatus = selectedServer?.membershipStatus ?? null;

  return {
    userId,
    globalRoleKey,
    membershipStatus,
    membership: selectedServer?.membership ?? null,
    serverStaffRole: selectedServer?.staffRole ?? null,
    isAdmin,
    isOperator,
    isTester,
    isModerator,
    isServerStaff,
    isMembershipActive: isMembershipActive(membershipStatus),
    isMembershipSuspended: isMembershipSuspended(membershipStatus),
    isMembershipBanned: isMembershipBanned(membershipStatus),
    isMembershipBlocked: isMembershipBlocked(membershipStatus),
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
    membershipStatus: null,
    membership: null,
    serverStaffRole: null,
    isAdmin: false,
    isOperator: false,
    isTester: false,
    isModerator: false,
    isServerStaff: false,
    isMembershipActive: false,
    isMembershipSuspended: false,
    isMembershipBanned: false,
    isMembershipBlocked: false,
    canAccessSandbox: false,
    canManageSelectedServer: false,
  };
}

function toSelectedServerFromStartFlowAvailability(
  availability: StartFlowServerAvailability,
): SelectedGameServer {
  const membershipStatus = toMembershipStatus(availability.membershipStatus);

  return {
    id: availability.serverId,
    key: availability.serverKey,
    name: availability.serverName,
    kind: availability.serverKind as GameServerKindValue,
    status: availability.serverStatus as GameServerStatusValue,
    description: availability.description,
    launchedAt: null,
    archivedAt: null,
    membershipStatus,
    membership: membershipStatus
      ? {
          status: membershipStatus,
          suspendedUntil: null,
          suspensionReason: null,
          banReason: null,
        }
      : null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: availability.isSandbox && availability.isStaffContext,
  };
}

function toMembershipStatus(status: string | null): ServerMembershipStatusValue | null {
  switch (status) {
    case ServerMembershipStatus.Active:
    case ServerMembershipStatus.Banned:
    case ServerMembershipStatus.Suspended:
      return status;
    default:
      return null;
  }
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
        membership: membership ? toServerMembershipState(membership) : null,
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
  preferredServerId: string | null,
): SelectedGameServer | null {
  if (currentServer && servers.some((server) => server.id === currentServer.id)) {
    return servers.find((server) => server.id === currentServer.id) ?? null;
  }

  if (preferredServerId) {
    const preferredServer =
      servers.find((server) => server.id === preferredServerId) ?? null;

    if (preferredServer) {
      return preferredServer;
    }
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
