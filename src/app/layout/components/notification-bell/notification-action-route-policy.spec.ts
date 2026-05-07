import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { NotificationActionRoutePolicy } from './notification-action-route-policy';

describe('NotificationActionRoutePolicy', () => {
  const policy = new NotificationActionRoutePolicy();

  it('allows player menu game routes and preserves query strings', () => {
    expect(policy.actionRoute(notification('/game/mansion?tab=buildings')))
      .toBe('/game/mansion?tab=buildings');
  });

  it('allows PvP result notification routes and preserves query strings', () => {
    expect(policy.actionRoute(notification(
      '/game/vicinity/attack-results/attack-result-1?from=bell',
      'pvp.attack_result.attacker',
      'pvp_attack_result',
      'attack-result-1',
    ))).toBe('/game/vicinity/attack-results/attack-result-1?from=bell');
    expect(policy.actionRoute(notification(
      '/game/vicinity/attack-results/attack-result-2',
      'pvp.attack_result.defender',
      'pvp_attack_result',
      'attack-result-2',
    ))).toBe('/game/vicinity/attack-results/attack-result-2');
    expect(policy.actionRoute(notification(
      '/game/vicinity/spy-results/spy-result-1',
      'pvp.spy_result.ready',
      'pvp_spy_result',
      'spy-result-1',
    ))).toBe('/game/vicinity/spy-results/spy-result-1');
  });

  it('blocks non-result notifications from PvP result routes', () => {
    expect(policy.actionRoute(notification(
      '/game/vicinity/attack-results/attack-result-1',
      'estate.building_job.completed',
    ))).toBeNull();
    expect(policy.actionRoute(notification(
      '/game/vicinity/attack-results/attack-result-1',
      'pvp.attack.incoming',
    ))).toBeNull();
    expect(policy.actionRoute(notification(
      '/game/vicinity/spy-results/spy-result-1',
      'pvp.spy.incoming',
    ))).toBeNull();
    expect(policy.actionRoute(notification(
      '/game/vicinity/spy-results/spy-result-1',
      'pvp.spy.target',
    ))).toBeNull();
  });

  it('blocks PvP result routes when source entity is missing', () => {
    expect(policy.actionRoute(notification(
      '/game/vicinity/attack-results/attack-result-1',
      'pvp.attack_result.attacker',
    ))).toBeNull();
    expect(policy.actionRoute(notification(
      '/game/vicinity/spy-results/spy-result-1',
      'pvp.spy_result.ready',
    ))).toBeNull();
  });

  it('blocks PvP result routes when source entity type or id does not match', () => {
    expect(policy.actionRoute(notification(
      '/game/vicinity/attack-results/attack-result-1',
      'pvp.attack_result.attacker',
      'pvp_spy_result',
      'attack-result-1',
    ))).toBeNull();
    expect(policy.actionRoute(notification(
      '/game/vicinity/attack-results/attack-result-1',
      'pvp.attack_result.attacker',
      'pvp_attack_result',
      'attack-result-2',
    ))).toBeNull();
    expect(policy.actionRoute(notification(
      '/game/vicinity/spy-results/spy-result-1',
      'pvp.spy_result.ready',
      'pvp_spy_result',
      'spy-result-2',
    ))).toBeNull();
  });

  it('blocks non-player, reports and unknown action routes', () => {
    expect(policy.actionRoute(notification('ViewState'))).toBeNull();
    expect(policy.actionRoute(notification('/admin/users'))).toBeNull();
    expect(policy.actionRoute(notification('/report/public-token'))).toBeNull();
    expect(policy.actionRoute(notification('/game/reports'))).toBeNull();
    expect(policy.actionRoute(notification('/game/missing'))).toBeNull();
    expect(policy.actionRoute(notification('/game/vicinity/attack-results'))).toBeNull();
    expect(policy.actionRoute(notification('/game/vicinity/spy-results'))).toBeNull();
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
