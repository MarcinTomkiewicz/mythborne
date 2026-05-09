import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DisbandGuildInput,
  GuildLifecycleOperationResult,
  LeaveGuildInput,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { PlayerGuildLifecycle } from './player-guild-lifecycle';

@Injectable({ providedIn: 'root' })
export class GuildLifecycleState {
  private readonly activeHero = inject(ActiveHero);
  private readonly currentGuild = inject(CurrentGuildState);
  private readonly playerGuildLifecycle = inject(PlayerGuildLifecycle);
  private mutationRequestId = 0;

  readonly lastResult = signal<GuildLifecycleOperationResult | null>(null);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly currentRoleKey = computed(() => this.currentGuild.roleKey());

  leave(input: LeaveGuildInput = {}): void {
    if (!this.currentContextKey()) {
      this.rejectMissingContext();
      return;
    }

    if (this.currentRoleKey() === 'leader') {
      this.rejectMutation('Guild leader cannot leave guild through leave action.');
      return;
    }

    if (!this.currentRoleKey()) {
      this.rejectMutation('Current hero has no active guild membership.');
      return;
    }

    this.runMutation(
      () => this.playerGuildLifecycle.leaveGuildForActiveHero(input),
      'Guild left.',
    );
  }

  disband(input: DisbandGuildInput): void {
    if (!this.currentContextKey()) {
      this.rejectMissingContext();
      return;
    }

    if (this.currentRoleKey() !== 'leader') {
      this.rejectMutation('Only guild leader can disband guild.');
      return;
    }

    this.runMutation(
      () => this.playerGuildLifecycle.disbandGuildForActiveHero(input),
      'Guild disbanded.',
    );
  }

  clear(): void {
    this.mutationRequestId++;
    this.lastResult.set(null);
    this.isMutating.set(false);
    this.error.set(null);
    this.message.set(null);
  }

  private runMutation(
    operation: () => Observable<GuildLifecycleOperationResult>,
    successMessage: string,
  ): void {
    const requestId = ++this.mutationRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.message.set(null);
    this.lastResult.set(null);

    if (!contextKey) {
      this.error.set('No active hero for guild lifecycle action.');
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
        this.currentGuild.load();
        this.message.set(successMessage);
      },
      error: (error: unknown) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to update guild lifecycle.'));
        this.isMutating.set(false);
      },
    });
  }

  private rejectMutation(message: string): void {
    this.mutationRequestId++;
    this.error.set(message);
    this.message.set(null);
    this.lastResult.set(null);
    this.isMutating.set(false);
  }

  private rejectMissingContext(): void {
    this.mutationRequestId++;
    this.error.set('No active hero for guild lifecycle action.');
    this.message.set(null);
    this.lastResult.set(null);
    this.isMutating.set(false);
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsMutationResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.mutationRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.lastResult.set(null);
      this.isMutating.set(false);
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
