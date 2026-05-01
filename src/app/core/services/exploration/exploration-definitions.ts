import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import {
  EncounterDefinitionReadModel,
  ExplorationDifficultyTierReadModel,
  TrialDefinitionReadModel,
} from '../../domain/exploration/exploration-definition.model';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../../domain/item/item-generation-admin.model';
import { RewardProfileReadModel } from '../../domain/exploration/exploration-reward.model';
import { FilterOperator } from '../../enums/filter-operators';
import { BuildingDistrictOption, BuildingStatOption } from '../../types/building.types';
import { Row } from '../../types/supabase.types';
import { mapBuildingDistricts, mapBuildingStats } from '../../utils/building-admin-mappers';
import {
  mapEncounterDefinition,
  mapExplorationDifficultyTier,
  mapTrialDefinition,
} from '../../utils/exploration-definition-mappers';
import { mapRewardProfile } from '../../utils/exploration-reward-mappers';
import {
  mapEditableBucketProfile,
  mapEditableQuality,
} from '../../utils/item-generation-admin-mappers';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class ExplorationDefinitions {
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

  getActiveItemBucketProfiles(): Observable<EditableItemGenerationBucketProfile[]> {
    return this.backend
      .getAll<Row<'item_generation_bucket_profiles'>>({
        table: TABLES.item_generation_bucket_profiles,
        filters: {
          isActive: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: [
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapEditableBucketProfile)));
  }

  getEnabledItemQualities(): Observable<EditableItemGenerationQuality[]> {
    return this.backend
      .getAll<Row<'item_generation_qualities'>>({
        table: TABLES.item_generation_qualities,
        filters: {
          isEnabled: { operator: FilterOperator.EQ, value: true },
        },
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map((rows) => rows.map(mapEditableQuality)));
  }

  getDistrictOptions(): Observable<BuildingDistrictOption[]> {
    return this.backend
      .getAll<Row<'estate_districts'>>({
        table: TABLES.estate_districts,
        orderBy: [
          { column: 'rank', ascending: true },
          { column: 'code', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map(mapBuildingDistricts));
  }

  getStatOptions(): Observable<BuildingStatOption[]> {
    return this.backend
      .getAll<Pick<Row<'stats'>, 'key' | 'label'>>({
        table: TABLES.stats,
        orderBy: [
          { column: 'order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      })
      .pipe(map(mapBuildingStats));
  }
}
