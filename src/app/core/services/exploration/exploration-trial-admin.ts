import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import {
  ExplorationTrialAdminData,
  TrialCombatCandidateReadModel,
  UpsertTrialCombatCandidateInput,
  UpsertTrialDefinitionInput,
} from '../../domain/exploration/exploration-trial-admin.model';
import { TrialDefinitionReadModel } from '../../domain/exploration/exploration-definition.model';
import { mapBuildingStats } from '../../utils/building-admin-mappers';
import {
  mapExplorationMinigameDefinition,
  mapTrialDefinition,
} from '../../utils/exploration-definition-mappers';
import {
  mapCombatOpponentDefinition,
  mapCombatOpponentFamily,
  mapTrialCombatCandidate,
} from '../../utils/exploration-trial-admin-mappers';
import {
  toDeactivateTrialCombatCandidateRpcArgs,
  toUpsertTrialCombatCandidateRpcArgs,
  toUpsertTrialDefinitionRpcArgs,
} from '../../utils/exploration-trial-admin-rpc';
import { mapBalanceFormula } from '../../utils/formula-admin-mappers';
import { Database } from '../../types/database.types';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ExplorationTrialAdmin {
  private readonly backend = inject(Backend);

  getAdminData(): Observable<ExplorationTrialAdminData> {
    return forkJoin({
      trials: this.backend.getAll<Row<'trial_definitions'>>({
        table: TABLES.trial_definitions,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      minigames: this.backend.getAll<Row<'exploration_minigame_definitions'>>({
        table: TABLES.exploration_minigame_definitions,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      stats: this.backend.getAll<Pick<Row<'stats'>, 'key' | 'label'>>({
        table: TABLES.stats,
        orderBy: [
          { column: 'order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      combatCandidates: this.backend.getAll<Row<'trial_combat_candidates'>>({
        table: TABLES.trial_combat_candidates,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'id', ascending: true },
        ],
        camelCase: false,
      }),
      opponents: this.backend.getAll<Row<'combat_opponent_definitions'>>({
        table: TABLES.combat_opponent_definitions,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      families: this.backend.getAll<Row<'combat_opponent_families'>>({
        table: TABLES.combat_opponent_families,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
      formulas: this.backend.getAll<Row<'balance_formulas'>>({
        table: TABLES.balance_formulas,
        orderBy: [
          { column: 'scope_key', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
    }).pipe(
      map((data) => ({
        trials: data.trials.map(mapTrialDefinition),
        minigames: data.minigames.map(mapExplorationMinigameDefinition),
        stats: mapBuildingStats(data.stats),
        combatCandidates: data.combatCandidates.map(mapTrialCombatCandidate),
        opponents: data.opponents.map(mapCombatOpponentDefinition),
        families: data.families.map(mapCombatOpponentFamily),
        formulas: data.formulas.map(mapBalanceFormula),
      })),
    );
  }

  upsertTrialDefinition(
    input: UpsertTrialDefinitionInput,
  ): Observable<TrialDefinitionReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_trial_definition']['Returns']>(
        RPC.upsert_trial_definition,
        toUpsertTrialDefinitionRpcArgs(input),
      )
      .pipe(map(mapTrialDefinition));
  }

  upsertTrialCombatCandidate(
    input: UpsertTrialCombatCandidateInput,
  ): Observable<TrialCombatCandidateReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['upsert_trial_combat_candidate']['Returns']>(
        RPC.upsert_trial_combat_candidate,
        toUpsertTrialCombatCandidateRpcArgs(input),
      )
      .pipe(map(mapTrialCombatCandidate));
  }

  deactivateTrialCombatCandidate(
    candidateId: string,
    reason: string,
  ): Observable<TrialCombatCandidateReadModel> {
    return this.backend
      .rpc<Database['public']['Functions']['deactivate_trial_combat_candidate']['Returns']>(
        RPC.deactivate_trial_combat_candidate,
        toDeactivateTrialCombatCandidateRpcArgs(candidateId, reason),
      )
      .pipe(map(mapTrialCombatCandidate));
  }
}
