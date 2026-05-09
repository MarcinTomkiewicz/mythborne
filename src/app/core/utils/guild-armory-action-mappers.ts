import {
  DepositGuildArmoryItemInput,
  GuildArmoryAccessLockState,
  GuildArmoryBorrowResult,
  GuildArmoryItemActionInput,
  GuildArmoryItemOperationResult,
  GuildArmoryLoanActionInput,
  GuildArmoryLoanOperationResult,
  SetGuildArmoryMemberAccessInput,
} from '../domain/guild/guild-armory.model';
import {
  BorrowGuildArmoryItemRpcArgs,
  BorrowGuildArmoryItemRpcRow,
  DepositGuildArmoryItemRpcArgs,
  DepositGuildArmoryItemRpcRow,
  ForceReturnGuildArmoryLoanRpcArgs,
  ForceReturnGuildArmoryLoanRpcRow,
  RemoveGuildArmoryItemRpcArgs,
  RemoveGuildArmoryItemRpcRow,
  ReturnGuildArmoryLoanRpcArgs,
  ReturnGuildArmoryLoanRpcRow,
  SetGuildArmoryMemberAccessRpcArgs,
  SetGuildArmoryMemberAccessRpcRow,
  WithdrawGuildArmoryItemRpcArgs,
  WithdrawGuildArmoryItemRpcRow,
} from '../types/guild-rpc.types';

export function toDepositGuildArmoryItemRpcArgs(
  actorHeroId: string,
  input: DepositGuildArmoryItemInput,
): DepositGuildArmoryItemRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_item_id: requiredText(input.itemId, 'item id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toGuildArmoryItemActionRpcArgs(
  actorHeroId: string,
  input: GuildArmoryItemActionInput,
):
  | BorrowGuildArmoryItemRpcArgs
  | WithdrawGuildArmoryItemRpcArgs
  | RemoveGuildArmoryItemRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_armory_item_id: requiredText(input.armoryItemId, 'armory item id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toGuildArmoryLoanActionRpcArgs(
  actorHeroId: string,
  input: GuildArmoryLoanActionInput,
): ReturnGuildArmoryLoanRpcArgs | ForceReturnGuildArmoryLoanRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_loan_id: requiredText(input.loanId, 'loan id'),
    p_reason: nullableText(input.reason) ?? undefined,
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function toSetGuildArmoryMemberAccessRpcArgs(
  actorHeroId: string,
  input: SetGuildArmoryMemberAccessInput,
): SetGuildArmoryMemberAccessRpcArgs {
  return {
    p_actor_hero_id: actorHeroId,
    p_member_hero_id: requiredText(input.memberHeroId, 'member hero id'),
    p_status_key: requiredText(input.statusKey, 'armory access status'),
    p_reason: requiredText(input.reason, 'reason'),
    p_request_id: nullableText(input.requestId) ?? undefined,
  };
}

export function mapGuildArmoryDepositResult(
  row: DepositGuildArmoryItemRpcRow,
): GuildArmoryItemOperationResult {
  return mapGuildArmoryItemOperationResult('deposit', row);
}

export function mapGuildArmoryWithdrawResult(
  row: WithdrawGuildArmoryItemRpcRow,
): GuildArmoryItemOperationResult {
  return mapGuildArmoryItemOperationResult('withdraw', row);
}

export function mapGuildArmoryRemoveResult(
  row: RemoveGuildArmoryItemRpcRow,
): GuildArmoryItemOperationResult {
  return mapGuildArmoryItemOperationResult('remove', row);
}

export function mapGuildArmoryBorrowResult(
  row: BorrowGuildArmoryItemRpcRow,
): GuildArmoryBorrowResult {
  return {
    kind: 'borrow',
    guildId: row.guild_id,
    armoryItemId: row.armory_item_id,
    itemId: row.item_id,
    ownerHeroId: row.owner_hero_id,
    borrowerHeroId: row.borrower_hero_id,
    loanId: row.loan_id,
    armoryStatusKey: row.armory_status_key,
    loanStatusKey: row.loan_status_key,
  };
}

export function mapGuildArmoryReturnResult(
  row: ReturnGuildArmoryLoanRpcRow,
): GuildArmoryLoanOperationResult {
  return mapGuildArmoryLoanOperationResult('return', row);
}

export function mapGuildArmoryForceReturnResult(
  row: ForceReturnGuildArmoryLoanRpcRow,
): GuildArmoryLoanOperationResult {
  return mapGuildArmoryLoanOperationResult('force-return', row);
}

export function mapGuildArmoryAccessLockState(
  row: SetGuildArmoryMemberAccessRpcRow,
): GuildArmoryAccessLockState {
  return {
    accessLockId: row.access_lock_id,
    guildId: row.guild_id,
    memberHeroId: row.member_hero_id,
    statusKey: row.status_key,
  };
}

function mapGuildArmoryItemOperationResult(
  kind: GuildArmoryItemOperationResult['kind'],
  row:
    | DepositGuildArmoryItemRpcRow
    | WithdrawGuildArmoryItemRpcRow
    | RemoveGuildArmoryItemRpcRow,
): GuildArmoryItemOperationResult {
  return {
    kind,
    guildId: row.guild_id,
    armoryItemId: row.armory_item_id,
    itemId: row.item_id,
    ownerHeroId: row.owner_hero_id,
    statusKey: row.status_key,
  };
}

function mapGuildArmoryLoanOperationResult(
  kind: GuildArmoryLoanOperationResult['kind'],
  row: ReturnGuildArmoryLoanRpcRow | ForceReturnGuildArmoryLoanRpcRow,
): GuildArmoryLoanOperationResult {
  return {
    kind,
    guildId: row.guild_id,
    armoryItemId: row.armory_item_id,
    itemId: row.item_id,
    loanId: row.loan_id,
    armoryStatusKey: row.armory_status_key,
    loanStatusKey: row.loan_status_key,
  };
}

function nullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function requiredText(value: string, label: string): string {
  const trimmed = nullableText(value);

  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  return trimmed;
}
