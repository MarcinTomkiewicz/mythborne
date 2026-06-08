import {
  ExplorationResultNarrativeSnapshotV1,
} from '../domain/exploration/exploration-result-copy.model';
import {
  HeroDailyActionCounterReadModel,
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationDebugEntryReadModel,
  HeroExplorationDebugStateReadModel,
  HeroExplorationEdgeReadModel,
  HeroExplorationEffectReadModel,
  HeroExplorationNodeReadModel,
  HeroExplorationMovementOptionReadModel,
  HeroExplorationReadModel,
  HeroExplorationStateReadModel,
  HeroExplorationStepReadModel,
  HeroExplorationTestOverrideReadModel,
} from '../domain/exploration/exploration-runtime.model';
import { Json } from '../types/database.types';
import { mapHeroExplorationChallengeAutoResolve } from './exploration-challenge-auto-resolve-read-model';
import { mapOptionalExplorationResultNarrativeSnapshot } from './exploration-result-copy.mapper';
import { mapHeroExplorationStepRng } from './exploration-rng-read-model';
import { mapHeroExplorationTrialManifestation } from './exploration-trial-manifestation-read-model';
import {
  booleanValue,
  jsonRecord,
  jsonValue,
  JsonRecord,
  mapJsonArray,
  mapJsonObject,
  numberValue,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  text,
} from './json-read';

export function mapHeroExplorationStateJson(value: Json): HeroExplorationStateReadModel {
  const record = jsonRecord(value);

  return {
    hasExploration: booleanValue(read(record, 'hasExploration', 'has_exploration')),
    heroId: text(read(record, 'heroId', 'hero_id')),
    difficultyKey: text(read(record, 'difficultyKey', 'difficulty_key')),
    explorationDate: text(read(record, 'explorationDate', 'exploration_date')),
    remainingTrials: numberValue(read(record, 'remainingTrials', 'remaining_trials')),
    exploration: mapJsonObject(read(record, 'exploration'), mapHeroExplorationJson),
    currentNode: mapJsonObject(read(record, 'currentNode', 'current_node'), mapHeroExplorationNodeJson),
    edges: mapJsonArray(read(record, 'edges'), mapHeroExplorationEdgeJson),
    movementOptions: mapJsonArray(
      read(record, 'movementOptions', 'movement_options'),
      mapHeroExplorationMovementOptionJson,
    ),
    activeStep: mapJsonObject(read(record, 'activeStep', 'active_step'), mapHeroExplorationStepJson),
    activeChallenge: mapJsonObject(
      read(record, 'activeChallenge', 'active_challenge'),
      mapHeroExplorationChallengeAttemptJson,
    ),
    activeEffect: mapJsonObject(
      read(record, 'activeEffect', 'active_effect'),
      mapHeroExplorationEffectJson,
    ),
    rawJson: value,
  };
}

export function mapHeroExplorationDebugStateJson(
  value: Json,
): HeroExplorationDebugStateReadModel {
  const record = jsonRecord(value);

  return {
    serverId: text(read(record, 'serverId', 'server_id')),
    heroId: text(read(record, 'heroId', 'hero_id')),
    explorationDate: text(read(record, 'explorationDate', 'exploration_date')),
    counters: mapJsonArray(read(record, 'counters'), mapHeroDailyActionCounterJson),
    explorations: mapJsonArray(read(record, 'explorations'), mapHeroExplorationDebugEntryJson),
    rawJson: value,
  };
}

function mapHeroExplorationDebugEntryJson(
  row: JsonRecord,
): HeroExplorationDebugEntryReadModel {
  return {
    exploration: mapHeroExplorationJson(jsonRecord(read(row, 'exploration')) ?? {}),
    remainingTrials: optionalNumber(read(row, 'remainingTrials', 'remaining_trials')),
    currentNode: mapJsonObject(read(row, 'currentNode', 'current_node'), mapHeroExplorationNodeJson),
    edges: mapJsonArray(read(row, 'edges'), mapHeroExplorationEdgeJson),
    activeStep: mapJsonObject(read(row, 'activeStep', 'active_step'), mapHeroExplorationStepJson),
    activeChallenge: mapJsonObject(
      read(row, 'activeChallenge', 'active_challenge'),
      mapHeroExplorationChallengeAttemptJson,
    ),
    activeEffect: mapJsonObject(
      read(row, 'activeEffect', 'active_effect'),
      mapHeroExplorationEffectJson,
    ),
    recentSteps: mapJsonArray(read(row, 'recentSteps', 'recent_steps'), mapHeroExplorationStepJson),
    recentChallenges: mapJsonArray(
      read(row, 'recentChallenges', 'recent_challenges'),
      mapHeroExplorationChallengeAttemptJson,
    ),
    testOverrides: mapJsonArray(
      read(row, 'testOverrides', 'test_overrides'),
      mapHeroExplorationTestOverrideJson,
    ),
  };
}

function mapHeroExplorationJson(row: JsonRecord): HeroExplorationReadModel {
  return {
    id: text(read(row, 'id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    heroId: text(read(row, 'heroId', 'hero_id')),
    difficultyKey: text(read(row, 'difficultyKey', 'difficulty_key')),
    districtCode: text(read(row, 'districtCode', 'district_code')),
    explorationDate: text(read(row, 'explorationDate', 'exploration_date')),
    status: text(read(row, 'status')),
    currentNodeId: optionalText(read(row, 'currentNodeId', 'current_node_id')),
    trialDryStepCount: numberValue(read(row, 'trialDryStepCount', 'trial_dry_step_count')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json')),
    startedAt: text(read(row, 'startedAt', 'started_at')),
    completedAt: optionalText(read(row, 'completedAt', 'completed_at')),
    createdAt: text(read(row, 'createdAt', 'created_at')),
    updatedAt: text(read(row, 'updatedAt', 'updated_at')),
  };
}

function mapHeroDailyActionCounterJson(row: JsonRecord): HeroDailyActionCounterReadModel {
  return {
    id: text(read(row, 'id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    heroId: text(read(row, 'heroId', 'hero_id')),
    actionKind: text(read(row, 'actionKind', 'action_kind')),
    actionDate: text(read(row, 'actionDate', 'action_date')),
    remainingCount: numberValue(read(row, 'remainingCount', 'remaining_count')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json')),
    createdAt: text(read(row, 'createdAt', 'created_at')),
    updatedAt: text(read(row, 'updatedAt', 'updated_at')),
  };
}

function mapHeroExplorationNodeJson(row: JsonRecord): HeroExplorationNodeReadModel {
  return {
    id: text(read(row, 'id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    explorationId: text(read(row, 'explorationId', 'exploration_id')),
    parentNodeId: optionalText(read(row, 'parentNodeId', 'parent_node_id')),
    descriptionId: optionalText(read(row, 'descriptionId', 'description_id')),
    label: optionalText(read(row, 'label')),
    createdSequence: numberValue(read(row, 'createdSequence', 'created_sequence')),
    distanceFromRoot: numberValue(read(row, 'distanceFromRoot', 'distance_from_root')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json')),
    createdAt: text(read(row, 'createdAt', 'created_at')),
    updatedAt: text(read(row, 'updatedAt', 'updated_at')),
  };
}

function mapHeroExplorationEdgeJson(row: JsonRecord): HeroExplorationEdgeReadModel {
  return {
    id: text(read(row, 'id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    explorationId: text(read(row, 'explorationId', 'exploration_id')),
    fromNodeId: text(read(row, 'fromNodeId', 'from_node_id')),
    toNodeId: optionalText(read(row, 'toNodeId', 'to_node_id')),
    directionKey: text(read(row, 'directionKey', 'direction_key')),
    label: text(read(row, 'label')),
    sortOrder: numberValue(read(row, 'sortOrder', 'sort_order')),
    isAvailable: booleanValue(read(row, 'isAvailable', 'is_available')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json')),
    createdAt: text(read(row, 'createdAt', 'created_at')),
    updatedAt: text(read(row, 'updatedAt', 'updated_at')),
  };
}

function mapHeroExplorationMovementOptionJson(
  row: JsonRecord,
): HeroExplorationMovementOptionReadModel {
  const edgeId = optionalText(read(row, 'edgeId', 'edge_id'));
  const directionKey = optionalText(read(row, 'directionKey', 'direction_key'));
  const stepKind = text(read(row, 'stepKind', 'step_kind'));

  return {
    optionKind: optionalText(read(row, 'optionKind', 'option_kind')),
    actionKey: optionalText(read(row, 'actionKey', 'action_key')),
    stepKind,
    edgeId,
    directionKey,
    label: text(read(row, 'label')) || directionKey || stepKind,
    sortOrder: optionalNumber(read(row, 'sortOrder', 'sort_order')),
    toNodeId: optionalText(read(row, 'toNodeId', 'to_node_id')),
    isKnownPath: optionalBoolean(read(row, 'isKnownPath', 'is_known_path')),
    isBacktrack: booleanValue(read(row, 'isBacktrack', 'is_backtrack')) || stepKind === 'backtrack',
    isAvailable: optionalBoolean(read(row, 'isAvailable', 'is_available')) ?? true,
    startRpc: jsonValue(read(row, 'startRpc', 'start_rpc')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json')),
  };
}

function mapHeroExplorationStepJson(row: JsonRecord): HeroExplorationStepReadModel {
  const step = {
    id: text(read(row, 'id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    heroId: text(read(row, 'heroId', 'hero_id')),
    explorationId: text(read(row, 'explorationId', 'exploration_id')),
    edgeId: optionalText(read(row, 'edgeId', 'edge_id')),
    fromNodeId: text(read(row, 'fromNodeId', 'from_node_id')),
    toNodeId: optionalText(read(row, 'toNodeId', 'to_node_id')),
    directionKey: optionalText(read(row, 'directionKey', 'direction_key')),
    stepKind: text(read(row, 'stepKind', 'step_kind')),
    status: text(read(row, 'status')),
    outcomeKind: text(read(row, 'outcomeKind', 'outcome_kind')),
    difficultyKey: text(read(row, 'difficultyKey', 'difficulty_key')),
    districtCode: text(read(row, 'districtCode', 'district_code')),
    trialDefinitionId: optionalText(read(row, 'trialDefinitionId', 'trial_definition_id')),
    encounterDefinitionId: optionalText(read(row, 'encounterDefinitionId', 'encounter_definition_id')),
    trialOpportunityChance: optionalNumber(
      read(row, 'trialOpportunityChance', 'trial_opportunity_chance'),
    ),
    trialOpportunityRoll: optionalNumber(
      read(row, 'trialOpportunityRoll', 'trial_opportunity_roll'),
    ),
    encounterChance: optionalNumber(read(row, 'encounterChance', 'encounter_chance')),
    encounterRoll: optionalNumber(read(row, 'encounterRoll', 'encounter_roll')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json')),
    startedAt: text(read(row, 'startedAt', 'started_at')),
    resolvesAt: text(read(row, 'resolvesAt', 'resolves_at')),
    resolvedAt: optionalText(read(row, 'resolvedAt', 'resolved_at')),
    createdAt: text(read(row, 'createdAt', 'created_at')),
    updatedAt: text(read(row, 'updatedAt', 'updated_at')),
  } satisfies Omit<HeroExplorationStepReadModel, 'rng'>;

  return {
    ...step,
    rng: mapHeroExplorationStepRng(step),
  };
}

function mapHeroExplorationEffectJson(row: JsonRecord): HeroExplorationEffectReadModel {
  return {
    id: text(read(row, 'id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    heroId: text(read(row, 'heroId', 'hero_id')),
    explorationId: text(read(row, 'explorationId', 'exploration_id')),
    effectDefinitionId: text(read(row, 'effectDefinitionId', 'effect_definition_id')),
    effectKind: text(read(row, 'effectKind', 'effect_kind')),
    effectLabel: optionalText(read(row, 'effectLabel', 'effect_label')),
    effectKindLabel: optionalText(read(row, 'effectKindLabel', 'effect_kind_label')),
    effectTargetLabel: optionalText(read(row, 'effectTargetLabel', 'effect_target_label')),
    valueDisplay: optionalText(read(row, 'displayValue', 'display_value', 'valueDisplay', 'value_display')),
    playerSummary: optionalText(read(row, 'playerSummary', 'player_summary')),
    sourceKind: text(read(row, 'sourceKind', 'source_kind')),
    sourceId: optionalText(read(row, 'sourceId', 'source_id')),
    isActive: booleanValue(read(row, 'isActive', 'is_active')),
    appliedAt: text(read(row, 'appliedAt', 'applied_at')),
    consumedAt: optionalText(read(row, 'consumedAt', 'consumed_at')),
    consumedByKind: optionalText(read(row, 'consumedByKind', 'consumed_by_kind')),
    consumedById: optionalText(read(row, 'consumedById', 'consumed_by_id')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json')),
    createdAt: text(read(row, 'createdAt', 'created_at')),
    updatedAt: text(read(row, 'updatedAt', 'updated_at')),
  };
}

function mapHeroExplorationChallengeAttemptJson(
  row: JsonRecord,
): HeroExplorationChallengeAttemptReadModel {
  const metadataJson = jsonValue(read(row, 'metadataJson', 'metadata_json'));
  const challenge = {
    id: text(read(row, 'id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    heroId: text(read(row, 'heroId', 'hero_id')),
    explorationId: text(read(row, 'explorationId', 'exploration_id')),
    stepId: text(read(row, 'stepId', 'step_id')),
    challengeKind: text(read(row, 'challengeKind', 'challenge_kind')),
    status: text(read(row, 'status')),
    difficultyKey: text(read(row, 'difficultyKey', 'difficulty_key')),
    districtCode: text(read(row, 'districtCode', 'district_code')),
    trialDefinitionId: optionalText(read(row, 'trialDefinitionId', 'trial_definition_id')),
    encounterDefinitionId: optionalText(read(row, 'encounterDefinitionId', 'encounter_definition_id')),
    minigameKey: optionalText(read(row, 'minigameKey', 'minigame_key')),
    testedStatKey: optionalText(read(row, 'testedStatKey', 'tested_stat_key')),
    manifestationStatus: text(read(row, 'manifestationStatus', 'manifestation_status')),
    manifestationChance: optionalNumber(read(row, 'manifestationChance', 'manifestation_chance')),
    manifestationRoll: optionalNumber(read(row, 'manifestationRoll', 'manifestation_roll')),
    manualDeadlineAt: optionalText(read(row, 'manualDeadlineAt', 'manual_deadline_at')),
    completionMode: optionalText(read(row, 'completionMode', 'completion_mode')),
    performanceRating: optionalText(read(row, 'performanceRating', 'performance_rating')),
    score: optionalNumber(read(row, 'score')),
    success: optionalBoolean(read(row, 'success')),
    rewardGrantId: optionalText(read(row, 'rewardGrantId', 'reward_grant_id')),
    autoResolveChance: optionalNumber(read(row, 'autoResolveChance', 'auto_resolve_chance')),
    autoResolveRoll: optionalNumber(read(row, 'autoResolveRoll', 'auto_resolve_roll')),
    trialManifestationNarrativeJson: mapTrialManifestationNarrativeJson(
      row,
      metadataJson,
      'activeChallenge',
    ),
    encounterCombatHandoffNarrativeJson: mapEncounterCombatHandoffNarrativeJson(
      row,
      metadataJson,
      'activeChallenge',
    ),
    detailsJson: jsonValue(read(row, 'detailsJson', 'details_json')),
    metadataJson,
    startedAt: optionalText(read(row, 'startedAt', 'started_at')),
    completedAt: optionalText(read(row, 'completedAt', 'completed_at')),
    createdAt: text(read(row, 'createdAt', 'created_at')),
    updatedAt: text(read(row, 'updatedAt', 'updated_at')),
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

function mapTrialManifestationNarrativeJson(
  row: JsonRecord,
  metadataJson: Json,
  field: string,
): ExplorationResultNarrativeSnapshotV1 | null {
  const direct = mapOptionalExplorationResultNarrativeSnapshot(
    read(row, 'trialManifestationNarrativeJson', 'trial_manifestation_narrative_json'),
    `${field}.trialManifestationNarrativeJson`,
  );

  if (direct) {
    return direct;
  }

  return mapOptionalExplorationResultNarrativeSnapshot(
    read(jsonRecord(metadataJson), 'trialManifestationNarrativeJson'),
    `${field}.metadataJson.trialManifestationNarrativeJson`,
  );
}

function mapEncounterCombatHandoffNarrativeJson(
  row: JsonRecord,
  metadataJson: Json,
  field: string,
): ExplorationResultNarrativeSnapshotV1 | null {
  const direct = mapEncounterCombatHandoffNarrativeCandidate(
    read(row, 'encounterCombatHandoffNarrativeJson', 'encounter_combat_handoff_narrative_json'),
    `${field}.encounterCombatHandoffNarrativeJson`,
  );

  if (direct) {
    return direct;
  }

  const result = mapEncounterCombatHandoffNarrativeCandidate(
    read(row, 'resultNarrativeJson', 'result_narrative_json'),
    `${field}.resultNarrativeJson`,
  );

  if (result) {
    return result;
  }

  return mapEncounterCombatHandoffNarrativeCandidate(
    read(jsonRecord(metadataJson), 'resultNarrativeJson'),
    `${field}.metadataJson.resultNarrativeJson`,
  );
}

function mapEncounterCombatHandoffNarrativeCandidate(
  value: Json | undefined,
  field: string,
): ExplorationResultNarrativeSnapshotV1 | null {
  const narrative = mapOptionalExplorationResultNarrativeSnapshot(value, field);

  if (!narrative) {
    return null;
  }

  if (narrative.resultKind !== 'encounter_combat_handoff') {
    return null;
  }

  return narrative;
}

function mapHeroExplorationTestOverrideJson(
  row: JsonRecord,
): HeroExplorationTestOverrideReadModel {
  return {
    id: text(read(row, 'id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    heroId: text(read(row, 'heroId', 'hero_id')),
    difficultyKey: text(read(row, 'difficultyKey', 'difficulty_key')),
    overrideKind: text(read(row, 'overrideKind', 'override_kind')),
    forcedOutcomeKind: text(read(row, 'forcedOutcomeKind', 'forced_outcome_kind')),
    trialDefinitionId: optionalText(read(row, 'trialDefinitionId', 'trial_definition_id')),
    encounterDefinitionId: optionalText(read(row, 'encounterDefinitionId', 'encounter_definition_id')),
    forceManifestationStatus: optionalText(
      read(row, 'forceManifestationStatus', 'force_manifestation_status'),
    ),
    reason: text(read(row, 'reason')),
    isConsumed: booleanValue(read(row, 'isConsumed', 'is_consumed')),
    consumedAt: optionalText(read(row, 'consumedAt', 'consumed_at')),
    consumedByStepId: optionalText(read(row, 'consumedByStepId', 'consumed_by_step_id')),
    expiresAt: text(read(row, 'expiresAt', 'expires_at')),
    createdBy: optionalText(read(row, 'createdBy', 'created_by')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json')),
    createdAt: text(read(row, 'createdAt', 'created_at')),
    updatedAt: text(read(row, 'updatedAt', 'updated_at')),
  };
}
