import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  GuildArmoryItem,
  GuildArmoryReadModel,
} from '../../../core/domain/guild/guild-armory.model';
import { ArmoryItemSummary } from '../../../core/domain/item/item-equipment.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { PlayerGuildArmory } from '../../../core/services/guild/player-guild-armory';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { ArmoryGuildItemUsageState } from './armory-guild-item-usage.state';

describe('ArmoryGuildItemUsageState', () => {
  let state: ArmoryGuildItemUsageState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let guildArmory: jasmine.SpyObj<PlayerGuildArmory>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    guildArmory = jasmine.createSpyObj<PlayerGuildArmory>(
      'PlayerGuildArmory',
      ['getActiveHeroGuildArmory'],
    );

    TestBed.configureTestingModule({
      providers: [
        ArmoryGuildItemUsageState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: PlayerGuildArmory, useValue: guildArmory },
      ],
    });

    state = TestBed.inject(ArmoryGuildItemUsageState);
  });

  it('loads guild armory item context through canonical guild armory read service', () => {
    guildArmory.getActiveHeroGuildArmory.and.returnValue(of(readModel()));

    state.load();

    expect(guildArmory.getActiveHeroGuildArmory).toHaveBeenCalledWith(false);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('classifies private, deposited, borrowed-from and borrowed-by states from read model only', () => {
    guildArmory.getActiveHeroGuildArmory.and.returnValue(of(readModel({
      items: [
        guildItem({ itemId: 'deposited-item', armoryStatusKey: 'available' }),
        guildItem({
          itemId: 'borrowed-by-member-item',
          armoryStatusKey: 'borrowed',
          borrowerHeroId: 'member-hero-2',
          borrowerHeroName: 'Member Two',
        }),
        guildItem({
          itemId: 'borrowed-from-item',
          ownerHeroId: 'owner-hero-2',
          armoryStatusKey: 'borrowed',
          borrowerHeroId: 'hero-1',
          borrowerHeroName: 'Active Hero',
        }),
      ],
      loans: [],
    })));

    state.load();

    expect(state.usageForItem(item({ itemId: 'private-item' })).key)
      .toBe('owned_private');
    expect(state.usageForItem(item({ itemId: 'deposited-item' })).key)
      .toBe('deposited_in_guild_armory');
    expect(state.usageForItem(item({ itemId: 'borrowed-by-member-item' })).label)
      .toBe('Borrowed by Member Two');
    expect(state.usageForItem(item({
      itemId: 'borrowed-from-item',
      ownerHeroId: 'owner-hero-2',
    })).key).toBe('borrowed_from_guild_armory');
  });

  it('hides private actions while guild armory context is unavailable', () => {
    guildArmory.getActiveHeroGuildArmory.and.returnValue(
      throwError(() => new Error('guild armory read failed')),
    );

    state.load();

    expect(state.usageForItem(item()).key).toBe('unknown');
    expect(state.canUsePrivateItemActions(item())).toBeFalse();
    expect(state.error()).toBe('guild armory read failed');
  });

  it('ignores stale guild armory context after active hero changes', () => {
    const response = new Subject<GuildArmoryReadModel>();
    guildArmory.getActiveHeroGuildArmory.and.returnValue(response.asObservable());

    state.load();
    activeHeroState.set(activeContext({ heroId: 'hero-2' }));
    response.next(readModel());

    expect(state.readModel()).toBeNull();
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
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

function readModel(
  overrides: Partial<GuildArmoryReadModel> = {},
): GuildArmoryReadModel {
  return {
    items: [],
    loans: [],
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
    ownerHeroId: 'hero-1',
    ownerHeroName: 'Active Hero',
    depositedAt: '2026-05-09T10:00:00.000Z',
    loanId: null,
    loanStatusKey: null,
    borrowerHeroId: null,
    borrowerHeroName: null,
    borrowedAt: null,
    canBorrow: false,
    canReturn: false,
    canForceReturn: false,
    canWithdraw: true,
    canRemove: false,
    ...overrides,
  };
}

function item(overrides: Partial<ArmoryItemSummary> = {}): ArmoryItemSummary {
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
