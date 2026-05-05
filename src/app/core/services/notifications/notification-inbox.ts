import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  PlayerNotificationFilters,
  PlayerNotificationListItem,
} from '../../domain/notifications/notification.model';
import {
  GetMyNotificationUnreadCountRpcArgs,
  GetMyNotificationUnreadCountRpcReturn,
  GetMyNotificationsRpcArgs,
  GetMyNotificationsRpcRow,
} from '../../types/notification-rpc.types';
import { mapPlayerNotificationListItem } from '../../utils/notification-mappers';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';

const DEFAULT_NOTIFICATION_LIMIT = 50;

@Injectable({ providedIn: 'root' })
export class NotificationInbox {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getPlayerNotifications(
    filters: Partial<PlayerNotificationFilters> = {},
  ): Observable<PlayerNotificationListItem[]> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetMyNotificationsRpcArgs = {
          p_hero_id: context.heroId,
          p_include_dismissed: false,
          p_limit: filters.limit ?? DEFAULT_NOTIFICATION_LIMIT,
          p_offset: filters.offset ?? 0,
          p_server_id: context.serverId,
          p_unread_only: filters.unreadOnly ?? false,
        };

        return this.backend.rpc<GetMyNotificationsRpcRow[]>(
          RPC.get_my_notifications,
          args,
        );
      }),
      map((rows) =>
        rows
          .map(mapPlayerNotificationListItem)
          .filter((notification) => !notification.readState.isDismissed),
      ),
    );
  }

  getPlayerUnreadCount(): Observable<GetMyNotificationUnreadCountRpcReturn> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => {
        const args: GetMyNotificationUnreadCountRpcArgs = {
          p_hero_id: context.heroId,
          p_server_id: context.serverId,
        };

        return this.backend.rpc<GetMyNotificationUnreadCountRpcReturn>(
          RPC.get_my_notification_unread_count,
          args,
        );
      }),
    );
  }
}
