import { AdminDashboardCard, AdminTagLink } from '../types/admin-ui.types';
import { StaffAccessPolicy } from '../types/staff-access-policy.types';
import {
  filterAdminDashboardCards,
  filterAdminTagLinks,
} from './admin-navigation-access';

describe('admin navigation access', () => {
  it('shows management dashboard cards to global admins', () => {
    const cards = createCards('selectedServerManagement');

    const result = filterAdminDashboardCards(cards, createPolicy({ isGlobalAdmin: true }));

    expect(result.map((card) => card.routerLink)).toEqual(['/admin/balance']);
  });

  it('shows selected-server management cards to selected-server operators', () => {
    const cards = createCards('selectedServerManagement');

    const result = filterAdminDashboardCards(
      cards,
      createPolicy({ canManageSelectedServer: true }),
    );

    expect(result.map((card) => card.routerLink)).toEqual(['/admin/balance']);
  });

  it('hides management dashboard cards from moderators without management authority', () => {
    const cards = createCards('selectedServerManagement');

    const result = filterAdminDashboardCards(
      cards,
      createPolicy({
        canAccessAdminShell: true,
        canModerateSelectedServer: true,
      }),
    );

    expect(result).toEqual([]);
  });

  it('shows moderation cards to moderators without exposing management cards', () => {
    const cards = [
      ...createCards('selectedServerManagement'),
      ...createCards('selectedServerModeration', '/admin/moderation'),
    ];

    const result = filterAdminDashboardCards(
      cards,
      createPolicy({
        canAccessAdminShell: true,
        canModerateSelectedServer: true,
      }),
    );

    expect(result.map((card) => card.routerLink)).toEqual(['/admin/moderation']);
  });

  it('shows testing cards to testers without exposing management cards', () => {
    const cards = [
      ...createCards('selectedServerManagement'),
      ...createCards('selectedServerTesting', '/admin/testing'),
    ];

    const result = filterAdminDashboardCards(
      cards,
      createPolicy({
        canAccessAdminShell: true,
        canTestSelectedServer: true,
      }),
    );

    expect(result.map((card) => card.routerLink)).toEqual(['/admin/testing']);
  });

  it('hides admin shell links from players and keeps them for shell-allowed contexts', () => {
    const links: readonly AdminTagLink[] = [
      { label: 'Dashboard', routerLink: '/admin', accessPolicy: 'adminShell' },
    ];

    expect(filterAdminTagLinks(links, createPolicy())).toEqual([]);
    expect(
      filterAdminTagLinks(links, createPolicy({ canAccessAdminShell: true })).map(
        (link) => link.routerLink,
      ),
    ).toEqual(['/admin']);
  });

  it('hides gameplay tag links when player gameplay is blocked', () => {
    const links: readonly AdminTagLink[] = [
      { label: 'Dashboard', routerLink: '/admin' },
      { label: 'Armory', routerLink: '/game/armory' },
    ];

    const result = filterAdminTagLinks(
      links,
      createPolicy({
        canAccessAdminShell: true,
        canAccessPlayerGameplay: false,
      }),
    );

    expect(result.map((link) => link.routerLink)).toEqual(['/admin']);
  });

  it('treats game links without explicit policy as player gameplay fallback', () => {
    const links: readonly AdminTagLink[] = [
      { label: 'Armory', routerLink: '/game/armory' },
    ];

    const result = filterAdminTagLinks(
      links,
      createPolicy({ canAccessPlayerGameplay: false }),
    );

    expect(result).toEqual([]);
  });
});

function createCards(
  accessPolicy: AdminDashboardCard['accessPolicy'],
  routerLink = '/admin/balance',
): readonly AdminDashboardCard[] {
  return [
    {
      legend: 'Balance',
      title: 'Balance',
      description: 'Balance tools.',
      routerLink,
      accessPolicy,
    },
  ];
}

function createPolicy(overrides: Partial<StaffAccessPolicy> = {}): StaffAccessPolicy {
  return {
    isGlobalAdmin: false,
    isGlobalOperator: false,
    isGlobalTester: false,
    isGlobalModerator: false,
    isAssignedStaffOnSelectedServer: false,
    isSelectedServerOwner: false,
    isSelectedServerOperator: false,
    isSelectedServerModerator: false,
    isSelectedServerTester: false,
    isSandboxOrTestingServer: false,
    hasSelectedServerManagementAuthority: false,
    hasSelectedServerModerationAuthority: false,
    hasSelectedServerTestingAccess: false,
    canAccessAdminShell: false,
    canAccessSelectedServerStaffTools: false,
    canManageSelectedServer: false,
    canModerateSelectedServer: false,
    canTestSelectedServer: false,
    canAccessPlayerGameplay: true,
    isStaffGameplayBlocked: false,
    ...overrides,
  };
}
