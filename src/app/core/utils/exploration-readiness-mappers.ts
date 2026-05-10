import {
  EncounterReadinessReadModel,
  ExplorationDefinitionKind,
  ExplorationReadinessReasonMetadataReadModel,
  ExplorationReadinessReasonReadModel,
  ExplorationReadinessStatusKey,
  ExplorationSelectedDefinitionReadModel,
  ExplorationSkippedDefinitionReadModel,
  ExplorationStepOutcomeKind,
  ExplorationStepSelectionDiagnosticReadModel,
  TrialReadinessReadModel,
} from '../domain/exploration/exploration-readiness.model';
import { Json } from '../types/database.types';
import {
  GetEncounterDefinitionReadinessRpcRow,
  GetExplorationStepSelectionDiagnosticRpcRow,
  GetTrialDefinitionReadinessRpcRow,
} from '../types/exploration-runtime-rpc.types';
import { Row } from '../types/supabase.types';
import {
  jsonValue,
  jsonRecord,
  mapJsonArray,
  numberValue,
  optionalBoolean,
  optionalText,
  read,
  text,
  JsonRecord,
} from './json-read';

type DefinitionReadinessRpcRow =
  | GetTrialDefinitionReadinessRpcRow
  | GetEncounterDefinitionReadinessRpcRow;

export function mapExplorationReadinessReasonMetadata(
  row: Row<'exploration_readiness_reason_codes'>,
): ExplorationReadinessReasonMetadataReadModel {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    severity: row.severity,
    isBlocking: row.is_blocking,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTrialReadiness(
  row: GetTrialDefinitionReadinessRpcRow,
): TrialReadinessReadModel {
  return {
    ...mapDefinitionReadiness(row, 'trial'),
    definitionKind: 'trial',
  };
}

export function mapEncounterReadiness(
  row: GetEncounterDefinitionReadinessRpcRow,
): EncounterReadinessReadModel {
  return {
    ...mapDefinitionReadiness(row, 'encounter'),
    definitionKind: 'encounter',
  };
}

export function mapExplorationStepSelectionDiagnostic(
  row: GetExplorationStepSelectionDiagnosticRpcRow,
): ExplorationStepSelectionDiagnosticReadModel {
  const outcomeKind = toOutcomeKind(row.outcome_kind);
  const selectedDefinition = mapSelectedDefinition(row, outcomeKind);
  const skippedDefinition = mapSkippedDefinition(row);

  return {
    stepId: row.step_id,
    serverId: row.server_id,
    heroId: row.hero_id,
    explorationId: row.exploration_id,
    stepKind: row.step_kind,
    stepStatus: row.step_status,
    resolutionAttemptId: nullableText(row.challenge_attempt_id),
    resolutionAttemptStatus: nullableText(row.challenge_status),
    rewardGrantId: nullableText(row.reward_grant_id),
    outcomeKind,
    readinessGuarded: row.readiness_guarded,
    forcedOverrideId: nullableText(row.forced_override_id),
    trialOpportunityChance: nullableNumber(row.trial_opportunity_chance),
    trialOpportunityRoll: nullableNumber(row.trial_opportunity_roll),
    encounterChance: nullableNumber(row.encounter_chance),
    encounterRoll: nullableNumber(row.encounter_roll),
    selectedDefinition,
    skippedDefinition,
    finalOutcomeKind: selectedDefinition?.definitionKind ?? outcomeKind,
    selectedAt: readSelectedAt(row.metadata_json),
    metadataJson: row.metadata_json,
  };
}

function mapDefinitionReadiness(
  row: DefinitionReadinessRpcRow,
  definitionKind: ExplorationDefinitionKind,
) {
  const isActive = row.is_active;
  const isReady = row.is_ready;

  return {
    definitionKind,
    definitionId: row.definition_id,
    definitionKey: row.definition_key,
    isActive,
    isReady,
    statusKey: toReadinessStatus(isActive, isReady),
    minigameKey: nullableText(row.minigame_key),
    encounterKind: nullableText(row.encounter_kind),
    combatCandidateCount: row.combat_candidate_count,
    rewardAssignmentCount: row.reward_assignment_count,
    effectPayloadCount: row.effect_payload_count,
    blockingReasonCount: row.blocking_reason_count,
    reasons: mapReadinessReasons(row.reasons_json),
    metadataJson: row.metadata_json,
  };
}

function mapSelectedDefinition(
  row: GetExplorationStepSelectionDiagnosticRpcRow,
  outcomeKind: ExplorationStepOutcomeKind,
): ExplorationSelectedDefinitionReadModel | null {
  if (outcomeKind === 'trial') {
    return selectedDefinition({
      definitionKind: 'trial',
      definitionId: row.trial_definition_id,
      definitionKey: row.trial_definition_key,
      isReady: row.trial_definition_ready,
      encounterKind: null,
      readinessReasonsJson: row.trial_readiness_reasons_json,
    });
  }

  if (outcomeKind === 'encounter') {
    return selectedDefinition({
      definitionKind: 'encounter',
      definitionId: row.encounter_definition_id,
      definitionKey: row.encounter_definition_key,
      isReady: row.encounter_definition_ready,
      encounterKind: row.encounter_kind,
      readinessReasonsJson: row.encounter_readiness_reasons_json,
    });
  }

  return null;
}

function selectedDefinition(input: {
  definitionKind: Exclude<ExplorationStepOutcomeKind, 'nothing'>;
  definitionId: string | null;
  definitionKey: string | null;
  isReady: boolean | null;
  encounterKind: string | null;
  readinessReasonsJson: Json;
}): ExplorationSelectedDefinitionReadModel | null {
  const definitionId = nullableText(input.definitionId);
  const definitionKey = nullableText(input.definitionKey);

  if (!definitionId || !definitionKey) {
    return null;
  }

  return {
    definitionKind: input.definitionKind,
    definitionId,
    definitionKey,
    isReady: input.isReady === true,
    encounterKind: nullableText(input.encounterKind),
    readinessReasons: mapReadinessReasons(input.readinessReasonsJson),
  };
}

function mapSkippedDefinition(
  row: GetExplorationStepSelectionDiagnosticRpcRow,
): ExplorationSkippedDefinitionReadModel | null {
  if (!row.encounter_selection_skipped_reason) {
    return null;
  }

  return {
    definitionKind: 'encounter',
    definitionId: nullableText(row.encounter_definition_id),
    definitionKey: nullableText(row.encounter_definition_key),
    reasonKey: row.encounter_selection_skipped_reason,
    readinessReasons: mapReadinessReasons(row.encounter_readiness_reasons_json),
  };
}

function mapReadinessReasons(value: Json): ExplorationReadinessReasonReadModel[] {
  return mapJsonArray(value, mapReadinessReason);
}

function mapReadinessReason(row: JsonRecord): ExplorationReadinessReasonReadModel {
  return {
    key: text(read(row, 'key', 'reasonKey', 'reason_key', 'code')),
    label: optionalText(read(row, 'label')),
    description: optionalText(read(row, 'description', 'helperText', 'helper_text')),
    severity: optionalText(read(row, 'severity')),
    isBlocking: optionalBoolean(read(row, 'isBlocking', 'is_blocking', 'blocking')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json', 'metadata')),
  };
}

function toReadinessStatus(
  isActive: boolean,
  isReady: boolean,
): ExplorationReadinessStatusKey {
  if (!isActive) {
    return 'inactive';
  }

  return isReady ? 'ready' : 'incomplete';
}

function toOutcomeKind(value: string): ExplorationStepOutcomeKind {
  return value === 'trial' || value === 'encounter' ? value : 'nothing';
}

function readSelectedAt(value: Json): string | null {
  return optionalText(
    read(
      jsonRecord(value),
      'selectedAt',
      'selected_at',
      'resolvedAt',
      'resolved_at',
    ),
  );
}

function nullableText(value: string | null): string | null {
  return value === '' ? null : value;
}

function nullableNumber(value: number | null): number | null {
  return value === null ? null : numberValue(value);
}
