import { Injectable } from '@angular/core';
import { adminRoutes } from '../../../admin/admin.routes';
import { StaffNotificationListItem } from '../../../core/domain/notifications/notification.model';

const ADMIN_ROUTE_PATTERNS = adminRoutes
  .map((route) => route.path)
  .filter((path): path is string => typeof path === 'string' && path !== 'access-denied')
  .map((path) => toAdminRoutePattern(path));

@Injectable()
export class StaffNotificationActionRoutePolicy {
  actionRoute(notification: StaffNotificationListItem): string | null {
    const url = notification.actionLink?.url ?? null;

    if (!url) {
      return null;
    }

    const path = url.split(/[?#]/, 1)[0];

    if (!path.startsWith('/admin')) {
      return null;
    }

    return ADMIN_ROUTE_PATTERNS.some((pattern) => pattern.test(path)) ? url : null;
  }
}

function toAdminRoutePattern(path: string): RegExp {
  if (path === '') {
    return /^\/admin\/?$/;
  }

  const segments = path.split('/').map((segment) =>
    segment.startsWith(':') ? '[^/]+' : escapeRegExp(segment),
  );

  return new RegExp(`^/admin/${segments.join('/')}/?$`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
