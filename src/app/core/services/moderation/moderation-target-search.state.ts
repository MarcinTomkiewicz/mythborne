import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  ModerationHeroTarget,
  ModerationUserTarget,
} from '../../domain/moderation/moderation-action.model';
import {
  MODERATION_TARGET_SEARCH_DEFAULT_LIMIT,
  MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH,
} from '../../constants/moderation-action.const';
import { trimToNull } from '../../utils/normalize-text';
import { ModerationActions } from './moderation-actions';

type TargetSearchEvent = { query: string };

export interface ModerationTargetSearchHandlers {
  setUserTargetId(userId: string): void;
  clearUserTargetId(): void;
  setHeroTargetIds(userId: string, heroId: string): void;
  clearHeroTargetId(): void;
  setError(summary: string, error: unknown): void;
}

export class ModerationTargetSearchState {
  readonly userTargetControl = new FormControl<ModerationUserTarget | null>(null);
  readonly heroTargetControl = new FormControl<ModerationHeroTarget | null>(null);
  readonly userTargetSuggestions = signal<ModerationUserTarget[]>([]);
  readonly heroTargetSuggestions = signal<ModerationHeroTarget[]>([]);
  readonly isSearchingUserTargets = signal(false);
  readonly isSearchingHeroTargets = signal(false);
  readonly message = signal<string | null>(null);

  constructor(
    private readonly moderationActions: ModerationActions,
    private readonly destroyRef: DestroyRef,
    private readonly handlers: ModerationTargetSearchHandlers,
  ) {}

  searchUserTargets(
    event: TargetSearchEvent,
    serverId: string | null,
    canSearchTargets: boolean,
  ): void {
    const query = trimToNull(event.query);

    if (!this.canSearch(query, serverId, canSearchTargets)) {
      this.userTargetSuggestions.set([]);
      return;
    }

    this.isSearchingUserTargets.set(true);
    this.message.set(null);
    this.moderationActions
      .searchUserTargets({
        serverId: serverId as string,
        query,
        limit: MODERATION_TARGET_SEARCH_DEFAULT_LIMIT,
      })
      .pipe(
        finalize(() => this.isSearchingUserTargets.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (targets) => this.userTargetSuggestions.set(targets),
        error: (error) => this.handlers.setError('User target search failed', error),
      });
  }

  searchHeroTargets(
    event: TargetSearchEvent,
    serverId: string | null,
    canSearchTargets: boolean,
  ): void {
    const query = trimToNull(event.query);

    if (!this.canSearch(query, serverId, canSearchTargets)) {
      this.heroTargetSuggestions.set([]);
      return;
    }

    this.isSearchingHeroTargets.set(true);
    this.message.set(null);
    this.moderationActions
      .searchHeroTargets({
        serverId: serverId as string,
        query,
        limit: MODERATION_TARGET_SEARCH_DEFAULT_LIMIT,
      })
      .pipe(
        finalize(() => this.isSearchingHeroTargets.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (targets) => this.heroTargetSuggestions.set(targets),
        error: (error) => this.handlers.setError('Hero target search failed', error),
      });
  }

  selectUserTarget(target: ModerationUserTarget): void {
    this.heroTargetControl.setValue(null);
    this.handlers.clearHeroTargetId();
    this.handlers.setUserTargetId(target.userId);
  }

  selectHeroTarget(target: ModerationHeroTarget): void {
    this.handlers.setHeroTargetIds(target.userId, target.heroId);
  }

  clearUserTarget(): void {
    this.userTargetControl.setValue(null);
    this.heroTargetControl.setValue(null);
    this.handlers.clearUserTargetId();
    this.handlers.clearHeroTargetId();
  }

  clearHeroTarget(): void {
    this.heroTargetControl.setValue(null);
    this.handlers.clearHeroTargetId();
  }

  reset(): void {
    this.userTargetControl.setValue(null);
    this.heroTargetControl.setValue(null);
    this.userTargetSuggestions.set([]);
    this.heroTargetSuggestions.set([]);
    this.message.set(null);
  }

  private canSearch(
    query: string | null,
    serverId: string | null,
    canSearchTargets: boolean,
  ): query is string {
    if (!serverId || !canSearchTargets) {
      this.message.set('Target search is unavailable for the current server context.');
      return false;
    }

    if (!query || query.length < MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH) {
      this.message.set('Type at least 2 characters to search targets.');
      return false;
    }

    return true;
  }
}
