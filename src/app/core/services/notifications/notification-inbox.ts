import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  PlayerNotificationFilters,
  PlayerNotificationListItem,
  StaffNotificationFilters,
  StaffNotificationListItem,
} from '../../domain/notifications/notification.model';
import {
  GetMyNotificationUnreadCountRpcArgs,
  GetMyNotificationUnreadCountRpcReturn,
  GetMyNotificationsRpcArgs,
  GetMyNotificationsRpcRow,
  GetMyStaffNotificationUnreadCountRpcArgs,
  GetMyStaffNotificationUnreadCountRpcReturn,
  GetMyStaffNotificationsRpcArgs,
  GetMyStaffNotificationsRpcRow,
} from '../../types/notification-rpc.types';
import {
  mapPlayerNotificationListItem,
  mapStaffNotificationListItem,
} from '../../utils/notification-mappers';
import { trimText } from '../../utils/normalize-text';
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

  getStaffNotifications(
    serverId: string,
    filters: Partial<StaffNotificationFilters> = {},
  ): Observable<StaffNotificationListItem[]> {
    const normalizedServerId = requiredServerId(serverId);
    const args: GetMyStaffNotificationsRpcArgs = {
      p_include_dismissed: false,
      p_limit: filters.limit ?? DEFAULT_NOTIFICATION_LIMIT,
      p_offset: filters.offset ?? 0,
      p_server_id: normalizedServerId,
      p_unread_only: filters.unreadOnly ?? false,
    };

    return this.backend.rpc<GetMyStaffNotificationsRpcRow[]>(
      RPC.get_my_staff_notifications,
      args,
    ).pipe(
      map((rows) =>
        rows
          .map(mapStaffNotificationListItem)
          .filter((notification) => !notification.readState.isDismissed),
      ),
    );
  }

  getStaffUnreadCount(
    serverId: string,
  ): Observable<GetMyStaffNotificationUnreadCountRpcReturn> {
    const args: GetMyStaffNotificationUnreadCountRpcArgs = {
      p_server_id: requiredServerId(serverId),
    };

    return this.backend.rpc<GetMyStaffNotificationUnreadCountRpcReturn>(
      RPC.get_my_staff_notification_unread_count,
      args,
    );
  }
}

function requiredServerId(value: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error('serverId is required for staff notifications.');
  }

  return normalized;
}
