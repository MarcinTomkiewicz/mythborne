import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  DepositGuildArmoryItemInput,
  GuildArmoryAccessLockState,
  GuildArmoryBorrowResult,
  GuildArmoryItemActionInput,
  GuildArmoryItemOperationResult,
  GuildArmoryLoanActionInput,
  GuildArmoryLoanOperationResult,
  SetGuildArmoryMemberAccessInput,
} from '../../domain/guild/guild-armory.model';
import {
  BorrowGuildArmoryItemRpcRow,
  DepositGuildArmoryItemRpcRow,
  ForceReturnGuildArmoryLoanRpcRow,
  RemoveGuildArmoryItemRpcRow,
  ReturnGuildArmoryLoanRpcRow,
  SetGuildArmoryMemberAccessRpcRow,
  WithdrawGuildArmoryItemRpcRow,
} from '../../types/guild-rpc.types';
import {
  mapGuildArmoryAccessLockState,
  mapGuildArmoryBorrowResult,
  mapGuildArmoryDepositResult,
  mapGuildArmoryForceReturnResult,
  mapGuildArmoryRemoveResult,
  mapGuildArmoryReturnResult,
  mapGuildArmoryWithdrawResult,
  toDepositGuildArmoryItemRpcArgs,
  toGuildArmoryItemActionRpcArgs,
  toGuildArmoryLoanActionRpcArgs,
  toSetGuildArmoryMemberAccessRpcArgs,
} from '../../utils/guild-armory-action-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

@Injectable({ providedIn: 'root' })
export class PlayerGuildArmoryActions {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  depositGuildArmoryItemForActiveHero(
    input: DepositGuildArmoryItemInput,
  ): Observable<GuildArmoryItemOperationResult> {
    return this.runOperationForActiveHero(
      input,
      'guild-armory-deposit',
      (actorHeroId, actionInput) =>
        this.depositGuildArmoryItem(actorHeroId, actionInput),
    );
  }

  depositGuildArmoryItem(
    actorHeroId: string,
    input: DepositGuildArmoryItemInput,
  ): Observable<GuildArmoryItemOperationResult> {
    return this.backend
      .rpc<DepositGuildArmoryItemRpcRow[]>(
        RPC.deposit_guild_armory_item,
        toDepositGuildArmoryItemRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-armory-deposit'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildArmoryDepositResult(firstRow(rows, RPC.deposit_guild_armory_item))
        ),
      );
  }

  borrowGuildArmoryItemForActiveHero(
    input: GuildArmoryItemActionInput,
  ): Observable<GuildArmoryBorrowResult> {
    return this.runOperationForActiveHero(
      input,
      'guild-armory-borrow',
      (actorHeroId, actionInput) =>
        this.borrowGuildArmoryItem(actorHeroId, actionInput),
    );
  }

  borrowGuildArmoryItem(
    actorHeroId: string,
    input: GuildArmoryItemActionInput,
  ): Observable<GuildArmoryBorrowResult> {
    return this.backend
      .rpc<BorrowGuildArmoryItemRpcRow[]>(
        RPC.borrow_guild_armory_item,
        toGuildArmoryItemActionRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-armory-borrow'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildArmoryBorrowResult(firstRow(rows, RPC.borrow_guild_armory_item))
        ),
      );
  }

  returnGuildArmoryLoanForActiveHero(
    input: GuildArmoryLoanActionInput,
  ): Observable<GuildArmoryLoanOperationResult> {
    return this.runOperationForActiveHero(
      input,
      'guild-armory-return',
      (actorHeroId, actionInput) =>
        this.returnGuildArmoryLoan(actorHeroId, actionInput),
    );
  }

  returnGuildArmoryLoan(
    actorHeroId: string,
    input: GuildArmoryLoanActionInput,
  ): Observable<GuildArmoryLoanOperationResult> {
    return this.backend
      .rpc<ReturnGuildArmoryLoanRpcRow[]>(
        RPC.return_guild_armory_loan,
        toGuildArmoryLoanActionRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-armory-return'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildArmoryReturnResult(firstRow(rows, RPC.return_guild_armory_loan))
        ),
      );
  }

  forceReturnGuildArmoryLoanForActiveHero(
    input: GuildArmoryLoanActionInput,
  ): Observable<GuildArmoryLoanOperationResult> {
    return this.runOperationForActiveHero(
      input,
      'guild-armory-force-return',
      (actorHeroId, actionInput) =>
        this.forceReturnGuildArmoryLoan(actorHeroId, actionInput),
    );
  }

  forceReturnGuildArmoryLoan(
    actorHeroId: string,
    input: GuildArmoryLoanActionInput,
  ): Observable<GuildArmoryLoanOperationResult> {
    return this.backend
      .rpc<ForceReturnGuildArmoryLoanRpcRow[]>(
        RPC.force_return_guild_armory_loan,
        toGuildArmoryLoanActionRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-armory-force-return'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildArmoryForceReturnResult(
            firstRow(rows, RPC.force_return_guild_armory_loan),
          )
        ),
      );
  }

  withdrawGuildArmoryItemForActiveHero(
    input: GuildArmoryItemActionInput,
  ): Observable<GuildArmoryItemOperationResult> {
    return this.runOperationForActiveHero(
      input,
      'guild-armory-withdraw',
      (actorHeroId, actionInput) =>
        this.withdrawGuildArmoryItem(actorHeroId, actionInput),
    );
  }

  withdrawGuildArmoryItem(
    actorHeroId: string,
    input: GuildArmoryItemActionInput,
  ): Observable<GuildArmoryItemOperationResult> {
    return this.backend
      .rpc<WithdrawGuildArmoryItemRpcRow[]>(
        RPC.withdraw_guild_armory_item,
        toGuildArmoryItemActionRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-armory-withdraw'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildArmoryWithdrawResult(
            firstRow(rows, RPC.withdraw_guild_armory_item),
          )
        ),
      );
  }

  removeGuildArmoryItemForActiveHero(
    input: GuildArmoryItemActionInput,
  ): Observable<GuildArmoryItemOperationResult> {
    return this.runOperationForActiveHero(
      input,
      'guild-armory-remove',
      (actorHeroId, actionInput) =>
        this.removeGuildArmoryItem(actorHeroId, actionInput),
    );
  }

  removeGuildArmoryItem(
    actorHeroId: string,
    input: GuildArmoryItemActionInput,
  ): Observable<GuildArmoryItemOperationResult> {
    return this.backend
      .rpc<RemoveGuildArmoryItemRpcRow[]>(
        RPC.remove_guild_armory_item,
        toGuildArmoryItemActionRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-armory-remove'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildArmoryRemoveResult(firstRow(rows, RPC.remove_guild_armory_item))
        ),
      );
  }

  setGuildArmoryMemberAccessForActiveHero(
    input: SetGuildArmoryMemberAccessInput,
  ): Observable<GuildArmoryAccessLockState> {
    return this.runOperationForActiveHero(
      input,
      'guild-armory-access',
      (actorHeroId, actionInput) =>
        this.setGuildArmoryMemberAccess(actorHeroId, actionInput),
    );
  }

  setGuildArmoryMemberAccess(
    actorHeroId: string,
    input: SetGuildArmoryMemberAccessInput,
  ): Observable<GuildArmoryAccessLockState> {
    return this.backend
      .rpc<SetGuildArmoryMemberAccessRpcRow[]>(
        RPC.set_guild_armory_member_access,
        toSetGuildArmoryMemberAccessRpcArgs(
          actorHeroId,
          withRequestId(input, 'guild-armory-access'),
        ),
      )
      .pipe(
        map((rows) =>
          mapGuildArmoryAccessLockState(
            firstRow(rows, RPC.set_guild_armory_member_access),
          )
        ),
      );
  }

  private runOperationForActiveHero<TInput extends { requestId?: string | null }, TResult>(
    input: TInput,
    requestIdPrefix: string,
    operation: (
      actorHeroId: string,
      input: TInput,
    ) => Observable<TResult>,
  ): Observable<TResult> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) =>
        operation(context.heroId, withRequestId(input, requestIdPrefix)).pipe(
          map((result) => {
            assertActiveContext(this.activeHero.state(), context);

            return result;
          }),
        ),
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
    throw new Error(`${rpcName} returned no guild armory row.`);
  }

  return row;
}

function assertActiveContext(
  active: { heroId: string | null; serverId: string | null } | null,
  expected: { heroId: string; serverId: string },
): void {
  if (active?.heroId !== expected.heroId || active.serverId !== expected.serverId) {
    throw new Error('Guild armory context changed.');
  }
}
