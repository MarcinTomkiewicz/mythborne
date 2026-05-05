import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, forkJoin, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { StaffNotificationListItem } from '../../../core/domain/notifications/notification.model';
import { ActiveServer } from '../../../core/services/server/active-server';
import { NotificationInbox } from '../../../core/services/notifications/notification-inbox';
import { resolveStaffAccessPolicy } from '../../../core/utils/staff-access-policy';
import { NotificationBellDisplayFormatter } from '../notification-bell/notification-bell-display-formatter';
import { StaffNotificationActionRoutePolicy } from './staff-notification-action-route-policy';

const STAFF_DROPDOWN_NOTIFICATION_LIMIT = 6;

interface StaffNotificationBellPayload {
  notifications: StaffNotificationListItem[];
  unreadCount: number;
}

interface StaffNotificationBellLoadResult {
  serverId: string;
  payload?: StaffNotificationBellPayload;
  error?: true;
}

@Injectable()
export class StaffNotificationBellState implements OnDestroy {
  private readonly activeServer = inject(ActiveServer);
  private readonly notificationInbox = inject(NotificationInbox);
  private readonly displayFormatter = inject(NotificationBellDisplayFormatter);
  private readonly actionRoutePolicy = inject(StaffNotificationActionRoutePolicy);
  private readonly selectedServer$ = toObservable(this.activeServer.selectedServer);
  private readonly access$ = toObservable(this.activeServer.access);
  private subscription?: Subscription;
  private serverId = signal<string | null>(null);

  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly notifications = signal<StaffNotificationListItem[]>([]);
  readonly unreadCount = signal(0);
  readonly selectedServer = this.activeServer.selectedServer;
  readonly staffAccessPolicy = computed(() =>
    resolveStaffAccessPolicy({
      access: this.activeServer.access(),
      selectedServer: this.activeServer.selectedServer(),
    }),
  );
  readonly shouldRender = computed(() => this.staffAccessPolicy().canAccessAdminShell);
  readonly missingSelectedServer = computed(
    () => this.shouldRender() && !this.selectedServer(),
  );
  readonly hasNotifications = computed(() => this.notifications().length > 0);
  readonly unreadCountLabel = computed(() => {
    const count = this.unreadCount();
    return count > 99 ? '99+' : String(count);
  });

  init(): void {
    this.subscription = combineLatest([this.selectedServer$, this.access$])
      .pipe(
        switchMap(([server]) => {
          if (!this.shouldRender()) {
            this.serverId.set(null);
            this.reset();
            return of(null);
          }

          if (!server) {
            this.serverId.set(null);
            this.clearLoadState();
            return of(null);
          }

          this.serverId.set(server.id);
          this.notifications.set([]);
          this.unreadCount.set(0);
          this.isLoading.set(true);
          this.error.set(null);

          return this.loadPayload(server.id);
        }),
      )
      .subscribe((result) => {
        if (!result || result.serverId !== this.serverId()) {
          return;
        }

        if (result.error) {
          this.failLoad();
          return;
        }

        this.applyPayload(result.payload);
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

  severityBadgeClass(notification: StaffNotificationListItem): string {
    return this.displayFormatter.severityBadgeClass(notification);
  }

  toDateTimeLabel(value: string): string {
    return this.displayFormatter.toDateTimeLabel(value);
  }

  shortBody(notification: StaffNotificationListItem): string | null {
    return this.displayFormatter.shortBody(notification);
  }

  actionRoute(notification: StaffNotificationListItem): string | null {
    return this.actionRoutePolicy.actionRoute(notification);
  }

  private loadPayload(serverId: string): Observable<StaffNotificationBellLoadResult> {
    return forkJoin({
      notifications: this.notificationInbox.getStaffNotifications(serverId, {
        limit: STAFF_DROPDOWN_NOTIFICATION_LIMIT,
      }),
      unreadCount: this.notificationInbox.getStaffUnreadCount(serverId),
    }).pipe(
      map((payload) => ({ serverId, payload })),
      catchError(() => of({ serverId, error: true as const })),
    );
  }

  private applyPayload(payload: StaffNotificationBellPayload | undefined): void {
    if (!payload) {
      return;
    }

    this.notifications.set(payload.notifications);
    this.unreadCount.set(payload.unreadCount);
    this.error.set(null);
    this.isLoading.set(false);
  }

  private clearLoadState(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.error.set(null);
    this.isLoading.set(false);
  }

  private reset(): void {
    this.clearLoadState();
    this.isOpen.set(false);
  }

  private failLoad(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.error.set('Staff notifications unavailable.');
    this.isLoading.set(false);
  }
}
