import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CancelGuildJoinRequestInput,
  CreateGuildJoinRequestInput,
  GuildJoinRequest,
  GuildJoinRequestOperationResult,
  ReviewGuildJoinRequestInput,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { GuildDiscoveryState } from './guild-discovery.state';
import { PlayerGuildJoinRequests } from './player-guild-join-requests';

@Injectable({ providedIn: 'root' })
export class GuildJoinRequestsState {
  private readonly activeHero = inject(ActiveHero);
  private readonly currentGuild = inject(CurrentGuildState);
  private readonly discovery = inject(GuildDiscoveryState);
  private readonly playerGuildJoinRequests = inject(PlayerGuildJoinRequests);
  private loadRequestId = 0;
  private mutationRequestId = 0;

  readonly requests = signal<GuildJoinRequest[]>([]);
  readonly lastResult = signal<GuildJoinRequestOperationResult | null>(null);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  load(includeTerminal = false): void {
    const requestId = ++this.loadRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.message.set(null);

    if (!contextKey) {
      this.clearRequestList();
      this.error.set('No active hero for guild join requests.');
      return;
    }

    this.isLoading.set(true);

    this.playerGuildJoinRequests.getActiveHeroGuildJoinRequests(includeTerminal).subscribe({
      next: (requests) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.requests.set(requests);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to load guild join requests.'));
        this.isLoading.set(false);
      },
    });
  }

  create(input: CreateGuildJoinRequestInput): void {
    this.runMutation(
      () => this.playerGuildJoinRequests.createGuildJoinRequestForActiveHero(input),
      'Guild join request created.',
    );
  }

  review(input: ReviewGuildJoinRequestInput): void {
    this.runMutation(
      () => this.playerGuildJoinRequests.reviewGuildJoinRequestForActiveHero(input),
      input.accept ? 'Guild join request accepted.' : 'Guild join request rejected.',
    );
  }

  cancel(input: CancelGuildJoinRequestInput): void {
    this.runMutation(
      () => this.playerGuildJoinRequests.cancelGuildJoinRequestForActiveHero(input),
      'Guild join request canceled.',
    );
  }

  clear(): void {
    this.loadRequestId++;
    this.mutationRequestId++;
    this.requests.set([]);
    this.lastResult.set(null);
    this.isLoading.set(false);
    this.isMutating.set(false);
    this.error.set(null);
    this.message.set(null);
  }

  private runMutation(
    operation: () => Observable<GuildJoinRequestOperationResult>,
    successMessage: string,
  ): void {
    const requestId = ++this.mutationRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.message.set(null);
    this.lastResult.set(null);

    if (!contextKey) {
      this.clearRequestList();
      this.error.set('No active hero for guild join requests.');
      return;
    }

    this.isMutating.set(true);

    operation().subscribe({
      next: (result) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.lastResult.set(result);
        this.isMutating.set(false);
        this.load();
        this.currentGuild.load();
        this.discovery.search();
        this.message.set(successMessage);
      },
      error: (error: unknown) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to update guild join request.'));
        this.isMutating.set(false);
      },
    });
  }

  private clearRequestList(): void {
    this.requests.set([]);
    this.lastResult.set(null);
    this.isLoading.set(false);
    this.isMutating.set(false);
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsLoadResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.loadRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.clearRequestList();
      this.error.set(null);
      this.message.set(null);
      return false;
    }

    return true;
  }

  private acceptsMutationResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.mutationRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.clearRequestList();
      this.error.set(null);
      this.message.set(null);
      return false;
    }

    return true;
  }
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
