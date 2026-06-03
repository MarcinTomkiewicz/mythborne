import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CancelGuildInviteInput,
  CreateGuildInviteInput,
  GuildInvite,
  GuildInviteOperationResult,
  RespondGuildInviteInput,
} from '../../domain/guild/guild.model';
import {
  CancelGuildInviteRpcRow,
  CreateGuildInviteRpcRow,
  GetHeroGuildInvitationRowsRpcRow,
  RespondGuildInviteRpcRow,
} from '../../types/guild-rpc.types';
import {
  mapGuildInviteOperationResult,
  toCancelGuildInviteRpcArgs,
  toCreateGuildInviteRpcArgs,
  toRespondGuildInviteRpcArgs,
} from '../../utils/guild-invite-mappers';
import { mapGuildInvite } from '../../utils/guild-mappers';
import { firstRpcRow } from '../../utils/rpc-result';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerGuildInvites {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroGuildInvites(includeTerminal = false): Observable<GuildInvite[]> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.getHeroGuildInvites(context.heroId, includeTerminal).pipe(
          map((invites) => {
            assertActiveContext(this.activeHero.state(), context);

            return invites;
          }),
        ),
      ),
    );
  }

  getHeroGuildInvites(
    heroId: string,
    includeTerminal = false,
  ): Observable<GuildInvite[]> {
    return this.backend
      .rpc<GetHeroGuildInvitationRowsRpcRow[]>(
        RPC.get_hero_guild_invitation_rows,
        { p_hero_id: heroId, p_include_terminal: includeTerminal },
      )
      .pipe(map((rows) => rows.map(mapGuildInvite)));
  }

  createGuildInviteForActiveHero(
    input: CreateGuildInviteInput,
  ): Observable<GuildInviteOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.createGuildInvite(context.heroId, withRequestId(input, 'guild-invite')).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  createGuildInvite(
    actorHeroId: string,
    input: CreateGuildInviteInput,
  ): Observable<GuildInviteOperationResult> {
    return this.backend
      .rpc<CreateGuildInviteRpcRow[]>(
        RPC.create_guild_invite,
        toCreateGuildInviteRpcArgs(actorHeroId, withRequestId(input, 'guild-invite')),
      )
      .pipe(
        map((rows) =>
          mapGuildInviteOperationResult(firstRpcRow(rows, RPC.create_guild_invite))
        ),
      );
  }

  respondGuildInviteForActiveHero(
    input: RespondGuildInviteInput,
  ): Observable<GuildInviteOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.respondGuildInvite(context.heroId, withRequestId(input, 'guild-invite-response')).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  respondGuildInvite(
    targetHeroId: string,
    input: RespondGuildInviteInput,
  ): Observable<GuildInviteOperationResult> {
    return this.backend
      .rpc<RespondGuildInviteRpcRow[]>(
        RPC.respond_guild_invite,
        toRespondGuildInviteRpcArgs(targetHeroId, withRequestId(input, 'guild-invite-response')),
      )
      .pipe(
        map((rows) =>
          mapGuildInviteOperationResult(firstRpcRow(rows, RPC.respond_guild_invite))
        ),
      );
  }

  cancelGuildInviteForActiveHero(
    input: CancelGuildInviteInput,
  ): Observable<GuildInviteOperationResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        this.cancelGuildInvite(context.heroId, withRequestId(input, 'guild-invite-cancel')).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
      ),
    );
  }

  cancelGuildInvite(
    actorHeroId: string,
    input: CancelGuildInviteInput,
  ): Observable<GuildInviteOperationResult> {
    return this.backend
      .rpc<CancelGuildInviteRpcRow[]>(
        RPC.cancel_guild_invite,
        toCancelGuildInviteRpcArgs(actorHeroId, withRequestId(input, 'guild-invite-cancel')),
      )
      .pipe(
        map((rows) =>
          mapGuildInviteOperationResult(firstRpcRow(rows, RPC.cancel_guild_invite))
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
    throw new Error('Guild invite context changed.');
  }
}
