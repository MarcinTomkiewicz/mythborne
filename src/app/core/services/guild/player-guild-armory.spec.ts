import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import {
  GetHeroGuildArmoryItemRowsRpcRow,
  GetHeroGuildArmoryLoanRowsRpcRow,
} from '../../types/guild-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { PlayerGuildArmory } from './player-guild-armory';

describe('PlayerGuildArmory', () => {
  let service: PlayerGuildArmory;
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
        PlayerGuildArmory,
        { provide: Backend, useValue: backend },
        { provide: ActiveHero, useValue: activeHero },
      ],
    });

    service = TestBed.inject(PlayerGuildArmory);
  });

  it('loads active hero guild armory through canonical read RPCs', async () => {
    backend.rpc.and.returnValues(of([itemRow()]), of([loanRow()]));

    const result = await firstValueFrom(service.getActiveHeroGuildArmory(true));

    expect(backend.rpc).toHaveBeenCalledWith(
      'get_hero_guild_armory_item_rows',
      { p_hero_id: 'hero-1' },
    );
    expect(backend.rpc).toHaveBeenCalledWith(
      'get_hero_guild_armory_loan_rows',
      { p_hero_id: 'hero-1', p_include_terminal: true },
    );
    expect(result.items[0].armoryItemId).toBe('armory-item-1');
    expect(result.loans[0].loanId).toBe('loan-1');
  });

  it('rejects stale active hero context after read RPC responses', async () => {
    const itemResponse = new Subject<GetHeroGuildArmoryItemRowsRpcRow[]>();
    const loanResponse = new Subject<GetHeroGuildArmoryLoanRowsRpcRow[]>();
    backend.rpc.and.returnValues(itemResponse.asObservable(), loanResponse.asObservable());

    const result = firstValueFrom(service.getActiveHeroGuildArmory());
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    itemResponse.next([itemRow()]);
    itemResponse.complete();
    loanResponse.next([loanRow()]);
    loanResponse.complete();

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

function itemRow(): GetHeroGuildArmoryItemRowsRpcRow {
  return {
    armory_item_id: 'armory-item-1',
    armory_status_key: 'available',
    base_type_key: 'spear',
    borrowed_at: '',
    borrower_hero_id: '',
    borrower_hero_name: '',
    can_borrow: true,
    can_force_return: false,
    can_remove: true,
    can_return: false,
    can_withdraw: true,
    deposited_at: '2026-05-09T10:00:00.000Z',
    generation_quality_key: 'common',
    guild_id: 'guild-1',
    item_id: 'item-1',
    item_name: 'Bronze Spear',
    item_status: 'active',
    loan_id: '',
    loan_status_key: '',
    owner_hero_id: 'owner-hero-1',
    owner_hero_name: 'Owner Hero',
    quality_label: 'Common',
  };
}

function loanRow(): GetHeroGuildArmoryLoanRowsRpcRow {
  return {
    armory_item_id: 'armory-item-1',
    borrowed_at: '2026-05-09T11:00:00.000Z',
    borrower_hero_id: 'borrower-hero-1',
    borrower_hero_name: 'Borrower Hero',
    can_force_return: true,
    can_return: true,
    due_at: '',
    ended_at: '',
    guild_id: 'guild-1',
    item_id: 'item-1',
    item_name: 'Bronze Spear',
    loan_id: 'loan-1',
    loan_status_key: 'active',
    owner_hero_id: 'owner-hero-1',
    owner_hero_name: 'Owner Hero',
    reason: '',
    status_reason: '',
  };
}
