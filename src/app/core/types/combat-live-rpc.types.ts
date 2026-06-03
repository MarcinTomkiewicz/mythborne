import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

export type StartManualCombatSessionRpcArgs =
  Rpc<'start_manual_combat_session'>['Args'];
export type StartManualCombatSessionRpcRow =
  Rpc<'start_manual_combat_session'>['Returns'][number];

export type GetCombatResolutionPreviewRpcArgs =
  Rpc<'get_combat_resolution_preview'>['Args'];
export type GetCombatResolutionPreviewRpcRow =
  Rpc<'get_combat_resolution_preview'>['Returns'][number];

export type GetCombatLiveStateRpcArgs =
  Rpc<'get_combat_live_state'>['Args'];
export type GetCombatLiveStateRpcRow =
  Rpc<'get_combat_live_state'>['Returns'][number];

export type SubmitCombatPlayerActionRpcArgs =
  Rpc<'submit_combat_player_action'>['Args'];
export type SubmitCombatPlayerActionRpcRow =
  Rpc<'submit_combat_player_action'>['Returns'][number];

export type LiveStateRpcRow =
  | StartManualCombatSessionRpcRow
  | GetCombatLiveStateRpcRow
  | SubmitCombatPlayerActionRpcRow;

export type AutoResolveCombatSessionRpcArgs =
  Rpc<'auto_resolve_combat_session'>['Args'];
export type AutoResolveCombatSessionRpcRow =
  Rpc<'auto_resolve_combat_session'>['Returns'][number];

export type FinalizeCombatSourceResultRpcArgs =
  Rpc<'finalize_combat_source_result'>['Args'];
export type FinalizeCombatSourceResultRpcRow =
  Rpc<'finalize_combat_source_result'>['Returns'][number];

export type GetCombatResultDetailRpcArgs =
  Rpc<'get_combat_result_detail'>['Args'];
export type GetCombatResultDetailRpcRow =
  Rpc<'get_combat_result_detail'>['Returns'][number];
