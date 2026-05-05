import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import {
  PlayerNotificationListItem,
  PlayerNotificationMutationResult,
} from '../../../core/domain/notifications/notification.model';
import { NotificationInbox } from '../../../core/services/notifications/notification-inbox';
import { ToastService } from '../../../core/services/ui/toast';
import {
  NotificationBellActionContext,
  NotificationBellActionRunner,
} from './notification-bell-action-runner';

describe('NotificationBellActionRunner', () => {
  let runner: NotificationBellActionRunner;
  let notificationInbox: jasmine.SpyObj<NotificationInbox>;
  let toast: jasmine.SpyObj<ToastService>;
  let notifications: PlayerNotificationListItem[];
  let unreadCount: number;
  let error: string | null;
  let isCurrentContext: boolean;

  beforeEach(() => {
    notificationInbox = jasmine.createSpyObj<NotificationInbox>(
      'NotificationInbox',
      [
        'getPlayerUnreadCount',
        'markPlayerNotificationRead',
        'dismissPlayerNotification',
      ],
    );
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);
    notificationInbox.getPlayerUnreadCount.and.returnValue(of(2));
    notificationInbox.markPlayerNotificationRead.and.returnValue(of(mutationResult({
      readAt: '2026-05-05T10:10:00.000Z',
      isUnread: false,
    })));
    notificationInbox.dismissPlayerNotification.and.returnValue(of(mutationResult({
      dismissedAt: '2026-05-05T10:15:00.000Z',
      isDismissed: true,
    })));
    notifications = [notification()];
    unreadCount = 3;
    error = null;
    isCurrentContext = true;

    TestBed.configureTestingModule({
      providers: [
        NotificationBellActionRunner,
        { provide: NotificationInbox, useValue: notificationInbox },
        { provide: ToastService, useValue: toast },
      ],
    });

    runner = TestBed.inject(NotificationBellActionRunner);
  });

  it('marks unread notification read and refreshes unread count through RPC', () => {
    runner.markRead(notification(), actionContext());

    expect(notificationInbox.markPlayerNotificationRead)
      .toHaveBeenCalledWith('notification-1');
    expect(notificationInbox.getPlayerUnreadCount).toHaveBeenCalled();
    expect(notifications[0].readState.isUnread).toBeFalse();
    expect(unreadCount).toBe(2);
    expect(runner.actionNotificationIds()).toEqual([]);
  });

  it('dismisses a notification and refreshes unread count through RPC', () => {
    runner.dismiss(notification(), actionContext());

    expect(notificationInbox.dismissPlayerNotification)
      .toHaveBeenCalledWith('notification-1');
    expect(notifications).toEqual([]);
    expect(unreadCount).toBe(2);
    expect(runner.actionNotificationIds()).toEqual([]);
  });

  it('clears pending mark-read state and ignores stale success after context change', () => {
    const result$ = new Subject<PlayerNotificationMutationResult>();
    notificationInbox.markPlayerNotificationRead.and.returnValue(result$);

    runner.markRead(notification(), actionContext());

    expect(runner.actionNotificationIds()).toEqual(['notification-1']);

    isCurrentContext = false;
    result$.next(mutationResult({
      readAt: '2026-05-05T10:20:00.000Z',
      isUnread: false,
    }));

    expect(notifications[0].readState.isUnread).toBeTrue();
    expect(unreadCount).toBe(3);
    expect(runner.actionNotificationIds()).toEqual([]);
  });

  it('clears pending dismiss state and ignores stale success after context change', () => {
    const result$ = new Subject<PlayerNotificationMutationResult>();
    notificationInbox.dismissPlayerNotification.and.returnValue(result$);

    runner.dismiss(notification(), actionContext());

    expect(runner.actionNotificationIds()).toEqual(['notification-1']);

    isCurrentContext = false;
    result$.next(mutationResult({
      dismissedAt: '2026-05-05T10:25:00.000Z',
      isDismissed: true,
    }));

    expect(notifications.map((item) => item.notificationId)).toEqual(['notification-1']);
    expect(unreadCount).toBe(3);
    expect(runner.actionNotificationIds()).toEqual([]);
  });

  it('shows mutation errors without changing the local notification', () => {
    notificationInbox.markPlayerNotificationRead.and.returnValue(
      throwError(() => new Error('access denied')),
    );

    runner.markRead(notification(), actionContext());

    expect(notifications[0].readState.isUnread).toBeTrue();
    expect(error).toBe('access denied');
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Notification update failed',
      'access denied',
    );
    expect(runner.actionNotificationIds()).toEqual([]);
  });

  function actionContext(): NotificationBellActionContext {
    return {
      isCurrentContext: () => isCurrentContext,
      setError: (message) => {
        error = message;
      },
      setUnreadCount: (count) => {
        unreadCount = count;
      },
      updateNotifications: (updater) => {
        notifications = updater(notifications);
      },
    };
  }
});

function notification(): PlayerNotificationListItem {
  return {
    notificationId: 'notification-1',
    type: {
      key: 'estate.building_job.completed',
      label: 'Building completed',
      category: 'estate',
      helperText: null,
    },
    recipientKind: 'hero',
    severity: 'notice',
    title: 'Building completed',
    body: 'A building job was completed.',
    actionLink: null,
    sourceEntity: null,
    readState: {
      readAt: null,
      dismissedAt: null,
      isUnread: true,
      isDismissed: false,
    },
    createdAt: '2026-05-05T10:00:00.000Z',
    defaultToastEnabled: true,
  };
}

function mutationResult(
  readState: Partial<PlayerNotificationListItem['readState']> = {},
): PlayerNotificationMutationResult {
  return {
    notificationId: 'notification-1',
    recipientKind: 'hero',
    readState: {
      readAt: null,
      dismissedAt: null,
      isUnread: true,
      isDismissed: false,
      ...readState,
    },
  };
}
