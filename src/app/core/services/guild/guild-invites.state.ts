import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CancelGuildInviteInput,
  CreateGuildInviteInput,
  GuildInvite,
  GuildInviteOperationResult,
  RespondGuildInviteInput,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { PlayerGuildInvites } from './player-guild-invites';

@Injectable({ providedIn: 'root' })
export class GuildInvitesState {
  private readonly activeHero = inject(ActiveHero);
  private readonly currentGuild = inject(CurrentGuildState);
  private readonly playerGuildInvites = inject(PlayerGuildInvites);
  private loadRequestId = 0;
  private mutationRequestId = 0;

  readonly invites = signal<GuildInvite[]>([]);
  readonly lastResult = signal<GuildInviteOperationResult | null>(null);
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
      this.clearInviteList();
      this.error.set('No active hero for guild invites.');
      return;
    }

    this.isLoading.set(true);

    this.playerGuildInvites.getActiveHeroGuildInvites(includeTerminal).subscribe({
      next: (invites) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.invites.set(invites);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to load guild invites.'));
        this.isLoading.set(false);
      },
    });
  }

  create(input: CreateGuildInviteInput): void {
    this.runMutation(
      () => this.playerGuildInvites.createGuildInviteForActiveHero(input),
      'Guild invite created.',
      true,
    );
  }

  respond(input: RespondGuildInviteInput): void {
    this.runMutation(
      () => this.playerGuildInvites.respondGuildInviteForActiveHero(input),
      input.accept ? 'Guild invite accepted.' : 'Guild invite rejected.',
      input.accept,
    );
  }

  cancel(input: CancelGuildInviteInput): void {
    this.runMutation(
      () => this.playerGuildInvites.cancelGuildInviteForActiveHero(input),
      'Guild invite canceled.',
      true,
    );
  }

  clear(): void {
    this.loadRequestId++;
    this.mutationRequestId++;
    this.invites.set([]);
    this.lastResult.set(null);
    this.isLoading.set(false);
    this.isMutating.set(false);
    this.error.set(null);
    this.message.set(null);
  }

  private runMutation(
    operation: () => Observable<GuildInviteOperationResult>,
    successMessage: string,
    refreshCurrentGuild: boolean,
  ): void {
    const requestId = ++this.mutationRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.message.set(null);
    this.lastResult.set(null);

    if (!contextKey) {
      this.clearInviteList();
      this.error.set('No active hero for guild invites.');
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

        if (refreshCurrentGuild) {
          this.currentGuild.load();
        }

        this.message.set(successMessage);
      },
      error: (error: unknown) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to update guild invite.'));
        this.isMutating.set(false);
      },
    });
  }

  private clearInviteList(): void {
    this.invites.set([]);
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
      this.clearInviteList();
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
      this.clearInviteList();
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
