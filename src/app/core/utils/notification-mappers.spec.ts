import {
  GetMyNotificationsRpcRow,
  GetMyStaffNotificationsRpcRow,
  NotificationTypeRow,
} from '../types/notification-rpc.types';
import {
  mapNotificationType,
  mapPlayerNotificationListItem,
  mapStaffNotificationListItem,
} from './notification-mappers';

type PlayerNotificationRowOverride = Partial<{
  [Key in keyof GetMyNotificationsRpcRow]: GetMyNotificationsRpcRow[Key] | null;
}>;
type StaffNotificationRowOverride = Partial<{
  [Key in keyof GetMyStaffNotificationsRpcRow]: GetMyStaffNotificationsRpcRow[Key] | null;
}>;

describe('notification mappers', () => {
  it('maps notification type dictionary rows', () => {
    expect(mapNotificationType(notificationTypeRow())).toEqual({
      key: 'estate.building_job.completed',
      label: 'Building completed',
      description: 'A building job completed.',
      helperText: 'Shown when estate construction finishes.',
      adminDescription: 'Internal admin note.',
      category: 'estate',
      defaultSeverity: 'notice',
      defaultToastEnabled: true,
      sortOrder: 10,
      isActive: true,
    });
  });

  it('maps player notifications with read state, action link and toast eligibility', () => {
    const item = mapPlayerNotificationListItem(playerNotificationRow({
      read_at: null,
      dismissed_at: null,
      is_unread: true,
      is_dismissed: false,
    }));

    expect(item).toEqual({
      notificationId: 'notification-1',
      type: {
        key: 'estate.building_job.completed',
        label: 'Building completed',
        category: 'estate',
        helperText: 'Shown when estate construction finishes.',
      },
      recipientKind: 'hero',
      severity: 'notice',
      title: 'Workshop completed',
      body: 'Workshop reached level 2.',
      actionLink: {
        label: 'Open estate',
        url: '/game/mansion',
      },
      sourceEntity: {
        entityType: 'estate_building_job',
        entityId: 'job-1',
      },
      readState: {
        readAt: null,
        dismissedAt: null,
        isUnread: true,
        isDismissed: false,
      },
      createdAt: '2026-05-05T10:00:00.000Z',
      defaultToastEnabled: true,
    });
    expect(Object.keys(item).sort()).not.toContain('actorHeroId');
    expect(Object.keys(item).sort()).not.toContain('recipientHeroId');
    expect(Object.keys(item).sort()).not.toContain('recipientUserId');
  });

  it('maps dismissed player notifications and nullable body/action/source safely', () => {
    const item = mapPlayerNotificationListItem(playerNotificationRow({
      action_label: null,
      action_url: null,
      body: null,
      dismissed_at: '2026-05-05T10:05:00.000Z',
      is_dismissed: true,
      is_unread: false,
      read_at: '2026-05-05T10:05:00.000Z',
      source_entity_id: null,
      source_entity_type: null,
    }));

    expect(item.body).toBeNull();
    expect(item.actionLink).toBeNull();
    expect(item.sourceEntity).toBeNull();
    expect(item.readState).toEqual({
      readAt: '2026-05-05T10:05:00.000Z',
      dismissedAt: '2026-05-05T10:05:00.000Z',
      isUnread: false,
      isDismissed: true,
    });
  });

  it('rejects staff notifications from the player mapper', () => {
    expect(() =>
      mapPlayerNotificationListItem(playerNotificationRow({
        recipient_kind: 'staff',
      })),
    ).toThrowError('Staff notifications must not be mapped into the player inbox.');
  });

  it('maps staff notifications with explicit staff metadata', () => {
    const item = mapStaffNotificationListItem(staffNotificationRow());

    expect(item).toEqual(jasmine.objectContaining({
      notificationId: 'staff-notification-1',
      recipientKind: 'staff',
      severity: 'warning',
      serverId: 'server-1',
      actorHeroId: 'hero-actor-1',
      recipientHeroId: null,
      defaultToastEnabled: false,
      sourceEntity: {
        entityType: 'anti_abuse_case',
        entityId: 'case-1',
      },
    }));
    expect(item.type).toEqual({
      key: 'staff.anti_abuse.case_opened',
      label: 'Anti-abuse case opened',
      category: 'staff',
      helperText: 'Shown to staff when a case needs review.',
    });
  });

  it('rejects non-staff notifications from the staff mapper', () => {
    expect(() =>
      mapStaffNotificationListItem(staffNotificationRow({
        recipient_kind: 'hero',
      })),
    ).toThrowError('Non-staff notifications must not be mapped into the staff inbox.');
  });
});

function notificationTypeRow(): NotificationTypeRow {
  return {
    admin_description: 'Internal admin note.',
    category: 'estate',
    created_at: '2026-05-05T10:00:00.000Z',
    default_severity: 'notice',
    default_toast_enabled: true,
    description: 'A building job completed.',
    helper_text: 'Shown when estate construction finishes.',
    is_active: true,
    key: 'estate.building_job.completed',
    label: 'Building completed',
    sort_order: 10,
    updated_at: '2026-05-05T10:00:00.000Z',
  };
}

function playerNotificationRow(
  overrides: PlayerNotificationRowOverride = {},
): GetMyNotificationsRpcRow {
  return {
    action_label: 'Open estate',
    action_url: '/game/mansion',
    actor_hero_id: 'hero-actor-1',
    body: 'Workshop reached level 2.',
    created_at: '2026-05-05T10:00:00.000Z',
    default_toast_enabled: true,
    dismissed_at: null,
    is_dismissed: false,
    is_unread: true,
    notification_id: 'notification-1',
    notification_type_category: 'estate',
    notification_type_helper_text: 'Shown when estate construction finishes.',
    notification_type_key: 'estate.building_job.completed',
    notification_type_label: 'Building completed',
    read_at: null,
    recipient_hero_id: 'hero-1',
    recipient_kind: 'hero',
    server_id: 'server-1',
    severity: 'notice',
    source_entity_id: 'job-1',
    source_entity_type: 'estate_building_job',
    title: 'Workshop completed',
    ...overrides,
  } as unknown as GetMyNotificationsRpcRow;
}

function staffNotificationRow(
  overrides: StaffNotificationRowOverride = {},
): GetMyStaffNotificationsRpcRow {
  return {
    action_label: 'Open case',
    action_url: '/admin/anti-abuse/cases/case-1',
    actor_hero_id: 'hero-actor-1',
    body: 'A new case needs staff review.',
    created_at: '2026-05-05T10:00:00.000Z',
    default_toast_enabled: false,
    dismissed_at: null,
    is_dismissed: false,
    is_unread: true,
    notification_id: 'staff-notification-1',
    notification_type_category: 'staff',
    notification_type_helper_text: 'Shown to staff when a case needs review.',
    notification_type_key: 'staff.anti_abuse.case_opened',
    notification_type_label: 'Anti-abuse case opened',
    read_at: null,
    recipient_hero_id: null,
    recipient_kind: 'staff',
    server_id: 'server-1',
    severity: 'warning',
    source_entity_id: 'case-1',
    source_entity_type: 'anti_abuse_case',
    title: 'Case opened',
    ...overrides,
  } as unknown as GetMyStaffNotificationsRpcRow;
}
