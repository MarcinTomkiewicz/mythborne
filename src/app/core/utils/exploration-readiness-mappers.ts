import {
  EncounterReadinessReadModel,
  ExplorationDefinitionKind,
  ExplorationDefinitionReadinessReadModel,
  ExplorationReadinessReasonMetadataReadModel,
  ExplorationReadinessReasonReadModel,
  ExplorationReadinessStatusKey,
  TrialReadinessReadModel,
} from '../domain/exploration/exploration-readiness.model';
import { Json } from '../types/database.types';
import {
  DefinitionReadinessRpcRow,
  GetEncounterDefinitionReadinessRpcRow,
  GetTrialDefinitionReadinessRpcRow,
} from '../types/exploration-runtime-rpc.types';
import { Row } from '../types/supabase.types';
import {
  jsonValue,
  mapJsonArray,
  optionalBoolean,
  optionalText,
  read,
  text,
  JsonRecord,
} from './json-read';

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

function mapDefinitionReadiness(
  row: DefinitionReadinessRpcRow,
  definitionKind: ExplorationDefinitionKind,
): ExplorationDefinitionReadinessReadModel {
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

function nullableText(value: string | null): string | null {
  return value === '' ? null : value;
}
