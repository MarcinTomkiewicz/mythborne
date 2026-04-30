import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  MODERATION_TARGET_SEARCH_DEFAULT_LIMIT,
  MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH,
} from '../../constants/moderation-action.const';
import {
  ModerationHeroTarget,
  ModerationUserTarget,
} from '../../domain/moderation/moderation-action.model';
import {
  AntiAbuseCaseTargetSearchEvent,
  AntiAbuseCaseTargetSearchHandlers,
} from '../../types/anti-abuse-case-target-search.types';
import { trimToNull } from '../../utils/normalize-text';
import { ModerationActions } from '../moderation/moderation-actions';

export class AntiAbuseCaseTargetSearchState {
  private accessRequestId = 0;
  private userSearchRequestId = 0;
  private heroSearchRequestId = 0;

  readonly minQueryLength = MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH;
  readonly userTargetControl = new FormControl<ModerationUserTarget | null>(null);
  readonly heroTargetControl = new FormControl<ModerationHeroTarget | null>(null);
  readonly userTargetSuggestions = signal<ModerationUserTarget[]>([]);
  readonly heroTargetSuggestions = signal<ModerationHeroTarget[]>([]);
  readonly isSearchingUserTargets = signal(false);
  readonly isSearchingHeroTargets = signal(false);
  readonly isLoadingAccess = signal(false);
  readonly canSearchTargets = signal(false);
  readonly message = signal<string | null>(null);

  constructor(
    private readonly moderationActions: ModerationActions,
    private readonly destroyRef: DestroyRef,
    private readonly handlers: AntiAbuseCaseTargetSearchHandlers,
  ) {}

  loadAccess(serverId: string | null, canTriageAntiAbuse: boolean): void {
    const requestId = ++this.accessRequestId;

    this.canSearchTargets.set(false);

    if (!serverId || !canTriageAntiAbuse) {
      this.isLoadingAccess.set(false);
      return;
    }

    this.isLoadingAccess.set(true);
    this.moderationActions
      .canSearchTargets(serverId)
      .pipe(
        finalize(() => {
          if (requestId === this.accessRequestId) {
            this.isLoadingAccess.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (canSearch) => {
          if (requestId === this.accessRequestId) {
            this.canSearchTargets.set(canSearch);
          }
        },
        error: () => {
          if (requestId === this.accessRequestId) {
            this.canSearchTargets.set(false);
          }
        },
      });
  }

  searchUserTargets(
    event: AntiAbuseCaseTargetSearchEvent,
    serverId: string | null,
    canTriageAntiAbuse: boolean,
  ): void {
    const requestId = ++this.userSearchRequestId;
    const request = this.targetSearchRequest(event.query, serverId, canTriageAntiAbuse);

    if (!request) {
      this.userTargetSuggestions.set([]);
      this.isSearchingUserTargets.set(false);
      return;
    }

    this.isSearchingUserTargets.set(true);
    this.moderationActions
      .searchUserTargets(request)
      .pipe(
        finalize(() => {
          if (requestId === this.userSearchRequestId) {
            this.isSearchingUserTargets.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (targets) => {
          if (requestId === this.userSearchRequestId) {
            this.userTargetSuggestions.set(targets);
          }
        },
        error: (error) => {
          if (requestId === this.userSearchRequestId) {
            this.setSearchError('User target search failed', error);
          }
        },
      });
  }

  searchHeroTargets(
    event: AntiAbuseCaseTargetSearchEvent,
    serverId: string | null,
    canTriageAntiAbuse: boolean,
  ): void {
    const requestId = ++this.heroSearchRequestId;
    const request = this.targetSearchRequest(event.query, serverId, canTriageAntiAbuse);

    if (!request) {
      this.heroTargetSuggestions.set([]);
      this.isSearchingHeroTargets.set(false);
      return;
    }

    this.isSearchingHeroTargets.set(true);
    this.moderationActions
      .searchHeroTargets(request)
      .pipe(
        finalize(() => {
          if (requestId === this.heroSearchRequestId) {
            this.isSearchingHeroTargets.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (targets) => {
          if (requestId === this.heroSearchRequestId) {
            this.heroTargetSuggestions.set(targets);
          }
        },
        error: (error) => {
          if (requestId === this.heroSearchRequestId) {
            this.setSearchError('Hero target search failed', error);
          }
        },
      });
  }

  selectUserTarget(target: ModerationUserTarget): void {
    this.handlers.setParticipantUserId(target.userId);
  }

  selectHeroTarget(target: ModerationHeroTarget): void {
    this.handlers.setParticipantHeroId(target.heroId);
  }

  clearUserTarget(): void {
    this.handlers.setParticipantUserId(null);
  }

  clearHeroTarget(): void {
    this.handlers.setParticipantHeroId(null);
  }

  reset(): void {
    this.userSearchRequestId += 1;
    this.heroSearchRequestId += 1;
    this.userTargetControl.setValue(null);
    this.heroTargetControl.setValue(null);
    this.userTargetSuggestions.set([]);
    this.heroTargetSuggestions.set([]);
    this.isSearchingUserTargets.set(false);
    this.isSearchingHeroTargets.set(false);
    this.message.set(null);
  }

  private targetSearchRequest(
    query: string,
    serverId: string | null,
    canTriageAntiAbuse: boolean,
  ): { serverId: string; query: string; limit: number } | null {
    const normalizedQuery = trimToNull(query);

    if (!serverId || !canTriageAntiAbuse || !this.canSearchTargets()) {
      this.message.set('Target search is unavailable for the current server context.');
      return null;
    }

    if (
      !normalizedQuery ||
      normalizedQuery.length < MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH
    ) {
      this.message.set(
        `Type at least ${MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH} characters to search targets.`,
      );
      return null;
    }

    this.message.set(null);

    return {
      serverId,
      query: normalizedQuery,
      limit: MODERATION_TARGET_SEARCH_DEFAULT_LIMIT,
    };
  }

  private setSearchError(summary: string, error: unknown): void {
    const detail = error instanceof Error ? error.message : String(error);
    const message = `${summary}: ${detail}`;
    this.message.set(message);
    this.handlers.setError(message);
  }
}
