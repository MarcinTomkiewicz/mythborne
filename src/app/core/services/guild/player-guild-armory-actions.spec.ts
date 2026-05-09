import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  BorrowGuildArmoryItemRpcRow,
  DepositGuildArmoryItemRpcRow,
  ForceReturnGuildArmoryLoanRpcRow,
  RemoveGuildArmoryItemRpcRow,
  ReturnGuildArmoryLoanRpcRow,
  SetGuildArmoryMemberAccessRpcRow,
  WithdrawGuildArmoryItemRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuildArmoryActions } from './player-guild-armory-actions';

describe('PlayerGuildArmoryActions', () => {
  let service: PlayerGuildArmoryActions;
  let backend: jasmine.SpyObj<Backend>;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let activeHero: Pick<ActiveHero, 'requireActiveHero' | 'state'> & {
    requireActiveHero: jasmine.Spy;
  };

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    activeHero = {
      requireActiveHero: jasmine.createSpy('requireActiveHero'),
      state: activeHeroState.asReadonly(),
    };
    activeHero.requireActiveHero.and.callFake(() => of(activeHeroState() as ActiveHeroState));

    TestBed.configureTestingModule({
      providers: [
        PlayerGuildArmoryActions,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuildArmoryActions);
  });

  it('deposits item through canonical RPC and generated args', async () => {
    backend.rpc.and.returnValue(of([itemOperationRow()]));

    const result = await firstValueFrom(service.depositGuildArmoryItemForActiveHero({
      itemId: 'item-1',
      reason: 'For guild.',
      requestId: 'request-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith('deposit_guild_armory_item', {
      p_actor_hero_id: 'hero-1',
      p_item_id: 'item-1',
      p_reason: 'For guild.',
      p_request_id: 'request-1',
    });
    expect(result.kind).toBe('deposit');
    expect(JSON.stringify(result)).not.toContain('audit-log-1');
  });

  it('generates guild armory request id when caller omits one', async () => {
    backend.rpc.and.returnValue(of([itemOperationRow()]));

    await firstValueFrom(service.depositGuildArmoryItemForActiveHero({
      itemId: 'item-1',
    }));

    expect(backend.rpc).toHaveBeenCalledWith(
      'deposit_guild_armory_item',
      jasmine.objectContaining({
        p_request_id: jasmine.stringMatching(/^guild-armory-deposit:/),
      }),
    );
  });

  it('borrows, returns, force-returns, withdraws, removes and sets access through RPCs', async () => {
    backend.rpc.and.returnValues(
      of([borrowRow()]),
      of([loanOperationRow()]),
      of([loanOperationRow()]),
      of([itemOperationRow()]),
      of([itemOperationRow()]),
      of([accessRow()]),
    );

    const borrow = await firstValueFrom(service.borrowGuildArmoryItemForActiveHero({
      armoryItemId: 'armory-item-1',
      requestId: 'request-2',
    }));
    const returned = await firstValueFrom(service.returnGuildArmoryLoanForActiveHero({
      loanId: 'loan-1',
      requestId: 'request-3',
    }));
    const forceReturned = await firstValueFrom(
      service.forceReturnGuildArmoryLoanForActiveHero({
        loanId: 'loan-1',
        requestId: 'request-4',
      }),
    );
    const withdrawn = await firstValueFrom(service.withdrawGuildArmoryItemForActiveHero({
      armoryItemId: 'armory-item-1',
      requestId: 'request-5',
    }));
    const removed = await firstValueFrom(service.removeGuildArmoryItemForActiveHero({
      armoryItemId: 'armory-item-1',
      requestId: 'request-6',
    }));
    const access = await firstValueFrom(service.setGuildArmoryMemberAccessForActiveHero({
      memberHeroId: 'member-hero-1',
      statusKey: 'blocked',
      reason: 'Abuse.',
      requestId: 'request-7',
    }));

    expect(backend.rpc).toHaveBeenCalledWith(
      'borrow_guild_armory_item',
      jasmine.objectContaining({ p_armory_item_id: 'armory-item-1' }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'return_guild_armory_loan',
      jasmine.objectContaining({ p_loan_id: 'loan-1' }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'force_return_guild_armory_loan',
      jasmine.objectContaining({ p_loan_id: 'loan-1' }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'withdraw_guild_armory_item',
      jasmine.objectContaining({ p_armory_item_id: 'armory-item-1' }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'remove_guild_armory_item',
      jasmine.objectContaining({ p_armory_item_id: 'armory-item-1' }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'set_guild_armory_member_access',
      jasmine.objectContaining({
        p_member_hero_id: 'member-hero-1',
        p_status_key: 'blocked',
      }),
    );
    expect(borrow.kind).toBe('borrow');
    expect(returned.kind).toBe('return');
    expect(forceReturned.kind).toBe('force-return');
    expect(withdrawn.kind).toBe('withdraw');
    expect(removed.kind).toBe('remove');
    expect(access.statusKey).toBe('blocked');
  });

  it('rejects stale active hero context after action RPC response', async () => {
    const response = new Subject<DepositGuildArmoryItemRpcRow[]>();
    backend.rpc.and.returnValue(response.asObservable());

    const result = firstValueFrom(service.depositGuildArmoryItemForActiveHero({
      itemId: 'item-1',
    }));
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next([itemOperationRow()]);
    response.complete();

    await expectAsync(result)
      .toBeRejectedWithError('Guild armory context changed.');
  });
});

function activeContext(
  overrides: Partial<Pick<ActiveHeroState, 'serverId' | 'heroId'>> = {},
): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId: 'hero-1',
    server: {} as ActiveHeroState['server'],
    hero: {} as ActiveHeroState['hero'],
    heroRow: {} as ActiveHeroState['heroRow'],
    ...overrides,
  };
}

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
