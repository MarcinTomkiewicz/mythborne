import { computed, inject, Injectable, signal } from '@angular/core';
import {
  GuildEmergencyElectionCandidate,
  GuildEmergencyElectionSummary,
} from '../../domain/guild/guild-emergency-election.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { PlayerGuildElections } from './player-guild-elections';

@Injectable({ providedIn: 'root' })
export class GuildEmergencyElectionState {
  private readonly activeHero = inject(ActiveHero);
  private readonly currentGuild = inject(CurrentGuildState);
  private readonly playerGuildElections = inject(PlayerGuildElections);
  private loadRequestId = 0;

  readonly summary = signal<GuildEmergencyElectionSummary | null>(null);
  readonly candidates = signal<GuildEmergencyElectionCandidate[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasActiveElection = computed(() => this.summary() !== null);
  readonly statusKey = computed(() => this.summary()?.statusKey ?? null);
  readonly canStartElection = computed(() =>
    this.currentGuild.readModel()
      ?.detail
      ?.permissions
      .canStartEmergencyElection ?? false
  );

  load(): void {
    const requestId = ++this.loadRequestId;
    const contextKey = this.currentContextKey();

    this.summary.set(null);
    this.candidates.set([]);
    this.error.set(null);

    if (!contextKey) {
      this.isLoading.set(false);
      this.error.set('No active hero for guild emergency election.');
      return;
    }

    this.isLoading.set(true);

    this.playerGuildElections.getActiveHeroEmergencyElection().subscribe({
      next: (readModel) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.summary.set(readModel.summary);
        this.candidates.set(readModel.candidates);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.acceptsLoadResponse(requestId, contextKey)) {
          return;
        }

        this.error.set(
          getErrorMessage(error, 'Failed to load guild emergency election.'),
        );
        this.isLoading.set(false);
      },
    });
  }

  clear(): void {
    this.loadRequestId++;
    this.summary.set(null);
    this.candidates.set([]);
    this.isLoading.set(false);
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
      this.summary.set(null);
      this.candidates.set([]);
      this.isLoading.set(false);
      this.error.set(null);
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
