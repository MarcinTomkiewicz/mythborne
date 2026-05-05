import {
  NotificationActionLink,
  NotificationReadState,
  NotificationSourceEntityReference,
  NotificationTypeEntry,
  NotificationTypeSnapshot,
  PlayerNotificationListItem,
  StaffNotificationListItem,
} from '../domain/notifications/notification.model';
import {
  GetMyNotificationsRpcRow,
  GetMyStaffNotificationsRpcRow,
  NotificationRecipientKind,
  NotificationTypeRow,
} from '../types/notification-rpc.types';

export function mapNotificationType(row: NotificationTypeRow): NotificationTypeEntry {
  return {
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: nullableText(row.helper_text),
    category: row.category,
    defaultSeverity: row.default_severity,
    defaultToastEnabled: row.default_toast_enabled,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapPlayerNotificationListItem(
  row: GetMyNotificationsRpcRow,
): PlayerNotificationListItem {
  if (row.recipient_kind === 'staff') {
    throw new Error('Staff notifications must not be mapped into the player inbox.');
  }

  return {
    notificationId: requiredText(row.notification_id, 'notificationId'),
    type: mapNotificationTypeSnapshot(row),
    recipientKind: row.recipient_kind as Exclude<NotificationRecipientKind, 'staff'>,
    severity: row.severity,
    title: requiredText(row.title, 'title'),
    body: nullableText(row.body),
    actionLink: mapNotificationActionLink(row),
    sourceEntity: mapNotificationSourceEntity(row),
    readState: mapNotificationReadState(row),
    createdAt: requiredText(row.created_at, 'createdAt'),
    defaultToastEnabled: row.default_toast_enabled,
  };
}

export function mapStaffNotificationListItem(
  row: GetMyStaffNotificationsRpcRow,
): StaffNotificationListItem {
  if (row.recipient_kind !== 'staff') {
    throw new Error('Non-staff notifications must not be mapped into the staff inbox.');
  }

  return {
    notificationId: requiredText(row.notification_id, 'notificationId'),
    type: mapNotificationTypeSnapshot(row),
    recipientKind: row.recipient_kind,
    severity: row.severity,
    title: requiredText(row.title, 'title'),
    body: nullableText(row.body),
    actionLink: mapNotificationActionLink(row),
    sourceEntity: mapNotificationSourceEntity(row),
    readState: mapNotificationReadState(row),
    createdAt: requiredText(row.created_at, 'createdAt'),
    defaultToastEnabled: row.default_toast_enabled,
    serverId: requiredText(row.server_id, 'serverId'),
    actorHeroId: nullableText(row.actor_hero_id),
    recipientHeroId: nullableText(row.recipient_hero_id),
  };
}

function mapNotificationTypeSnapshot(
  row: Pick<
    GetMyNotificationsRpcRow,
    | 'notification_type_key'
    | 'notification_type_label'
    | 'notification_type_category'
    | 'notification_type_helper_text'
  >,
): NotificationTypeSnapshot {
  return {
    key: requiredText(row.notification_type_key, 'notificationTypeKey'),
    label: requiredText(row.notification_type_label, 'notificationTypeLabel'),
    category: requiredText(row.notification_type_category, 'notificationTypeCategory'),
    helperText: nullableText(row.notification_type_helper_text),
  };
}

function mapNotificationReadState(
  row: Pick<
    GetMyNotificationsRpcRow,
    'read_at' | 'dismissed_at' | 'is_unread' | 'is_dismissed'
  >,
): NotificationReadState {
  return {
    readAt: nullableText(row.read_at),
    dismissedAt: nullableText(row.dismissed_at),
    isUnread: row.is_unread,
    isDismissed: row.is_dismissed,
  };
}

function mapNotificationActionLink(
  row: Pick<GetMyNotificationsRpcRow, 'action_label' | 'action_url'>,
): NotificationActionLink | null {
  const label = nullableText(row.action_label);
  const url = nullableText(row.action_url);

  if (!label || !url) {
    return null;
  }

  return { label, url };
}

function mapNotificationSourceEntity(
  row: Pick<GetMyNotificationsRpcRow, 'source_entity_type' | 'source_entity_id'>,
): NotificationSourceEntityReference | null {
  const entityType = nullableText(row.source_entity_type);
  const entityId = nullableText(row.source_entity_id);

  if (!entityType || !entityId) {
    return null;
  }

  return { entityType, entityId };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = nullableText(value);

  if (!normalized) {
    throw new Error(`${field} must be a non-empty notification field.`);
  }

  return normalized;
}

function nullableText(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
