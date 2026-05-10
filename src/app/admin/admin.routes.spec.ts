import { adminRoutes } from './admin.routes';

describe('admin routes', () => {
  it('exposes the Luck Lab admin route', () => {
    const route = adminRoutes.find((item) => item.path === 'luck-lab');

    expect(route).toBeDefined();
    expect(route?.loadComponent).toEqual(jasmine.any(Function));
  });
});
