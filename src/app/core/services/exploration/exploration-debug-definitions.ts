import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  EncounterDefinitionReadModel,
  ExplorationDifficultyTierReadModel,
  TrialDefinitionReadModel,
} from '../../domain/exploration/exploration-definition.model';
import { RewardProfileReadModel } from '../../domain/exploration/exploration-reward.model';
import { FilterOperator } from '../../enums/filter-operators';
import { Row } from '../../types/supabase.types';
import {
  mapEncounterDefinition,
  mapExplorationDifficultyTier,
  mapTrialDefinition,
} from '../../utils/exploration-definition-mappers';
import { mapRewardProfile } from '../../utils/exploration-reward-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ExplorationDebugDefinitions {
  private readonly backend = inject(Backend);

  getActiveDifficultyTiers(): Observable<ExplorationDifficultyTierReadModel[]> {
    return this.backend
      .getAll<Row<'exploration_difficulty_tiers'>>({
        table: TABLES.exploration_difficulty_tiers,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapExplorationDifficultyTier)));
  }

  getActiveRewardProfiles(): Observable<RewardProfileReadModel[]> {
    return this.backend
      .getAll<Row<'reward_profiles'>>({
        table: TABLES.reward_profiles,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapRewardProfile)));
  }

  getActiveTrialDefinitions(): Observable<TrialDefinitionReadModel[]> {
    return this.backend
      .getAll<Row<'trial_definitions'>>({
        table: TABLES.trial_definitions,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapTrialDefinition)));
  }

  getActiveEncounterDefinitions(): Observable<EncounterDefinitionReadModel[]> {
    return this.backend
      .getAll<Row<'encounter_definitions'>>({
        table: TABLES.encounter_definitions,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapEncounterDefinition)));
  }
}
