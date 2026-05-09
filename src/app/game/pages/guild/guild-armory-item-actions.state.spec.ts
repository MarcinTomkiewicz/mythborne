import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  GuildArmoryBorrowResult,
  GuildArmoryItem,
  GuildArmoryItemOperationResult,
  GuildArmoryLoan,
  GuildArmoryLoanOperationResult,
} from '../../../core/domain/guild/guild-armory.model';
import {
  ArmoryItemSummary,
  EquippedItemSummary,
} from '../../../core/domain/item/item-equipment.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { PlayerGuildArmoryActions } from '../../../core/services/guild/player-guild-armory-actions';
import { ToastService } from '../../../core/services/ui/toast';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ArmoryShelfState } from '../../../core/services/items/armory-shelf.state';
import { CurrentEquipmentState } from '../../../core/services/items/current-equipment.state';
import { GuildArmoryItemActionsState } from './guild-armory-item-actions.state';
import { GuildArmoryReadState } from './guild-armory-read.state';

describe('GuildArmoryItemActionsState', () => {
  let state: GuildArmoryItemActionsState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let armory: FakeArmoryShelfState;
  let equipment: FakeCurrentEquipmentState;
  let guildArmory: jasmine.SpyObj<GuildArmoryReadState>;
  let actions: jasmine.SpyObj<PlayerGuildArmoryActions>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    armory = new FakeArmoryShelfState();
    equipment = new FakeCurrentEquipmentState();
    guildArmory = jasmine.createSpyObj<GuildArmoryReadState>('GuildArmoryReadState', [
      'load',
    ]);
    actions = jasmine.createSpyObj<PlayerGuildArmoryActions>(
      'PlayerGuildArmoryActions',
      [
        'borrowGuildArmoryItemForActiveHero',
        'depositGuildArmoryItemForActiveHero',
        'forceReturnGuildArmoryLoanForActiveHero',
        'removeGuildArmoryItemForActiveHero',
        'returnGuildArmoryLoanForActiveHero',
        'withdrawGuildArmoryItemForActiveHero',
      ],
    );
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      providers: [
        GuildArmoryItemActionsState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: ArmoryShelfState, useValue: armory },
        { provide: CurrentEquipmentState, useValue: equipment },
        { provide: GuildArmoryReadState, useValue: guildArmory },
        { provide: PlayerGuildArmoryActions, useValue: actions },
        { provide: ToastService, useValue: toast },
      ],
    });

    state = TestBed.inject(GuildArmoryItemActionsState);
  });

  it('loads personal armory and current equipment context', () => {
    state.load();

    expect(armory.load).toHaveBeenCalled();
    expect(equipment.load).toHaveBeenCalled();
  });

  it('deposits eligible item through canonical action service and refreshes state', () => {
    actions.depositGuildArmoryItemForActiveHero.and.returnValue(
      of(operation({ kind: 'deposit' })),
    );

    state.deposit(depositItem());

    expect(actions.depositGuildArmoryItemForActiveHero).toHaveBeenCalledWith({
      itemId: 'item-1',
    });
    expect(guildArmory.load).toHaveBeenCalled();
    expect(armory.refresh).toHaveBeenCalled();
    expect(equipment.refresh).toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild armory',
      'Item deposited into guild armory.',
    );
    expect(state.isMutating()).toBeFalse();
  });

  it('blocks equipped item deposit before calling RPC', () => {
    equipment.slots.set([equippedItem({ itemId: 'item-1' })]);

    state.deposit(depositItem());

    expect(actions.depositGuildArmoryItemForActiveHero).not.toHaveBeenCalled();
    expect(guildArmory.load).not.toHaveBeenCalled();
    expect(state.error()).toBe(
      'Equipped items must be unequipped before guild armory deposit.',
    );
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild armory action failed',
      'Equipped items must be unequipped before guild armory deposit.',
    );
  });

  it('withdraws owner item and removes manager item through distinct actions', () => {
    actions.withdrawGuildArmoryItemForActiveHero.and.returnValue(
      of(operation({ kind: 'withdraw' })),
    );
    actions.removeGuildArmoryItemForActiveHero.and.returnValue(
      of(operation({ kind: 'remove' })),
    );

    state.withdraw(guildItem({ canWithdraw: true, canRemove: false }));
    state.remove(guildItem({ canWithdraw: false, canRemove: true }));

    expect(actions.withdrawGuildArmoryItemForActiveHero).toHaveBeenCalledWith({
      armoryItemId: 'armory-item-1',
    });
    expect(actions.removeGuildArmoryItemForActiveHero).toHaveBeenCalledWith({
      armoryItemId: 'armory-item-1',
    });
    expect(guildArmory.load).toHaveBeenCalledTimes(2);
    expect(armory.refresh).toHaveBeenCalledTimes(2);
    expect(equipment.refresh).toHaveBeenCalledTimes(2);
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild armory',
      'Item removed from guild armory.',
    );
  });

  it('borrows available item and returns own loan through canonical actions', () => {
    actions.borrowGuildArmoryItemForActiveHero.and.returnValue(of(borrowOperation()));
    actions.returnGuildArmoryLoanForActiveHero.and.returnValue(of(loanOperation()));

    state.borrow(guildItem({ canBorrow: true }));
    state.returnLoan(loan());

    expect(actions.borrowGuildArmoryItemForActiveHero).toHaveBeenCalledWith({
      armoryItemId: 'armory-item-1',
    });
    expect(actions.returnGuildArmoryLoanForActiveHero).toHaveBeenCalledWith({
      loanId: 'loan-1',
    });
    expect(guildArmory.load).toHaveBeenCalledTimes(2);
    expect(armory.refresh).toHaveBeenCalledTimes(2);
    expect(equipment.refresh).toHaveBeenCalledTimes(2);
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild armory',
      'Guild armory loan returned.',
    );
  });

  it('returns active loan from guild armory item rows', () => {
    actions.returnGuildArmoryLoanForActiveHero.and.returnValue(of(loanOperation()));

    state.returnItem(guildItem({ loanId: 'loan-1', canReturn: true }));

    expect(actions.returnGuildArmoryLoanForActiveHero).toHaveBeenCalledWith({
      loanId: 'loan-1',
    });
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild armory',
      'Guild armory loan returned.',
    );
  });

  it('force-returns active loans from item and loan rows through canonical action', () => {
    actions.forceReturnGuildArmoryLoanForActiveHero.and.returnValue(
      of(loanOperation({ kind: 'force-return' })),
    );

    state.forceReturnItem(guildItem({
      loanId: 'loan-1',
      canForceReturn: true,
    }));
    state.forceReturnLoan(loan({ canForceReturn: true }));

    expect(actions.forceReturnGuildArmoryLoanForActiveHero).toHaveBeenCalledWith({
      loanId: 'loan-1',
    });
    expect(actions.forceReturnGuildArmoryLoanForActiveHero).toHaveBeenCalledTimes(2);
    expect(guildArmory.load).toHaveBeenCalledTimes(2);
    expect(armory.refresh).toHaveBeenCalledTimes(2);
    expect(equipment.refresh).toHaveBeenCalledTimes(2);
    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild armory',
      'Guild armory loan force-returned.',
    );
  });

  it('blocks force-return without active loan before calling RPC', () => {
    state.forceReturnItem(guildItem({ loanId: null, canForceReturn: true }));

    expect(actions.forceReturnGuildArmoryLoanForActiveHero).not.toHaveBeenCalled();
    expect(state.error()).toBe('No active guild armory loan for this item.');
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild armory action failed',
      'No active guild armory loan for this item.',
    );
  });

  it('blocks item return without active loan before calling RPC', () => {
    state.returnItem(guildItem({ loanId: null, canReturn: true }));

    expect(actions.returnGuildArmoryLoanForActiveHero).not.toHaveBeenCalled();
    expect(state.error()).toBe('No active guild armory loan for this item.');
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild armory action failed',
      'No active guild armory loan for this item.',
    );
  });

  it('surfaces guild armory action errors', () => {
    actions.withdrawGuildArmoryItemForActiveHero.and.returnValue(
      throwError(() => new Error('Only owner can withdraw this guild armory item.')),
    );

    state.withdraw(guildItem());

    expect(state.error()).toBe('Only owner can withdraw this guild armory item.');
    expect(state.isMutating()).toBeFalse();
    expect(guildArmory.load).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild armory action failed',
      'Only owner can withdraw this guild armory item.',
    );
  });

  it('ignores stale mutation success after active hero context changes', () => {
    const response = new Subject<GuildArmoryItemOperationResult>();
    actions.removeGuildArmoryItemForActiveHero.and.returnValue(response.asObservable());

    state.remove(guildItem());
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    response.next(operation({ kind: 'remove' }));
    response.complete();

    expect(state.error()).toBeNull();
    expect(state.isMutating()).toBeFalse();
    expect(guildArmory.load).not.toHaveBeenCalled();
    expect(armory.refresh).not.toHaveBeenCalled();
    expect(equipment.refresh).not.toHaveBeenCalled();
  });

  it('requires active hero context before mutating', () => {
    activeHeroState.set(activeContext({ heroId: null }));

    state.remove(guildItem());

    expect(actions.removeGuildArmoryItemForActiveHero).not.toHaveBeenCalled();
    expect(state.error()).toBe('No active hero for guild armory action.');
    expect(state.isMutating()).toBeFalse();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild armory action failed',
      'No active hero for guild armory action.',
    );
  });
});

class FakeArmoryShelfState {
  readonly visibleItems = signal<ArmoryItemSummary[]>([]);
  readonly isLoading = signal(false);
  readonly load = jasmine.createSpy('load');
  readonly refresh = jasmine.createSpy('refresh');
}

class FakeCurrentEquipmentState {
  readonly slots = signal<EquippedItemSummary[]>([]);
  readonly isLoading = signal(false);
  readonly load = jasmine.createSpy('load');
  readonly refresh = jasmine.createSpy('refresh');
}

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

function depositItem(overrides: Partial<ArmoryItemSummary> = {}): ArmoryItemSummary {
  return {
    itemId: 'item-1',
    ownerHeroId: 'hero-1',
    serverId: 'server-1',
    name: 'Bronze Spear',
    description: null,
    lifecycleStatus: 'active',
    generationBaseId: 'base-1',
    generationQualityKey: 'common',
    prefixAffixId: null,
    suffixAffixId: null,
    armoryShelfPosition: 1,
    drachmaValue: 10,
    shelfPosition: 1,
    shelfName: 'Main shelf',
    requirementPreview: null,
    ...overrides,
  };
}

function guildItem(overrides: Partial<GuildArmoryItem> = {}): GuildArmoryItem {
  return {
    guildId: 'guild-1',
    armoryItemId: 'armory-item-1',
    itemId: 'item-1',
    itemName: 'Bronze Spear',
    itemStatus: 'active',
    baseTypeKey: 'spear',
    generationQualityKey: 'common',
    qualityLabel: 'Common',
    armoryStatusKey: 'available',
    ownerHeroId: 'owner-hero-1',
    ownerHeroName: 'Owner Hero',
    depositedAt: '2026-05-09T10:00:00.000Z',
    loanId: null,
    loanStatusKey: null,
    borrowerHeroId: null,
    borrowerHeroName: null,
    borrowedAt: null,
    canBorrow: true,
    canReturn: false,
    canForceReturn: false,
    canWithdraw: true,
    canRemove: true,
    ...overrides,
  };
}

function loan(overrides: Partial<GuildArmoryLoan> = {}): GuildArmoryLoan {
  return {
    guildId: 'guild-1',
    armoryItemId: 'armory-item-1',
    itemId: 'item-1',
    itemName: 'Bronze Spear',
    loanId: 'loan-1',
    loanStatusKey: 'active',
    ownerHeroId: 'owner-hero-1',
    ownerHeroName: 'Owner Hero',
    borrowerHeroId: 'hero-1',
    borrowerHeroName: 'Borrower Hero',
    borrowedAt: '2026-05-09T11:00:00.000Z',
    dueAt: null,
    endedAt: null,
    reason: null,
    statusReason: null,
    canReturn: true,
    canForceReturn: false,
    ...overrides,
  };
}

function equippedItem(overrides: Partial<EquippedItemSummary> = {}): EquippedItemSummary {
  return {
    itemId: 'item-1',
    heroId: 'hero-1',
    ownerHeroId: 'hero-1',
    itemName: 'Bronze Spear',
    lifecycleStatus: 'active',
    generationBaseId: 'base-1',
    generationQualityKey: 'common',
    prefixAffixId: null,
    suffixAffixId: null,
    slotKey: 'main_hand',
    slotLabel: 'Main hand',
    slotSortOrder: 1,
    equipmentArea: 'weapon',
    equipmentSlotGroup: 'hand',
    equippedAt: '2026-05-09T10:00:00.000Z',
    baseKey: 'bronze_spear',
    baseName: 'Bronze Spear',
    baseTypeKey: 'spear',
    handUsage: 'one_handed',
    qualityLabel: 'Common',
    qualityMultiplier: 1,
    prefixKey: null,
    prefixName: null,
    suffixKey: null,
    suffixName: null,
    isRuntimeUsable: true,
    ...overrides,
  };
}

function operation(
  overrides: Partial<GuildArmoryItemOperationResult> = {},
): GuildArmoryItemOperationResult {
  return {
    kind: 'deposit',
    guildId: 'guild-1',
    armoryItemId: 'armory-item-1',
    itemId: 'item-1',
    ownerHeroId: 'owner-hero-1',
    statusKey: 'available',
    ...overrides,
  };
}

function borrowOperation(
  overrides: Partial<GuildArmoryBorrowResult> = {},
): GuildArmoryBorrowResult {
  return {
    kind: 'borrow',
    guildId: 'guild-1',
    armoryItemId: 'armory-item-1',
    itemId: 'item-1',
    ownerHeroId: 'owner-hero-1',
    borrowerHeroId: 'hero-1',
    loanId: 'loan-1',
    armoryStatusKey: 'borrowed',
    loanStatusKey: 'active',
    ...overrides,
  };
}

function loanOperation(
  overrides: Partial<GuildArmoryLoanOperationResult> = {},
): GuildArmoryLoanOperationResult {
  return {
    kind: 'return',
    guildId: 'guild-1',
    armoryItemId: 'armory-item-1',
    itemId: 'item-1',
    loanId: 'loan-1',
    armoryStatusKey: 'available',
    loanStatusKey: 'returned',
    ...overrides,
  };
}
