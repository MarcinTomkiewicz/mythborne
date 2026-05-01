import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import {
  EncounterDefinitionReadModel,
  ExplorationDifficultyTierReadModel,
  TrialDefinitionReadModel,
} from '../../../core/domain/exploration/exploration-definition.model';
import { RewardProfileReadModel } from '../../../core/domain/exploration/exploration-reward.model';
import { ExplorationDebugDefinitions } from '../../../core/services/exploration/exploration-debug-definitions';
import { getErrorMessage } from '../../../core/utils/error-message';
import { trimText } from '../../../core/utils/normalize-text';
import { ExplorationDebugFeedbackState } from './exploration-debug-feedback.state';

@Injectable()
export class ExplorationDebugDefinitionsState {
  private readonly definitions = inject(ExplorationDebugDefinitions);
  private readonly feedback = inject(ExplorationDebugFeedbackState);
  private readonly destroyRef = inject(DestroyRef);

  readonly difficulties = signal<ExplorationDifficultyTierReadModel[]>([]);
  readonly rewardProfiles = signal<RewardProfileReadModel[]>([]);
  readonly trialDefinitions = signal<TrialDefinitionReadModel[]>([]);
  readonly encounterDefinitions = signal<EncounterDefinitionReadModel[]>([]);
  readonly isLoadingDefinitions = signal(false);
  readonly difficultyOptions = computed(() =>
    this.difficulties().map((difficulty) => ({
      label: `${difficulty.label} (${difficulty.key})`,
      value: difficulty.key,
    })),
  );
  readonly hasActiveDifficulties = computed(() => this.difficulties().length > 0);

  loadDefinitions(): void {
    this.isLoadingDefinitions.set(true);
    forkJoin({
      difficulties: this.definitions.getActiveDifficultyTiers(),
      rewardProfiles: this.definitions.getActiveRewardProfiles(),
      trialDefinitions: this.definitions.getActiveTrialDefinitions(),
      encounterDefinitions: this.definitions.getActiveEncounterDefinitions(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.difficulties.set(result.difficulties);
          this.rewardProfiles.set(result.rewardProfiles);
          this.trialDefinitions.set(result.trialDefinitions);
          this.encounterDefinitions.set(result.encounterDefinitions);
          this.isLoadingDefinitions.set(false);
        },
        error: (error: unknown) => {
          this.isLoadingDefinitions.set(false);
          this.feedback.error.set(
            getErrorMessage(error, 'Failed to load exploration debug definitions.'),
          );
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
