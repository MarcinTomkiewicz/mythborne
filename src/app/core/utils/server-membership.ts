import { ServerMembershipStatus } from '../enums/active-server.enum';
import {
  ServerMembershipState,
  ServerMembershipStatusValue,
} from '../interfaces/server/active-server.interface';
import { Row } from '../types/supabase.types';

export function toServerMembershipState(
  membership: Row<'server_memberships'>,
): ServerMembershipState {
  return {
    status: membership.status,
    suspendedUntil: membership.suspended_until,
    suspensionReason: membership.suspension_reason,
    banReason: membership.ban_reason,
  };
}

export function isMembershipActive(
  status: ServerMembershipStatusValue | null,
): boolean {
  return status === ServerMembershipStatus.Active;
}

export function isMembershipSuspended(
  status: ServerMembershipStatusValue | null,
): boolean {
  return status === ServerMembershipStatus.Suspended;
}

export function isMembershipBanned(
  status: ServerMembershipStatusValue | null,
): boolean {
  return status === ServerMembershipStatus.Banned;
}

export function isMembershipBlocked(
  status: ServerMembershipStatusValue | null,
): boolean {
  return isMembershipSuspended(status) || isMembershipBanned(status);
}

export function membershipStatusLabel(
  status: ServerMembershipStatusValue | null,
): string {
  switch (status) {
    case ServerMembershipStatus.Active:
      return 'Active';
    case ServerMembershipStatus.Suspended:
      return 'Suspended';
    case ServerMembershipStatus.Banned:
      return 'Banned';
    default:
      return 'No membership';
  }
}

export function membershipStatusReason(
  membership: ServerMembershipState | null,
): string | null {
  if (!membership) {
    return null;
  }

  if (membership.status === ServerMembershipStatus.Banned) {
    return membership.banReason;
  }

  if (membership.status === ServerMembershipStatus.Suspended) {
    return membership.suspensionReason;
  }

  return null;
}
