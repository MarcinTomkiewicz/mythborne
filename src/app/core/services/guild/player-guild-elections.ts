import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  GuildEmergencyElectionReadModel,
} from '../../domain/guild/guild-emergency-election.model';
import {
  GetHeroGuildEmergencyElectionCandidateRowsRpcRow,
  GetHeroGuildEmergencyElectionSummaryRpcRow,
} from '../../types/guild-rpc.types';
import { mapGuildEmergencyElectionReadModel } from '../../utils/guild-emergency-election-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerGuildElections {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroEmergencyElection(): Observable<GuildEmergencyElectionReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.getHeroEmergencyElection(context.heroId).pipe(
          map((readModel) => {
            assertActiveContext(this.activeHero.state(), context);

            return readModel;
          }),
        ),
      ),
    );
  }

  getHeroEmergencyElection(
    heroId: string,
  ): Observable<GuildEmergencyElectionReadModel> {
    return forkJoin({
      summaryRows: this.backend.rpc<GetHeroGuildEmergencyElectionSummaryRpcRow[]>(
        RPC.get_hero_guild_emergency_election_summary,
        { p_hero_id: heroId },
      ),
      candidateRows: this.backend.rpc<GetHeroGuildEmergencyElectionCandidateRowsRpcRow[]>(
        RPC.get_hero_guild_emergency_election_candidate_rows,
        { p_hero_id: heroId },
      ),
    }).pipe(
      map(({ summaryRows, candidateRows }) =>
        mapGuildEmergencyElectionReadModel(summaryRows, candidateRows)
      ),
    );
  }
}

function assertActiveContext(
  active: { heroId: string | null; serverId: string | null } | null,
  expected: { heroId: string; serverId: string },
): void {
  if (active?.heroId !== expected.heroId || active.serverId !== expected.serverId) {
    throw new Error('Guild emergency election context changed.');
  }
}
