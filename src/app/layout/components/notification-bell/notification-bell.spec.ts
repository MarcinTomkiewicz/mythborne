import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { NotificationInbox } from '../../../core/services/notifications/notification-inbox';
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

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(activeHeroContext());
    notificationInbox = jasmine.createSpyObj<NotificationInbox>(
      'NotificationInbox',
      ['getPlayerNotifications', 'getPlayerUnreadCount'],
    );
    notificationInbox.getPlayerNotifications.and.returnValue(of([notification()]));
    notificationInbox.getPlayerUnreadCount.and.returnValue(of(3));

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

    expect(router.url).toBe('/game/mansion');
    expect(fixture.componentInstance.isOpen()).toBeFalse();
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

    expect(fixture.componentInstance.notifications().length).toBe(1);
    expect(fixture.componentInstance.unreadCount()).toBe(3);

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

    expect(fixture.componentInstance.notifications()).toEqual([]);
    expect(fixture.componentInstance.unreadCount()).toBe(0);
    expect(fixture.componentInstance.error()).toBe('Notifications unavailable.');
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
