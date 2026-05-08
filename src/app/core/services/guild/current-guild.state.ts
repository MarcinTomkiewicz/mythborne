import { computed, inject, Injectable, signal } from '@angular/core';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { CurrentGuildReadModel } from '../../domain/guild/guild.model';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuild } from './player-guild';

export type CurrentGuildReadStatus =
  | 'idle'
  | 'loading'
  | 'no-guild'
  | 'member'
  | 'officer'
  | 'leader'
  | 'error';

@Injectable({ providedIn: 'root' })
export class CurrentGuildState {
  private readonly activeHero = inject(ActiveHero);
  private readonly playerGuild = inject(PlayerGuild);
  private loadRequestId = 0;

  readonly readModel = signal<CurrentGuildReadModel | null>(null);
  readonly status = signal<CurrentGuildReadStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly isLoading = computed(() => this.status() === 'loading');
  readonly hasGuild = computed(() => this.readModel()?.state.guild != null);
  readonly roleKey = computed(() => this.readModel()?.state.membership?.roleKey ?? null);

  load(): void {
    const requestId = ++this.loadRequestId;
    const contextKey = this.currentContextKey();

    this.readModel.set(null);
    this.error.set(null);

    if (!contextKey) {
      this.status.set('error');
      this.error.set('No active hero for guild state.');
      return;
    }

    this.status.set('loading');

    this.playerGuild.getActiveHeroGuild().subscribe({
      next: (readModel) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.readModel.set(readModel);
        this.status.set(resolveGuildStatus(readModel));
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.readModel.set(null);
        this.status.set('error');
        this.error.set(getErrorMessage(error, 'Failed to load current guild state.'));
      },
    });
  }

  clear(): void {
    this.loadRequestId++;
    this.readModel.set(null);
    this.status.set('idle');
    this.error.set(null);
  }

  private currentContextKey(): string | null {
    return toContextKey(this.activeHero.state());
  }

  private acceptsLoadResponse(requestId: number, contextKey: string): boolean {
    if (requestId !== this.loadRequestId) {
      return false;
    }

    if (contextKey !== this.currentContextKey()) {
      this.readModel.set(null);
      this.status.set('idle');
      this.error.set(null);
      return false;
    }

    return true;
  }
}

function resolveGuildStatus(readModel: CurrentGuildReadModel): CurrentGuildReadStatus {
  const roleKey = readModel.state.membership?.roleKey;

  if (!readModel.state.guild || !roleKey) {
    return 'no-guild';
  }

  if (roleKey === 'leader' || roleKey === 'officer') {
    return roleKey;
  }

  return 'member';
}

function toContextKey(
  state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null,
): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
