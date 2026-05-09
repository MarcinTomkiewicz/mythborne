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
