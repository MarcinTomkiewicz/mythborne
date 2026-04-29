import { Database } from './database.types';

export type CreateModerationActionRpcArgs =
  Database['public']['Functions']['create_moderation_action']['Args'];
export type CanApplyLocalModerationActionRpcArgs =
  Database['public']['Functions']['can_apply_local_moderation_action']['Args'];
export type CanReadFullModerationHistoryRpcArgs =
  Database['public']['Functions']['can_read_full_moderation_history']['Args'];
export type CanSearchModerationTargetsRpcArgs =
  Database['public']['Functions']['can_search_moderation_targets']['Args'];
export type GetVisibleModerationActionsRpcArgs =
  Database['public']['Functions']['get_visible_moderation_actions']['Args'];
export type GetFullUserModerationHistoryRpcArgs =
  Database['public']['Functions']['get_full_user_moderation_history']['Args'];
export type GetFullHeroModerationHistoryRpcArgs =
  Database['public']['Functions']['get_full_hero_moderation_history']['Args'];
export type SearchModerationUserTargetsRpcArgs =
  Database['public']['Functions']['search_moderation_user_targets']['Args'];
export type SearchModerationHeroTargetsRpcArgs =
  Database['public']['Functions']['search_moderation_hero_targets']['Args'];

export type ModerationActionRpcRow =
  Database['public']['Functions']['get_visible_moderation_actions']['Returns'][number];
export type FullUserModerationHistoryRpcRow =
  Database['public']['Functions']['get_full_user_moderation_history']['Returns'][number];
export type FullHeroModerationHistoryRpcRow =
  Database['public']['Functions']['get_full_hero_moderation_history']['Returns'][number];
export type CreatedModerationActionRpcRow =
  Database['public']['Functions']['create_moderation_action']['Returns'];
export type SearchModerationUserTargetRpcRow =
  Database['public']['Functions']['search_moderation_user_targets']['Returns'][number];
export type SearchModerationHeroTargetRpcRow =
  Database['public']['Functions']['search_moderation_hero_targets']['Returns'][number];

export type AnyModerationActionRpcRow =
  | ModerationActionRpcRow
  | FullUserModerationHistoryRpcRow
  | FullHeroModerationHistoryRpcRow
  | CreatedModerationActionRpcRow;
