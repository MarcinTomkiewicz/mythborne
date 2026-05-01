import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { ExplorationChallengeRewardReadModel } from '../../domain/exploration/exploration-reward.model';
import { FilterOperator } from '../../enums/filter-operators';
import { FilterDefinition } from '../../interfaces/i-filter';
import { Row } from '../../types/supabase.types';
import { mapRewardGrant, mapRewardGrantEntry } from '../../utils/exploration-reward-mappers';
import { mapItemReadModel } from '../../utils/item-mappers';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class HeroExplorationRewards {
  private readonly backend = inject(Backend);

  getLatestChallengeReward(input: {
    heroId: string;
    explorationId: string;
  }): Observable<ExplorationChallengeRewardReadModel | null> {
    const heroId = requiredText(input.heroId, 'heroId');
    const explorationId = requiredText(input.explorationId, 'explorationId');

    return this.backend
      .getAll<Row<'hero_exploration_challenge_attempts'>>({
        table: TABLES.hero_exploration_challenge_attempts,
        filters: {
          heroId: eq(heroId),
          explorationId: eq(explorationId),
        },
        orderBy: [{ column: 'updated_at', ascending: false }],
        camelCase: false,
      })
      .pipe(
        map((rows) => rows.find(isCompletedChallenge) ?? null),
        switchMap((challenge) =>
          challenge ? this.getRewardForChallenge(challenge) : of(null),
        ),
      );
  }

  private getRewardForChallenge(
    challenge: Row<'hero_exploration_challenge_attempts'>,
  ): Observable<ExplorationChallengeRewardReadModel> {
    if (!challenge.reward_grant_id) {
      return of(toChallengeReward(challenge, null, [], []));
    }

    return forkJoin({
      grants: this.getRewardGrant(challenge.reward_grant_id),
      entries: this.getRewardEntries(challenge.reward_grant_id),
    }).pipe(
      switchMap(({ grants, entries }) => {
        const itemIds = uniqueTexts(
          entries.map((entry) => entry.item_id).filter(Boolean),
        );

        return this.getRewardItems(challenge.server_id, itemIds).pipe(
          map((items) =>
            toChallengeReward(
              challenge,
              grants[0] ?? null,
              entries,
              items,
            ),
          ),
        );
      }),
    );
  }

  private getRewardGrant(rewardGrantId: string): Observable<Row<'reward_grants'>[]> {
    return this.backend.getAll<Row<'reward_grants'>>({
      table: TABLES.reward_grants,
      filters: { id: eq(rewardGrantId) },
      camelCase: false,
    });
  }

  private getRewardEntries(
    rewardGrantId: string,
  ): Observable<Row<'reward_grant_entries'>[]> {
    return this.backend.getAll<Row<'reward_grant_entries'>>({
      table: TABLES.reward_grant_entries,
      filters: { rewardGrantId: eq(rewardGrantId) },
      orderBy: [{ column: 'created_at', ascending: true }],
      camelCase: false,
    });
  }

  private getRewardItems(
    serverId: string,
    itemIds: readonly string[],
  ): Observable<Row<'items'>[]> {
    if (!itemIds.length) {
      return of([]);
    }

    return this.backend.getAll<Row<'items'>>({
      table: TABLES.items,
      filters: {
        serverId: eq(serverId),
        id: inList(itemIds),
      },
      camelCase: false,
    });
  }
}

function toChallengeReward(
  challenge: Row<'hero_exploration_challenge_attempts'>,
  grant: Row<'reward_grants'> | null,
  entries: readonly Row<'reward_grant_entries'>[],
  items: readonly Row<'items'>[],
): ExplorationChallengeRewardReadModel {
  return {
    challengeAttemptId: challenge.id,
    challengeKind: challenge.challenge_kind,
    status: challenge.status,
    success: challenge.success,
    completionMode: challenge.completion_mode,
    completedAt: challenge.completed_at,
    rewardGrantId: challenge.reward_grant_id,
    rewardGrant: grant ? mapRewardGrant(grant) : null,
    entries: entries.map(mapRewardGrantEntry),
    items: items.map(mapItemReadModel),
  };
}

function isCompletedChallenge(
  row: Row<'hero_exploration_challenge_attempts'>,
): boolean {
  return Boolean(row.completed_at || row.reward_grant_id || row.completion_mode);
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for exploration reward read model.`);
  }

  return normalized;
}

function eq(value: string): FilterDefinition {
  return { operator: FilterOperator.EQ, value };
}

function inList(values: readonly string[]): FilterDefinition {
  return { operator: FilterOperator.IN, value: [...values] };
}

function uniqueTexts(values: readonly (string | null | undefined)[]): string[] {
  return [...new Set(values.map((value) => trimText(value)).filter(Boolean))];
}
