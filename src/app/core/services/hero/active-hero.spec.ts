import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { Platform } from '../platform/platform';
import { ActiveServer } from '../server/active-server';
import { ActiveHero } from './active-hero';

describe('ActiveHero', () => {
  let authState: AuthState;
  let backend: jasmine.SpyObj<Backend>;
  let activeServer: jasmine.SpyObj<ActiveServer>;
  let activeHero: ActiveHero;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    activeServer = jasmine.createSpyObj<ActiveServer>('ActiveServer', [
      'loadAccessibleServers',
      'selectedServer',
    ]);

    activeServer.selectedServer.and.returnValue({
      id: 'server-1',
      key: 'sandbox',
      name: 'Sandbox',
    } as ReturnType<ActiveServer['selectedServer']>);
    backend.getAll.and.returnValue(of([
      heroRow({ id: 'hero-1', name: 'First' }),
      heroRow({ id: 'hero-2', name: 'Second' }),
    ]));

    TestBed.configureTestingModule({
      providers: [
        AuthState,
        ActiveHero,
        { provide: Backend, useValue: backend },
        { provide: Platform, useValue: { isBrowser: true, isServer: false } },
        { provide: ActiveServer, useValue: activeServer },
      ],
    });

    authState = TestBed.inject(AuthState);
    authState.setUser({ id: 'user-1' } as ReturnType<AuthState['user']>);
    activeHero = TestBed.inject(ActiveHero);
    window.localStorage.removeItem('mythsworn.selectedHeroId.user-1.server-1');
  });

  afterEach(() => {
    window.localStorage.removeItem('mythsworn.selectedHeroId.user-1.server-1');
  });

  it('selects a hero only through the selected server scoped active-hero read path', (done) => {
    activeHero.selectHero('hero-2').subscribe((state) => {
      expect(backend.getAll).toHaveBeenCalledOnceWith({
        table: TABLES.hero,
        filters: {
          userId: { operator: FilterOperator.EQ, value: 'user-1' },
          serverId: { operator: FilterOperator.EQ, value: 'server-1' },
        },
        orderBy: { column: 'created_at' },
        camelCase: false,
      });
      expect(state.heroId).toBe('hero-2');
      expect(authState.hero()?.id).toBe('hero-2');
      done();
    });
  });

  it('restores the selected hero for the selected server after in-memory state is cleared', async () => {
    await firstValueFrom(activeHero.selectHero('hero-2'));

    activeHero.clear();

    const state = await firstValueFrom(activeHero.loadActiveHero());

    expect(state?.heroId).toBe('hero-2');
    expect(authState.hero()?.id).toBe('hero-2');
  });
});

function heroRow(patch: Record<string, unknown> = {}) {
  return {
    id: 'hero-1',
    user_id: 'user-1',
    server_id: 'server-1',
    name: 'Hero',
    level: 1,
    rank: 1,
    experience: 0,
    total_experience_earned: 0,
    character_points: 1000,
    total_character_points_earned: 1000,
    origin_id: 'origin-1',
    estate_id: 'estate-1',
    profile_picture: null,
    created_at: '2026-05-01T10:00:00.000Z',
    ...patch,
  };
}
