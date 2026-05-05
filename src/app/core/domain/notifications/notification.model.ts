import {
  NotificationRecipientKind,
  NotificationSeverity,
} from '../../types/notification-rpc.types';

export interface NotificationTypeEntry {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  category: string;
  defaultSeverity: NotificationSeverity;
  defaultToastEnabled: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface NotificationReadState {
  readAt: string | null;
  dismissedAt: string | null;
  isUnread: boolean;
  isDismissed: boolean;
}

export interface NotificationActionLink {
  label: string;
  url: string;
}

export interface NotificationSourceEntityReference {
  entityType: string;
  entityId: string;
}

export interface NotificationTypeSnapshot {
  key: string;
  label: string;
  category: string;
  helperText: string | null;
}

export interface PlayerNotificationListItem {
  notificationId: string;
  type: NotificationTypeSnapshot;
  recipientKind: Exclude<NotificationRecipientKind, 'staff'>;
  severity: NotificationSeverity;
  title: string;
  body: string | null;
  actionLink: NotificationActionLink | null;
  sourceEntity: NotificationSourceEntityReference | null;
  readState: NotificationReadState;
  createdAt: string;
  defaultToastEnabled: boolean;
}

export interface PlayerNotificationFilters {
  readonly limit: number;
  readonly offset: number;
  readonly unreadOnly: boolean;
}

export interface StaffNotificationListItem {
  notificationId: string;
  type: NotificationTypeSnapshot;
  recipientKind: Extract<NotificationRecipientKind, 'staff'>;
  severity: NotificationSeverity;
  title: string;
  body: string | null;
  actionLink: NotificationActionLink | null;
  sourceEntity: NotificationSourceEntityReference | null;
  readState: NotificationReadState;
  createdAt: string;
  defaultToastEnabled: boolean;
  serverId: string;
  actorHeroId: string | null;
  recipientHeroId: string | null;
}
