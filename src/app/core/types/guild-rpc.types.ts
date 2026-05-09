import { Database } from './database.types';
import { Row } from './supabase.types';

export type GuildRoleRow = Row<'guild_roles'>;
export type GuildRoleKey = GuildRoleRow['key'];

export type GuildStatusRow = Row<'guild_statuses'>;
export type GuildStatusKey = GuildStatusRow['key'];

export type GuildMembershipStatusRow = Row<'guild_membership_statuses'>;
export type GuildMembershipStatusKey = GuildMembershipStatusRow['key'];

export type GuildInviteStatusRow = Row<'guild_invite_statuses'>;
export type GuildInviteStatusKey = GuildInviteStatusRow['key'];

export type GuildJoinRequestStatusRow = Row<'guild_join_request_statuses'>;
export type GuildJoinRequestStatusKey = GuildJoinRequestStatusRow['key'];

export type GetGuildConfigSummaryRpcRow =
  Database['public']['Functions']['get_guild_config_summary']['Returns'][number];

export type CreateGuildRpcArgs =
  Database['public']['Functions']['create_guild']['Args'];

export type CreateGuildRpcRow =
  Database['public']['Functions']['create_guild']['Returns'][number];

export type CreateGuildInviteRpcArgs =
  Database['public']['Functions']['create_guild_invite']['Args'];

export type CreateGuildInviteRpcRow =
  Database['public']['Functions']['create_guild_invite']['Returns'][number];

export type RespondGuildInviteRpcArgs =
  Database['public']['Functions']['respond_guild_invite']['Args'];

export type RespondGuildInviteRpcRow =
  Database['public']['Functions']['respond_guild_invite']['Returns'][number];

export type CancelGuildInviteRpcArgs =
  Database['public']['Functions']['cancel_guild_invite']['Args'];

export type CancelGuildInviteRpcRow =
  Database['public']['Functions']['cancel_guild_invite']['Returns'][number];

export type CreateGuildJoinRequestRpcArgs =
  Database['public']['Functions']['create_guild_join_request']['Args'];

export type CreateGuildJoinRequestRpcRow =
  Database['public']['Functions']['create_guild_join_request']['Returns'][number];

export type ReviewGuildJoinRequestRpcArgs =
  Database['public']['Functions']['review_guild_join_request']['Args'];

export type ReviewGuildJoinRequestRpcRow =
  Database['public']['Functions']['review_guild_join_request']['Returns'][number];

export type CancelGuildJoinRequestRpcArgs =
  Database['public']['Functions']['cancel_guild_join_request']['Args'];

export type CancelGuildJoinRequestRpcRow =
  Database['public']['Functions']['cancel_guild_join_request']['Returns'][number];

export type KickGuildMemberRpcArgs =
  Database['public']['Functions']['kick_guild_member']['Args'];

export type KickGuildMemberRpcRow =
  Database['public']['Functions']['kick_guild_member']['Returns'][number];

export type PromoteGuildMemberToOfficerRpcArgs =
  Database['public']['Functions']['promote_guild_member_to_officer']['Args'];

export type PromoteGuildMemberToOfficerRpcRow =
  Database['public']['Functions']['promote_guild_member_to_officer']['Returns'][number];

export type DemoteGuildOfficerRpcArgs =
  Database['public']['Functions']['demote_guild_officer']['Args'];

export type DemoteGuildOfficerRpcRow =
  Database['public']['Functions']['demote_guild_officer']['Returns'][number];

export type LeaveGuildRpcArgs =
  Database['public']['Functions']['leave_guild']['Args'];

export type LeaveGuildRpcRow =
  Database['public']['Functions']['leave_guild']['Returns'][number];

export type DisbandGuildRpcArgs =
  Database['public']['Functions']['disband_guild']['Args'];

export type DisbandGuildRpcRow =
  Database['public']['Functions']['disband_guild']['Returns'][number];

export type GetHeroGuildStateRpcRow =
  Database['public']['Functions']['get_hero_guild_state']['Returns'][number];

export type GetHeroGuildDashboardRpcRow =
  Database['public']['Functions']['get_hero_guild_dashboard']['Returns'][number];

export type GetHeroGuildMembersRpcRow =
  Database['public']['Functions']['get_hero_guild_members']['Returns'][number];

export type GetHeroGuildInvitationRowsRpcRow =
  Database['public']['Functions']['get_hero_guild_invitation_rows']['Returns'][number];

export type GetHeroGuildJoinRequestRowsRpcRow =
  Database['public']['Functions']['get_hero_guild_join_request_rows']['Returns'][number];

export type SearchGuildsForHeroRpcRow =
  Database['public']['Functions']['search_guilds_for_hero']['Returns'][number];
