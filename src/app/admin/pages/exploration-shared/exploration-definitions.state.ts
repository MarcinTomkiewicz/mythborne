import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import {
  EncounterDefinitionReadModel,
  ExplorationDifficultyTierReadModel,
  TrialDefinitionReadModel,
} from '../../../core/domain/exploration/exploration-definition.model';
import { RewardProfileReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import {
  EditableItemGenerationBucketProfile,
  EditableItemGenerationQuality,
} from '../../../core/domain/item/item-generation-admin.model';
import { ExplorationDefinitions } from '../../../core/services/exploration/exploration-definitions';
import { BuildingDistrictOption, BuildingStatOption } from '../../../core/types/building.types';
import { SelectOption } from '../../../core/types/select-option.types';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText } from '../../../core/utils/normalize-text';

@Injectable()
export class ExplorationDefinitionsState {
  private readonly definitions = inject(ExplorationDefinitions);
  private readonly destroyRef = inject(DestroyRef);

  readonly difficulties = signal<ExplorationDifficultyTierReadModel[]>([]);
  readonly rewardProfiles = signal<RewardProfileReadModel[]>([]);
  readonly trialDefinitions = signal<TrialDefinitionReadModel[]>([]);
  readonly encounterDefinitions = signal<EncounterDefinitionReadModel[]>([]);
  readonly itemBucketProfiles = signal<EditableItemGenerationBucketProfile[]>([]);
  readonly itemQualities = signal<EditableItemGenerationQuality[]>([]);
  readonly districts = signal<BuildingDistrictOption[]>([]);
  readonly stats = signal<BuildingStatOption[]>([]);
  readonly isLoadingDefinitions = signal(false);
  readonly error = signal<string | null>(null);
  readonly difficultyOptions = computed(() =>
    this.difficulties().map((difficulty) => ({
      label: `${difficulty.label} (${difficulty.key})`,
      value: difficulty.key,
    })),
  );
  readonly districtOptions = computed<SelectOption[]>(() =>
    this.districts().map((district) => ({
      label: `${district.name} (${district.code})`,
      value: district.code,
    })),
  );
  readonly statOptions = computed<SelectOption[]>(() =>
    this.stats().map((stat) => ({
      label: `${stat.label} (${stat.key})`,
      value: stat.key,
    })),
  );
  readonly itemBucketOptions = computed<SelectOption[]>(() =>
    this.itemBucketProfiles().map((profile) => ({
      label: `${profile.name} (${profile.key})`,
      value: profile.id ?? profile.key,
    })),
  );
  readonly itemQualityOptions = computed<SelectOption[]>(() =>
    this.itemQualities().map((quality) => ({
      label: `${quality.label} (${quality.key})`,
      value: quality.key,
    })),
  );
  readonly hasActiveDifficulties = computed(() => this.difficulties().length > 0);

  loadDefinitions(): void {
    this.isLoadingDefinitions.set(true);
    this.error.set(null);
    forkJoin({
      difficulties: this.definitions.getActiveDifficultyTiers(),
      rewardProfiles: this.definitions.getActiveRewardProfiles(),
      trialDefinitions: this.definitions.getActiveTrialDefinitions(),
      encounterDefinitions: this.definitions.getActiveEncounterDefinitions(),
      itemBucketProfiles: this.definitions.getActiveItemBucketProfiles(),
      itemQualities: this.definitions.getEnabledItemQualities(),
      districts: this.definitions.getDistrictOptions(),
      stats: this.definitions.getStatOptions(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.difficulties.set(result.difficulties);
          this.rewardProfiles.set(result.rewardProfiles);
          this.trialDefinitions.set(result.trialDefinitions);
          this.encounterDefinitions.set(result.encounterDefinitions);
          this.itemBucketProfiles.set(result.itemBucketProfiles);
          this.itemQualities.set(result.itemQualities);
          this.districts.set(result.districts);
          this.stats.set(result.stats);
          this.isLoadingDefinitions.set(false);
        },
        error: (error: unknown) => {
          this.isLoadingDefinitions.set(false);
          this.error.set(getErrorMessage(error, 'Failed to load exploration definitions.'));
        },
      });
  }

  filterRewardProfiles(query: string): RewardProfileReadModel[] {
    return filterByQuery(this.rewardProfiles(), query, (entry) => [
      entry.key,
      entry.label,
      entry.category,
      entry.id,
    ]);
  }

  filterTrialDefinitions(query: string): TrialDefinitionReadModel[] {
    return filterByQuery(this.trialDefinitions(), query, (entry) => [
      entry.key,
      entry.label,
      entry.testedStatKey,
      entry.id,
    ]);
  }

  filterEncounterDefinitions(query: string): EncounterDefinitionReadModel[] {
    return filterByQuery(this.encounterDefinitions(), query, (entry) => [
      entry.key,
      entry.label,
      entry.encounterKind,
      entry.id,
    ]);
  }
}

function filterByQuery<T>(
  entries: readonly T[],
  query: string,
  values: (entry: T) => readonly (string | null | undefined)[],
): T[] {
  const normalized = trimText(query).toLowerCase();

  if (!normalized) {
    return entries.slice(0, 20);
  }

  return entries
    .filter((entry) =>
      values(entry).some((value) => trimText(value).toLowerCase().includes(normalized)),
    )
    .slice(0, 20);
}
