import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { NotificationBellDisplayFormatter } from './notification-bell-display-formatter';

describe('NotificationBellDisplayFormatter', () => {
  const formatter = new NotificationBellDisplayFormatter();

  it('maps notification severity to shared badge classes', () => {
    expect(formatter.severityBadgeClass(notification({ severity: 'critical' })))
      .toBe('tag-badge tag-badge--danger');
    expect(formatter.severityBadgeClass(notification({ severity: 'warning' })))
      .toBe('tag-badge tag-badge--warn');
    expect(formatter.severityBadgeClass(notification({ severity: 'notice' })))
      .toBe('tag-badge tag-badge--info');
    expect(formatter.severityBadgeClass(notification({ severity: 'info' })))
      .toBe('tag-badge tag-badge--muted');
  });

  it('shortens long bodies and keeps empty bodies hidden', () => {
    expect(formatter.shortBody(notification({ body: null }))).toBeNull();
    expect(formatter.shortBody(notification({ body: 'Short body' }))).toBe('Short body');
    expect(formatter.shortBody(notification({ body: 'x'.repeat(141) })))
      .toBe(`${'x'.repeat(137)}...`);
  });
});

function notification(
  overrides: Partial<PlayerNotificationListItem> = {},
): PlayerNotificationListItem {
  return {
    notificationId: 'notification-1',
    type: {
      key: 'estate.building_job.completed',
      label: 'Building completed',
      category: 'estate',
      helperText: null,
    },
    recipientKind: 'hero',
    severity: 'notice',
    title: 'Building completed',
    body: 'A building job was completed.',
    actionLink: null,
    sourceEntity: null,
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
