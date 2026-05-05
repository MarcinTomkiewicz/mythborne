import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { NotificationInbox } from '../../../core/services/notifications/notification-inbox';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';

export interface NotificationBellActionContext {
  isCurrentContext(): boolean;
  setError(message: string): void;
  setUnreadCount(count: number): void;
  updateNotifications(
    updater: (items: PlayerNotificationListItem[]) => PlayerNotificationListItem[],
  ): void;
}

@Injectable()
export class NotificationBellActionRunner implements OnDestroy {
  private readonly notificationInbox = inject(NotificationInbox);
  private readonly toast = inject(ToastService);
  private readonly subscriptions = new Subscription();

  readonly actionNotificationIds = signal<string[]>([]);

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  clearPending(): void {
    this.actionNotificationIds.set([]);
  }

  isPending(notification: PlayerNotificationListItem): boolean {
    return this.actionNotificationIds().includes(notification.notificationId);
  }

  markRead(
    notification: PlayerNotificationListItem,
    context: NotificationBellActionContext,
  ): void {
    if (!notification.readState.isUnread || this.isPending(notification)) {
      return;
    }

    this.addPendingNotification(notification.notificationId);

    const subscription = this.notificationInbox
      .markPlayerNotificationRead(notification.notificationId)
      .subscribe({
        next: (result) => {
          if (!context.isCurrentContext()) {
            this.removePendingNotification(notification.notificationId);
            return;
          }

          context.updateNotifications((items) =>
            items.map((item) =>
              item.notificationId === result.notificationId
                ? { ...item, readState: result.readState }
                : item,
            ),
          );
          this.refreshUnreadCount(context);
          this.removePendingNotification(notification.notificationId);
        },
        error: (error: unknown) => {
          if (!context.isCurrentContext()) {
            this.removePendingNotification(notification.notificationId);
            return;
          }

          const message = getErrorMessage(error, 'Failed to mark notification read.');
          context.setError(message);
          this.toast.show('error', 'Notification update failed', message);
          this.removePendingNotification(notification.notificationId);
        },
      });

    this.subscriptions.add(subscription);
  }

  dismiss(
    notification: PlayerNotificationListItem,
    context: NotificationBellActionContext,
  ): void {
    if (this.isPending(notification)) {
      return;
    }

    this.addPendingNotification(notification.notificationId);

    const subscription = this.notificationInbox
      .dismissPlayerNotification(notification.notificationId)
      .subscribe({
        next: (result) => {
          if (!context.isCurrentContext()) {
            this.removePendingNotification(notification.notificationId);
            return;
          }

          context.updateNotifications((items) =>
            items.filter((item) => item.notificationId !== result.notificationId),
          );
          this.refreshUnreadCount(context);
          this.removePendingNotification(notification.notificationId);
        },
        error: (error: unknown) => {
          if (!context.isCurrentContext()) {
            this.removePendingNotification(notification.notificationId);
            return;
          }

          const message = getErrorMessage(error, 'Failed to dismiss notification.');
          context.setError(message);
          this.toast.show('error', 'Notification dismiss failed', message);
          this.removePendingNotification(notification.notificationId);
        },
      });

    this.subscriptions.add(subscription);
  }

  private refreshUnreadCount(context: NotificationBellActionContext): void {
    const subscription = this.notificationInbox.getPlayerUnreadCount().subscribe({
      next: (count) => {
        if (context.isCurrentContext()) {
          context.setUnreadCount(count);
        }
      },
      error: () => {
        if (context.isCurrentContext()) {
          this.toast.show(
            'warn',
            'Notification count unavailable',
            'Unread count refresh failed.',
          );
        }
      },
    });

    this.subscriptions.add(subscription);
  }

  private addPendingNotification(notificationId: string): void {
    this.actionNotificationIds.update((ids) =>
      ids.includes(notificationId) ? ids : [...ids, notificationId],
    );
  }

  private removePendingNotification(notificationId: string): void {
    this.actionNotificationIds.update((ids) =>
      ids.filter((id) => id !== notificationId),
    );
  }
}
