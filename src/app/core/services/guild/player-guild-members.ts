import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  DemoteGuildOfficerInput,
  GuildMemberListItem,
  GuildMemberOperationResult,
  KickGuildMemberInput,
  PromoteGuildMemberInput,
} from '../../domain/guild/guild.model';
import {
  DemoteGuildOfficerRpcRow,
  GetHeroGuildMembersRpcRow,
  KickGuildMemberRpcRow,
  PromoteGuildMemberToOfficerRpcRow,
} from '../../types/guild-rpc.types';
import {
  mapGuildMemberListItem,
  mapGuildMemberOperationResult,
  toDemoteGuildOfficerRpcArgs,
  toKickGuildMemberRpcArgs,
  toPromoteGuildMemberRpcArgs,
} from '../../utils/guild-member-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerGuildMembers {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroGuildMembers(): Observable<GuildMemberListItem[]> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.getHeroGuildMembers(context.heroId).pipe(
          map((members) => {
            assertActiveContext(this.activeHero.state(), context);

            return members;
          }),
        ),
      ),
    );
  }

  getHeroGuildMembers(heroId: string): Observable<GuildMemberListItem[]> {
    return this.backend
      .rpc<GetHeroGuildMembersRpcRow[]>(RPC.get_hero_guild_members, { p_hero_id: heroId })
      .pipe(map((rows) => rows.map(mapGuildMemberListItem)));
  }

  kickGuildMemberForActiveHero(
    input: KickGuildMemberInput,
  ): Observable<GuildMemberOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.kickGuildMember(
          context.heroId,
          withRequestId(input, 'guild-member-kick'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  kickGuildMember(
    actorHeroId: string,
    input: KickGuildMemberInput,
  ): Observable<GuildMemberOperationResult> {
    return this.backend
      .rpc<KickGuildMemberRpcRow[]>(
        RPC.kick_guild_member,
        toKickGuildMemberRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-member-kick'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildMemberOperationResult(firstRow(rows, RPC.kick_guild_member))
        ),
      );
  }

  promoteGuildMemberForActiveHero(
    input: PromoteGuildMemberInput,
  ): Observable<GuildMemberOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.promoteGuildMember(
          context.heroId,
          withRequestId(input, 'guild-member-promote'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  promoteGuildMember(
    actorHeroId: string,
    input: PromoteGuildMemberInput,
  ): Observable<GuildMemberOperationResult> {
    return this.backend
      .rpc<PromoteGuildMemberToOfficerRpcRow[]>(
        RPC.promote_guild_member_to_officer,
        toPromoteGuildMemberRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-member-promote'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildMemberOperationResult(firstRow(rows, RPC.promote_guild_member_to_officer))
        ),
      );
  }

  demoteGuildOfficerForActiveHero(
    input: DemoteGuildOfficerInput,
  ): Observable<GuildMemberOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.demoteGuildOfficer(
          context.heroId,
          withRequestId(input, 'guild-member-demote'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  demoteGuildOfficer(
    actorHeroId: string,
    input: DemoteGuildOfficerInput,
  ): Observable<GuildMemberOperationResult> {
    return this.backend
      .rpc<DemoteGuildOfficerRpcRow[]>(
        RPC.demote_guild_officer,
        toDemoteGuildOfficerRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-member-demote'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildMemberOperationResult(firstRow(rows, RPC.demote_guild_officer))
        ),
      );
  }
}

function withRequestId<T extends { requestId?: string | null }>(input: T, prefix: string): T {
  return input.requestId ? input : { ...input, requestId: createRequestId(prefix) };
}

function createRequestId(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}:${randomId}`;
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no guild member row.`);
  }

  return row;
}

function assertActiveContext(
  active: { heroId: string | null; serverId: string | null } | null,
  expected: { heroId: string; serverId: string },
): void {
  if (active?.heroId !== expected.heroId || active.serverId !== expected.serverId) {
    throw new Error('Guild member context changed.');
  }
}
