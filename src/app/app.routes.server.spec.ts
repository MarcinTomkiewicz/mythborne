import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

describe('server routes', () => {
  it('renders private dynamic spy result routes on the server instead of prerendering', () => {
    const route = serverRoutes.find((item) =>
      item.path === 'game/vicinity/spy-results/:spyResultId',
    );

    expect(route?.renderMode).toBe(RenderMode.Server);
  });
});
