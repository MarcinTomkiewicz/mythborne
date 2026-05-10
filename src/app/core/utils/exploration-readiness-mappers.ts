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
  booleanValue,
  jsonRecord,
  jsonValue,
  mapJsonArray,
  numberValue,
  optionalBoolean,
  optionalNumber,
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

export function mapExplorationStepSelectionDiagnosticJson(
  value: Json,
): ExplorationStepSelectionDiagnosticReadModel | null {
  const row = jsonRecord(value);

  if (!row) {
    return null;
  }

  const outcomeKind = toOutcomeKind(text(read(row, 'outcomeKind', 'outcome_kind')));
  const encounterReasonsJson = jsonValue(
    read(row, 'encounterReadinessReasonsJson', 'encounter_readiness_reasons_json'),
  );
  const encounterSkippedReason = optionalText(
    read(row, 'encounterSelectionSkippedReason', 'encounter_selection_skipped_reason'),
  );
  const selectedDefinition = selectedDefinitionForOutcome({
    outcomeKind,
    trialDefinitionId: optionalText(read(row, 'trialDefinitionId', 'trial_definition_id')),
    trialDefinitionKey: optionalText(read(row, 'trialDefinitionKey', 'trial_definition_key')),
    trialDefinitionReady: optionalBoolean(
      read(row, 'trialDefinitionReady', 'trial_definition_ready'),
    ),
    trialReasonsJson: jsonValue(
      read(row, 'trialReadinessReasonsJson', 'trial_readiness_reasons_json'),
    ),
    encounterDefinitionId: optionalText(
      read(row, 'encounterDefinitionId', 'encounter_definition_id'),
    ),
    encounterDefinitionKey: optionalText(
      read(row, 'encounterDefinitionKey', 'encounter_definition_key'),
    ),
    encounterDefinitionReady: optionalBoolean(
      read(row, 'encounterDefinitionReady', 'encounter_definition_ready'),
    ),
    encounterKind: optionalText(read(row, 'encounterKind', 'encounter_kind')),
    encounterReasonsJson,
  });

  return {
    stepId: text(read(row, 'stepId', 'step_id')),
    serverId: text(read(row, 'serverId', 'server_id')),
    heroId: text(read(row, 'heroId', 'hero_id')),
    explorationId: text(read(row, 'explorationId', 'exploration_id')),
    stepKind: text(read(row, 'stepKind', 'step_kind')),
    stepStatus: text(read(row, 'stepStatus', 'step_status')),
    resolutionAttemptId: optionalText(read(row, 'resolutionAttemptId', 'challenge_attempt_id')),
    resolutionAttemptStatus: optionalText(
      read(row, 'resolutionAttemptStatus', 'challenge_status'),
    ),
    rewardGrantId: optionalText(read(row, 'rewardGrantId', 'reward_grant_id')),
    outcomeKind,
    readinessGuarded: booleanValue(read(row, 'readinessGuarded', 'readiness_guarded')),
    forcedOverrideId: optionalText(read(row, 'forcedOverrideId', 'forced_override_id')),
    trialOpportunityChance: optionalNumber(
      read(row, 'trialOpportunityChance', 'trial_opportunity_chance'),
    ),
    trialOpportunityRoll: optionalNumber(
      read(row, 'trialOpportunityRoll', 'trial_opportunity_roll'),
    ),
    encounterChance: optionalNumber(read(row, 'encounterChance', 'encounter_chance')),
    encounterRoll: optionalNumber(read(row, 'encounterRoll', 'encounter_roll')),
    selectedDefinition,
    skippedDefinition: encounterSkippedReason
      ? {
          definitionKind: 'encounter',
          definitionId: optionalText(read(row, 'encounterDefinitionId', 'encounter_definition_id')),
          definitionKey: optionalText(
            read(row, 'encounterDefinitionKey', 'encounter_definition_key'),
          ),
          reasonKey: encounterSkippedReason,
          readinessReasons: mapReadinessReasons(encounterReasonsJson),
        }
      : null,
    finalOutcomeKind: selectedDefinition?.definitionKind ?? outcomeKind,
    selectedAt: optionalText(read(row, 'selectedAt', 'selected_at')),
    metadataJson: jsonValue(read(row, 'metadataJson', 'metadata_json', 'metadata')),
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
  return selectedDefinitionForOutcome({
    outcomeKind,
    trialDefinitionId: row.trial_definition_id,
    trialDefinitionKey: row.trial_definition_key,
    trialDefinitionReady: row.trial_definition_ready,
    trialReasonsJson: row.trial_readiness_reasons_json,
    encounterDefinitionId: row.encounter_definition_id,
    encounterDefinitionKey: row.encounter_definition_key,
    encounterDefinitionReady: row.encounter_definition_ready,
    encounterKind: row.encounter_kind,
    encounterReasonsJson: row.encounter_readiness_reasons_json,
  });
}

function selectedDefinitionForOutcome(input: {
  outcomeKind: ExplorationStepOutcomeKind;
  trialDefinitionId: string | null;
  trialDefinitionKey: string | null;
  trialDefinitionReady: boolean | null;
  trialReasonsJson: Json;
  encounterDefinitionId: string | null;
  encounterDefinitionKey: string | null;
  encounterDefinitionReady: boolean | null;
  encounterKind: string | null;
  encounterReasonsJson: Json;
}): ExplorationSelectedDefinitionReadModel | null {
  if (input.outcomeKind === 'trial') {
    return selectedDefinition({
      definitionKind: 'trial',
      definitionId: input.trialDefinitionId,
      definitionKey: input.trialDefinitionKey,
      isReady: input.trialDefinitionReady,
      encounterKind: null,
      readinessReasonsJson: input.trialReasonsJson,
    });
  }

  if (input.outcomeKind === 'encounter') {
    return selectedDefinition({
      definitionKind: 'encounter',
      definitionId: input.encounterDefinitionId,
      definitionKey: input.encounterDefinitionKey,
      isReady: input.encounterDefinitionReady,
      encounterKind: input.encounterKind,
      readinessReasonsJson: input.encounterReasonsJson,
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
