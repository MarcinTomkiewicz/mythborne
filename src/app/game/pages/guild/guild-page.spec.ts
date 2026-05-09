import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CurrentGuildReadModel,
  GuildDiscoveryResult,
  GuildInvite,
  GuildJoinRequest,
} from '../../../core/domain/guild/guild.model';
import { CurrentGuildState } from '../../../core/services/guild/current-guild.state';
import { GuildCreateState } from '../../../core/services/guild/guild-create.state';
import { GuildDiscoveryState } from '../../../core/services/guild/guild-discovery.state';
import { GuildInvitesState } from '../../../core/services/guild/guild-invites.state';
import { GuildJoinRequestsState } from '../../../core/services/guild/guild-join-requests.state';
import { ToastService } from '../../../core/services/ui/toast';
import { GuildArmoryReadSection } from './guild-armory-read-section';
import { GuildPage } from './guild-page';

describe('GuildPage', () => {
  let fixture: ComponentFixture<GuildPage>;
  let currentGuild: FakeCurrentGuildState;
  let guildCreate: FakeGuildCreateState;
  let discovery: FakeGuildDiscoveryState;
  let joinRequests: FakeGuildJoinRequestsState;
  let invites: FakeGuildInvitesState;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    currentGuild = new FakeCurrentGuildState();
    guildCreate = new FakeGuildCreateState();
    discovery = new FakeGuildDiscoveryState();
    joinRequests = new FakeGuildJoinRequestsState();
    invites = new FakeGuildInvitesState();
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [GuildPage],
      providers: [
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: GuildCreateState, useValue: guildCreate },
        { provide: GuildDiscoveryState, useValue: discovery },
        { provide: GuildInvitesState, useValue: invites },
        { provide: GuildJoinRequestsState, useValue: joinRequests },
        { provide: ToastService, useValue: toast },
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
    discovery.guilds.set([discoveredGuild()]);
    joinRequests.requests.set([joinRequest()]);
    invites.invites.set([invite()]);

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Join or create a guild');
    expect(text).toContain('Create guild');
    expect(text).toContain('Search guilds');
    expect(text).toContain('Join requests');
    expect(text).toContain('Invites');
    expect(text).toContain('Request to join');
    expect(text).toContain('Cancel request');
    expect(text).toContain('Accept invite');
    expect(text).toContain('Reject invite');
    expect(text).not.toContain('Start siege');
    expect(text).not.toContain('Start Argonautics');
    expect(text).not.toContain('Diplomacy');
  });

  it('loads no-guild entry states once when current hero has no guild', () => {
    currentGuild.status.set('no-guild');
    currentGuild.readModel.set(noGuildReadModel());

    fixture.detectChanges();
    fixture.detectChanges();

    expect(guildCreate.load).toHaveBeenCalledTimes(1);
    expect(discovery.search).toHaveBeenCalledTimes(1);
    expect(joinRequests.load).toHaveBeenCalledTimes(1);
    expect(invites.load).toHaveBeenCalledTimes(1);
  });

  it('wires create, search, join request and invite actions to entry states', () => {
    currentGuild.status.set('no-guild');
    currentGuild.readModel.set(noGuildReadModel());
    fixture.detectChanges();
    fixture.componentInstance.searchQueryControl.setValue('argo');

    fixture.componentInstance.submitCreateGuild();
    fixture.componentInstance.searchGuilds();
    fixture.componentInstance.requestToJoin(discoveredGuild());
    fixture.componentInstance.cancelJoinRequest(joinRequest());
    fixture.componentInstance.acceptInvite(invite());
    fixture.componentInstance.rejectInvite(invite());

    expect(guildCreate.submit).toHaveBeenCalled();
    expect(discovery.search).toHaveBeenCalledWith({ query: 'argo' });
    expect(joinRequests.create).toHaveBeenCalledWith({ guildId: 'guild-1' });
    expect(joinRequests.cancel).toHaveBeenCalledWith({
      joinRequestId: 'join-request-1',
    });
    expect(invites.respond).toHaveBeenCalledWith({
      inviteId: 'invite-1',
      accept: true,
    });
    expect(invites.respond).toHaveBeenCalledWith({
      inviteId: 'invite-1',
      accept: false,
    });
  });

  it('uses toast feedback for transient no-guild entry actions', () => {
    currentGuild.status.set('no-guild');
    currentGuild.readModel.set(noGuildReadModel());
    fixture.detectChanges();

    guildCreate.message.set('Guild Argonauts created.');
    fixture.detectChanges();
    joinRequests.error.set('Hero already has a pending join request.');
    fixture.detectChanges();

    expect(toast.show).toHaveBeenCalledWith(
      'success',
      'Guild creation',
      'Guild Argonauts created.',
    );
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild join request failed',
      'Hero already has a pending join request.',
    );
  });

  it('surfaces guild discovery read errors inline instead of empty search results', () => {
    currentGuild.status.set('no-guild');
    currentGuild.readModel.set(noGuildReadModel());
    discovery.error.set('Failed to search guilds.');

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Failed to search guilds.');
    expect(text).not.toContain('No guilds found.');
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

class FakeGuildCreateState {
  readonly form = new FormGroup({
    name: new FormControl<string>('Argonauts', { nonNullable: true }),
    tag: new FormControl<string>('ARGO', { nonNullable: true }),
    description: new FormControl<string>('', { nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });
  readonly creationDrachmaCost = signal(1000);
  readonly canCreateGuild = signal(true);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly submit = jasmine.createSpy('submit');
}

class FakeGuildDiscoveryState {
  readonly guilds = signal<GuildDiscoveryResult[]>([]);
  readonly totalCount = signal(0);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly search = jasmine.createSpy('search');
}

class FakeGuildJoinRequestsState {
  readonly requests = signal<GuildJoinRequest[]>([]);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly create = jasmine.createSpy('create');
  readonly cancel = jasmine.createSpy('cancel');
}

class FakeGuildInvitesState {
  readonly invites = signal<GuildInvite[]>([]);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly respond = jasmine.createSpy('respond');
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

function discoveredGuild(
  overrides: Partial<GuildDiscoveryResult> = {},
): GuildDiscoveryResult {
  return {
    guildId: 'guild-1',
    serverId: 'server-1',
    name: 'Argonauts',
    tag: 'ARGO',
    statusKey: 'active',
    memberCount: 12,
    memberLimit: 30,
    canRequestToJoin: true,
    currentJoinRequestStatusKey: null,
    currentInviteStatusKey: null,
    ...overrides,
  };
}

function joinRequest(overrides: Partial<GuildJoinRequest> = {}): GuildJoinRequest {
  return {
    joinRequestId: 'join-request-1',
    guildId: 'guild-2',
    guildName: 'Achilles',
    guildTag: 'ACH',
    requesterHeroId: 'hero-1',
    requesterHeroName: 'Hero',
    reviewedByHeroId: null,
    reviewedByHeroName: null,
    statusKey: 'pending',
    reason: null,
    statusReason: null,
    createdAt: '2026-05-09T10:00:00.000Z',
    expiresAt: '2026-05-10T10:00:00.000Z',
    reviewedAt: null,
    canAccept: false,
    canReject: false,
    canCancel: true,
    ...overrides,
  };
}

function invite(overrides: Partial<GuildInvite> = {}): GuildInvite {
  return {
    inviteId: 'invite-1',
    guildId: 'guild-3',
    guildName: 'Odyssey',
    guildTag: 'ODY',
    inviterHeroId: 'leader-hero-1',
    inviterHeroName: 'Leader Hero',
    targetHeroId: 'hero-1',
    targetHeroName: 'Hero',
    statusKey: 'pending',
    reason: null,
    statusReason: null,
    createdAt: '2026-05-09T10:00:00.000Z',
    expiresAt: '2026-05-10T10:00:00.000Z',
    respondedAt: null,
    canAccept: true,
    canReject: true,
    canCancel: false,
    ...overrides,
  };
}
