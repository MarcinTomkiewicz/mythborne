import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  GetMyNotificationsRpcRow,
  GetMyStaffNotificationsRpcRow,
} from '../../types/notification-rpc.types';
import { Backend } from '../backend/backend';
import { ActiveHero } from '../hero/active-hero';
import { NotificationInbox } from './notification-inbox';

type NotificationRowOverride = {
  [Key in keyof GetMyNotificationsRpcRow]: GetMyNotificationsRpcRow[Key] | null;
};

type StaffNotificationRowOverride = {
  [Key in keyof GetMyStaffNotificationsRpcRow]:
    GetMyStaffNotificationsRpcRow[Key] | null;
};

describe('NotificationInbox', () => {
  let service: NotificationInbox;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', [
      'requireActiveHero',
    ]);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'rpc',
      'getAll',
      'create',
      'update',
      'delete',
      'upsert',
    ]);

    activeHero.requireActiveHero.and.returnValue(of({
      heroRow: { id: 'hero-1' } as never,
      heroId: 'hero-1',
      hero: {} as never,
      userId: 'user-1',
      serverId: 'server-1',
      server: {} as never,
    }));

    TestBed.configureTestingModule({
      providers: [
        NotificationInbox,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(NotificationInbox);
  });

  it('loads player notifications through the owner-safe RPC with active hero context', async () => {
    backend.rpc.and.returnValue(of([notificationRow()]));

    const notifications = await firstValueFrom(
      service.getPlayerNotifications({
        limit: 25,
        offset: 10,
        unreadOnly: true,
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_my_notifications,
      {
        p_hero_id: 'hero-1',
        p_include_dismissed: false,
        p_limit: 25,
        p_offset: 10,
        p_server_id: 'server-1',
        p_unread_only: true,
      },
    );
    expect(notifications[0]).toEqual(jasmine.objectContaining({
      notificationId: 'notification-1',
      recipientKind: 'hero',
      title: 'Building completed',
      defaultToastEnabled: true,
      readState: jasmine.objectContaining({
        isUnread: true,
        isDismissed: false,
      }),
    }));
    expect(Object.keys(notifications[0]).sort()).not.toContain('recipientHeroId');
    expect(backend.getAll).not.toHaveBeenCalled();
  });

  it('uses notification unread count RPC without report unread count mixing', async () => {
    backend.rpc.and.returnValue(of(4));

    await expectAsync(firstValueFrom(service.getPlayerUnreadCount()))
      .toBeResolvedTo(4);

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_my_notification_unread_count,
      {
        p_hero_id: 'hero-1',
        p_server_id: 'server-1',
      },
    );
  });

  it('keeps dismissed notifications out of the normal inbox result', async () => {
    backend.rpc.and.returnValue(of([
      notificationRow(),
      notificationRow({
        dismissed_at: '2026-05-05T10:10:00.000Z',
        is_dismissed: true,
        notification_id: 'notification-2',
        title: 'Dismissed notification',
      }),
    ]));

    const notifications = await firstValueFrom(service.getPlayerNotifications());

    expect(notifications.map((notification) => notification.notificationId))
      .toEqual(['notification-1']);
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_my_notifications,
      jasmine.objectContaining({ p_include_dismissed: false }),
    );
  });

  it('rejects staff rows returned to the player inbox boundary', async () => {
    backend.rpc.and.returnValue(of([
      notificationRow({ recipient_kind: 'staff' }),
    ]));

    await expectAsync(firstValueFrom(service.getPlayerNotifications()))
      .toBeRejectedWithError(
        'Staff notifications must not be mapped into the player inbox.',
      );
  });

  it('does not mutate notification rows directly', async () => {
    backend.rpc.and.returnValue(of([notificationRow()]));

    await firstValueFrom(service.getPlayerNotifications());

    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
    expect(backend.upsert).not.toHaveBeenCalled();
  });

  it('loads staff notifications through the server-scoped staff RPC', async () => {
    backend.rpc.and.returnValue(of([staffNotificationRow()]));

    const notifications = await firstValueFrom(
      service.getStaffNotifications(' server-1 ', {
        limit: 10,
        offset: 5,
        unreadOnly: true,
      }),
    );

    expect(activeHero.requireActiveHero).not.toHaveBeenCalled();
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_my_staff_notifications,
      {
        p_include_dismissed: false,
        p_limit: 10,
        p_offset: 5,
        p_server_id: 'server-1',
        p_unread_only: true,
      },
    );
    expect(notifications[0]).toEqual(jasmine.objectContaining({
      notificationId: 'staff-notification-1',
      recipientKind: 'staff',
      serverId: 'server-1',
      actorHeroId: 'hero-actor-1',
      recipientHeroId: null,
      title: 'Case needs review',
    }));
  });

  it('loads staff unread count through the staff count RPC only', async () => {
    backend.rpc.and.returnValue(of(2));

    await expectAsync(firstValueFrom(service.getStaffUnreadCount('server-1')))
      .toBeResolvedTo(2);

    expect(activeHero.requireActiveHero).not.toHaveBeenCalled();
    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.get_my_staff_notification_unread_count,
      { p_server_id: 'server-1' },
    );
  });

  it('does not load staff notifications without an explicit server id', () => {
    expect(() => service.getStaffNotifications(' '))
      .toThrowError('serverId is required for staff notifications.');
    expect(() => service.getStaffUnreadCount(''))
      .toThrowError('serverId is required for staff notifications.');
    expect(backend.rpc).not.toHaveBeenCalled();
  });

  it('rejects non-staff rows returned to the staff inbox boundary', async () => {
    backend.rpc.and.returnValue(of([
      staffNotificationRow({ recipient_kind: 'hero' }),
    ]));

    await expectAsync(firstValueFrom(service.getStaffNotifications('server-1')))
      .toBeRejectedWithError(
        'Non-staff notifications must not be mapped into the staff inbox.',
      );
  });

  it('keeps dismissed staff notifications out of the normal staff result', async () => {
    backend.rpc.and.returnValue(of([
      staffNotificationRow(),
      staffNotificationRow({
        dismissed_at: '2026-05-05T10:15:00.000Z',
        is_dismissed: true,
        notification_id: 'staff-notification-2',
        title: 'Dismissed staff notification',
      }),
    ]));

    const notifications = await firstValueFrom(
      service.getStaffNotifications('server-1'),
    );

    expect(notifications.map((notification) => notification.notificationId))
      .toEqual(['staff-notification-1']);
    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.get_my_staff_notifications,
      jasmine.objectContaining({ p_include_dismissed: false }),
    );
  });
});

function notificationRow(
  overrides: Partial<NotificationRowOverride> = {},
): GetMyNotificationsRpcRow {
  return {
    action_label: 'Open mansion',
    action_url: '/game/mansion',
    actor_hero_id: null,
    body: 'A building job was completed.',
    created_at: '2026-05-05T10:00:00.000Z',
    default_toast_enabled: true,
    dismissed_at: null,
    is_dismissed: false,
    is_unread: true,
    notification_id: 'notification-1',
    notification_type_category: 'estate',
    notification_type_helper_text: 'Building updates.',
    notification_type_key: 'estate.building_job.completed',
    notification_type_label: 'Building completed',
    read_at: null,
    recipient_hero_id: 'hero-1',
    recipient_kind: 'hero',
    server_id: 'server-1',
    severity: 'notice',
    source_entity_id: 'building-job-1',
    source_entity_type: 'estate_building_job',
    title: 'Building completed',
    ...overrides,
  } as unknown as GetMyNotificationsRpcRow;
}

function staffNotificationRow(
  overrides: Partial<StaffNotificationRowOverride> = {},
): GetMyStaffNotificationsRpcRow {
  return {
    action_label: 'Open case',
    action_url: '/admin/anti-abuse-cases/case-1',
    actor_hero_id: 'hero-actor-1',
    body: 'A staff case needs review.',
    created_at: '2026-05-05T10:00:00.000Z',
    default_toast_enabled: true,
    dismissed_at: null,
    is_dismissed: false,
    is_unread: true,
    notification_id: 'staff-notification-1',
    notification_type_category: 'staff',
    notification_type_helper_text: 'Staff review updates.',
    notification_type_key: 'anti_abuse.case_attention',
    notification_type_label: 'Case attention',
    read_at: null,
    recipient_hero_id: null,
    recipient_kind: 'staff',
    server_id: 'server-1',
    severity: 'warning',
    source_entity_id: 'case-1',
    source_entity_type: 'anti_abuse_case',
    title: 'Case needs review',
    ...overrides,
  } as unknown as GetMyStaffNotificationsRpcRow;
}
