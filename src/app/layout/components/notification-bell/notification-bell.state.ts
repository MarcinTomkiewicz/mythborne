import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, Subscription, switchMap } from 'rxjs';
import { MENU_LOGGED_IN } from '../../../core/config/menu-config';
import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { NotificationInbox } from '../../../core/services/notifications/notification-inbox';
import { ToastService } from '../../../core/services/ui/toast';
import { getErrorMessage } from '../../../core/utils/error-message';

const DROPDOWN_NOTIFICATION_LIMIT = 6;
const ALLOWED_PLAYER_ACTION_ROUTES = new Set(
  MENU_LOGGED_IN
    .map((item) => typeof item['url'] === 'string' ? item['url'] : null)
    .filter((url): url is string =>
      url !== null &&
      url.startsWith('/game/') &&
      url !== '/game/reports',
    ),
);

interface NotificationBellPayload {
  notifications: PlayerNotificationListItem[];
  unreadCount: number;
}

@Injectable()
export class NotificationBellState implements OnDestroy {
  private readonly activeHero = inject(ActiveHero);
  private readonly notificationInbox = inject(NotificationInbox);
  private readonly toast = inject(ToastService);
  private readonly activeHeroState$ = toObservable(this.activeHero.state);
  private subscription?: Subscription;
  private readonly actionSubscriptions = new Subscription();
  private contextKey = signal<string | null>(null);

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly notifications = signal<PlayerNotificationListItem[]>([]);
  readonly actionNotificationIds = signal<string[]>([]);
  readonly unreadCount = signal(0);
  readonly hasNotifications = computed(() => this.notifications().length > 0);
  readonly unreadCountLabel = computed(() => {
    const count = this.unreadCount();
    return count > 99 ? '99+' : String(count);
  });

  init(): void {
    this.subscription = this.activeHeroState$
      .pipe(
        switchMap((state) => {
          const contextKey = toContextKey(state);
          this.contextKey.set(contextKey);
          this.actionNotificationIds.set([]);

          if (!contextKey) {
            this.reset();
            return of(null);
          }

          this.isLoading.set(true);
          this.error.set(null);

          return forkJoin({
            notifications: this.notificationInbox.getPlayerNotifications({
              limit: DROPDOWN_NOTIFICATION_LIMIT,
            }),
            unreadCount: this.notificationInbox.getPlayerUnreadCount(),
          }).pipe(
            map((payload) => ({ contextKey, payload })),
            catchError(() => of({ contextKey, error: true })),
          );
        }),
      )
      .subscribe((result) => {
        if (!result || result.contextKey !== this.contextKey()) {
          return;
        }

        if ('error' in result) {
          this.failLoad();
          return;
        }

        this.applyPayload(result.payload);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.actionSubscriptions.unsubscribe();
  }

  toggleDropdown(): void {
    this.isOpen.update((value) => !value);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

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

  actionRoute(notification: PlayerNotificationListItem): string | null {
    const url = notification.actionLink?.url ?? null;
    return this.isAllowedPlayerRoute(url) ? url : null;
  }

  isActionPending(notification: PlayerNotificationListItem): boolean {
    return this.actionNotificationIds().includes(notification.notificationId);
  }

  markRead(notification: PlayerNotificationListItem): void {
    if (!notification.readState.isUnread || this.isActionPending(notification)) {
      return;
    }

    const contextKey = this.contextKey();

    if (!contextKey) {
      return;
    }

    this.addPendingNotification(notification.notificationId);

    const subscription = this.notificationInbox
      .markPlayerNotificationRead(notification.notificationId)
      .subscribe({
        next: (result) => {
          if (contextKey !== this.contextKey()) {
            this.removePendingNotification(notification.notificationId);
            return;
          }

          this.notifications.update((items) =>
            items.map((item) =>
              item.notificationId === result.notificationId
                ? { ...item, readState: result.readState }
                : item,
            ),
          );
          this.refreshUnreadCount(contextKey);
          this.removePendingNotification(notification.notificationId);
        },
        error: (error: unknown) => {
          if (contextKey !== this.contextKey()) {
            this.removePendingNotification(notification.notificationId);
            return;
          }

          const message = getErrorMessage(error, 'Failed to mark notification read.');
          this.error.set(message);
          this.toast.show('error', 'Notification update failed', message);
          this.removePendingNotification(notification.notificationId);
        },
      });

    this.actionSubscriptions.add(subscription);
  }

  dismissNotification(notification: PlayerNotificationListItem): void {
    if (this.isActionPending(notification)) {
      return;
    }

    const contextKey = this.contextKey();

    if (!contextKey) {
      return;
    }

    this.addPendingNotification(notification.notificationId);

    const subscription = this.notificationInbox
      .dismissPlayerNotification(notification.notificationId)
      .subscribe({
        next: (result) => {
          if (contextKey !== this.contextKey()) {
            this.removePendingNotification(notification.notificationId);
            return;
          }

          this.notifications.update((items) =>
            items.filter((item) => item.notificationId !== result.notificationId),
          );
          this.refreshUnreadCount(contextKey);
          this.removePendingNotification(notification.notificationId);
        },
        error: (error: unknown) => {
          if (contextKey !== this.contextKey()) {
            this.removePendingNotification(notification.notificationId);
            return;
          }

          const message = getErrorMessage(error, 'Failed to dismiss notification.');
          this.error.set(message);
          this.toast.show('error', 'Notification dismiss failed', message);
          this.removePendingNotification(notification.notificationId);
        },
      });

    this.actionSubscriptions.add(subscription);
  }

  openActionLink(notification: PlayerNotificationListItem): void {
    this.markRead(notification);
    this.closeDropdown();
  }

  private applyPayload(payload: NotificationBellPayload): void {
    this.actionNotificationIds.set([]);
    this.notifications.set(payload.notifications);
    this.unreadCount.set(payload.unreadCount);
    this.isLoading.set(false);
  }

  private reset(): void {
    this.notifications.set([]);
    this.actionNotificationIds.set([]);
    this.unreadCount.set(0);
    this.error.set(null);
    this.isLoading.set(false);
    this.isOpen.set(false);
  }

  private failLoad(): void {
    this.notifications.set([]);
    this.actionNotificationIds.set([]);
    this.unreadCount.set(0);
    this.error.set('Notifications unavailable.');
    this.isLoading.set(false);
  }

  private isAllowedPlayerRoute(url: string | null): url is string {
    if (!url) {
      return false;
    }

    const path = url.split(/[?#]/, 1)[0];
    return ALLOWED_PLAYER_ACTION_ROUTES.has(path);
  }

  private refreshUnreadCount(contextKey: string): void {
    const subscription = this.notificationInbox.getPlayerUnreadCount().subscribe({
      next: (count) => {
        if (contextKey === this.contextKey()) {
          this.unreadCount.set(count);
        }
      },
      error: () => {
        if (contextKey === this.contextKey()) {
          this.toast.show(
            'warn',
            'Notification count unavailable',
            'Unread count refresh failed.',
          );
        }
      },
    });

    this.actionSubscriptions.add(subscription);
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

function toContextKey(state: ActiveHeroState | null): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
