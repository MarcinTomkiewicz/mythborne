import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { NotificationActionRoutePolicy } from './notification-action-route-policy';

describe('NotificationActionRoutePolicy', () => {
  const policy = new NotificationActionRoutePolicy();

  it('allows player menu game routes and preserves query strings', () => {
    expect(policy.actionRoute(notification('/game/mansion?tab=buildings')))
      .toBe('/game/mansion?tab=buildings');
  });

  it('blocks non-player, reports and unknown action routes', () => {
    expect(policy.actionRoute(notification('ViewState'))).toBeNull();
    expect(policy.actionRoute(notification('/admin/users'))).toBeNull();
    expect(policy.actionRoute(notification('/report/public-token'))).toBeNull();
    expect(policy.actionRoute(notification('/game/reports'))).toBeNull();
    expect(policy.actionRoute(notification('/game/missing'))).toBeNull();
  });
});

function notification(
  url: string,
  typeKey = 'estate.building_job.completed',
  sourceEntityType: string | null = null,
  sourceEntityId: string | null = null,
): PlayerNotificationListItem {
  return {
    notificationId: 'notification-1',
    type: {
      key: typeKey,
      label: 'Building completed',
      category: 'estate',
      helperText: null,
    },
    recipientKind: 'hero',
    severity: 'notice',
    title: 'Building completed',
    body: null,
    actionLink: {
      label: 'Open',
      url,
    },
    sourceEntity: sourceEntityType && sourceEntityId
      ? { entityType: sourceEntityType, entityId: sourceEntityId }
      : null,
    readState: {
      readAt: null,
      dismissedAt: null,
      isUnread: true,
      isDismissed: false,
    },
    createdAt: '2026-05-05T10:00:00.000Z',
    defaultToastEnabled: true,
  };
}
