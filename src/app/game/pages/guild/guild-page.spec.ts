import { Component, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentGuildReadModel } from '../../../core/domain/guild/guild.model';
import { CurrentGuildState } from '../../../core/services/guild/current-guild.state';
import { GuildArmoryReadSection } from './guild-armory-read-section';
import { GuildPage } from './guild-page';

describe('GuildPage', () => {
  let fixture: ComponentFixture<GuildPage>;
  let currentGuild: FakeCurrentGuildState;

  beforeEach(async () => {
    currentGuild = new FakeCurrentGuildState();

    await TestBed.configureTestingModule({
      imports: [GuildPage],
      providers: [
        { provide: CurrentGuildState, useValue: currentGuild },
      ],
    })
      .overrideComponent(GuildPage, {
        remove: { imports: [GuildArmoryReadSection] },
        add: { imports: [GuildArmoryReadSectionStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GuildPage);
  });

  it('loads current guild state on init', () => {
    fixture.detectChanges();

    expect(currentGuild.load).toHaveBeenCalled();
  });

  it('renders no-guild entry points without fake siege or Argonautics actions', () => {
    currentGuild.status.set('no-guild');
    currentGuild.readModel.set(noGuildReadModel());

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Join or create a guild');
    expect(text).toContain('Create guild');
    expect(text).toContain('Search guilds');
    expect(text).toContain('Join requests');
    expect(text).toContain('Invites');
    expect(text).not.toContain('Start siege');
    expect(text).not.toContain('Start Argonautics');
    expect(text).not.toContain('Diplomacy');
  });

  it('renders guild overview, member, election and armory sections for guild members', () => {
    currentGuild.status.set('leader');
    currentGuild.readModel.set(guildReadModel());

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Argonauts');
    expect(text).toContain('Guild overview');
    expect(text).toContain('Members: 12 / 30');
    expect(text).toContain('Member management');
    expect(text).toContain('Pending invites');
    expect(text).toContain('Emergency election');
    expect(text).toContain('no active election');
    expect(text).toContain('Guild armory placeholder');
  });

  it('renders blocking guild load errors inline', () => {
    currentGuild.status.set('error');
    currentGuild.error.set('Failed to load current guild state.');

    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Failed to load current guild state.');
  });
});

@Component({
  selector: 'app-guild-armory-read-section',
  standalone: true,
  template: '<section>Guild armory placeholder</section>',
})
class GuildArmoryReadSectionStub {}

class FakeCurrentGuildState {
  readonly readModel = signal<CurrentGuildReadModel | null>(null);
  readonly status = signal('idle');
  readonly error = signal<string | null>(null);
  readonly isLoading = computed(() => this.status() === 'loading');
  readonly load = jasmine.createSpy('load');
}

function textContent(fixture: ComponentFixture<GuildPage>): string {
  return fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
}

function noGuildReadModel(): CurrentGuildReadModel {
  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    state: {
      heroId: 'hero-1',
      serverId: 'server-1',
      guild: null,
      membership: null,
      canCreateGuild: true,
      permissions: {
        canInvite: false,
        canManageArmory: false,
        canManageMembers: false,
        canStartEmergencyElection: false,
      },
    },
    detail: null,
  };
}

function guildReadModel(): CurrentGuildReadModel {
  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    state: {
      heroId: 'hero-1',
      serverId: 'server-1',
      guild: {
        guildId: 'guild-1',
        serverId: 'server-1',
        name: 'Argonauts',
        tag: 'ARGO',
        statusKey: 'active',
        memberCount: 12,
        memberLimit: 30,
      },
      membership: {
        membershipId: 'membership-1',
        guildId: 'guild-1',
        heroId: 'hero-1',
        statusKey: 'active',
        roleKey: 'leader',
        roleLabel: 'Leader',
      },
      canCreateGuild: false,
      permissions: {
        canInvite: true,
        canManageArmory: true,
        canManageMembers: true,
        canStartEmergencyElection: true,
      },
    },
    detail: {
      guildId: 'guild-1',
      serverId: 'server-1',
      name: 'Argonauts',
      tag: 'ARGO',
      statusKey: 'active',
      memberCount: 12,
      memberLimit: 30,
      currentHeroId: 'hero-1',
      currentMembershipId: 'membership-1',
      currentMembershipStatusKey: 'active',
      currentRoleKey: 'leader',
      currentRoleLabel: 'Leader',
      armoryAvailableCount: 5,
      armoryBorrowedCount: 2,
      myActiveLoanCount: 1,
      myArmoryAccessStatusKey: 'allowed',
      myDepositedItemCount: 3,
      pendingInviteCount: 4,
      pendingJoinRequestCount: 6,
      activeElectionId: null,
      activeElectionStatusKey: null,
      permissions: {
        canInvite: true,
        canManageArmory: true,
        canManageMembers: true,
        canStartEmergencyElection: true,
      },
    },
  };
}
