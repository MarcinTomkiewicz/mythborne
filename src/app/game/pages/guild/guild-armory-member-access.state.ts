import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GuildArmoryAccessLockState,
  SetGuildArmoryMemberAccessInput,
} from '../../../core/domain/guild/guild-armory.model';
import { GuildMemberListItem } from '../../../core/domain/guild/guild.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { PlayerGuildArmoryActions } from '../../../core/services/guild/player-guild-armory-actions';
import { GuildArmoryAccessStatusKey } from '../../../core/types/guild-rpc.types';
import { getErrorMessage } from '../../../core/utils/error-message';
import { ToastService } from '../../../core/services/ui/toast';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { CurrentGuildState } from '../../../core/services/guild/current-guild.state';
import { GuildMembersState } from '../../../core/services/guild/guild-members.state';
import { GuildArmoryReadState } from './guild-armory-read.state';

@Injectable()
export class GuildArmoryMemberAccessState {
  private readonly activeHero = inject(ActiveHero);
  private readonly currentGuild = inject(CurrentGuildState);
  private readonly guildArmory = inject(GuildArmoryReadState);
  private readonly guildArmoryActions = inject(PlayerGuildArmoryActions);
  private readonly guildMembers = inject(GuildMembersState);
  private readonly toast = inject(ToastService);
  private mutationRequestId = 0;

  readonly members = computed(() => this.guildMembers.members());
  readonly isLoading = computed(() => this.guildMembers.isLoading());
  readonly canManageAccess = computed(() => {
    const roleKey = this.guildMembers.currentRoleKey();

    return roleKey === 'leader' || roleKey === 'officer';
  });
  readonly lastResult = signal<GuildArmoryAccessLockState | null>(null);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    this.guildMembers.load();
  }

  block(member: GuildMemberListItem): void {
    this.setAccess(member, 'blocked', 'Blocked guild armory access.');
  }

  allow(member: GuildMemberListItem): void {
    this.setAccess(member, 'allowed', 'Allowed guild armory access.');
  }

  private setAccess(
    member: GuildMemberListItem,
    statusKey: GuildArmoryAccessStatusKey,
    reason: string,
  ): void {
    if (!this.canManageAccess()) {
      this.rejectMutation('Current hero cannot manage guild armory access.');
      return;
    }

    this.runMutation({
      memberHeroId: member.memberHeroId,
      statusKey,
      reason,
    });
  }

  private runMutation(input: SetGuildArmoryMemberAccessInput): void {
    const requestId = ++this.mutationRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.lastResult.set(null);

    if (!contextKey) {
      this.isMutating.set(false);
      this.showAccessError('No active hero for guild armory access.');
      return;
    }

    this.isMutating.set(true);

    this.accessOperation(input).subscribe({
      next: (result) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.lastResult.set(result);
        this.isMutating.set(false);
        this.toast.show('success', 'Guild armory access', successMessage(result.statusKey));
        this.refreshAfterMutation();
      },
      error: (error: unknown) => {
        if (!this.acceptsMutationResponse(requestId, contextKey)) {
          return;
        }

        this.isMutating.set(false);
        this.showAccessError(
          getErrorMessage(error, 'Guild armory access update failed.'),
        );
      },
    });
  }

  private accessOperation(
    input: SetGuildArmoryMemberAccessInput,
  ): Observable<GuildArmoryAccessLockState> {
    return this.guildArmoryActions.setGuildArmoryMemberAccessForActiveHero(input);
  }

  private refreshAfterMutation(): void {
    this.guildMembers.load();
    this.currentGuild.load();
    this.guildArmory.load();
  }

  private rejectMutation(message: string): void {
    this.mutationRequestId++;
    this.showAccessError(message);
    this.lastResult.set(null);
    this.isMutating.set(false);
  }

  private showAccessError(message: string): void {
    this.error.set(message);
    this.toast.show('error', 'Guild armory access failed', message);
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsMutationResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.mutationRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.isMutating.set(false);
      this.error.set(null);
      return false;
    }

    return true;
  }
}

function successMessage(statusKey: GuildArmoryAccessStatusKey): string {
  return statusKey === 'blocked'
    ? 'Guild armory access blocked.'
    : 'Guild armory access allowed.';
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
