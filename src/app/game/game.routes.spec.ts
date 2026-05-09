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

  it('exposes the PvP spy result detail route under vicinity', () => {
    const route = gameRoutes.find((item) =>
      item.path === 'vicinity/spy-results/:spyResultId',
    );

    expect(route).toBeDefined();
    expect(route?.loadComponent).toEqual(jasmine.any(Function));
  });

  it('exposes the PvP attack result detail route under vicinity', () => {
    const route = gameRoutes.find((item) =>
      item.path === 'vicinity/attack-results/:attackResultId',
    );

    expect(route).toBeDefined();
    expect(route?.loadComponent).toEqual(jasmine.any(Function));
  });

  it('exposes the guild page under the guarded game shell', () => {
    const gameShellRoute = routes
      .flatMap((route) => route.children ?? [])
      .find((route) => route.path === 'game');
    const guildRoute = gameRoutes.find((route) => route.path === 'guild');

    expect(gameShellRoute?.canActivateChild).toContain(requireOnboardedHeroGuard);
    expect(guildRoute).toBeDefined();
    expect(guildRoute?.loadComponent).toEqual(jasmine.any(Function));
  });
});
