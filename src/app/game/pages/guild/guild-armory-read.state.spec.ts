import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  GuildArmoryItem,
  GuildArmoryLoan,
  GuildArmoryReadModel,
} from '../../../core/domain/guild/guild-armory.model';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { PlayerGuild } from '../../../core/services/guild/player-guild';
import { PlayerGuildArmory } from '../../../core/services/guild/player-guild-armory';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { GuildArmoryReadState } from './guild-armory-read.state';

describe('GuildArmoryReadState', () => {
  let state: GuildArmoryReadState;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let playerGuild: jasmine.SpyObj<PlayerGuild>;
  let playerGuildArmory: jasmine.SpyObj<PlayerGuildArmory>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeContext());
    playerGuild = jasmine.createSpyObj<PlayerGuild>('PlayerGuild', [
      'getGuildConfigSummary',
    ]);
    playerGuildArmory = jasmine.createSpyObj<PlayerGuildArmory>('PlayerGuildArmory', [
      'getActiveHeroGuildArmory',
    ]);

    TestBed.configureTestingModule({
      providers: [
        GuildArmoryReadState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: PlayerGuild, useValue: playerGuild },
        { provide: PlayerGuildArmory, useValue: playerGuildArmory },
      ],
    });

    state = TestBed.inject(GuildArmoryReadState);
  });

  it('loads guild armory read state and DB-backed unlimited capacity', () => {
    playerGuildArmory.getActiveHeroGuildArmory.and.returnValue(of(readModel()));
    playerGuild.getGuildConfigSummary.and.returnValue(of(config({ armoryCapacity: 0 })));

    state.load();

    expect(playerGuildArmory.getActiveHeroGuildArmory).toHaveBeenCalledWith(false);
    expect(state.items().length).toBe(2);
    expect(state.loans().length).toBe(1);
    expect(state.availableCount()).toBe(1);
    expect(state.borrowedCount()).toBe(1);
    expect(state.capacityLabel()).toBe('2 / unlimited');
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('requires active hero context before loading', () => {
    activeHeroState.set(activeContext({ heroId: null }));
    state.items.set([item()]);

    state.load();

    expect(playerGuildArmory.getActiveHeroGuildArmory).not.toHaveBeenCalled();
    expect(state.items()).toEqual([]);
    expect(state.error()).toBe('No active hero for guild armory.');
    expect(state.isLoading()).toBeFalse();
  });

  it('ignores stale load success after active server changes and clears read state', () => {
    const armoryResponse = new Subject<GuildArmoryReadModel>();
    const configResponse = new Subject<GuildConfigSummary>();
    playerGuildArmory.getActiveHeroGuildArmory.and.returnValue(
      armoryResponse.asObservable(),
    );
    playerGuild.getGuildConfigSummary.and.returnValue(configResponse.asObservable());
    state.items.set([item()]);

    state.load();
    activeHeroState.set(activeContext({ serverId: 'server-2' }));
    armoryResponse.next(readModel());
    armoryResponse.complete();
    configResponse.next(config());
    configResponse.complete();

    expect(state.items()).toEqual([]);
    expect(state.loans()).toEqual([]);
    expect(state.error()).toBeNull();
    expect(state.isLoading()).toBeFalse();
  });

  it('surfaces guild armory read errors', () => {
    playerGuildArmory.getActiveHeroGuildArmory.and.returnValue(
      throwError(() => new Error('Armory read failed.')),
    );
    playerGuild.getGuildConfigSummary.and.returnValue(of(config()));

    state.load();

    expect(state.error()).toBe('Armory read failed.');
    expect(state.items()).toEqual([]);
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

function readModel(): GuildArmoryReadModel {
  return {
    items: [
      item(),
      item({
        armoryItemId: 'armory-item-2',
        armoryStatusKey: 'borrowed',
        borrowerHeroId: 'borrower-hero-1',
        borrowerHeroName: 'Borrower Hero',
        borrowedAt: '2026-05-09T11:00:00.000Z',
        loanId: 'loan-1',
        loanStatusKey: 'active',
      }),
    ],
    loans: [loan()],
  };
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
