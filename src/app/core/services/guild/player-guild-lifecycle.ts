import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  DisbandGuildInput,
  GuildDisbandResult,
  GuildLeaveResult,
  LeaveGuildInput,
} from '../../domain/guild/guild.model';
import {
  DisbandGuildRpcRow,
  LeaveGuildRpcRow,
} from '../../types/guild-rpc.types';
import {
  mapGuildDisbandResult,
  mapGuildLeaveResult,
  toDisbandGuildRpcArgs,
  toLeaveGuildRpcArgs,
} from '../../utils/guild-lifecycle-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerGuildLifecycle {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  leaveGuildForActiveHero(input: LeaveGuildInput = {}): Observable<GuildLeaveResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.leaveGuild(
          context.heroId,
          withRequestId(input, 'guild-leave'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  leaveGuild(
    actorHeroId: string,
    input: LeaveGuildInput = {},
  ): Observable<GuildLeaveResult> {
    return this.backend
      .rpc<LeaveGuildRpcRow[]>(
        RPC.leave_guild,
        toLeaveGuildRpcArgs(actorHeroId, withRequestId(input, 'guild-leave')),
      )
      .pipe(map((rows) => mapGuildLeaveResult(firstRow(rows, RPC.leave_guild))));
  }

  disbandGuildForActiveHero(
    input: DisbandGuildInput,
  ): Observable<GuildDisbandResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.disbandGuild(
          context.heroId,
          withRequestId(input, 'guild-disband'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  disbandGuild(
    actorHeroId: string,
    input: DisbandGuildInput,
  ): Observable<GuildDisbandResult> {
    return this.backend
      .rpc<DisbandGuildRpcRow[]>(
        RPC.disband_guild,
        toDisbandGuildRpcArgs(actorHeroId, withRequestId(input, 'guild-disband')),
      )
      .pipe(map((rows) => mapGuildDisbandResult(firstRow(rows, RPC.disband_guild))));
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
    throw new Error(`${rpcName} returned no guild lifecycle row.`);
  }

  return row;
}

function assertActiveContext(
  active: { heroId: string | null; serverId: string | null } | null,
  expected: { heroId: string; serverId: string },
): void {
  if (active?.heroId !== expected.heroId || active.serverId !== expected.serverId) {
    throw new Error('Guild lifecycle context changed.');
  }
}
