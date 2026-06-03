import {
  HeroDailyActionCounterReadModel,
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationEdgeReadModel,
  HeroExplorationEffectReadModel,
  HeroExplorationNodeReadModel,
  HeroExplorationReadModel,
  HeroExplorationStepReadModel,
  HeroExplorationTestOverrideReadModel,
  HeroPendingCombatEffectStateReadModel,
} from '../domain/exploration/exploration-runtime.model';
import { Row } from '../types/supabase.types';
import { GetHeroPendingCombatEffectStateRpcRow } from '../types/exploration-runtime-rpc.types';
import { mapHeroExplorationChallengeAutoResolve } from './exploration-challenge-auto-resolve-read-model';
import { mapHeroExplorationStepRng } from './exploration-rng-read-model';
import { mapHeroExplorationTrialManifestation } from './exploration-trial-manifestation-read-model';

export function mapHeroDailyActionCounter(
  row: Row<'hero_daily_action_counters'>,
): HeroDailyActionCounterReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    heroId: row.hero_id,
    actionKind: row.action_kind,
    actionDate: row.action_date,
    remainingCount: row.remaining_count,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHeroExploration(row: Row<'hero_explorations'>): HeroExplorationReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    heroId: row.hero_id,
    difficultyKey: row.difficulty_key,
    districtCode: row.district_code,
    explorationDate: row.exploration_date,
    status: row.status,
    currentNodeId: row.current_node_id,
    trialDryStepCount: row.trial_dry_step_count,
    metadataJson: row.metadata_json,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHeroExplorationNode(
  row: Row<'hero_exploration_nodes'>,
): HeroExplorationNodeReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    explorationId: row.exploration_id,
    parentNodeId: row.parent_node_id,
    descriptionId: row.description_id,
    label: row.label,
    createdSequence: row.created_sequence,
    distanceFromRoot: row.distance_from_root,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHeroExplorationEdge(
  row: Row<'hero_exploration_edges'>,
): HeroExplorationEdgeReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    explorationId: row.exploration_id,
    fromNodeId: row.from_node_id,
    toNodeId: row.to_node_id,
    directionKey: row.direction_key,
    label: row.label,
    sortOrder: row.sort_order,
    isAvailable: row.is_available,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHeroExplorationStep(
  row: Row<'hero_exploration_steps'>,
): HeroExplorationStepReadModel {
  const step = {
    id: row.id,
    serverId: row.server_id,
    heroId: row.hero_id,
    explorationId: row.exploration_id,
    edgeId: row.edge_id,
    fromNodeId: row.from_node_id,
    toNodeId: row.to_node_id,
    directionKey: row.direction_key,
    stepKind: row.step_kind,
    status: row.status,
    outcomeKind: row.outcome_kind,
    difficultyKey: row.difficulty_key,
    districtCode: row.district_code,
    trialDefinitionId: row.trial_definition_id,
    encounterDefinitionId: row.encounter_definition_id,
    trialOpportunityChance: row.trial_opportunity_chance,
    trialOpportunityRoll: row.trial_opportunity_roll,
    encounterChance: row.encounter_chance,
    encounterRoll: row.encounter_roll,
    metadataJson: row.metadata_json,
    startedAt: row.started_at,
    resolvesAt: row.resolves_at,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies Omit<HeroExplorationStepReadModel, 'rng'>;

  return {
    ...step,
    rng: mapHeroExplorationStepRng(step),
  };
}

export function mapHeroExplorationEffect(
  row: Row<'hero_exploration_effects'>,
): HeroExplorationEffectReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    heroId: row.hero_id,
    explorationId: row.exploration_id,
    effectDefinitionId: row.effect_definition_id,
    effectKind: row.effect_kind,
    sourceKind: row.source_kind,
    sourceId: row.source_id,
    isActive: row.is_active,
    appliedAt: row.applied_at,
    consumedAt: row.consumed_at,
    consumedByKind: row.consumed_by_kind,
    consumedById: row.consumed_by_id,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapHeroPendingCombatEffectState(
  row: GetHeroPendingCombatEffectStateRpcRow,
): HeroPendingCombatEffectStateReadModel {
  return {
    effectId: row.effect_id,
    serverId: row.server_id,
    heroId: row.hero_id,
    explorationId: row.exploration_id,
    effectDefinitionId: row.effect_definition_id,
    effectKey: row.effect_key,
    effectLabel: row.effect_label,
    effectDescription: row.effect_description,
    effectHelperText: row.effect_helper_text,
    effectKind: row.effect_kind,
    effectKindLabel: row.effect_kind_label,
    effectTargetKey: row.effect_target_key,
    effectTargetLabel: row.effect_target_label,
    bonusTemplateKey: row.bonus_template_key,
    bonusTemplateLabel: row.bonus_template_label,
    valueDisplay: row.value_display,
    status: row.status,
    isActive: row.is_active,
    runtimeIncluded: row.runtime_included,
    playerSummary: row.player_summary,
    metadataJson: row.metadata_json,
    appliedAt: row.applied_at,
    consumedAt: row.consumed_at,
    consumedByKind: row.consumed_by_kind,
    consumedById: row.consumed_by_id,
  };
}

export function mapHeroExplorationChallengeAttempt(
  row: Row<'hero_exploration_challenge_attempts'>,
): HeroExplorationChallengeAttemptReadModel {
  const challenge = {
    id: row.id,
    serverId: row.server_id,
    heroId: row.hero_id,
    explorationId: row.exploration_id,
    stepId: row.step_id,
    challengeKind: row.challenge_kind,
    status: row.status,
    difficultyKey: row.difficulty_key,
    districtCode: row.district_code,
    trialDefinitionId: row.trial_definition_id,
    encounterDefinitionId: row.encounter_definition_id,
    minigameKey: row.minigame_key,
    testedStatKey: row.tested_stat_key,
    manifestationStatus: row.manifestation_status,
    manifestationChance: row.manifestation_chance,
    manifestationRoll: row.manifestation_roll,
    manualDeadlineAt: row.manual_deadline_at,
    completionMode: row.completion_mode,
    performanceRating: row.performance_rating,
    score: row.score,
    success: row.success,
    rewardGrantId: row.reward_grant_id,
    autoResolveChance: row.auto_resolve_chance,
    autoResolveRoll: row.auto_resolve_roll,
    detailsJson: row.details_json,
    metadataJson: row.metadata_json,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies Omit<
    HeroExplorationChallengeAttemptReadModel,
    'autoResolve' | 'manifestation'
  >;

  return {
    ...challenge,
    autoResolve: mapHeroExplorationChallengeAutoResolve(challenge),
    manifestation: mapHeroExplorationTrialManifestation(challenge),
  };
}

export function mapHeroExplorationTestOverride(
  row: Row<'hero_exploration_test_overrides'>,
): HeroExplorationTestOverrideReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    heroId: row.hero_id,
    difficultyKey: row.difficulty_key,
    overrideKind: row.override_kind,
    forcedOutcomeKind: row.forced_outcome_kind,
    trialDefinitionId: row.trial_definition_id,
    encounterDefinitionId: row.encounter_definition_id,
    forceManifestationStatus: row.force_manifestation_status,
    reason: row.reason,
    isConsumed: row.is_consumed,
    consumedAt: row.consumed_at,
    consumedByStepId: row.consumed_by_step_id,
    expiresAt: row.expires_at,
    createdBy: row.created_by,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
