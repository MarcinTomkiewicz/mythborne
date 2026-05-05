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

@Injectable()
export class NotificationActionRoutePolicy {
  actionRoute(notification: PlayerNotificationListItem): string | null {
    const url = notification.actionLink?.url ?? null;

    if (!url) {
      return null;
    }

    const path = url.split(/[?#]/, 1)[0];
    return ALLOWED_PLAYER_ACTION_ROUTES.has(path) ? url : null;
  }
}
