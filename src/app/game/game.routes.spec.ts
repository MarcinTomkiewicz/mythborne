import { routes } from '../app.routes';
import { requireOnboardedHeroGuard } from '../core/guards/hero-onboarding.guard';
import { gameRoutes } from './game.routes';

describe('game routes', () => {
  it('exposes the vicinity page under the guarded game shell', () => {
    const gameShellRoute = routes
      .flatMap((route) => route.children ?? [])
      .find((route) => route.path === 'game');
    const vicinityRoute = gameRoutes.find((route) => route.path === 'vicinity');

    expect(gameShellRoute?.canActivateChild).toContain(requireOnboardedHeroGuard);
    expect(vicinityRoute).toBeDefined();
    expect(vicinityRoute?.loadComponent).toEqual(jasmine.any(Function));
  });

  it('does not introduce a neighborhood route alias', () => {
    expect(gameRoutes.some((route) => route.path === 'neighborhood')).toBeFalse();
  });
});
