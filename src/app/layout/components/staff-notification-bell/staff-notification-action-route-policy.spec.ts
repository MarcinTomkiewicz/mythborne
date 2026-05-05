import { StaffNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { StaffNotificationActionRoutePolicy } from './staff-notification-action-route-policy';

describe('StaffNotificationActionRoutePolicy', () => {
  const policy = new StaffNotificationActionRoutePolicy();

  it('allows admin routes declared in the admin route config', () => {
    expect(policy.actionRoute(notification('/admin'))).toBe('/admin');
    expect(policy.actionRoute(notification('/admin/anti-abuse-cases/case-1?tab=timeline')))
      .toBe('/admin/anti-abuse-cases/case-1?tab=timeline');
  });

  it('blocks non-admin and unknown staff action routes', () => {
    expect(policy.actionRoute(notification('ViewState'))).toBeNull();
    expect(policy.actionRoute(notification('/game/mansion'))).toBeNull();
    expect(policy.actionRoute(notification('/report/public-token'))).toBeNull();
    expect(policy.actionRoute(notification('/admin/missing'))).toBeNull();
    expect(policy.actionRoute(notification('/admin/access-denied'))).toBeNull();
  });
});

function notification(url: string): StaffNotificationListItem {
  return {
    notificationId: 'staff-notification-1',
    type: {
      key: 'anti_abuse.case.created',
      label: 'Anti-abuse case',
      category: 'anti_abuse',
      helperText: null,
    },
    recipientKind: 'staff',
    severity: 'warning',
    title: 'Case opened',
    body: null,
    actionLink: {
      label: 'Open case',
      url,
    },
    sourceEntity: null,
    readState: {
      readAt: null,
      dismissedAt: null,
      isUnread: true,
      isDismissed: false,
    },
    createdAt: '2026-05-05T10:00:00.000Z',
    defaultToastEnabled: false,
    serverId: 'server-1',
    actorHeroId: null,
    recipientHeroId: null,
  };
}
