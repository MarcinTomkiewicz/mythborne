import { Injectable } from '@angular/core';
import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';

@Injectable()
export class NotificationBellDisplayFormatter {
  severityBadgeClass(notification: PlayerNotificationListItem): string {
    switch (notification.severity) {
      case 'critical':
        return 'tag-badge tag-badge--danger';
      case 'warning':
        return 'tag-badge tag-badge--warn';
      case 'notice':
        return 'tag-badge tag-badge--info';
      default:
        return 'tag-badge tag-badge--muted';
    }
  }

  toDateTimeLabel(value: string): string {
    return new Date(value).toLocaleString();
  }

  shortBody(notification: PlayerNotificationListItem): string | null {
    if (!notification.body) {
      return null;
    }

    return notification.body.length > 140
      ? `${notification.body.slice(0, 137)}...`
      : notification.body;
  }
}
