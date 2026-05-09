import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  DemoteGuildOfficerInput,
  GuildMemberListItem,
  GuildMemberOperationResult,
  KickGuildMemberInput,
  PromoteGuildMemberInput,
} from '../../domain/guild/guild.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { GuildRoleKey } from '../../types/guild-rpc.types';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { PlayerGuildMembers } from './player-guild-members';

@Injectable({ providedIn: 'root' })
export class GuildMembersState {
  private readonly activeHero = inject(ActiveHero);
  private readonly currentGuild = inject(CurrentGuildState);
  private readonly playerGuildMembers = inject(PlayerGuildMembers);
  private loadRequestId = 0;
  private mutationRequestId = 0;

  readonly members = signal<GuildMemberListItem[]>([]);
  readonly lastResult = signal<GuildMemberOperationResult | null>(null);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly currentRoleKey = computed(() => this.currentGuild.roleKey());

  load(): void {
    const requestId = ++this.loadRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.message.set(null);

    if (!contextKey) {
      this.clearMemberList();
      this.error.set('No active hero for guild members.');
      return;
    }

    this.isLoading.set(true);

    this.playerGuildMembers.getActiveHeroGuildMembers().subscribe({
      next: (members) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.members.set(members);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to load guild members.'));
        this.isLoading.set(false);
      },
    });
  }

  kick(input: KickGuildMemberInput): void {
    if (!this.currentContextKey()) {
      this.rejectMissingContext();
      return;
    }

    const member = this.findMember(input.targetHeroId);

    if (!this.canKick(member)) {
      this.rejectMutation('Current hero cannot kick this guild member.');
      return;
    }

    this.runMutation(
      () => this.playerGuildMembers.kickGuildMemberForActiveHero(input),
      'Guild member kicked.',
    );
  }

  promote(input: PromoteGuildMemberInput): void {
    if (!this.currentContextKey()) {
      this.rejectMissingContext();
      return;
    }

    const member = this.findMember(input.targetHeroId);

    if (!this.canPromote(member)) {
      this.rejectMutation('Current hero cannot promote this guild member.');
      return;
    }

    this.runMutation(
      () => this.playerGuildMembers.promoteGuildMemberForActiveHero(input),
      'Guild member promoted to officer.',
    );
  }

  demote(input: DemoteGuildOfficerInput): void {
    if (!this.currentContextKey()) {
      this.rejectMissingContext();
      return;
    }

    const member = this.findMember(input.targetHeroId);

    if (!this.canDemote(member)) {
      this.rejectMutation('Current hero cannot demote this guild officer.');
      return;
    }

    this.runMutation(
      () => this.playerGuildMembers.demoteGuildOfficerForActiveHero(input),
      'Guild officer demoted.',
    );
  }

  clear(): void {
    this.loadRequestId++;
    this.mutationRequestId++;
    this.members.set([]);
    this.lastResult.set(null);
    this.isLoading.set(false);
    this.isMutating.set(false);
    this.error.set(null);
    this.message.set(null);
  }

  canKick(member: GuildMemberListItem | null | undefined): boolean {
    const roleKey = this.currentRoleKey();

    if (!member || member.membershipStatusKey !== 'active' || member.roleKey === 'leader') {
      return false;
    }

    return roleKey === 'leader' || (roleKey === 'officer' && member.roleKey === 'member');
  }

  canPromote(member: GuildMemberListItem | null | undefined): boolean {
    return this.currentRoleKey() === 'leader'
      && member?.membershipStatusKey === 'active'
      && member.roleKey === 'member';
  }

  canDemote(member: GuildMemberListItem | null | undefined): boolean {
    return this.currentRoleKey() === 'leader'
      && member?.membershipStatusKey === 'active'
      && member.roleKey === 'officer';
  }

  private runMutation(
    operation: () => Observable<GuildMemberOperationResult>,
    successMessage: string,
  ): void {
    const requestId = ++this.mutationRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.message.set(null);
    this.lastResult.set(null);

    if (!contextKey) {
      this.clearMemberList();
      this.error.set('No active hero for guild members.');
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
        this.message.set(successMessage);
      },
      error: (error: unknown) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Failed to update guild member.'));
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
    this.clearMemberList();
    this.error.set('No active hero for guild members.');
    this.message.set(null);
  }

  private findMember(heroId: string): GuildMemberListItem | undefined {
    return this.members().find((member) => member.memberHeroId === heroId);
  }

  private clearMemberList(): void {
    this.members.set([]);
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
      this.clearMemberList();
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
      this.clearMemberList();
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
