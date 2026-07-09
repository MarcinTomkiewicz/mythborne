import {
  ManualRuntimeManifest,
  ManualTrialActionLogEnvelope,
  ManualTrialBackendVerdict,
  ManualTrialBackendVerdictDebug,
  ManualTrialFailureReason,
  ManualTrialOutcome,
  ManualTrialResolutionMode,
  TrialOffer,
} from './manual-trial-core.model';
import {
  GetActiveTrialOfferRpcRow,
  GetManualTrialRuntimeManifestRpcRow,
  ManualTrialBackendVerdictRpcRow,
  ManualTrialFailureReasonRow,
  ManualTrialOutcomeKindRow,
  ManualTrialResolutionModeRow,
  StartManualTrialRuntimeSessionRpcRow,
  SubmitManualTrialActionLogRpcArgs,
} from '../../types/manual-trial-rpc.types';

export function mapTrialOffer(row: GetActiveTrialOfferRpcRow): TrialOffer {
  return {
    attemptId: row.attempt_id,
    serverId: row.server_id,
    heroId: row.hero_id,
    trialDefinitionId: row.trial_definition_id,
    trialKey: row.trial_key,
    difficultyKey: row.difficulty_key,
    districtCode: row.district_code,
    testedStatKey: row.tested_stat_key,
    minigameKey: row.minigame_key,
    minigameImplementationKey: row.minigame_implementation_key,
    attemptStatusKey: row.challenge_status,
    canManualResolve: row.can_manual_resolve,
    canAutoResolve: row.can_auto_resolve,
    manualDeadlineAt: row.manual_deadline_at,
    offerInactivityAutoResolveAt: row.offer_inactivity_auto_resolve_at,
    existingManualSessionId: row.existing_manual_session_id,
    existingManifestId: row.existing_manifest_id,
    existingVerdictId: row.existing_verdict_id,
    rewardGrantId: row.reward_grant_id,
    gameReportId: row.game_report_id,
    playerContextJson: row.player_context_json,
    policyJson: row.policy_json,
  };
}

export function mapManualRuntimeManifest(
  row: GetManualTrialRuntimeManifestRpcRow | StartManualTrialRuntimeSessionRpcRow,
): ManualRuntimeManifest {
  return {
    manifestId: row.manifest_id,
    manualSessionId: row.manual_session_id,
    attemptId: row.attempt_id,
    serverId: row.server_id,
    heroId: row.hero_id,
    trialDefinitionId: row.trial_definition_id,
    minigameKey: row.minigame_key,
    manifestStatusKey: row.manifest_status_key,
    sessionStatusKey: row.session_status_key,
    manifestVersion: row.manifest_version,
    manifestHash: row.manifest_hash,
    startedAt: row.started_at,
    sessionExpiresAt: row.session_expires_at,
    manifestExpiresAt: row.manifest_expires_at,
    playerManifestJson: row.player_manifest_json,
    minigameConfigJson: row.minigame_config_json,
    timingPolicyJson: row.timing_policy_json,
    inactivityPolicyJson: row.inactivity_policy_json,
    accessibilityPolicyJson: row.accessibility_policy_json,
    reportPolicyJson: row.report_policy_json,
  };
}

export function toSubmitManualTrialActionLogRpcArgs(
  envelope: ManualTrialActionLogEnvelope,
): SubmitManualTrialActionLogRpcArgs {
  return {
    p_request_id: envelope.requestId,
    p_attempt_id: envelope.attemptId,
    p_manual_session_id: envelope.manualSessionId,
    p_manifest_id: envelope.manifestId,
    p_manifest_version: envelope.manifestVersion,
    p_manifest_hash: envelope.manifestHash,
    p_action_log_json: envelope.actionLogJson,
    p_client_timing_summary_json: envelope.clientTimingSummaryJson,
    p_client_observed_summary_json: envelope.clientObservedSummaryJson,
    p_client_environment_summary_json: envelope.clientEnvironmentSummaryJson,
  };
}

export function mapManualTrialBackendVerdict(
  row: ManualTrialBackendVerdictRpcRow,
): ManualTrialBackendVerdict {
  return {
    verdictId: row.verdict_id,
    actionLogId: row.action_log_id,
    attemptId: row.attempt_id,
    manualSessionId: row.manual_session_id,
    serverId: row.server_id,
    heroId: row.hero_id,
    trialDefinitionId: row.trial_definition_id,
    minigameKey: row.minigame_key,
    outcomeKey: row.outcome_key,
    resolutionModeKey: row.resolution_mode_key,
    failureReasonKey: row.failure_reason_key,
    validationReasonKey: row.validation_reason_key,
    validationReasonSeverity: row.validation_reason_severity,
    performanceRating: row.performance_rating,
    score: row.score,
    resolvedAt: row.resolved_at,
    report: {
      gameReportId: row.game_report_id,
      playerReportSummaryJson: row.player_report_summary_json,
    },
    reward: {
      rewardGrantId: row.reward_grant_id,
      rewardSummaryJson: row.reward_summary_json,
    },
  };
}

export function mapManualTrialBackendVerdictDebug(
  row: ManualTrialBackendVerdictRpcRow,
): ManualTrialBackendVerdictDebug {
  return {
    verdictId: row.verdict_id,
    backendReplaySummaryJson: row.backend_replay_summary_json,
    validationWarningsJson: row.validation_warnings_json,
  };
}

export function mapManualTrialOutcome(row: ManualTrialOutcomeKindRow): ManualTrialOutcome {
  return {
    key: row.key,
    isSuccess: row.is_success,
    isActive: row.is_active,
    isPlayerVisible: row.is_player_visible,
    sortOrder: row.sort_order,
    metadataJson: row.metadata_json,
  };
}

export function mapManualTrialResolutionMode(
  row: ManualTrialResolutionModeRow,
): ManualTrialResolutionMode {
  return {
    key: row.key,
    isManualPath: row.is_manual_path,
    isAutoResolve: row.is_auto_resolve,
    isActive: row.is_active,
    isPlayerVisible: row.is_player_visible,
    sortOrder: row.sort_order,
    metadataJson: row.metadata_json,
  };
}

export function mapManualTrialFailureReason(
  row: ManualTrialFailureReasonRow,
): ManualTrialFailureReason {
  return {
    key: row.key,
    reasonFamily: row.reason_family,
    isActive: row.is_active,
    isPlayerVisible: row.is_player_visible,
    sortOrder: row.sort_order,
    metadataJson: row.metadata_json,
  };
}
