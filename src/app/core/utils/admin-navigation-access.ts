import {
  AdminDashboardCard,
  AdminNavigationAccessPolicy,
  AdminTagLink,
} from '../types/admin-ui.types';
import { StaffAccessPolicy } from '../types/staff-access-policy.types';

export function filterAdminDashboardCards(
  cards: readonly AdminDashboardCard[],
  policy: StaffAccessPolicy,
): readonly AdminDashboardCard[] {
  return cards.filter((card) => canAccessAdminNavigation(card.accessPolicy, policy));
}

export function filterAdminTagLinks(
  links: readonly AdminTagLink[],
  policy: StaffAccessPolicy,
): readonly AdminTagLink[] {
  return links.filter((link) =>
    canAccessAdminNavigation(
      link.accessPolicy ?? inferAdminNavigationAccessPolicy(link.routerLink),
      policy,
    ),
  );
}

export function canAccessAdminNavigation(
  accessPolicy: AdminNavigationAccessPolicy,
  policy: StaffAccessPolicy,
): boolean {
  switch (accessPolicy) {
    case 'adminShell':
      return policy.canAccessAdminShell;
    case 'selectedServerManagement':
      return policy.isGlobalAdmin || policy.canManageSelectedServer;
    case 'selectedServerModeration':
      return policy.isGlobalAdmin || policy.canModerateSelectedServer;
    case 'selectedServerAntiAbuseTriage':
      return policy.isGlobalAdmin || policy.canTriageAntiAbuseSelectedServer;
    case 'selectedServerTesting':
      return policy.isGlobalAdmin || policy.canTestSelectedServer;
    case 'playerGameplay':
      return policy.canAccessPlayerGameplay;
  }
}

function inferAdminNavigationAccessPolicy(routerLink: string): AdminNavigationAccessPolicy {
  // Transitional compatibility fallback; new links should set accessPolicy explicitly.
  if (routerLink.startsWith('/hero') || routerLink.startsWith('/game')) {
    return 'playerGameplay';
  }

  if (routerLink === '/admin') {
    return 'adminShell';
  }

  return 'selectedServerManagement';
}
