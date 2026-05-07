import { Injectable } from '@angular/core';
import { MENU_LOGGED_IN } from '../../../core/config/menu-config';
import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';

const ALLOWED_PLAYER_ACTION_ROUTES = new Set(
  MENU_LOGGED_IN
    .map((item) => typeof item['url'] === 'string' ? item['url'] : null)
    .filter((url): url is string =>
      url !== null &&
      url.startsWith('/game/') &&
      url !== '/game/reports',
    ),
);

const ALLOWED_PLAYER_DYNAMIC_ACTION_ROUTE_PATTERNS = [
  {
    pattern: /^\/game\/vicinity\/attack-results\/([^/?#]+)$/,
    sourceEntityType: 'pvp_attack_result',
    typeKeys: new Set([
      'pvp.attack_result.attacker',
      'pvp.attack_result.defender',
    ]),
  },
  {
    pattern: /^\/game\/vicinity\/spy-results\/([^/?#]+)$/,
    sourceEntityType: 'pvp_spy_result',
    typeKeys: new Set([
      'pvp.spy_result.ready',
    ]),
  },
];

@Injectable()
export class NotificationActionRoutePolicy {
  actionRoute(notification: PlayerNotificationListItem): string | null {
    const url = notification.actionLink?.url ?? null;

    if (!url) {
      return null;
    }

    const path = url.split(/[?#]/, 1)[0];
    if (ALLOWED_PLAYER_ACTION_ROUTES.has(path)) {
      return url;
    }

    return isAllowedDynamicActionRoute(notification, path) ? url : null;
  }
}

function isAllowedDynamicActionRoute(
  notification: PlayerNotificationListItem,
  path: string,
): boolean {
  return ALLOWED_PLAYER_DYNAMIC_ACTION_ROUTE_PATTERNS.some((route) => {
    const match = route.pattern.exec(path);

    if (!match || !route.typeKeys.has(notification.type.key)) {
      return false;
    }

    const sourceEntity = notification.sourceEntity;
    if (!sourceEntity) {
      return false;
    }

    return sourceEntity.entityType === route.sourceEntityType
      && sourceEntity.entityId === match[1];
  });
}
