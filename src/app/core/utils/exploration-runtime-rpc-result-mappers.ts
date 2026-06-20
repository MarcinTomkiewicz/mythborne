import {
  HeroExplorationChallengeCompletionReadModel,
  HeroExplorationChallengeCompletionWorkflowResult,
  HeroExplorationStepResolutionReadModel,
  HeroExplorationStepResolutionWorkflowResult,
} from '../domain/exploration/exploration-runtime.model';
import { Json } from '../types/database.types';
import {
  AutoResolveCombatSessionRpcRow,
  AutoResolveHeroExplorationChallengeAttemptRpcRow,
  CompleteHeroExplorationChallengeAttemptRpcRow,
  ResolveHeroExplorationStepRpcRow,
} from '../types/exploration-runtime-rpc.types';
import { trimToNull } from './normalize-text';

export function mapResolveHeroExplorationStepResult(
  row: ResolveHeroExplorationStepRpcRow,
): HeroExplorationStepResolutionReadModel {
  const metadataJson = row.metadata_json as Json;

  return {
    stepId: row.step_id,
    explorationId: row.exploration_id,
    status: row.status,
    outcomeKind: canonicalStepOutcomeKind(row.outcome_kind),
    rawOutcomeKind: row.outcome_kind,
    currentNodeId: trimToNull(row.current_node_id),
    toNodeId: trimToNull(row.to_node_id),
    trialDefinitionId: trimToNull(row.trial_definition_id),
    encounterDefinitionId: trimToNull(row.encounter_definition_id),
    challengeAttemptId: trimToNull(row.challenge_attempt_id),
    remainingTrials: row.remaining_trials,
    trialDryStepCount: row.trial_dry_step_count,
    metadataJson,
  };
}

export function mapCompleteHeroExplorationChallengeResult(
  row: CompleteHeroExplorationChallengeAttemptRpcRow,
): HeroExplorationChallengeCompletionReadModel {
  return {
    challengeAttemptId: row.challenge_attempt_id,
    status: row.status,
    success: row.success,
    completionMode: row.completion_mode,
    rewardGrantId: row.reward_grant_id,
    remainingTrials: row.remaining_trials,
    explorationStatus: row.exploration_status,
    autoResolveChance: null,
    autoResolveRoll: null,
  };
}

export function mapAutoResolveHeroExplorationChallengeResult(
  row: AutoResolveHeroExplorationChallengeAttemptRpcRow,
): HeroExplorationChallengeCompletionReadModel {
  return {
    challengeAttemptId: row.challenge_attempt_id,
    status: row.status,
    success: row.success,
    completionMode: row.completion_mode,
    rewardGrantId: row.reward_grant_id,
    remainingTrials: null,
    explorationStatus: null,
    autoResolveChance: row.auto_resolve_chance,
    autoResolveRoll: row.auto_resolve_roll,
  };
}

export function mapAutoResolveCombatSessionChallengeResult(
  row: AutoResolveCombatSessionRpcRow,
): HeroExplorationChallengeCompletionReadModel {
  return {
    challengeAttemptId: row.source_entity_id,
    status: row.status,
    success: row.success,
    completionMode: row.completion_mode,
    rewardGrantId: row.reward_grant_id,
    remainingTrials: row.remaining_trials,
    explorationStatus: row.exploration_status,
    autoResolveChance: null,
    autoResolveRoll: null,
    combatResultId: row.combat_result_id,
    combatSessionId: row.combat_session_id,
    combatOutcome: row.outcome,
    gameReportId: row.game_report_id,
    participantsCreated: row.participants_created,
    participantStatsCreated: row.participant_stats_created,
    attacksCreated: row.attacks_created,
    finalEventCount: row.final_event_count,
  };
}

export function explorationStepResolutionWorkflowResult(
  result: HeroExplorationStepResolutionReadModel,
  state: HeroExplorationStepResolutionWorkflowResult['state'],
): HeroExplorationStepResolutionWorkflowResult {
  return { result, state };
}

export function explorationChallengeCompletionWorkflowResult(
  result: HeroExplorationChallengeCompletionReadModel,
  state: HeroExplorationChallengeCompletionWorkflowResult['state'],
): HeroExplorationChallengeCompletionWorkflowResult {
  return { result, state };
}

function canonicalStepOutcomeKind(value: string): HeroExplorationStepResolutionReadModel['outcomeKind'] {
  return value === 'trial' || value === 'encounter' ? value : 'nothing';
}
