import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import {
  PlayerNotificationListItem,
  PlayerNotificationMutationResult,
} from '../../../core/domain/notifications/notification.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { NotificationInbox } from '../../../core/services/notifications/notification-inbox';
import { ToastService } from '../../../core/services/ui/toast';
import { NotificationBell } from './notification-bell';

@Component({
  standalone: true,
  template: '',
})
class RouteTargetComponent {}

describe('NotificationBell', () => {
  let fixture: ComponentFixture<NotificationBell>;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;
  let notificationInbox: jasmine.SpyObj<NotificationInbox>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeHeroContext());
    notificationInbox = jasmine.createSpyObj<NotificationInbox>(
      'NotificationInbox',
      [
        'getPlayerNotifications',
        'getPlayerUnreadCount',
        'markPlayerNotificationRead',
        'dismissPlayerNotification',
      ],
    );
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
    notificationInbox.getPlayerNotifications.and.returnValue(of([notification()]));
    notificationInbox.getPlayerUnreadCount.and.returnValue(of(3));
    notificationInbox.markPlayerNotificationRead.and.returnValue(of(mutationResult({
      readAt: '2026-05-05T10:10:00.000Z',
      isUnread: false,
    })));
    notificationInbox.dismissPlayerNotification.and.returnValue(of(mutationResult({
      readAt: '2026-05-05T10:15:00.000Z',
      dismissedAt: '2026-05-05T10:15:00.000Z',
      isUnread: false,
      isDismissed: true,
    })));

    TestBed.configureTestingModule({
      imports: [NotificationBell],
      providers: [
        provideRouter([
          {
            path: 'game',
            children: [
              { path: 'mansion', component: RouteTargetComponent },
            ],
          },
        ]),
        {
          provide: ActiveHero,
          useValue: { state: activeHeroState },
        },
        { provide: NotificationInbox, useValue: notificationInbox },
        { provide: ToastService, useValue: toast },
      ],
    });

    fixture = TestBed.createComponent(NotificationBell);
  });

  it('renders unread count and concise player notifications in the dropdown', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(notificationInbox.getPlayerNotifications).toHaveBeenCalledWith({
      limit: 6,
    });
    expect(notificationInbox.getPlayerUnreadCount).toHaveBeenCalled();
    expect(text).toContain('3');
    expect(text).toContain('Building completed');
    expect(text).toContain('A building job was completed.');
    expect(text).toContain('estate');
    expect(text).toContain('notice');
    expect(text).toContain('Unread');
    expect(text).toContain('Mark read');
    expect(text).toContain('Dismiss');
    expect(text).not.toContain('report-1');
    expect(text).not.toContain('staff-notification');
  });

  it('renders a route action link and closes the dropdown on click', async () => {
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/game/mansion');

    link.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(notificationInbox.markPlayerNotificationRead)
      .toHaveBeenCalledWith('notification-1');
    expect(router.url).toBe('/game/mansion');
    expect(fixture.componentInstance.state.isOpen()).toBeFalse();
  });

  it('marks an unread notification read and refreshes the unread count', async () => {
    notificationInbox.getPlayerUnreadCount.and.returnValues(of(3), of(2));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    clickButton('Mark read');
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(notificationInbox.markPlayerNotificationRead)
      .toHaveBeenCalledWith('notification-1');
    expect(notificationInbox.getPlayerUnreadCount).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.state.unreadCount()).toBe(2);
    expect(text).toContain('Read');
    expect(text).not.toContain('Mark read');
  });

  it('dismisses a notification and refreshes the unread count', async () => {
    notificationInbox.getPlayerUnreadCount.and.returnValues(of(3), of(2));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    clickButton('Dismiss');
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(notificationInbox.dismissPlayerNotification)
      .toHaveBeenCalledWith('notification-1');
    expect(fixture.componentInstance.state.notifications()).toEqual([]);
    expect(fixture.componentInstance.state.unreadCount()).toBe(2);
    expect(text).toContain('No notifications.');
  });

  it('shows action RPC errors without changing the local notification', async () => {
    notificationInbox.markPlayerNotificationRead.and.returnValue(
      throwError(() => new Error('access denied')),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    clickButton('Mark read');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.notifications()[0].readState.isUnread).toBeTrue();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Notification update failed',
      'access denied',
    );
  });

  it('does not render unsupported action routes', async () => {
    notificationInbox.getPlayerNotifications.and.returnValue(of([
      notification({
        notificationId: 'notification-view-state',
        actionLink: { label: 'View', url: 'ViewState' },
      }),
      notification({
        notificationId: 'notification-admin',
        actionLink: { label: 'Open admin', url: '/admin/users' },
      }),
      notification({
        notificationId: 'notification-report',
        actionLink: { label: 'Open report', url: '/report/public-token' },
      }),
      notification({
        notificationId: 'notification-reports-inbox',
        actionLink: { label: 'Open reports', url: '/game/reports' },
      }),
      notification({
        notificationId: 'notification-missing-game-route',
        actionLink: { label: 'Missing game route', url: '/game/missing' },
      }),
    ]));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;

    expect(links.length).toBe(0);
  });

  it('clears stale notifications and unread count when loading fails', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.notifications().length).toBe(1);
    expect(fixture.componentInstance.state.unreadCount()).toBe(3);

    notificationInbox.getPlayerNotifications.and.returnValue(
      throwError(() => new Error('RPC failed')),
    );
    notificationInbox.getPlayerUnreadCount.and.returnValue(of(3));
    activeHeroState.set({
      ...activeHeroContext(),
      heroId: 'hero-2',
      serverId: 'server-1',
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.notifications()).toEqual([]);
    expect(fixture.componentInstance.state.unreadCount()).toBe(0);
    expect(fixture.componentInstance.state.error()).toBe('Notifications unavailable.');
  });

  it('clears pending mark-read state and ignores stale success after context change', async () => {
    const actionResult$ = new Subject<PlayerNotificationMutationResult>();
    notificationInbox.markPlayerNotificationRead.and.returnValue(actionResult$);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    clickButton('Mark read');
    fixture.detectChanges();

    expect(fixture.componentInstance.state.actionNotificationIds())
      .toEqual(['notification-1']);

    notificationInbox.getPlayerNotifications.and.returnValue(of([
      notification({
        notificationId: 'notification-2',
        title: 'New context notification',
      }),
    ]));
    notificationInbox.getPlayerUnreadCount.and.returnValue(of(1));
    activeHeroState.set({
      ...activeHeroContext(),
      heroId: 'hero-2',
      serverId: 'server-2',
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.actionNotificationIds()).toEqual([]);

    actionResult$.next(mutationResult({
      readAt: '2026-05-05T10:20:00.000Z',
      isUnread: false,
    }));
    actionResult$.complete();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.notifications().map((item) => item.notificationId))
      .toEqual(['notification-2']);
    expect(fixture.componentInstance.state.notifications()[0].readState.isUnread).toBeTrue();
    expect(fixture.componentInstance.state.unreadCount()).toBe(1);
  });

  it('clears pending dismiss state and ignores stale success after context change', async () => {
    const actionResult$ = new Subject<PlayerNotificationMutationResult>();
    notificationInbox.dismissPlayerNotification.and.returnValue(actionResult$);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    clickButton('Dismiss');
    fixture.detectChanges();

    expect(fixture.componentInstance.state.actionNotificationIds())
      .toEqual(['notification-1']);

    notificationInbox.getPlayerNotifications.and.returnValue(of([
      notification({
        notificationId: 'notification-2',
        title: 'New context notification',
      }),
    ]));
    notificationInbox.getPlayerUnreadCount.and.returnValue(of(1));
    activeHeroState.set({
      ...activeHeroContext(),
      heroId: 'hero-2',
      serverId: 'server-2',
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.actionNotificationIds()).toEqual([]);

    actionResult$.next(mutationResult({
      readAt: '2026-05-05T10:25:00.000Z',
      dismissedAt: '2026-05-05T10:25:00.000Z',
      isUnread: false,
      isDismissed: true,
    }));
    actionResult$.complete();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.state.notifications().map((item) => item.notificationId))
      .toEqual(['notification-2']);
    expect(fixture.componentInstance.state.unreadCount()).toBe(1);
  });

  it('renders a clear empty state', async () => {
    notificationInbox.getPlayerNotifications.and.returnValue(of([]));
    notificationInbox.getPlayerUnreadCount.and.returnValue(of(0));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    clickBell();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('No notifications.');
  });

  function clickBell(): void {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
  }

  function clickButton(label: string): void {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const button = buttons.find((item) => item.textContent?.trim() === label);

    if (!button) {
      throw new Error(`Button ${label} not found.`);
    }

    button.click();
  }
});

function activeHeroContext(): ActiveHeroState {
  return {
    heroRow: { id: 'hero-1' } as never,
    heroId: 'hero-1',
    hero: {} as never,
    userId: 'user-1',
    serverId: 'server-1',
    server: {} as never,
  };
}

function notification(
  overrides: Partial<PlayerNotificationListItem> = {},
): PlayerNotificationListItem {
  return {
    notificationId: 'notification-1',
    type: {
      key: 'estate.building_job.completed',
      label: 'Building completed',
      category: 'estate',
      helperText: 'Building updates.',
    },
    recipientKind: 'hero',
    severity: 'notice',
    title: 'Building completed',
    body: 'A building job was completed.',
    actionLink: {
      label: 'Open mansion',
      url: '/game/mansion',
    },
    sourceEntity: {
      entityType: 'estate_building_job',
      entityId: 'building-job-1',
    },
    readState: {
      readAt: null,
      dismissedAt: null,
      isUnread: true,
      isDismissed: false,
    },
    createdAt: '2026-05-05T10:00:00.000Z',
    defaultToastEnabled: true,
    ...overrides,
  };
}

function mutationResult(
  readState: Partial<PlayerNotificationListItem['readState']> = {},
): PlayerNotificationMutationResult {
  return {
    notificationId: 'notification-1',
    recipientKind: 'hero',
    readState: {
      readAt: null,
      dismissedAt: null,
      isUnread: true,
      isDismissed: false,
      ...readState,
    },
  };
}
