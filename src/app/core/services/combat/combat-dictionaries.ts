import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { CombatDisplayDictionaries } from '../../domain/combat/combat-dictionary.model';
import { Row } from '../../types/supabase.types';
import { mapCombatDictionary } from '../../utils/combat-opponent-admin-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class CombatDictionariesService {
  private readonly backend = inject(Backend);

  getCombatDictionaries(): Observable<CombatDisplayDictionaries> {
    return forkJoin({
      sourceTypes: this.backend.getAll<Row<'combat_source_type_definitions'>>({
        table: TABLES.combat_source_type_definitions,
        sortBy: 'sort_order',
        camelCase: false,
      }),
      sides: this.backend.getAll<Row<'combat_side_definitions'>>({
        table: TABLES.combat_side_definitions,
        sortBy: 'sort_order',
        camelCase: false,
      }),
      outcomes: this.backend.getAll<Row<'combat_outcome_definitions'>>({
        table: TABLES.combat_outcome_definitions,
        sortBy: 'sort_order',
        camelCase: false,
      }),
      participantKinds: this.backend.getAll<Row<'combat_participant_kind_definitions'>>({
        table: TABLES.combat_participant_kind_definitions,
        sortBy: 'sort_order',
        camelCase: false,
      }),
      attackSourceKinds: this.backend.getAll<Row<'combat_attack_source_kind_definitions'>>({
        table: TABLES.combat_attack_source_kind_definitions,
        sortBy: 'sort_order',
        camelCase: false,
      }),
    }).pipe(
      map((data) => ({
        sourceTypes: data.sourceTypes.map(mapCombatDictionary),
        sides: data.sides.map(mapCombatDictionary),
        outcomes: data.outcomes.map(mapCombatDictionary),
        participantKinds: data.participantKinds.map(mapCombatDictionary),
        attackSourceKinds: data.attackSourceKinds.map(mapCombatDictionary),
      })),
    );
  }
}
