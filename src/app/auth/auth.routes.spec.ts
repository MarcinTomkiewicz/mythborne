import { authRoutes } from './auth.routes';
import { AccountEntryLayout } from './layout/account-entry-layout';

describe('authRoutes', () => {
  it('renders account-entry pages inside the account layout route', async () => {
    const accountLayoutRoute = authRoutes.find((route) =>
      route.path === '' &&
      !!route.loadComponent &&
      Array.isArray(route.children),
    );

    expect(accountLayoutRoute).toBeTruthy();
    await expectAsync(accountLayoutRoute?.loadComponent?.() as Promise<unknown>)
      .toBeResolvedTo(AccountEntryLayout);
    expect(accountLayoutRoute?.children?.some((route) => route.path === 'login'))
      .toBeTrue();
    expect(accountLayoutRoute?.children?.some((route) => route.path === 'server-entry'))
      .toBeTrue();
    expect(accountLayoutRoute?.children?.some((route) => route.path === 'create-character'))
      .toBeTrue();
  });

  it('does not expose server-entry as a top-level auth page outside the account layout', () => {
    const topLevelServerEntry = authRoutes.find((route) => route.path === 'server-entry');

    expect(topLevelServerEntry).toBeUndefined();
  });

  it('does not expose login as a top-level auth page outside the account layout', () => {
    const topLevelLogin = authRoutes.find((route) => route.path === 'login');

    expect(topLevelLogin).toBeUndefined();
  });
});
