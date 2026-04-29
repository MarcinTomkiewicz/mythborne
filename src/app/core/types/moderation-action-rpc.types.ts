import { Database } from './database.types';

export type CreateModerationActionRpcArgs =
  Database['public']['Functions']['create_moderation_action']['Args'];
export type CanApplyLocalModerationActionRpcArgs =
  Database['public']['Functions']['can_apply_local_moderation_action']['Args'];
export type GetVisibleModerationActionsRpcArgs =
  Database['public']['Functions']['get_visible_moderation_actions']['Args'];

export type ModerationActionRpcRow =
  Database['public']['Functions']['get_visible_moderation_actions']['Returns'][number];
export type CreatedModerationActionRpcRow =
  Database['public']['Functions']['create_moderation_action']['Returns'];
