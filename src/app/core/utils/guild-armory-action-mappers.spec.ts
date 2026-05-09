import {
  BorrowGuildArmoryItemRpcRow,
  DepositGuildArmoryItemRpcRow,
  ForceReturnGuildArmoryLoanRpcRow,
  RemoveGuildArmoryItemRpcRow,
  ReturnGuildArmoryLoanRpcRow,
  SetGuildArmoryMemberAccessRpcRow,
  WithdrawGuildArmoryItemRpcRow,
} from '../types/guild-rpc.types';
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
} from './guild-armory-action-mappers';

describe('guild armory action mappers', () => {
  it('maps action args and trims optional text', () => {
    expect(toDepositGuildArmoryItemRpcArgs('hero-1', {
      itemId: ' item-1 ',
      reason: ' Deposit. ',
      requestId: ' request-1 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_item_id: 'item-1',
      p_reason: 'Deposit.',
      p_request_id: 'request-1',
    });

    expect(toGuildArmoryItemActionRpcArgs('hero-1', {
      armoryItemId: ' armory-item-1 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_armory_item_id: 'armory-item-1',
      p_reason: undefined,
      p_request_id: undefined,
    });

    expect(toGuildArmoryLoanActionRpcArgs('hero-1', {
      loanId: ' loan-1 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_loan_id: 'loan-1',
      p_reason: undefined,
      p_request_id: undefined,
    });

    expect(toSetGuildArmoryMemberAccessRpcArgs('hero-1', {
      memberHeroId: ' member-hero-1 ',
      statusKey: 'blocked',
      reason: ' Abuse. ',
      requestId: ' request-2 ',
    })).toEqual({
      p_actor_hero_id: 'hero-1',
      p_member_hero_id: 'member-hero-1',
      p_status_key: 'blocked',
      p_reason: 'Abuse.',
      p_request_id: 'request-2',
    });
  });

  it('maps operation results without exposing audit log id', () => {
    const results = [
      mapGuildArmoryDepositResult(itemOperationRow()),
      mapGuildArmoryWithdrawResult(itemOperationRow()),
      mapGuildArmoryRemoveResult(itemOperationRow()),
      mapGuildArmoryBorrowResult(borrowRow()),
      mapGuildArmoryReturnResult(loanOperationRow()),
      mapGuildArmoryForceReturnResult(loanOperationRow()),
      mapGuildArmoryAccessLockState(accessRow()),
    ];

    expect(results[0]).toEqual(jasmine.objectContaining({
      kind: 'deposit',
      statusKey: 'available',
    }));
    expect(results[3]).toEqual(jasmine.objectContaining({
      kind: 'borrow',
      loanId: 'loan-1',
      borrowerHeroId: 'borrower-hero-1',
    }));
    expect(results[6]).toEqual(jasmine.objectContaining({
      accessLockId: 'access-lock-1',
      statusKey: 'blocked',
    }));
    expect(JSON.stringify(results)).not.toContain('audit-log-1');
  });
});

function itemOperationRow():
  | DepositGuildArmoryItemRpcRow
  | WithdrawGuildArmoryItemRpcRow
  | RemoveGuildArmoryItemRpcRow {
  return {
    armory_item_id: 'armory-item-1',
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    item_id: 'item-1',
    owner_hero_id: 'owner-hero-1',
    status_key: 'available',
  };
}

function borrowRow(): BorrowGuildArmoryItemRpcRow {
  return {
    armory_item_id: 'armory-item-1',
    armory_status_key: 'borrowed',
    audit_log_id: 'audit-log-1',
    borrower_hero_id: 'borrower-hero-1',
    guild_id: 'guild-1',
    item_id: 'item-1',
    loan_id: 'loan-1',
    loan_status_key: 'active',
    owner_hero_id: 'owner-hero-1',
  };
}

function loanOperationRow():
  | ReturnGuildArmoryLoanRpcRow
  | ForceReturnGuildArmoryLoanRpcRow {
  return {
    armory_item_id: 'armory-item-1',
    armory_status_key: 'available',
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    item_id: 'item-1',
    loan_id: 'loan-1',
    loan_status_key: 'returned',
  };
}

function accessRow(): SetGuildArmoryMemberAccessRpcRow {
  return {
    access_lock_id: 'access-lock-1',
    audit_log_id: 'audit-log-1',
    guild_id: 'guild-1',
    member_hero_id: 'member-hero-1',
    status_key: 'blocked',
  };
}
