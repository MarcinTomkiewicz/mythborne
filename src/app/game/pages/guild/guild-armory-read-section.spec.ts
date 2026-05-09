import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  GuildArmoryItem,
  GuildArmoryLoan,
} from '../../../core/domain/guild/guild-armory.model';
import { GuildConfigSummary } from '../../../core/domain/guild/guild.model';
import { GuildArmoryReadSection } from './guild-armory-read-section';
import { GuildArmoryReadState } from './guild-armory-read.state';

describe('GuildArmoryReadSection', () => {
  let fixture: ComponentFixture<GuildArmoryReadSection>;
  let state: FakeGuildArmoryReadState;

  beforeEach(async () => {
    state = new FakeGuildArmoryReadState();

    await TestBed.configureTestingModule({
      imports: [GuildArmoryReadSection],
    })
      .overrideComponent(GuildArmoryReadSection, {
        set: {
          providers: [{ provide: GuildArmoryReadState, useValue: state }],
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

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(state.load).toHaveBeenCalled();
    expect(text).toContain('Guild armory');
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
