import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { StaffNotificationListItem } from '../../../core/domain/notifications/notification.model';
import {
  SelectedGameServer,
  ServerAccessState,
} from '../../../core/interfaces/server/active-server.interface';
import { NotificationInbox } from '../../../core/services/notifications/notification-inbox';
import { ActiveServer } from '../../../core/services/server/active-server';
import { StaffNotificationBell } from './staff-notification-bell';

@Component({
  standalone: true,
  template: '',
})
class RouteTargetComponent {}

describe('StaffNotificationBell', () => {
  let fixture: ComponentFixture<StaffNotificationBell>;
  let selectedServer: ReturnType<typeof signal<SelectedGameServer | null>>;
  let access: ReturnType<typeof signal<ServerAccessState>>;
  let notificationInbox: jasmine.SpyObj<NotificationInbox>;

  beforeEach(() => {
    selectedServer = signal<SelectedGameServer | null>(server());
    access = signal<ServerAccessState>(staffAccess());
    notificationInbox = jasmine.createSpyObj<NotificationInbox>(
      'NotificationInbox',
      ['getStaffNotifications', 'getStaffUnreadCount'],
    );
    notificationInbox.getStaffNotifications.and.returnValue(of([notification()]));
    notificationInbox.getStaffUnreadCount.and.returnValue(of(2));

    TestBed.configureTestingModule({
      imports: [StaffNotificationBell],
      providers: [
        provideRouter([
          { path: 'admin/anti-abuse-cases', component: RouteTargetComponent },
          { path: 'admin/anti-abuse-cases/:caseId', component: RouteTargetComponent },
        ]),
        {
          provide: ActiveServer,
          useValue: {
            selectedServer: selectedServer.asReadonly(),
            access: access.asReadonly(),
          },
        },
        { provide: NotificationInbox, useValue: notificationInbox },
      ],
    });

    fixture = TestBed.createComponent(StaffNotificationBell);
  });

  it('renders server-scoped staff notifications and unread count', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickStaffBell();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(notificationInbox.getStaffNotifications).toHaveBeenCalledWith('server-1', {
      limit: 6,
    });
    expect(notificationInbox.getStaffUnreadCount).toHaveBeenCalledWith('server-1');
    expect(text).toContain('2');
    expect(text).toContain('Staff notifications');
    expect(text).toContain('Case opened');
    expect(text).toContain('Anti-abuse case requires review.');
    expect(text).toContain('Unread');
    expect(text).not.toContain('Athena');
    expect(text).not.toContain('anti_abuse');
    expect(text).not.toContain('warning');
    expect(text).not.toContain('Actor linked');
    expect(text).not.toContain('ViewState');
    expect(link.getAttribute('href')).toBe('/admin/anti-abuse-cases/case-1');
  });

  it('closes the dropdown on outside click', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickStaffBell();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.isOpen()).toBeTrue();

    document.body.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.isOpen()).toBeFalse();
  });

  it('does not expose staff notifications to normal player access', async () => {
    access.set(playerAccess());

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('');
    expect(notificationInbox.getStaffNotifications).not.toHaveBeenCalled();
    expect(notificationInbox.getStaffUnreadCount).not.toHaveBeenCalled();
  });

  it('shows a clear missing-server state without calling staff RPCs', async () => {
    selectedServer.set(null);
    access.set(staffAccess({ isAdmin: true, serverStaffRole: null, isServerStaff: false }));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickStaffBell();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Select a server to view staff notifications.');
    expect(notificationInbox.getStaffNotifications).not.toHaveBeenCalled();
    expect(notificationInbox.getStaffUnreadCount).not.toHaveBeenCalled();
  });

  it('blocks unsafe staff action links in the dropdown', async () => {
    notificationInbox.getStaffNotifications.and.returnValue(of([
      notification({
        actionLink: {
          label: 'Unsafe',
          url: '/game/mansion',
        },
      }),
    ]));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickStaffBell();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Unsafe');
  });

  it('clears stale staff notifications when the selected server load fails', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.notifications().length).toBe(1);
    expect(fixture.componentInstance.state.unreadCount()).toBe(2);

    notificationInbox.getStaffNotifications.and.returnValue(
      throwError(() => new Error('RPC failed')),
    );
    notificationInbox.getStaffUnreadCount.and.returnValue(of(2));
    selectedServer.set(server({ id: 'server-2', name: 'Apollo' }));

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.notifications()).toEqual([]);
    expect(fixture.componentInstance.state.unreadCount()).toBe(0);
    expect(fixture.componentInstance.state.error()).toBe('Staff notifications unavailable.');
  });

  it('clears server-scoped staff state immediately while the next server load is pending', async () => {
    const pendingServerTwoNotifications = new Subject<StaffNotificationListItem[]>();
    const pendingServerTwoCount = new Subject<number>();
    const serverTwoNotification = notification({
      notificationId: 'staff-notification-2',
      title: 'Server two case opened',
      body: 'Server two anti-abuse case requires review.',
      serverId: 'server-2',
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.notifications().map((item) => item.notificationId))
      .toEqual(['staff-notification-1']);
    expect(fixture.componentInstance.state.unreadCount()).toBe(2);

    clickStaffBell();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent as string).toContain('Case opened');

    notificationInbox.getStaffNotifications.and.returnValue(
      pendingServerTwoNotifications.asObservable(),
    );
    notificationInbox.getStaffUnreadCount.and.returnValue(
      pendingServerTwoCount.asObservable(),
    );
    selectedServer.set(server({ id: 'server-2', name: 'Apollo' }));

    await fixture.whenStable();
    fixture.detectChanges();

    const pendingText = fixture.nativeElement.textContent as string;

    expect(fixture.componentInstance.state.notifications()).toEqual([]);
    expect(fixture.componentInstance.state.unreadCount()).toBe(0);
    expect(fixture.componentInstance.state.isLoading()).toBeTrue();
    expect(pendingText).not.toContain('2 unread');
    expect(pendingText).not.toContain('Case opened');
    expect(pendingText).not.toContain('Anti-abuse case requires review.');

    pendingServerTwoNotifications.next([serverTwoNotification]);
    pendingServerTwoNotifications.complete();
    pendingServerTwoCount.next(1);
    pendingServerTwoCount.complete();

    await fixture.whenStable();
    fixture.detectChanges();

    const resolvedText = fixture.nativeElement.textContent as string;

    expect(fixture.componentInstance.state.notifications().map((item) => item.notificationId))
      .toEqual(['staff-notification-2']);
    expect(fixture.componentInstance.state.unreadCount()).toBe(1);
    expect(fixture.componentInstance.state.isLoading()).toBeFalse();
    expect(resolvedText).toContain('1 unread');
    expect(resolvedText).toContain('Server two case opened');
  });

  function clickStaffBell(): void {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
  }
});

function notification(
  overrides: Partial<StaffNotificationListItem> = {},
): StaffNotificationListItem {
  return {
    notificationId: 'staff-notification-1',
    type: {
      key: 'anti_abuse.case.created',
      label: 'Anti-abuse case',
      category: 'anti_abuse',
      helperText: 'Review staff cases.',
    },
    recipientKind: 'staff',
    severity: 'warning',
    title: 'Case opened',
    body: 'Anti-abuse case requires review.',
    actionLink: {
      label: 'Open case',
      url: '/admin/anti-abuse-cases/case-1',
    },
    sourceEntity: {
      entityType: 'anti_abuse_case',
      entityId: 'case-1',
    },
    readState: {
      readAt: null,
      dismissedAt: null,
      isUnread: true,
      isDismissed: false,
    },
    createdAt: '2026-05-05T10:00:00.000Z',
    defaultToastEnabled: false,
    serverId: 'server-1',
    actorHeroId: 'hero-1',
    recipientHeroId: null,
    ...overrides,
  };
}

function server(
  overrides: Partial<SelectedGameServer> = {},
): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'athena',
    name: 'Athena',
    kind: 'standard',
    status: 'live',
    description: null,
    launchedAt: null,
    archivedAt: null,
    membershipStatus: null,
    membership: null,
    staffRole: 'moderator',
    canManage: false,
    canUseAsSandbox: false,
    ...overrides,
  };
}

function staffAccess(
  overrides: Partial<ServerAccessState> = {},
): ServerAccessState {
  return {
    userId: 'user-1',
    globalRoleKey: null,
    membershipStatus: null,
    membership: null,
    serverStaffRole: 'moderator',
    isAdmin: false,
    isOperator: false,
    isTester: false,
    isModerator: false,
    isServerStaff: true,
    isMembershipActive: false,
    isMembershipSuspended: false,
    isMembershipBanned: false,
    isMembershipBlocked: false,
    canAccessSandbox: false,
    canManageSelectedServer: false,
    ...overrides,
  };
}

function playerAccess(): ServerAccessState {
  return staffAccess({
    serverStaffRole: null,
    isServerStaff: false,
  });
}
