import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];
type Table<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T];

export type ActiveOfferRpcArgs = Rpc<'get_active_trial_offer'>['Args'];
export type ActiveOfferRpcRow = Rpc<'get_active_trial_offer'>['Returns'][number];

export type StartSessionRpcArgs =
  Rpc<'start_manual_trial_runtime_session'>['Args'];
export type StartSessionRpcRow =
  Rpc<'start_manual_trial_runtime_session'>['Returns'][number];

export type RuntimeManifestRpcArgs =
  Rpc<'get_manual_trial_runtime_manifest'>['Args'];
export type RuntimeManifestRpcRow =
  Rpc<'get_manual_trial_runtime_manifest'>['Returns'][number];

export type SubmitActionLogRpcArgs =
  Rpc<'submit_manual_trial_action_log'>['Args'];
export type SubmitActionLogRpcRow =
  Rpc<'submit_manual_trial_action_log'>['Returns'][number];

export type SessionVerdictRpcArgs =
  Rpc<'get_manual_trial_backend_verdict'>['Args'];
export type SessionVerdictRpcRow =
  Rpc<'get_manual_trial_backend_verdict'>['Returns'][number];
export type AttemptVerdictRpcArgs =
  Rpc<'get_manual_trial_backend_verdict_for_attempt'>['Args'];
export type AttemptVerdictRpcRow =
  Rpc<'get_manual_trial_backend_verdict_for_attempt'>['Returns'][number];

export type AutoResolveAttemptRpcArgs =
  Rpc<'auto_resolve_manual_trial'>['Args'];
export type AutoResolveAttemptRpcRow =
  Rpc<'auto_resolve_manual_trial'>['Returns'][number];

export type CreateReportHandoffRpcArgs =
  Rpc<'create_manual_trial_game_report'>['Args'];
export type CreateReportHandoffRpcRow =
  Rpc<'create_manual_trial_game_report'>['Returns'][number];

export type VerdictRpcRow =
  | SessionVerdictRpcRow
  | AttemptVerdictRpcRow
  | SubmitActionLogRpcRow
  | AutoResolveAttemptRpcRow;

export type OutcomeKindRow = Table<'manual_trial_outcome_kinds'>['Row'];
export type ResolutionModeRow = Table<'manual_trial_resolution_modes'>['Row'];
export type FailureReasonRow = Table<'manual_trial_failure_reasons'>['Row'];
