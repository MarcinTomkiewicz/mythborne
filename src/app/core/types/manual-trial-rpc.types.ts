import { Database } from './database.types';

type Rpc<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];
type Table<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T];

export type GetActiveTrialOfferRpcArgs =
  Rpc<'get_active_trial_offer'>['Args'];
export type GetActiveTrialOfferRpcRow =
  Rpc<'get_active_trial_offer'>['Returns'][number];

export type StartManualTrialRuntimeSessionRpcArgs =
  Rpc<'start_manual_trial_runtime_session'>['Args'];
export type StartManualTrialRuntimeSessionRpcRow =
  Rpc<'start_manual_trial_runtime_session'>['Returns'][number];

export type GetManualTrialRuntimeManifestRpcArgs =
  Rpc<'get_manual_trial_runtime_manifest'>['Args'];
export type GetManualTrialRuntimeManifestRpcRow =
  Rpc<'get_manual_trial_runtime_manifest'>['Returns'][number];

export type SubmitManualTrialActionLogRpcArgs =
  Rpc<'submit_manual_trial_action_log'>['Args'];
export type SubmitManualTrialActionLogRpcRow =
  Rpc<'submit_manual_trial_action_log'>['Returns'][number];

export type GetManualTrialBackendVerdictRpcArgs =
  Rpc<'get_manual_trial_backend_verdict'>['Args'];
export type GetManualTrialBackendVerdictRpcRow =
  Rpc<'get_manual_trial_backend_verdict'>['Returns'][number];
export type GetManualTrialBackendVerdictForAttemptRpcArgs =
  Rpc<'get_manual_trial_backend_verdict_for_attempt'>['Args'];
export type GetManualTrialBackendVerdictForAttemptRpcRow =
  Rpc<'get_manual_trial_backend_verdict_for_attempt'>['Returns'][number];

export type AutoResolveManualTrialRpcArgs =
  Rpc<'auto_resolve_manual_trial'>['Args'];
export type AutoResolveManualTrialRpcRow =
  Rpc<'auto_resolve_manual_trial'>['Returns'][number];
export type ExitManualTrialToAutoResolveRpcArgs =
  Rpc<'exit_manual_trial_to_auto_resolve'>['Args'];
export type ExitManualTrialToAutoResolveRpcRow =
  Rpc<'exit_manual_trial_to_auto_resolve'>['Returns'][number];
export type ResolveTrialOfferInactivityTimeoutRpcArgs =
  Rpc<'resolve_trial_offer_inactivity_timeout'>['Args'];
export type ResolveTrialOfferInactivityTimeoutRpcRow =
  Rpc<'resolve_trial_offer_inactivity_timeout'>['Returns'][number];
export type ResolveManualTrialInactivityTimeoutRpcArgs =
  Rpc<'resolve_manual_trial_inactivity_timeout'>['Args'];
export type ResolveManualTrialInactivityTimeoutRpcRow =
  Rpc<'resolve_manual_trial_inactivity_timeout'>['Returns'][number];

export type CreateManualTrialGameReportRpcArgs =
  Rpc<'create_manual_trial_game_report'>['Args'];
export type CreateManualTrialGameReportRpcRow =
  Rpc<'create_manual_trial_game_report'>['Returns'][number];

export type ManualTrialBackendVerdictRpcRow =
  | GetManualTrialBackendVerdictRpcRow
  | GetManualTrialBackendVerdictForAttemptRpcRow
  | SubmitManualTrialActionLogRpcRow
  | AutoResolveManualTrialRpcRow
  | ExitManualTrialToAutoResolveRpcRow
  | ResolveTrialOfferInactivityTimeoutRpcRow
  | ResolveManualTrialInactivityTimeoutRpcRow;

export type ManualTrialOutcomeKindRow =
  Table<'manual_trial_outcome_kinds'>['Row'];
export type ManualTrialResolutionModeRow =
  Table<'manual_trial_resolution_modes'>['Row'];
export type ManualTrialFailureReasonRow =
  Table<'manual_trial_failure_reasons'>['Row'];
