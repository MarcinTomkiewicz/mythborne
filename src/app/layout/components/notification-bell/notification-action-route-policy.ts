import { Injectable } from '@angular/core';
import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';

const ALLOWED_PLAYER_ACTION_ROUTE_PATHS = new Set([
  '/hero/dashboard',
  '/hero/attributes',
  '/game/exploration',
  '/game/combat',
  '/game/armory',
  '/game/mansion',
  '/game/vicinity',
  '/game/guild',
  '/game/trade',
  '/game/auction',
]);
const REPORT_DETAIL_ROUTE = /^\/game\/reports\/[^/?#]+$/;

@Injectable()
export class NotificationActionRoutePolicy {
  actionRoute(notification: PlayerNotificationListItem): string | null {
    const url = notification.actionLink?.url ?? null;

    if (!url) {
      return null;
    }

    const path = url.split(/[?#]/, 1)[0];
    if (ALLOWED_PLAYER_ACTION_ROUTE_PATHS.has(path) || REPORT_DETAIL_ROUTE.test(path)) {
      return url;
    }

    return null;
  }
}
