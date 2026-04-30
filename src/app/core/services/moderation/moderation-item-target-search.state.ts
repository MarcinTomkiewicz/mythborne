import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  MODERATION_TARGET_SEARCH_DEFAULT_LIMIT,
  MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH,
} from '../../constants/moderation-action.const';
import { ModerationItemTarget } from '../../domain/moderation/moderation-action.model';
import { AntiAbuseCaseTargetSearchEvent } from '../../types/anti-abuse-case-target-search.types';
import { trimToNull } from '../../utils/normalize-text';
import { ModerationActions } from './moderation-actions';

export class ModerationItemTargetSearchState {
  private searchRequestId = 0;

  readonly minQueryLength = MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH;
  readonly itemTargetControl = new FormControl<ModerationItemTarget | null>(null);
  readonly itemTargetSuggestions = signal<ModerationItemTarget[]>([]);
  readonly selectedItemTargets = signal<ModerationItemTarget[]>([]);
  readonly isSearchingItemTargets = signal(false);
  readonly message = signal<string | null>(null);

  constructor(
    private readonly moderationActions: ModerationActions,
    private readonly destroyRef: DestroyRef,
    private readonly setError: (message: string) => void,
  ) {}

  searchItemTargets(
    event: AntiAbuseCaseTargetSearchEvent,
    serverId: string | null,
    canSearchTargets: boolean,
  ): void {
    const requestId = ++this.searchRequestId;
    const request = this.targetSearchRequest(event.query, serverId, canSearchTargets);

    if (!request) {
      this.itemTargetSuggestions.set([]);
      this.isSearchingItemTargets.set(false);
      return;
    }

    this.isSearchingItemTargets.set(true);
    this.moderationActions
      .searchItemTargets(request)
      .pipe(
        finalize(() => {
          if (requestId === this.searchRequestId) {
            this.isSearchingItemTargets.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (targets) => {
          if (requestId === this.searchRequestId) {
            this.itemTargetSuggestions.set(targets);
          }
        },
        error: (error) => {
          if (requestId === this.searchRequestId) {
            this.setSearchError('Item target search failed', error);
          }
        },
      });
  }

  selectItemTarget(target: ModerationItemTarget): void {
    this.selectedItemTargets.update((targets) =>
      targets.some((entry) => entry.itemId === target.itemId)
        ? targets
        : [...targets, target],
    );
    this.itemTargetControl.setValue(null);
    this.itemTargetSuggestions.set([]);
  }

  removeItemTarget(itemId: string): void {
    this.selectedItemTargets.update((targets) =>
      targets.filter((target) => target.itemId !== itemId),
    );
  }

  selectedItemIds(): string[] {
    return this.selectedItemTargets().map((target) => target.itemId);
  }

  reset(): void {
    this.searchRequestId += 1;
    this.itemTargetControl.setValue(null);
    this.itemTargetSuggestions.set([]);
    this.selectedItemTargets.set([]);
    this.isSearchingItemTargets.set(false);
    this.message.set(null);
  }

  private targetSearchRequest(
    query: string,
    serverId: string | null,
    canSearchTargets: boolean,
  ): { serverId: string; query: string; limit: number } | null {
    const normalizedQuery = trimToNull(query);

    if (!serverId || !canSearchTargets) {
      this.message.set('Item search is unavailable for the current server context.');
      return null;
    }

    if (
      !normalizedQuery ||
      normalizedQuery.length < MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH
    ) {
      this.message.set(
        `Type at least ${MODERATION_TARGET_SEARCH_MIN_QUERY_LENGTH} characters to search items.`,
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
    this.setError(message);
  }
}
