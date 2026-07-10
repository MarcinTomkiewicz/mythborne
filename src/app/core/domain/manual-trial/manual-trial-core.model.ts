import { Json } from '../../types/database.types';

export interface TrialOffer {
  attemptId: string;
  serverId: string;
  heroId: string;
  trialDefinitionId: string;
  trialKey: string;
  difficultyKey: string;
  districtCode: string;
  testedStatKey: string;
  minigameKey: string;
  minigameImplementationKey: string;
  attemptStatusKey: string;
  canManualResolve: boolean;
  canAutoResolve: boolean;
  manualDeadlineAt: string | null;
  offerInactivityAutoResolveAt: string | null;
  existingManualSessionId: string | null;
  existingManifestId: string | null;
  existingVerdictId: string | null;
  rewardGrantId: string | null;
  gameReportId: string | null;
  playerContextJson: Json;
  policyJson: Json;
}

export interface ManualRuntimeManifest {
  manifestId: string;
  manualSessionId: string;
  attemptId: string;
  serverId: string;
  heroId: string;
  trialDefinitionId: string;
  minigameKey: string;
  manifestStatusKey: string;
  sessionStatusKey: string;
  manifestVersion: number;
  manifestHash: string;
  startedAt: string;
  sessionExpiresAt: string | null;
  manifestExpiresAt: string | null;
  playerManifestJson: Json;
  minigameConfigJson: Json;
  timingPolicyJson: Json;
  inactivityPolicyJson: Json;
  accessibilityPolicyJson: Json;
  reportPolicyJson: Json;
}

export interface ManualTrialActionLogEnvelope {
  requestId?: string | null;
  attemptId: string;
  manualSessionId: string;
  manifestId: string;
  manifestVersion: number;
  manifestHash: string;
  actionLogJson: Json;
  clientTimingSummaryJson?: Json;
  clientObservedSummaryJson?: Json;
  clientEnvironmentSummaryJson?: Json;
}

export interface ManualTrialActionLogSubmitEnvelope
  extends ManualTrialActionLogEnvelope {
  requestId: string;
}

export interface ManualTrialReportSummary {
  gameReportId: string | null;
  playerReportSummaryJson: Json;
}

export interface ManualTrialRewardSummary {
  rewardGrantId: string | null;
  rewardSummaryJson: Json;
}

export interface ManualTrialBackendVerdict {
  verdictId: string;
  actionLogId: string | null;
  attemptId: string;
  manualSessionId: string | null;
  serverId: string;
  heroId: string;
  trialDefinitionId: string;
  minigameKey: string;
  outcomeKey: string;
  resolutionModeKey: string;
  failureReasonKey: string | null;
  validationReasonKey: string | null;
  validationReasonSeverity: string | null;
  performanceRating: string | null;
  score: number | null;
  resolvedAt: string;
  report: ManualTrialReportSummary;
  reward: ManualTrialRewardSummary;
}

export interface ManualTrialReportHandoff {
  reportId: string;
  publicToken: string;
  reportTypeKey: string;
  verdictId: string;
  attemptId: string;
  manualSessionId: string | null;
  rewardGrantId: string | null;
  serverId: string;
  heroId: string;
}

export interface ManualTrialOutcome {
  key: string;
  isSuccess: boolean;
  isActive: boolean;
  isPlayerVisible: boolean;
  sortOrder: number;
  metadataJson: Json;
}

export interface ManualTrialResolutionMode {
  key: string;
  isManualPath: boolean;
  isAutoResolve: boolean;
  isActive: boolean;
  isPlayerVisible: boolean;
  sortOrder: number;
  metadataJson: Json;
}

export interface ManualTrialFailureReason {
  key: string;
  reasonFamily: string;
  isActive: boolean;
  isPlayerVisible: boolean;
  sortOrder: number;
  metadataJson: Json;
}
