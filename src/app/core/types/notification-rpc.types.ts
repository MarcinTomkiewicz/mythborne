import { Database } from './database.types';
import { Row } from './supabase.types';

export type NotificationRecipientKind =
  Database['public']['Enums']['notification_recipient_kind'];
export type NotificationSeverity =
  Database['public']['Enums']['notification_severity'];

export type NotificationTypeRow = Row<'notification_types'>;

export type GetMyNotificationsRpcArgs =
  Database['public']['Functions']['get_my_notifications']['Args'];
export type GetMyNotificationsRpcRow =
  Database['public']['Functions']['get_my_notifications']['Returns'][number];
export type GetMyNotificationUnreadCountRpcArgs =
  Database['public']['Functions']['get_my_notification_unread_count']['Args'];
export type GetMyNotificationUnreadCountRpcReturn =
  Database['public']['Functions']['get_my_notification_unread_count']['Returns'];

export type GetMyStaffNotificationsRpcArgs =
  Database['public']['Functions']['get_my_staff_notifications']['Args'];
export type GetMyStaffNotificationsRpcRow =
  Database['public']['Functions']['get_my_staff_notifications']['Returns'][number];
export type GetMyStaffNotificationUnreadCountRpcArgs =
  Database['public']['Functions']['get_my_staff_notification_unread_count']['Args'];
export type GetMyStaffNotificationUnreadCountRpcReturn =
  Database['public']['Functions']['get_my_staff_notification_unread_count']['Returns'];

export type MarkNotificationReadRpcArgs =
  Database['public']['Functions']['mark_notification_read']['Args'];
export type MarkNotificationReadRpcReturn =
  Database['public']['Functions']['mark_notification_read']['Returns'];
export type DismissNotificationRpcArgs =
  Database['public']['Functions']['dismiss_notification']['Args'];
export type DismissNotificationRpcReturn =
  Database['public']['Functions']['dismiss_notification']['Returns'];
