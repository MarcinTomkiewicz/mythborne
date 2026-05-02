import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { CombatOpponentAdminData } from '../../domain/combat/combat-opponent.model';
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
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class CombatOpponentAdmin {
  private readonly backend = inject(Backend);

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
