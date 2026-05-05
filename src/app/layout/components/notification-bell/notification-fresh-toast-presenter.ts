import { inject, Injectable } from '@angular/core';
import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { ToastService } from '../../../core/services/ui/toast';
import { NotificationSeverity } from '../../../core/types/notification-rpc.types';
import { ToastSeverity } from '../../../core/types/toast.types';

@Injectable()
export class NotificationFreshToastPresenter {
  private readonly toast = inject(ToastService);
  private readonly seenNotificationIds = new Set<string>();

  seed(notifications: PlayerNotificationListItem[]): void {
    notifications.forEach((notification) =>
      this.seenNotificationIds.add(notification.notificationId),
    );
  }

  presentFresh(notifications: PlayerNotificationListItem[]): void {
    notifications.forEach((notification) => {
      if (this.seenNotificationIds.has(notification.notificationId)) {
        return;
      }

      this.seenNotificationIds.add(notification.notificationId);

      if (!notification.defaultToastEnabled || !notification.readState.isUnread) {
        return;
      }

      this.toast.show(
        toToastSeverity(notification.severity),
        notification.title,
        toastDetail(notification),
      );
    });
  }
}

function toToastSeverity(severity: NotificationSeverity): ToastSeverity {
  switch (severity) {
    case 'critical':
      return 'error';
    case 'warning':
      return 'warn';
    default:
      return 'info';
  }
}

function toastDetail(notification: PlayerNotificationListItem): string {
  const parts = [
    notification.body,
    notification.actionLink ? `Action: ${notification.actionLink.label}` : null,
  ].filter((part): part is string => typeof part === 'string' && part.length > 0);

  return parts.join(' ');
}
