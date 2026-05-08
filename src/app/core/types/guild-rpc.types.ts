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
