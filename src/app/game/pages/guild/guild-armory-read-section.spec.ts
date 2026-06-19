import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  GuildArmoryItem,
  GuildArmoryLoan,
} from '../../../core/domain/guild/guild-armory.model';
import {
  GuildConfigSummary,
  GuildMemberListItem,
} from '../../../core/domain/guild/guild.model';
import { PlayerArmoryItemReadModel } from '../../../core/domain/item/player-armory-page-context.model';
import { GuildArmoryItemActionsState } from './guild-armory-item-actions.state';
import { GuildArmoryMemberAccessState } from './guild-armory-member-access.state';
import { GuildArmoryReadSection } from './guild-armory-read-section';
import { GuildArmoryReadState } from './guild-armory-read.state';

describe('GuildArmoryReadSection', () => {
  let fixture: ComponentFixture<GuildArmoryReadSection>;
  let actions: FakeGuildArmoryItemActionsState;
  let memberAccess: FakeGuildArmoryMemberAccessState;
  let state: FakeGuildArmoryReadState;

  beforeEach(async () => {
    actions = new FakeGuildArmoryItemActionsState();
    memberAccess = new FakeGuildArmoryMemberAccessState();
    state = new FakeGuildArmoryReadState();

    await TestBed.configureTestingModule({
      imports: [GuildArmoryReadSection],
    })
      .overrideComponent(GuildArmoryReadSection, {
        set: {
          providers: [
            { provide: GuildArmoryItemActionsState, useValue: actions },
            { provide: GuildArmoryMemberAccessState, useValue: memberAccess },
            { provide: GuildArmoryReadState, useValue: state },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GuildArmoryReadSection);
  });

  it('renders available and borrowed guild armory items with borrower context', () => {
    state.items.set([
      item(),
      item({
        armoryItemId: 'armory-item-2',
        itemName: 'Bronze Shield',
        armoryStatusKey: 'borrowed',
        borrowerHeroId: 'borrower-hero-1',
        borrowerHeroName: 'Borrower Hero',
        loanId: 'loan-1',
      }),
    ]);
    state.loans.set([loan()]);
    state.config.set(config({ armoryCapacity: 0, armoryCapacityIsUnlimited: true }));
    actions.depositItems.set([
      depositItem(),
      depositItem({
        itemId: 'item-equipped',
        itemName: 'Equipped Blade',
        displayCore: {
          ...depositItem().displayCore,
          itemId: 'item-equipped',
          itemName: 'Equipped Blade',
        },
      }),
    ]);
    actions.equippedItemIds.set(new Set(['item-equipped']));

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(state.load).toHaveBeenCalled();
    expect(actions.load).toHaveBeenCalled();
    expect(memberAccess.load).toHaveBeenCalled();
    expect(text).toContain('Guild armory');
    expect(text).toContain('Deposit item');
    expect(text).toContain('Bronze Spear');
    expect(text).toContain('Equipped Blade');
    expect(text).toContain('Equipped');
    expect(text).toContain('Capacity: 2 / unlimited');
    expect(text).toContain('Available: 1');
    expect(text).toContain('Borrowed: 1');
    expect(text).toContain('Bronze Spear');
    expect(text).toContain('Bronze Shield');
    expect(text).toContain('Borrowed by: Borrower Hero');
    expect(text).not.toContain('withdrawn');
    expect(text).not.toContain('removed');
    expect(text).not.toContain('Shelf');
  });

  it('renders distinct owner withdraw and manager remove actions', () => {
    state.items.set([item({ canWithdraw: true, canRemove: true })]);
    state.config.set(config());

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Withdraw');
    expect(text).toContain('Remove');
  });

  it('renders borrow and return actions from DB-owned capability flags', () => {
    state.items.set([
      item({
        canBorrow: true,
        canReturn: false,
        canWithdraw: false,
        canRemove: false,
      }),
      item({
        armoryItemId: 'armory-item-2',
        itemName: 'Borrowed Spear',
        armoryStatusKey: 'borrowed',
        loanId: 'loan-1',
        canBorrow: false,
        canReturn: true,
        canWithdraw: false,
        canRemove: false,
      }),
    ]);
    state.loans.set([loan({ canReturn: true })]);
    state.config.set(config());

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Borrow');
    expect(text).toContain('Return');
    expect(text).not.toContain('Trade');
    expect(text).not.toContain('Auction');
    expect(text).not.toContain('Sell to vendor');
  });

  it('renders force-return action with borrower equipment warning from DB-owned flags', () => {
    state.items.set([
      item({
        armoryStatusKey: 'borrowed',
        loanId: 'loan-1',
        canBorrow: false,
        canForceReturn: true,
        canReturn: false,
        canWithdraw: false,
        canRemove: false,
      }),
    ]);
    state.loans.set([loan({ canForceReturn: true, canReturn: false })]);
    state.config.set(config());

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Force return');
    expect(text).toContain('Force return can remove borrower equipment');
    expect(text).not.toContain('Action history');
  });

  it('renders member armory access state and management actions from DB-owned status', () => {
    memberAccess.members.set([
      member({ memberName: 'Allowed Hero', armoryAccessStatusKey: 'allowed' }),
      member({
        memberHeroId: 'blocked-hero-1',
        memberName: 'Blocked Hero',
        armoryAccessStatusKey: 'blocked',
      }),
    ]);
    memberAccess.canManageAccess.set(true);
    state.config.set(config());

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Member armory access');
    expect(text).toContain('Allowed Hero');
    expect(text).toContain('allowed');
    expect(text).toContain('Block armory');
    expect(text).toContain('Blocked Hero');
    expect(text).toContain('blocked');
    expect(text).toContain('Allow armory');
  });

  it('renders future guild support notes without fake support functionality', () => {
    state.config.set(config());

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Guild support');
    expect(text).toContain('Future siege support');
    expect(text).toContain('Future Argonautics support');
    expect(text).toContain('Requires guild membership.');
    expect(text).toContain('Siege gameplay is not available in this UI yet.');
    expect(text).toContain('Argonautics gameplay is not available in this UI yet.');
    expect(text).not.toContain('Join siege');
    expect(text).not.toContain('Start Argonautics');
    expect(text).not.toContain('Diplomacy');
    expect(text).not.toContain('Influence');
    expect(text).not.toContain('Reputation');
  });

  it('hides member armory access management actions for regular members', () => {
    memberAccess.members.set([member()]);
    memberAccess.canManageAccess.set(false);
    state.config.set(config());

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('allowed');
    expect(text).not.toContain('Block armory');
    expect(text).not.toContain('Allow armory');
  });

  it('refreshes guild armory read state and deposit context together', () => {
    fixture.detectChanges();
    state.load.calls.reset();
    actions.load.calls.reset();
    memberAccess.load.calls.reset();

    fixture.componentInstance.refresh();

    expect(state.load).toHaveBeenCalledTimes(1);
    expect(actions.load).toHaveBeenCalledTimes(1);
    expect(memberAccess.load).toHaveBeenCalledTimes(1);
  });

  it('renders empty current guild armory state', () => {
    state.config.set(config());

    fixture.detectChanges();

    expect(textContent(fixture)).toContain('No current guild armory items.');
  });
});

class FakeGuildArmoryReadState {
  readonly items = signal<GuildArmoryItem[]>([]);
  readonly loans = signal<GuildArmoryLoan[]>([]);
  readonly config = signal<GuildConfigSummary | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentCount = computed(() => this.items().length);
  readonly availableCount = computed(() =>
    this.items().filter((item) => item.armoryStatusKey === 'available').length,
  );
  readonly borrowedCount = computed(() =>
    this.items().filter((item) => item.armoryStatusKey === 'borrowed').length,
  );
  readonly capacityLabel = computed(() => {
    const config = this.config();

    if (config?.armoryCapacityIsUnlimited || config?.armoryCapacity === 0) {
      return `${this.currentCount()} / unlimited`;
    }

    return `${this.currentCount()} / ${config?.armoryCapacity ?? 'N/D'}`;
  });
  readonly load = jasmine.createSpy('load');
}

class FakeGuildArmoryItemActionsState {
  readonly depositItems = signal<PlayerArmoryItemReadModel[]>([]);
  readonly equippedItemIds = signal<Set<string>>(new Set());
  readonly isLoadingDepositContext = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly deposit = jasmine.createSpy('deposit');
  readonly borrow = jasmine.createSpy('borrow');
  readonly returnItem = jasmine.createSpy('returnItem');
  readonly returnLoan = jasmine.createSpy('returnLoan');
  readonly forceReturnItem = jasmine.createSpy('forceReturnItem');
  readonly forceReturnLoan = jasmine.createSpy('forceReturnLoan');
  readonly withdraw = jasmine.createSpy('withdraw');
  readonly remove = jasmine.createSpy('remove');

  isEquipped(item: Pick<PlayerArmoryItemReadModel, 'itemId'>): boolean {
    return this.equippedItemIds().has(item.itemId);
  }

  canDeposit(item: PlayerArmoryItemReadModel): boolean {
    return item.lifecycleStatusKey === 'active' && !this.isEquipped(item);
  }
}

class FakeGuildArmoryMemberAccessState {
  readonly members = signal<GuildMemberListItem[]>([]);
  readonly isLoading = signal(false);
  readonly canManageAccess = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly block = jasmine.createSpy('block');
  readonly allow = jasmine.createSpy('allow');
}

function textContent(fixture: ComponentFixture<GuildArmoryReadSection>): string {
  return fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
}

function item(overrides: Partial<GuildArmoryItem> = {}): GuildArmoryItem {
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

function member(overrides: Partial<GuildMemberListItem> = {}): GuildMemberListItem {
  return {
    guildId: 'guild-1',
    memberHeroId: 'member-hero-1',
    memberName: 'Member Hero',
    roleKey: 'member',
    roleLabel: 'Member',
    membershipStatusKey: 'active',
    armoryAccessStatusKey: 'allowed',
    joinedAt: '2026-05-08T10:00:00.000Z',
    createdAt: '2026-05-08T09:00:00.000Z',
    ...overrides,
  };
}

function loan(overrides: Partial<GuildArmoryLoan> = {}): GuildArmoryLoan {
  return {
    guildId: 'guild-1',
    armoryItemId: 'armory-item-2',
    itemId: 'item-2',
    itemName: 'Bronze Shield',
    loanId: 'loan-1',
    loanStatusKey: 'active',
    ownerHeroId: 'owner-hero-1',
    ownerHeroName: 'Owner Hero',
    borrowerHeroId: 'borrower-hero-1',
    borrowerHeroName: 'Borrower Hero',
    borrowedAt: '2026-05-09T11:00:00.000Z',
    dueAt: null,
    endedAt: null,
    reason: null,
    statusReason: null,
    canReturn: true,
    canForceReturn: true,
    ...overrides,
  };
}

function config(overrides: Partial<GuildConfigSummary> = {}): GuildConfigSummary {
  return {
    creationDrachmaCost: 1000,
    memberBaseLimit: 10,
    memberLimitPerLeaderLevel: 2,
    leaderInactivityThresholdDays: 15,
    nominationDurationMinutes: 360,
    votingDurationMinutes: 720,
    emergencyMaxCandidates: 3,
    armoryCapacity: 10,
    armoryCapacityIsUnlimited: false,
    ...overrides,
  };
}

function depositItem(
  overrides: Partial<PlayerArmoryItemReadModel> = {},
): PlayerArmoryItemReadModel {
  return {
    itemId: 'item-1',
    heroId: 'hero-1',
    serverId: 'server-1',
    itemName: 'Bronze Spear',
    lifecycleStatusKey: 'active',
    lifecycleStatusLabel: 'Active',
    generationBaseId: 'base-1',
    generationQualityKey: 'common',
    qualityMultiplier: 1,
    qualityLabel: 'Common',
    baseKey: 'bronze_spear',
    baseName: 'Bronze Spear',
    baseTypeKey: 'spear',
    baseTypeLabel: 'Spear',
    prefixAffixId: null,
    prefixKey: null,
    prefixName: null,
    suffixAffixId: null,
    suffixKey: null,
    suffixName: null,
    armoryShelfPosition: 1,
    drachmaValue: 10,
    generatedAt: '2026-05-09T10:00:00.000Z',
    createdAt: '2026-05-09T10:00:00.000Z',
    storagePosition: 1,
    storageSlotKey: 'shelf_1',
    shelfName: 'Main shelf',
    storageSlotName: 'Main shelf',
    isUnsorted: false,
    visibilityIndex: 1,
    visibilityLimit: 10,
    isVisible: true,
    itemCategoryKey: 'weapon',
    equipmentArea: 'weapon',
    primarySlotKey: 'main_hand',
    primarySlotLabel: 'Main hand',
    handUsageKey: 'one_handed',
    handUsageLabel: 'One handed',
    allowedSlotKeys: ['main_hand'],
    allowedSlotLabel: 'Main hand',
    displayIconKey: 'box',
    meetsRequirements: true,
    requirementCount: 0,
    unmetRequirementCount: 0,
    requirementStatus: {},
    displayCore: {
      itemId: 'item-1',
      itemName: 'Bronze Spear',
      lifecycleStatusKey: 'active',
      lifecycleStatusLabel: 'Active',
      generationQualityKey: 'common',
      qualityLabel: 'Common',
      baseKey: 'bronze_spear',
      baseName: 'Bronze Spear',
      baseTypeKey: 'spear',
      baseTypeLabel: 'Spear',
      drachmaValue: '10',
      displayIconKey: 'box',
      equipmentArea: 'weapon',
      handUsageKey: 'one_handed',
      handUsageLabel: 'One handed',
      primarySlotKey: 'main_hand',
      primarySlotLabel: 'Main hand',
      equipmentSlotKey: null,
      equipmentSlotLabel: null,
      allowedSlotKeys: ['main_hand'],
      allowedSlotLabel: 'Main hand',
    },
    ...overrides,
  };
}
