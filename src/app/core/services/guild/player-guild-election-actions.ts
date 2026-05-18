import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  FinalizeGuildEmergencyElectionInput,
  GuildEmergencyElectionFinalizeResult,
  GuildEmergencyElectionNominationResult,
  GuildEmergencyElectionStartResult,
  GuildEmergencyElectionVoteResult,
  GuildEmergencyElectionVotingStartResult,
  NominateGuildEmergencyLeaderCandidateInput,
  StartGuildEmergencyElectionInput,
  StartGuildEmergencyElectionVotingInput,
  VoteGuildEmergencyElectionInput,
} from '../../domain/guild/guild-emergency-election.model';
import {
  FinalizeGuildEmergencyElectionRpcRow,
  NominateGuildEmergencyLeaderCandidateRpcRow,
  StartGuildEmergencyElectionRpcRow,
  StartGuildEmergencyElectionVotingRpcRow,
  VoteGuildEmergencyElectionRpcRow,
} from '../../types/guild-rpc.types';
import {
  mapGuildEmergencyElectionFinalizeResult,
  mapGuildEmergencyElectionNominationResult,
  mapGuildEmergencyElectionStartResult,
  mapGuildEmergencyElectionVoteResult,
  mapGuildEmergencyElectionVotingStartResult,
  toFinalizeGuildEmergencyElectionRpcArgs,
  toNominateGuildEmergencyLeaderCandidateRpcArgs,
  toStartGuildEmergencyElectionRpcArgs,
  toStartGuildEmergencyElectionVotingRpcArgs,
  toVoteGuildEmergencyElectionRpcArgs,
} from '../../utils/guild-emergency-election-action-mappers';
import { firstRpcRow } from '../../utils/rpc-result';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerGuildElectionActions {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  startEmergencyElectionForActiveHero(
    input: StartGuildEmergencyElectionInput = {},
  ): Observable<GuildEmergencyElectionStartResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.startEmergencyElection(
          context.heroId,
          withRequestId(input, 'guild-emergency-election-start'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  startEmergencyElection(
    actorHeroId: string,
    input: StartGuildEmergencyElectionInput = {},
  ): Observable<GuildEmergencyElectionStartResult> {
    return this.backend
      .rpc<StartGuildEmergencyElectionRpcRow[]>(
        RPC.start_guild_emergency_election,
        toStartGuildEmergencyElectionRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-emergency-election-start'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildEmergencyElectionStartResult(
            firstRpcRow(rows, RPC.start_guild_emergency_election),
          )
        ),
      );
  }

  nominateEmergencyLeaderCandidateForActiveHero(
    input: NominateGuildEmergencyLeaderCandidateInput,
  ): Observable<GuildEmergencyElectionNominationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.nominateEmergencyLeaderCandidate(
          context.heroId,
          withRequestId(input, 'guild-emergency-election-nominate'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  nominateEmergencyLeaderCandidate(
    actorHeroId: string,
    input: NominateGuildEmergencyLeaderCandidateInput,
  ): Observable<GuildEmergencyElectionNominationResult> {
    return this.backend
      .rpc<NominateGuildEmergencyLeaderCandidateRpcRow[]>(
        RPC.nominate_guild_emergency_leader_candidate,
        toNominateGuildEmergencyLeaderCandidateRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-emergency-election-nominate'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildEmergencyElectionNominationResult(
            firstRpcRow(rows, RPC.nominate_guild_emergency_leader_candidate),
          )
        ),
      );
  }

  startEmergencyElectionVotingForActiveHero(
    input: StartGuildEmergencyElectionVotingInput,
  ): Observable<GuildEmergencyElectionVotingStartResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.startEmergencyElectionVoting(
          context.heroId,
          withRequestId(input, 'guild-emergency-election-voting'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  startEmergencyElectionVoting(
    actorHeroId: string,
    input: StartGuildEmergencyElectionVotingInput,
  ): Observable<GuildEmergencyElectionVotingStartResult> {
    return this.backend
      .rpc<StartGuildEmergencyElectionVotingRpcRow[]>(
        RPC.start_guild_emergency_election_voting,
        toStartGuildEmergencyElectionVotingRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-emergency-election-voting'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildEmergencyElectionVotingStartResult(
            firstRpcRow(rows, RPC.start_guild_emergency_election_voting),
          )
        ),
      );
  }

  voteEmergencyElectionForActiveHero(
    input: VoteGuildEmergencyElectionInput,
  ): Observable<GuildEmergencyElectionVoteResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.voteEmergencyElection(
          context.heroId,
          withRequestId(input, 'guild-emergency-election-vote'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  voteEmergencyElection(
    voterHeroId: string,
    input: VoteGuildEmergencyElectionInput,
  ): Observable<GuildEmergencyElectionVoteResult> {
    return this.backend
      .rpc<VoteGuildEmergencyElectionRpcRow[]>(
        RPC.vote_guild_emergency_election,
        toVoteGuildEmergencyElectionRpcArgs(
          voterHeroId,
          withRequestId(input, 'guild-emergency-election-vote'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildEmergencyElectionVoteResult(
            firstRpcRow(rows, RPC.vote_guild_emergency_election),
          )
        ),
      );
  }

  finalizeEmergencyElectionForActiveHero(
    input: FinalizeGuildEmergencyElectionInput,
  ): Observable<GuildEmergencyElectionFinalizeResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.finalizeEmergencyElection(
          context.heroId,
          withRequestId(input, 'guild-emergency-election-finalize'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  finalizeEmergencyElection(
    actorHeroId: string,
    input: FinalizeGuildEmergencyElectionInput,
  ): Observable<GuildEmergencyElectionFinalizeResult> {
    return this.backend
      .rpc<FinalizeGuildEmergencyElectionRpcRow[]>(
        RPC.finalize_guild_emergency_election,
        toFinalizeGuildEmergencyElectionRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-emergency-election-finalize'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildEmergencyElectionFinalizeResult(
            firstRpcRow(rows, RPC.finalize_guild_emergency_election),
          )
        ),
      );
  }
}

function withRequestId<T extends { requestId?: string | null }>(
  input: T,
  prefix: string,
): T {
  return input.requestId ? input : { ...input, requestId: createRequestId(prefix) };
}

function createRequestId(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}:${randomId}`;
}

function assertActiveContext(
  active: { heroId: string | null; serverId: string | null } | null,
  expected: { heroId: string; serverId: string },
): void {
  if (active?.heroId !== expected.heroId || active.serverId !== expected.serverId) {
    throw new Error('Guild emergency election context changed.');
  }
}
