import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  CombatOpponentAdminData,
  CombatOpponentAttackSourceDraft,
  CombatOpponentDefinitionDraft,
  CombatOpponentEquipmentEntryDraft,
  CombatOpponentFamilyDraft,
  CombatOpponentStatValueDraft,
} from '../../domain/combat/combat-opponent.model';
import {
  mapCombatDictionary,
  mapCombatOpponentAttackSource,
  mapCombatOpponentDefinition,
  mapCombatOpponentEquipmentEntry,
  mapCombatOpponentEquipmentMode,
  mapCombatOpponentFamily,
  mapCombatOpponentStatValue,
  mapCombatStatDefinition,
  mapEquipmentSlotDefinition,
  toCombatOpponentAdminViews,
} from '../../utils/combat-opponent-admin-mappers';
import {
  toDeactivateCombatOpponentAttackSourceRpcArgs,
  toDeactivateCombatOpponentDefinitionRpcArgs,
  toDeactivateCombatOpponentEquipmentEntryRpcArgs,
  toDeactivateCombatOpponentFamilyRpcArgs,
  toDeleteCombatOpponentStatValueRpcArgs,
  toUpsertCombatOpponentAttackSourceRpcArgs,
  toUpsertCombatOpponentDefinitionRpcArgs,
  toUpsertCombatOpponentEquipmentEntryRpcArgs,
  toUpsertCombatOpponentFamilyRpcArgs,
  toUpsertCombatOpponentStatValueRpcArgs,
} from '../../utils/combat-opponent-admin-rpc';
import { mapUiMetadataEntry } from '../../utils/admin-ui-metadata';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { ItemGenerationAdminService } from '../items/item-generation-admin';
import {
  COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
} from '../../constants/combat-opponent-ui-metadata.const';

@Injectable({ providedIn: 'root' })
export class CombatOpponentAdmin {
  private readonly backend = inject(Backend);
  private readonly formulas = inject(FormulaService);
  private readonly itemGeneration = inject(ItemGenerationAdminService);

  getAdminData(): Observable<CombatOpponentAdminData> {
    return forkJoin({
      families: getRows<Row<'combat_opponent_families'>>(
        this.backend,
        TABLES.combat_opponent_families,
        [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      opponents: getRows<Row<'combat_opponent_definitions'>>(
        this.backend,
        TABLES.combat_opponent_definitions,
        [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      statValues: getRows<Row<'combat_opponent_stat_values'>>(
        this.backend,
        TABLES.combat_opponent_stat_values,
        [
          { column: 'opponent_definition_id', ascending: true },
          { column: 'sort_order', ascending: true },
          { column: 'stat_key', ascending: true },
        ],
      ),
      attackSources: getRows<Row<'combat_opponent_attack_sources'>>(
        this.backend,
        TABLES.combat_opponent_attack_sources,
        [
          { column: 'opponent_definition_id', ascending: true },
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      equipmentEntries: getRows<Row<'combat_opponent_equipment_entries'>>(
        this.backend,
        TABLES.combat_opponent_equipment_entries,
        [
          { column: 'opponent_definition_id', ascending: true },
          { column: 'sort_order', ascending: true },
          { column: 'slot_key', ascending: true },
        ],
      ),
      equipmentModes: getRows<Row<'combat_opponent_equipment_mode_definitions'>>(
        this.backend,
        TABLES.combat_opponent_equipment_mode_definitions,
        [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      equipmentSlots: getRows<Row<'equipment_slot_definitions'>>(
        this.backend,
        TABLES.equipment_slot_definitions,
        [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
      ),
      stats: getRows<Row<'stats'>>(this.backend, TABLES.stats, [
        { column: 'order', ascending: true },
        { column: 'key', ascending: true },
      ]),
      sourceTypes: dictionaryRows<Row<'combat_source_type_definitions'>>(
        this.backend,
        TABLES.combat_source_type_definitions,
      ),
      sides: dictionaryRows<Row<'combat_side_definitions'>>(
        this.backend,
        TABLES.combat_side_definitions,
      ),
      outcomes: dictionaryRows<Row<'combat_outcome_definitions'>>(
        this.backend,
        TABLES.combat_outcome_definitions,
      ),
      participantKinds: dictionaryRows<Row<'combat_participant_kind_definitions'>>(
        this.backend,
        TABLES.combat_participant_kind_definitions,
      ),
      attackSourceKinds: dictionaryRows<Row<'combat_attack_source_kind_definitions'>>(
        this.backend,
        TABLES.combat_attack_source_kind_definitions,
      ),
      candidateKinds: dictionaryRows<Row<'combat_candidate_kind_definitions'>>(
        this.backend,
        TABLES.combat_candidate_kind_definitions,
      ),
      formulaData: this.formulas.getAdminData(),
      itemCatalog: this.itemGeneration.getCatalogData(),
      itemBalance: this.itemGeneration.getBalanceData(),
      uiMetadataEntries: getUiMetadataEntries(this.backend),
    }).pipe(
      map((rows) => {
        const data = {
          families: rows.families.map(mapCombatOpponentFamily),
          opponents: rows.opponents.map(mapCombatOpponentDefinition),
          statValues: rows.statValues.map(mapCombatOpponentStatValue),
          attackSources: rows.attackSources.map(mapCombatOpponentAttackSource),
          equipmentEntries: rows.equipmentEntries.map(mapCombatOpponentEquipmentEntry),
          equipmentModes: rows.equipmentModes.map(mapCombatOpponentEquipmentMode),
          equipmentSlots: rows.equipmentSlots.map(mapEquipmentSlotDefinition),
          stats: rows.stats.map(mapCombatStatDefinition),
          dictionaries: {
            sourceTypes: rows.sourceTypes.map(mapCombatDictionary),
            sides: rows.sides.map(mapCombatDictionary),
            outcomes: rows.outcomes.map(mapCombatDictionary),
            participantKinds: rows.participantKinds.map(mapCombatDictionary),
            attackSourceKinds: rows.attackSourceKinds.map(mapCombatDictionary),
            candidateKinds: rows.candidateKinds.map(mapCombatDictionary),
          },
          formulas: rows.formulaData.formulas,
          formulaTargets: rows.formulaData.targets,
          assignments: rows.formulaData.assignments,
          itemCatalog: {
            bases: rows.itemCatalog.bases,
            prefixes: rows.itemCatalog.prefixes,
            suffixes: rows.itemCatalog.suffixes,
          },
          itemBalance: {
            qualities: rows.itemBalance.qualities,
            bucketProfiles: rows.itemBalance.bucketProfiles,
          },
          uiMetadataEntries: rows.uiMetadataEntries.map(mapUiMetadataEntry),
        };

        return {
          ...data,
          opponentViews: toCombatOpponentAdminViews(data),
          emptyState: data.families.length === 0 && data.opponents.length === 0
            ? {
                kind: 'empty_opponent_catalog',
                message: 'No combat opponent families or definitions are configured yet.',
              }
            : null,
        };
      }),
    );
  }

  saveFamily(input: CombatOpponentFamilyDraft) {
    return this.backend
      .rpc<Row<'combat_opponent_families'>>(
        RPC.upsert_combat_opponent_family,
        toUpsertCombatOpponentFamilyRpcArgs(input),
      )
      .pipe(map(mapCombatOpponentFamily));
  }

  deactivateFamily(familyKey: string, reason: string) {
    return this.backend
      .rpc<Row<'combat_opponent_families'>>(
        RPC.deactivate_combat_opponent_family,
        toDeactivateCombatOpponentFamilyRpcArgs(familyKey, reason),
      )
      .pipe(map(mapCombatOpponentFamily));
  }

  saveDefinition(input: CombatOpponentDefinitionDraft) {
    return this.backend
      .rpc<Row<'combat_opponent_definitions'>>(
        RPC.upsert_combat_opponent_definition,
        toUpsertCombatOpponentDefinitionRpcArgs(input),
      )
      .pipe(map(mapCombatOpponentDefinition));
  }

  deactivateDefinition(opponentDefinitionId: string, reason: string) {
    return this.backend
      .rpc<Row<'combat_opponent_definitions'>>(
        RPC.deactivate_combat_opponent_definition,
        toDeactivateCombatOpponentDefinitionRpcArgs(opponentDefinitionId, reason),
      )
      .pipe(map(mapCombatOpponentDefinition));
  }

  saveStatValue(input: CombatOpponentStatValueDraft) {
    return this.backend
      .rpc<Row<'combat_opponent_stat_values'>>(
        RPC.upsert_combat_opponent_stat_value,
        toUpsertCombatOpponentStatValueRpcArgs(input),
      )
      .pipe(map(mapCombatOpponentStatValue));
  }

  deleteStatValue(statValueId: string, reason: string) {
    return this.backend
      .rpc<Row<'combat_opponent_stat_values'>>(
        RPC.delete_combat_opponent_stat_value,
        toDeleteCombatOpponentStatValueRpcArgs(statValueId, reason),
      )
      .pipe(map(mapCombatOpponentStatValue));
  }

  saveAttackSource(input: CombatOpponentAttackSourceDraft) {
    return this.backend
      .rpc<Row<'combat_opponent_attack_sources'>>(
        RPC.upsert_combat_opponent_attack_source,
        toUpsertCombatOpponentAttackSourceRpcArgs(input),
      )
      .pipe(map(mapCombatOpponentAttackSource));
  }

  deactivateAttackSource(attackSourceId: string, reason: string) {
    return this.backend
      .rpc<Row<'combat_opponent_attack_sources'>>(
        RPC.deactivate_combat_opponent_attack_source,
        toDeactivateCombatOpponentAttackSourceRpcArgs(attackSourceId, reason),
      )
      .pipe(map(mapCombatOpponentAttackSource));
  }

  saveEquipmentEntry(input: CombatOpponentEquipmentEntryDraft) {
    return this.backend
      .rpc<Row<'combat_opponent_equipment_entries'>>(
        RPC.upsert_combat_opponent_equipment_entry,
        toUpsertCombatOpponentEquipmentEntryRpcArgs(input),
      )
      .pipe(map(mapCombatOpponentEquipmentEntry));
  }

  deactivateEquipmentEntry(equipmentEntryId: string, reason: string) {
    return this.backend
      .rpc<Row<'combat_opponent_equipment_entries'>>(
        RPC.deactivate_combat_opponent_equipment_entry,
        toDeactivateCombatOpponentEquipmentEntryRpcArgs(equipmentEntryId, reason),
      )
      .pipe(map(mapCombatOpponentEquipmentEntry));
  }
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

function dictionaryRows<T extends object>(backend: Backend, table: string) {
  return getRows<T>(backend, table, [
    { column: 'sort_order', ascending: true },
    { column: 'key', ascending: true },
  ]);
}

function getUiMetadataEntries(backend: Backend) {
  return backend.rpc<Row<'ui_metadata_entries'>[]>(RPC.get_ui_metadata_entries, {
    p_namespace: COMBAT_OPPONENT_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  });
}
