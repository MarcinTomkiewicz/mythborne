import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CurrentGuildReadModel,
  GuildInvite,
  GuildJoinRequest,
  GuildJoinRequestOperationResult,
  GuildLifecycleOperationResult,
  GuildMemberListItem,
} from '../../../core/domain/guild/guild.model';
import { CurrentGuildState } from '../../../core/services/guild/current-guild.state';
import { GuildInvitesState } from '../../../core/services/guild/guild-invites.state';
import { GuildJoinRequestsState } from '../../../core/services/guild/guild-join-requests.state';
import { GuildLifecycleState } from '../../../core/services/guild/guild-lifecycle.state';
import { GuildMembersState } from '../../../core/services/guild/guild-members.state';
import { ToastService } from '../../../core/services/ui/toast';
import { GuildMembershipManagementSection } from './guild-membership-management-section';

describe('GuildMembershipManagementSection', () => {
  let fixture: ComponentFixture<GuildMembershipManagementSection>;
  let currentGuild: FakeCurrentGuildState;
  let invites: FakeGuildInvitesState;
  let joinRequests: FakeGuildJoinRequestsState;
  let lifecycle: FakeGuildLifecycleState;
  let members: FakeGuildMembersState;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    currentGuild = new FakeCurrentGuildState();
    invites = new FakeGuildInvitesState();
    joinRequests = new FakeGuildJoinRequestsState();
    lifecycle = new FakeGuildLifecycleState();
    members = new FakeGuildMembersState();
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [GuildMembershipManagementSection],
      providers: [
        { provide: CurrentGuildState, useValue: currentGuild },
        { provide: GuildInvitesState, useValue: invites },
        { provide: GuildJoinRequestsState, useValue: joinRequests },
        { provide: GuildLifecycleState, useValue: lifecycle },
        { provide: GuildMembersState, useValue: members },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GuildMembershipManagementSection);
  });

  it('loads member, invite and join-request states', () => {
    fixture.detectChanges();

    expect(members.load).toHaveBeenCalled();
    expect(invites.load).toHaveBeenCalled();
    expect(joinRequests.load).toHaveBeenCalled();
  });

  it('renders members, pending counts, invites and request actions from DB-owned flags', () => {
    members.members.set([
      member({ memberName: 'Leader Hero', roleKey: 'leader', roleLabel: 'Leader' }),
      member({ memberHeroId: 'member-hero-1', memberName: 'Member Hero' }),
      member({
        memberHeroId: 'officer-hero-1',
        memberName: 'Officer Hero',
        roleKey: 'officer',
        roleLabel: 'Officer',
      }),
    ]);
    invites.invites.set([
      invite({ targetHeroName: 'Target Hero', canCancel: true }),
    ]);
    joinRequests.requests.set([
      joinRequest({
        requesterHeroId: 'requester-hero-1',
        requesterHeroName: 'Requester Hero',
        canAccept: true,
        canReject: true,
      }),
      joinRequest({
        joinRequestId: 'outgoing-request-1',
        requesterHeroId: 'hero-1',
        requesterHeroName: 'Current Hero',
        canCancel: true,
      }),
    ]);

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Members 12 / 30');
    expect(text).toContain('Pending invites4');
    expect(text).toContain('Pending join requests6');
    expect(text).toContain('Leader Hero');
    expect(text).toContain('Leader');
    expect(text).toContain('Member Hero');
    expect(text).toContain('Promote');
    expect(text).toContain('Kick');
    expect(text).toContain('Officer Hero');
    expect(text).toContain('Demote');
    expect(text).toContain('Disband guild');
    expect(text).not.toContain('Leave guild');
    expect(text).toContain('Target Hero');
    expect(text).toContain('Cancel invite');
    expect(text).toContain('Requester Hero');
    expect(text).toContain('Accept');
    expect(text).toContain('Reject');
    expect(text).toContain('My outgoing requests');
    expect(text).toContain('Cancel request');
    expect(text).not.toContain('Start siege');
    expect(text).not.toContain('Start Argonautics');
  });

  it('wires invite create/cancel and join-request review actions', () => {
    fixture.detectChanges();
    fixture.componentInstance.inviteForm.controls.targetHeroId.setValue(' target-hero-1 ');
    fixture.componentInstance.inviteForm.controls.reason.setValue(' Join us. ');

    fixture.componentInstance.createInvite();
    fixture.componentInstance.cancelInvite(invite());
    fixture.componentInstance.acceptJoinRequest(joinRequest());
    fixture.componentInstance.rejectJoinRequest(joinRequest());
    fixture.componentInstance.cancelJoinRequest(joinRequest());

    expect(invites.create).toHaveBeenCalledWith({
      targetHeroId: 'target-hero-1',
      reason: 'Join us.',
    });
    expect(invites.cancel).toHaveBeenCalledWith({ inviteId: 'invite-1' });
    expect(joinRequests.review).toHaveBeenCalledWith({
      joinRequestId: 'join-request-1',
      accept: true,
    });
    expect(joinRequests.review).toHaveBeenCalledWith({
      joinRequestId: 'join-request-1',
      accept: false,
    });
    expect(joinRequests.cancel).toHaveBeenCalledWith({
      joinRequestId: 'join-request-1',
    });
  });

  it('wires member role and lifecycle actions through state classes', () => {
    fixture.detectChanges();
    fixture.componentInstance.memberActionForm.controls.reason.setValue(' Trusted. ');
    fixture.componentInstance.lifecycleForm.controls.reason.setValue(' Closing guild. ');

    fixture.componentInstance.promoteMember(member({ memberHeroId: 'member-hero-1' }));
    fixture.componentInstance.demoteMember(member({ memberHeroId: 'officer-hero-1' }));
    fixture.componentInstance.kickMember(member({ memberHeroId: 'member-hero-2' }));
    fixture.componentInstance.disbandGuild();
    members.currentRoleKey.set('member');
    lifecycle.currentRoleKey.set('member');
    currentGuild.readModel.set(guildReadModel({
      state: {
        ...guildReadModel().state,
        membership: {
          ...guildReadModel().state.membership!,
          roleKey: 'member',
          roleLabel: 'Member',
        },
      },
      detail: {
        ...guildReadModel().detail!,
        currentRoleKey: 'member',
        currentRoleLabel: 'Member',
      },
    }));
    fixture.componentInstance.leaveGuild();

    expect(members.promote).toHaveBeenCalledWith({
      targetHeroId: 'member-hero-1',
      reason: 'Trusted.',
    });
    expect(members.demote).toHaveBeenCalledWith({
      targetHeroId: 'officer-hero-1',
      reason: 'Trusted.',
    });
    expect(members.kick).toHaveBeenCalledWith({
      targetHeroId: 'member-hero-2',
      reason: 'Trusted.',
    });
    expect(lifecycle.disband).toHaveBeenCalledWith({
      reason: 'Closing guild.',
    });
    expect(lifecycle.leave).toHaveBeenCalledWith({
      reason: 'Closing guild.',
    });
  });

  it('hides member management and disband actions for regular members', () => {
    members.currentRoleKey.set('member');
    lifecycle.currentRoleKey.set('member');
    currentGuild.readModel.set(guildReadModel({
      state: {
        ...guildReadModel().state,
        membership: {
          ...guildReadModel().state.membership!,
          roleKey: 'member',
          roleLabel: 'Member',
        },
      },
      detail: {
        ...guildReadModel().detail!,
        currentRoleKey: 'member',
        currentRoleLabel: 'Member',
      },
    }));
    members.members.set([member({ memberHeroId: 'other-member-1' })]);

    fixture.detectChanges();
    const text = textContent(fixture);

    expect(text).toContain('Leave guild');
    expect(text).not.toContain('Promote');
    expect(text).not.toContain('Demote');
    expect(text).not.toContain('Kick');
    expect(text).not.toContain('Disband guild');
  });

  it('requires a visible trimmed reason before disbanding from the UI layer', () => {
    fixture.detectChanges();
    fixture.componentInstance.lifecycleForm.controls.reason.setValue('   ');

    fixture.componentInstance.disbandGuild();
    fixture.detectChanges();

    expect(lifecycle.disband).not.toHaveBeenCalled();
    expect(textContent(fixture)).toContain('Disband reason is required.');
  });

  it('blocks whitespace-only invite target before calling state action', () => {
    fixture.detectChanges();
    fixture.componentInstance.inviteForm.controls.targetHeroId.setValue('   ');

    fixture.componentInstance.createInvite();

    expect(invites.create).not.toHaveBeenCalled();
  });

  it('refreshes member list after accepting a join request', () => {
    fixture.detectChanges();
    members.load.calls.reset();

    joinRequests.lastResult.set(joinRequestResult({ statusKey: 'accepted' }));
    fixture.detectChanges();

    expect(members.load).toHaveBeenCalledTimes(1);
  });

  it('refreshes member list after guild lifecycle success', () => {
    fixture.detectChanges();
    members.load.calls.reset();

    lifecycle.lastResult.set(lifecycleResult());
    fixture.detectChanges();

    expect(members.load).toHaveBeenCalledTimes(1);
  });

  it('hides invite creation when DB-backed guild permission denies it', () => {
    currentGuild.readModel.set(guildReadModel({
      detail: {
        ...guildReadModel().detail!,
        permissions: {
          ...guildReadModel().detail!.permissions,
          canInvite: false,
        },
      },
    }));

    fixture.detectChanges();
    fixture.componentInstance.inviteForm.controls.targetHeroId.setValue('target-hero-1');
    fixture.componentInstance.createInvite();

    expect(textContent(fixture)).not.toContain('Create invite');
    expect(invites.create).not.toHaveBeenCalled();
  });

  it('keeps blocking read errors inline and transient action errors in toast', () => {
    fixture.detectChanges();

    members.error.set('Failed to load guild members.');
    fixture.detectChanges();

    expect(textContent(fixture)).toContain('Failed to load guild members.');

    fixture.componentInstance.cancelInvite(invite());
    invites.error.set('Only leader or officer can cancel guild invite.');
    fixture.detectChanges();
    fixture.componentInstance.promoteMember(member({ memberHeroId: 'member-hero-1' }));
    members.error.set('Guild already has an active officer.');
    fixture.detectChanges();
    fixture.componentInstance.lifecycleForm.controls.reason.setValue('Closing guild.');
    fixture.componentInstance.disbandGuild();
    lifecycle.error.set('Guild cannot be disbanded during active siege.');
    fixture.detectChanges();

    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild invite failed',
      'Only leader or officer can cancel guild invite.',
    );
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild member action failed',
      'Guild already has an active officer.',
    );
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Guild lifecycle action failed',
      'Guild cannot be disbanded during active siege.',
    );
    expect(textContent(fixture)).not.toContain('Only leader or officer can cancel guild invite.');
    expect(textContent(fixture)).not.toContain('Guild already has an active officer.');
    expect(textContent(fixture)).not.toContain('Guild cannot be disbanded during active siege.');
  });
});

class FakeCurrentGuildState {
  readonly readModel = signal<CurrentGuildReadModel | null>(guildReadModel());
  readonly roleKey = computed(() => this.readModel()?.state.membership?.roleKey ?? null);
  readonly load = jasmine.createSpy('load');
}

class FakeGuildMembersState {
  readonly members = signal<GuildMemberListItem[]>([]);
  readonly currentRoleKey = signal<'leader' | 'officer' | 'member' | null>('leader');
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly kick = jasmine.createSpy('kick');
  readonly promote = jasmine.createSpy('promote');
  readonly demote = jasmine.createSpy('demote');

  canKick(member: GuildMemberListItem | null | undefined): boolean {
    const roleKey = this.currentRoleKey();

    if (!member || member.membershipStatusKey !== 'active' || member.roleKey === 'leader') {
      return false;
    }

    return roleKey === 'leader' || (roleKey === 'officer' && member.roleKey === 'member');
  }

  canPromote(member: GuildMemberListItem | null | undefined): boolean {
    return this.currentRoleKey() === 'leader'
      && member?.membershipStatusKey === 'active'
      && member.roleKey === 'member';
  }

  canDemote(member: GuildMemberListItem | null | undefined): boolean {
    return this.currentRoleKey() === 'leader'
      && member?.membershipStatusKey === 'active'
      && member.roleKey === 'officer';
  }
}

class FakeGuildLifecycleState {
  readonly lastResult = signal<GuildLifecycleOperationResult | null>(null);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly currentRoleKey = signal<'leader' | 'officer' | 'member' | null>('leader');
  readonly leave = jasmine.createSpy('leave');
  readonly disband = jasmine.createSpy('disband');
}

class FakeGuildInvitesState {
  readonly invites = signal<GuildInvite[]>([]);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly create = jasmine.createSpy('create');
  readonly cancel = jasmine.createSpy('cancel');
}

class FakeGuildJoinRequestsState {
  readonly requests = signal<GuildJoinRequest[]>([]);
  readonly lastResult = signal<GuildJoinRequestOperationResult | null>(null);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly load = jasmine.createSpy('load');
  readonly review = jasmine.createSpy('review');
  readonly cancel = jasmine.createSpy('cancel');
}

function textContent(
  fixture: ComponentFixture<GuildMembershipManagementSection>,
): string {
  return fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim();
}

function guildReadModel(
  overrides: Partial<CurrentGuildReadModel> = {},
): CurrentGuildReadModel {
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
    ...overrides,
  };
}

function member(overrides: Partial<GuildMemberListItem> = {}): GuildMemberListItem {
  return {
    guildId: 'guild-1',
    memberHeroId: 'hero-1',
    memberName: 'Current Hero',
    roleKey: 'member',
    roleLabel: 'Member',
    membershipStatusKey: 'active',
    armoryAccessStatusKey: 'allowed',
    joinedAt: '2026-05-09T10:00:00.000Z',
    createdAt: '2026-05-09T09:00:00.000Z',
    ...overrides,
  };
}

function invite(overrides: Partial<GuildInvite> = {}): GuildInvite {
  return {
    inviteId: 'invite-1',
    guildId: 'guild-1',
    guildName: 'Argonauts',
    guildTag: 'ARGO',
    inviterHeroId: 'hero-1',
    inviterHeroName: 'Current Hero',
    targetHeroId: 'target-hero-1',
    targetHeroName: 'Target Hero',
    statusKey: 'pending',
    reason: null,
    statusReason: null,
    createdAt: '2026-05-09T10:00:00.000Z',
    expiresAt: '2026-05-10T10:00:00.000Z',
    respondedAt: null,
    canAccept: false,
    canReject: false,
    canCancel: true,
    ...overrides,
  };
}

function joinRequest(overrides: Partial<GuildJoinRequest> = {}): GuildJoinRequest {
  return {
    joinRequestId: 'join-request-1',
    guildId: 'guild-1',
    guildName: 'Argonauts',
    guildTag: 'ARGO',
    requesterHeroId: 'requester-hero-1',
    requesterHeroName: 'Requester Hero',
    reviewedByHeroId: null,
    reviewedByHeroName: null,
    statusKey: 'pending',
    reason: null,
    statusReason: null,
    createdAt: '2026-05-09T10:00:00.000Z',
    expiresAt: '2026-05-10T10:00:00.000Z',
    reviewedAt: null,
    canAccept: true,
    canReject: true,
    canCancel: false,
    ...overrides,
  };
}

function joinRequestResult(
  overrides: Partial<GuildJoinRequestOperationResult> = {},
): GuildJoinRequestOperationResult {
  return {
    joinRequestId: 'join-request-1',
    guildId: 'guild-1',
    requesterHeroId: 'requester-hero-1',
    statusKey: 'accepted',
    expiresAt: null,
    membershipId: 'membership-2',
    memberCount: 13,
    memberLimit: 30,
    ...overrides,
  };
}

function lifecycleResult(): GuildLifecycleOperationResult {
  return {
    kind: 'leave',
    guildId: 'guild-1',
    actorHeroId: 'hero-1',
    membershipId: 'membership-1',
    oldRoleKey: 'member',
    statusKey: 'left',
    endedAt: '2026-05-09T10:00:00.000Z',
  };
}
