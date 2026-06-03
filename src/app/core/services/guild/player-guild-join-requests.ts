import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CancelGuildJoinRequestInput,
  CreateGuildJoinRequestInput,
  GuildJoinRequest,
  GuildJoinRequestOperationResult,
  ReviewGuildJoinRequestInput,
} from '../../domain/guild/guild.model';
import {
  CancelGuildJoinRequestRpcRow,
  CreateGuildJoinRequestRpcRow,
  GetHeroGuildJoinRequestRowsRpcRow,
  ReviewGuildJoinRequestRpcRow,
} from '../../types/guild-rpc.types';
import {
  mapGuildJoinRequestOperationResult,
  toCancelGuildJoinRequestRpcArgs,
  toCreateGuildJoinRequestRpcArgs,
  toReviewGuildJoinRequestRpcArgs,
} from '../../utils/guild-join-request-mappers';
import { mapGuildJoinRequest } from '../../utils/guild-mappers';
import { firstRpcRow } from '../../utils/rpc-result';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerGuildJoinRequests {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroGuildJoinRequests(
    includeTerminal = false,
  ): Observable<GuildJoinRequest[]> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.getHeroGuildJoinRequests(context.heroId, includeTerminal).pipe(
          map((requests) => {
            assertActiveContext(this.activeHero.state(), context);

            return requests;
          }),
        ),
      ),
    );
  }

  getHeroGuildJoinRequests(
    heroId: string,
    includeTerminal = false,
  ): Observable<GuildJoinRequest[]> {
    return this.backend
      .rpc<GetHeroGuildJoinRequestRowsRpcRow[]>(
        RPC.get_hero_guild_join_request_rows,
        { p_hero_id: heroId, p_include_terminal: includeTerminal },
      )
      .pipe(map((rows) => rows.map(mapGuildJoinRequest)));
  }

  createGuildJoinRequestForActiveHero(
    input: CreateGuildJoinRequestInput,
  ): Observable<GuildJoinRequestOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.createGuildJoinRequest(
          context.heroId,
          withRequestId(input, 'guild-join-request'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  createGuildJoinRequest(
    requesterHeroId: string,
    input: CreateGuildJoinRequestInput,
  ): Observable<GuildJoinRequestOperationResult> {
    return this.backend
      .rpc<CreateGuildJoinRequestRpcRow[]>(
        RPC.create_guild_join_request,
        toCreateGuildJoinRequestRpcArgs(
          requesterHeroId,
          withRequestId(input, 'guild-join-request'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildJoinRequestOperationResult(firstRpcRow(rows, RPC.create_guild_join_request))
        ),
      );
  }

  reviewGuildJoinRequestForActiveHero(
    input: ReviewGuildJoinRequestInput,
  ): Observable<GuildJoinRequestOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.reviewGuildJoinRequest(
          context.heroId,
          withRequestId(input, 'guild-join-request-review'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  reviewGuildJoinRequest(
    actorHeroId: string,
    input: ReviewGuildJoinRequestInput,
  ): Observable<GuildJoinRequestOperationResult> {
    return this.backend
      .rpc<ReviewGuildJoinRequestRpcRow[]>(
        RPC.review_guild_join_request,
        toReviewGuildJoinRequestRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-join-request-review'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildJoinRequestOperationResult(firstRpcRow(rows, RPC.review_guild_join_request))
        ),
      );
  }

  cancelGuildJoinRequestForActiveHero(
    input: CancelGuildJoinRequestInput,
  ): Observable<GuildJoinRequestOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.cancelGuildJoinRequest(
          context.heroId,
          withRequestId(input, 'guild-join-request-cancel'),
        ).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  cancelGuildJoinRequest(
    requesterHeroId: string,
    input: CancelGuildJoinRequestInput,
  ): Observable<GuildJoinRequestOperationResult> {
    return this.backend
      .rpc<CancelGuildJoinRequestRpcRow[]>(
        RPC.cancel_guild_join_request,
        toCancelGuildJoinRequestRpcArgs(
          requesterHeroId,
          withRequestId(input, 'guild-join-request-cancel'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildJoinRequestOperationResult(firstRpcRow(rows, RPC.cancel_guild_join_request))
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

function assertActiveContext(
  active: { heroId: string | null; serverId: string | null } | null,
  expected: { heroId: string; serverId: string },
): void {
  if (active?.heroId !== expected.heroId || active.serverId !== expected.serverId) {
    throw new Error('Guild join request context changed.');
  }
}
