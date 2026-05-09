import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FinalizeGuildEmergencyElectionInput,
  GuildEmergencyElectionCandidate,
  GuildEmergencyElectionOperationResult,
  GuildEmergencyElectionSummary,
  NominateGuildEmergencyLeaderCandidateInput,
  StartGuildEmergencyElectionInput,
  StartGuildEmergencyElectionVotingInput,
  VoteGuildEmergencyElectionInput,
} from '../../domain/guild/guild-emergency-election.model';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { getErrorMessage } from '../../utils/error-message';
import { ActiveHero } from '../hero/active-hero';
import { CurrentGuildState } from './current-guild.state';
import { PlayerGuildElectionActions } from './player-guild-election-actions';
import { PlayerGuildElections } from './player-guild-elections';

@Injectable({ providedIn: 'root' })
export class GuildEmergencyElectionState {
  private readonly activeHero = inject(ActiveHero);
  private readonly currentGuild = inject(CurrentGuildState);
  private readonly playerGuildElectionActions = inject(PlayerGuildElectionActions);
  private readonly playerGuildElections = inject(PlayerGuildElections);
  private loadRequestId = 0;
  private mutationRequestId = 0;

  readonly summary = signal<GuildEmergencyElectionSummary | null>(null);
  readonly candidates = signal<GuildEmergencyElectionCandidate[]>([]);
  readonly lastResult = signal<GuildEmergencyElectionOperationResult | null>(null);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
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
    this.message.set(null);

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

  start(input: StartGuildEmergencyElectionInput = {}): void {
    this.runMutation(
      () => this.playerGuildElectionActions.startEmergencyElectionForActiveHero(input),
      'Guild emergency election started.',
    );
  }

  nominate(input: NominateGuildEmergencyLeaderCandidateInput): void {
    this.runMutation(
      () =>
        this.playerGuildElectionActions
          .nominateEmergencyLeaderCandidateForActiveHero(input),
      'Guild emergency election candidate nominated.',
    );
  }

  startVoting(input: StartGuildEmergencyElectionVotingInput): void {
    this.runMutation(
      () =>
        this.playerGuildElectionActions
          .startEmergencyElectionVotingForActiveHero(input),
      'Guild emergency election voting started.',
    );
  }

  vote(input: VoteGuildEmergencyElectionInput): void {
    this.runMutation(
      () => this.playerGuildElectionActions.voteEmergencyElectionForActiveHero(input),
      'Guild emergency election vote submitted.',
    );
  }

  finalize(input: FinalizeGuildEmergencyElectionInput): void {
    this.runMutation(
      () =>
        this.playerGuildElectionActions.finalizeEmergencyElectionForActiveHero(input),
      'Guild emergency election finalized.',
    );
  }

  clear(): void {
    this.loadRequestId++;
    this.mutationRequestId++;
    this.summary.set(null);
    this.candidates.set([]);
    this.lastResult.set(null);
    this.isLoading.set(false);
    this.isMutating.set(false);
    this.error.set(null);
    this.message.set(null);
  }

  private runMutation(
    operation: () => Observable<GuildEmergencyElectionOperationResult>,
    successMessage: string,
  ): void {
    const requestId = ++this.mutationRequestId;
    const contextKey = this.currentContextKey();

    this.error.set(null);
    this.message.set(null);
    this.lastResult.set(null);

    if (!contextKey) {
      this.clearElectionData();
      this.error.set('No active hero for guild emergency election.');
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

        this.error.set(
          getErrorMessage(error, 'Failed to update guild emergency election.'),
        );
        this.isMutating.set(false);
      },
    });
  }

  private clearElectionData(): void {
    this.summary.set(null);
    this.candidates.set([]);
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
      this.clearElectionData();
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
      this.clearElectionData();
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
