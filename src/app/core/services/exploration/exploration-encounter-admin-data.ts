import { forkJoin, map, Observable } from 'rxjs';
import {
  ENCOUNTER_CONFIGURATOR_FIELD_METADATA_KEYS,
  ENCOUNTER_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
  ENCOUNTER_CONFIGURATOR_SECTION_METADATA_KEYS,
  ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
} from '../../constants/exploration-encounter-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { ExplorationEncounterAdminData } from '../../domain/exploration/exploration-encounter-admin.model';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { Row } from '../../types/supabase.types';
import { mapBuildingDistricts } from '../../utils/building-admin-mappers';
import { mapCanonicalBonusTemplate } from '../../utils/bonus-governance';
import {
  mapEncounterDefinition,
  mapExplorationDifficultyTier,
  mapExplorationMinigameDefinition,
} from '../../utils/exploration-definition-mappers';
import { mapEncounterCombatCandidate } from '../../utils/exploration-encounter-admin-mappers';
import {
  mapEncounterEffectPayload,
  mapEncounterResourcePayload,
  mapExplorationEffectDefinition,
} from '../../utils/exploration-encounter-payload-admin-mappers';
import {
  mapCombatOpponentDefinition,
  mapCombatOpponentFamily,
} from '../../utils/combat-opponent-admin-mappers';
import {
  mapRewardProfile,
  mapRewardProfileEntry,
  mapRewardOutcomeKind,
  mapRewardProfileAssignment,
  mapRewardDictionary,
  mapResourceType,
} from '../../utils/exploration-reward-mappers';
import { mapBalanceFormula } from '../../utils/formula-admin-mappers';
import { Backend } from '../backend/backend';

export function getExplorationEncounterAdminData(
  backend: Backend,
): Observable<ExplorationEncounterAdminData> {
  return forkJoin({
    encounters: getRows<Row<'encounter_definitions'>>(backend, TABLES.encounter_definitions, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    minigames: getRows<Row<'exploration_minigame_definitions'>>(backend, TABLES.exploration_minigame_definitions, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    difficulties: getRows<Row<'exploration_difficulty_tiers'>>(backend, TABLES.exploration_difficulty_tiers, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    districts: getRows<Row<'estate_districts'>>(backend, TABLES.estate_districts, [
      { column: 'rank', ascending: true },
      { column: 'code', ascending: true },
    ]),
    rewardProfiles: getRows<Row<'reward_profiles'>>(backend, TABLES.reward_profiles, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    rewardProfileEntries: getRows<Row<'reward_profile_entries'>>(backend, TABLES.reward_profile_entries, [
      { column: 'reward_profile_id', ascending: true },
      { column: 'sort_order', ascending: true },
      { column: 'label', ascending: true },
    ]),
    rewardOutcomeKinds: getRows<Row<'reward_outcome_kinds'>>(backend, TABLES.reward_outcome_kinds, [
      { column: 'source_kind', ascending: true },
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    resourceTypes: getRows<Row<'resource_types'>>(backend, TABLES.resource_types, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    rewardAssignmentMatchKinds: getRows<Row<'reward_assignment_match_kinds'>>(backend, TABLES.reward_assignment_match_kinds, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    rewardSourceKinds: getRows<Row<'reward_source_kinds'>>(backend, TABLES.reward_source_kinds, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    rewardEntryKinds: getRows<Row<'reward_entry_kinds'>>(backend, TABLES.reward_entry_kinds, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    rewardEntryAmountModes: getRows<Row<'reward_entry_amount_modes'>>(backend, TABLES.reward_entry_amount_modes, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    rewardAssignments: getRows<Row<'reward_profile_assignments'>>(backend, TABLES.reward_profile_assignments, [
      { column: 'sort_order', ascending: true },
      { column: 'id', ascending: true },
    ]),
    combatCandidates: getRows<Row<'encounter_combat_candidates'>>(backend, TABLES.encounter_combat_candidates, [
      { column: 'sort_order', ascending: true },
      { column: 'id', ascending: true },
    ]),
    resourcePayloads: getRows<Row<'encounter_resource_payloads'>>(backend, TABLES.encounter_resource_payloads, [
      { column: 'sort_order', ascending: true },
      { column: 'id', ascending: true },
    ]),
    effectPayloads: getRows<Row<'encounter_effect_payloads'>>(backend, TABLES.encounter_effect_payloads, [
      { column: 'sort_order', ascending: true },
      { column: 'id', ascending: true },
    ]),
    effectDefinitions: getRows<Row<'exploration_effect_definitions'>>(backend, TABLES.exploration_effect_definitions, [
      { column: 'effect_kind', ascending: true },
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    bonusTemplates: getRows<Row<'bonus_templates'>>(backend, TABLES.bonus_templates, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    opponents: getRows<Row<'combat_opponent_definitions'>>(backend, TABLES.combat_opponent_definitions, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    families: getRows<Row<'combat_opponent_families'>>(backend, TABLES.combat_opponent_families, [
      { column: 'sort_order', ascending: true },
      { column: 'key', ascending: true },
    ]),
    formulas: getRows<Row<'balance_formulas'>>(backend, TABLES.balance_formulas, [
      { column: 'scope_key', ascending: true },
      { column: 'key', ascending: true },
    ]),
    uiMetadataEntries: getEncounterConfiguratorUiMetadata(backend),
  }).pipe(
    map((data) => ({
      encounters: data.encounters.map(mapEncounterDefinition),
      minigames: data.minigames.map(mapExplorationMinigameDefinition),
      difficulties: data.difficulties.map(mapExplorationDifficultyTier),
      districts: mapBuildingDistricts(data.districts),
      rewardProfiles: data.rewardProfiles.map(mapRewardProfile),
      rewardProfileEntries: data.rewardProfileEntries.map(mapRewardProfileEntry),
      rewardOutcomeKinds: data.rewardOutcomeKinds.map(mapRewardOutcomeKind),
      resourceTypes: data.resourceTypes.map(mapResourceType),
      rewardAssignmentMatchKinds: data.rewardAssignmentMatchKinds.map(mapRewardDictionary),
      rewardSourceKinds: data.rewardSourceKinds.map(mapRewardDictionary),
      rewardEntryKinds: data.rewardEntryKinds.map(mapRewardDictionary),
      rewardEntryAmountModes: data.rewardEntryAmountModes.map(mapRewardDictionary),
      rewardAssignments: data.rewardAssignments.map(mapRewardProfileAssignment),
      combatCandidates: data.combatCandidates.map(mapEncounterCombatCandidate),
      resourcePayloads: data.resourcePayloads.map(mapEncounterResourcePayload),
      effectPayloads: data.effectPayloads.map(mapEncounterEffectPayload),
      effectDefinitions: data.effectDefinitions.map(mapExplorationEffectDefinition),
      bonusTemplates: data.bonusTemplates.map(mapCanonicalBonusTemplate),
      opponents: data.opponents.map(mapCombatOpponentDefinition),
      families: data.families.map(mapCombatOpponentFamily),
      formulas: data.formulas.map(mapBalanceFormula),
      uiMetadataEntries: data.uiMetadataEntries,
    })),
  );
}

function getRows<T extends object>(
  backend: Backend,
  table: string,
  orderBy: Array<{ column: string; ascending: boolean }>,
) {
  return backend.getAll<T>({
    table,
    orderBy,
    camelCase: false,
  });
}

function getEncounterConfiguratorUiMetadata(backend: Backend) {
  return forkJoin([
    getUiMetadataEntries(
      backend,
      ENCOUNTER_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      ENCOUNTER_CONFIGURATOR_SECTION_METADATA_KEYS,
    ),
    getUiMetadataEntries(
      backend,
      ENCOUNTER_CONFIGURATOR_FIELD_METADATA_NAMESPACE,
      ENCOUNTER_CONFIGURATOR_FIELD_METADATA_KEYS,
    ),
  ]).pipe(map(([sections, fields]) => [...sections, ...fields].map(mapUiMetadataEntry)));
}

function getUiMetadataEntries(
  backend: Backend,
  namespace: string,
  keys: readonly string[],
) {
  return backend.rpc<Row<'ui_metadata_entries'>[]>(RPC.get_ui_metadata_entries, {
    p_namespace: namespace,
    p_keys: [...keys],
    p_include_inactive: false,
  });
}
