import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, merge, Observable, of, Subscription, switchMap, timer } from 'rxjs';
import { PlayerNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { NotificationInbox } from '../../../core/services/notifications/notification-inbox';
import { NotificationActionRoutePolicy } from './notification-action-route-policy';
import {
  NotificationBellActionContext,
  NotificationBellActionRunner,
} from './notification-bell-action-runner';
import { NotificationBellDisplayFormatter } from './notification-bell-display-formatter';
import { NotificationFreshToastPresenter } from './notification-fresh-toast-presenter';

const DROPDOWN_NOTIFICATION_LIMIT = 6;
const NOTIFICATION_TOAST_POLL_INTERVAL_MS = 60_000;

interface NotificationBellPayload {
  notifications: PlayerNotificationListItem[];
  unreadCount: number;
}

interface NotificationBellLoadResult {
  contextKey: string;
  isInitial: boolean;
  payload?: NotificationBellPayload;
  error?: true;
}

@Injectable()
export class NotificationBellState implements OnDestroy {
  private readonly activeHero = inject(ActiveHero);
  private readonly notificationInbox = inject(NotificationInbox);
  private readonly actionRoutePolicy = inject(NotificationActionRoutePolicy);
  private readonly actionRunner = inject(NotificationBellActionRunner);
  private readonly displayFormatter = inject(NotificationBellDisplayFormatter);
  private readonly freshToastPresenter = inject(NotificationFreshToastPresenter);
  private readonly activeHeroState$ = toObservable(this.activeHero.state);
  private subscription?: Subscription;
  private contextKey = signal<string | null>(null);
  private seededContextKey: string | null = null;

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly notifications = signal<PlayerNotificationListItem[]>([]);
  readonly actionNotificationIds = this.actionRunner.actionNotificationIds;
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
          const shouldSeedInitialLoad =
            contextKey !== null && contextKey !== this.seededContextKey;
          this.contextKey.set(contextKey);
          this.actionRunner.clearPending();

          if (!contextKey) {
            this.seededContextKey = null;
            this.reset();
            return of(null);
          }

          this.isLoading.set(true);
          this.error.set(null);

          return merge(
            this.loadPayload(contextKey, shouldSeedInitialLoad),
            timer(
              NOTIFICATION_TOAST_POLL_INTERVAL_MS,
              NOTIFICATION_TOAST_POLL_INTERVAL_MS,
            ).pipe(
              switchMap(() => this.loadPayload(contextKey, false)),
            ),
          );
        }),
      )
      .subscribe((result) => {
        if (!result || result.contextKey !== this.contextKey()) {
          return;
        }

        if (result.error) {
          if (result.isInitial) {
            this.failLoad();
          }
          return;
        }

        this.applyPayload(result.payload, result.contextKey);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleDropdown(): void {
    this.isOpen.update((value) => !value);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  severityBadgeClass(notification: PlayerNotificationListItem): string {
    return this.displayFormatter.severityBadgeClass(notification);
  }

  toDateTimeLabel(value: string): string {
    return this.displayFormatter.toDateTimeLabel(value);
  }

  shortBody(notification: PlayerNotificationListItem): string | null {
    return this.displayFormatter.shortBody(notification);
  }

  actionRoute(notification: PlayerNotificationListItem): string | null {
    return this.actionRoutePolicy.actionRoute(notification);
  }

  isActionPending(notification: PlayerNotificationListItem): boolean {
    return this.actionRunner.isPending(notification);
  }

  markRead(notification: PlayerNotificationListItem): void {
    const context = this.actionContext();
    if (!context) {
      return;
    }

    this.actionRunner.markRead(notification, context);
  }

  dismissNotification(notification: PlayerNotificationListItem): void {
    const context = this.actionContext();
    if (!context) {
      return;
    }

    this.actionRunner.dismiss(notification, context);
  }

  openActionLink(notification: PlayerNotificationListItem): void {
    this.markRead(notification);
    this.closeDropdown();
  }

  private loadPayload(
    contextKey: string,
    isInitial: boolean,
  ): Observable<NotificationBellLoadResult> {
    return forkJoin({
      notifications: this.notificationInbox.getPlayerNotifications({
        limit: DROPDOWN_NOTIFICATION_LIMIT,
      }),
      unreadCount: this.notificationInbox.getPlayerUnreadCount(),
    }).pipe(
      map((payload) => ({ contextKey, isInitial, payload })),
      catchError(() => of({ contextKey, isInitial, error: true as const })),
    );
  }

  private applyPayload(
    payload: NotificationBellPayload | undefined,
    contextKey: string,
  ): void {
    if (!payload) {
      return;
    }

    const shouldSeedContext = this.seededContextKey !== contextKey;

    this.actionRunner.clearPending();
    this.notifications.set(payload.notifications);
    this.unreadCount.set(payload.unreadCount);
    this.error.set(null);
    this.isLoading.set(false);

    if (shouldSeedContext) {
      this.freshToastPresenter.seed(payload.notifications);
      this.seededContextKey = contextKey;
    } else {
      this.freshToastPresenter.presentFresh(payload.notifications);
    }
  }

  private reset(): void {
    this.notifications.set([]);
    this.actionRunner.clearPending();
    this.unreadCount.set(0);
    this.error.set(null);
    this.isLoading.set(false);
    this.isOpen.set(false);
  }

  private failLoad(): void {
    this.notifications.set([]);
    this.actionRunner.clearPending();
    this.unreadCount.set(0);
    this.error.set('Notifications unavailable.');
    this.isLoading.set(false);
  }

  private actionContext(): NotificationBellActionContext | null {
    const contextKey = this.contextKey();

    if (!contextKey) {
      return null;
    }

    return {
      isCurrentContext: () => contextKey === this.contextKey(),
      setError: (message) => this.error.set(message),
      setUnreadCount: (count) => this.unreadCount.set(count),
      updateNotifications: (updater) => this.notifications.update(updater),
    };
  }
}

function toContextKey(state: ActiveHeroState | null): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}
