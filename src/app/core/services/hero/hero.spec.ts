import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AuthState } from '../auth/auth-state';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';
import { Hero } from './hero';

describe('Hero', () => {
  let service: Hero;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let authState: jasmine.SpyObj<AuthState>;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    authState = jasmine.createSpyObj<AuthState>('AuthState', ['hero', 'setHero']);
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'rpc',
      'updateWhere',
      'upsertMany',
    ]);

    activeHero.requireActiveHero.and.returnValue(
      of({
        heroRow: createHeroRow(),
        heroId: 'hero-1',
        hero: createHero(),
        userId: 'user-1',
        serverId: 'server-1',
        server: {} as never,
      }),
    );
    authState.hero.and.returnValue(createHero());
    backend.rpc.and.returnValue(
      of([
        {
          audit_log_id: 'audit-1',
          character_points_after: 5,
          hero_id: 'hero-1',
          server_id: 'server-1',
          stats_json: { strength: 0, dexterity: 3 },
        },
      ]),
    );

    TestBed.configureTestingModule({
      providers: [
        Hero,
        { provide: ActiveHero, useValue: activeHero },
        { provide: AuthState, useValue: authState },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(Hero);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends normalized stat values to the canonical stat allocation rpc', async () => {
    const result = await firstValueFrom(
      service.saveProgressionDraft(
        { strength: -1, dexterity: 2.7 },
        5,
        {
          previousCharacterPoints: 8,
        },
      ),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      'save_stat_allocation',
      {
        p_hero_id: 'hero-1',
        p_stat_values_json: { strength: 0, dexterity: 3 },
        p_character_points_spent: 3,
        p_reason: 'Stat allocation saved.',
      },
    );
    expect(result).toEqual(
      {
        auditLogId: 'audit-1',
        characterPointsAfter: 5,
        heroId: 'hero-1',
        serverId: 'server-1',
        stats: { strength: 0, dexterity: 3 },
      },
    );
    expect(backend.rpc).toHaveBeenCalledTimes(1);
    expect(authState.setHero).toHaveBeenCalledWith(
      jasmine.objectContaining({
        characterPoints: 5,
      }),
    );
    expect(backend.upsertMany).not.toHaveBeenCalled();
    expect(backend.updateWhere).not.toHaveBeenCalled();
  });

  it('uses the active hero id for stat allocation instead of the auth user id', async () => {
    activeHero.requireActiveHero.and.returnValue(
      of({
        heroRow: createHeroRow({
          id: 'hero-active',
          user_id: 'auth-user-1',
          server_id: 'server-1',
        }),
        heroId: 'hero-active',
        hero: createHero({
          id: 'hero-active',
          userId: 'auth-user-1',
          serverId: 'server-1',
        }),
        userId: 'auth-user-1',
        serverId: 'server-1',
        server: {} as never,
      }),
    );
    authState.hero.and.returnValue(
      createHero({
        id: 'hero-active',
        userId: 'auth-user-1',
        serverId: 'server-1',
      }),
    );
    backend.rpc.and.returnValue(
      of([
        {
          audit_log_id: 'audit-2',
          character_points_after: 4,
          hero_id: 'hero-active',
          server_id: 'server-1',
          stats_json: { strength: 2 },
        },
      ]),
    );

    await firstValueFrom(
      service.saveProgressionDraft(
        { strength: 2 },
        4,
        {
          previousCharacterPoints: 6,
        },
      ),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      'save_stat_allocation',
      jasmine.objectContaining({
        p_hero_id: 'hero-active',
      }),
    );
    expect(backend.rpc).not.toHaveBeenCalledWith(
      'save_stat_allocation',
      jasmine.objectContaining({
        p_hero_id: 'auth-user-1',
      }),
    );
  });

  it('does not refresh a different active hero from a stale stat allocation result', async () => {
    authState.hero.and.returnValue(
      createHero({
        id: 'hero-2',
        serverId: 'server-1',
        characterPoints: 11,
      }),
    );

    await firstValueFrom(
      service.saveProgressionDraft(
        { strength: 2 },
        5,
        {
          previousCharacterPoints: 8,
        },
      ),
    );

    expect(authState.setHero).not.toHaveBeenCalled();
  });

  it('sends zero declared Character Points spent without direct writes', async () => {
    backend.rpc.and.returnValue(
      of([
        {
          audit_log_id: 'audit-1',
          character_points_after: 5,
          hero_id: 'hero-1',
          server_id: 'server-1',
          stats_json: { strength: 1 },
        },
      ]),
    );

    await firstValueFrom(
      service.saveProgressionDraft(
        { strength: 1.2 },
        5,
        {
          previousCharacterPoints: 5,
        },
      ),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      'save_stat_allocation',
      jasmine.objectContaining({
        p_stat_values_json: { strength: 1 },
        p_character_points_spent: 0,
      }),
    );
    expect(backend.rpc).toHaveBeenCalledTimes(1);
    expect(backend.upsertMany).not.toHaveBeenCalled();
    expect(backend.updateWhere).not.toHaveBeenCalled();
  });
});

function createHero(overrides: Partial<ReturnType<typeof baseHero>> = {}) {
  return {
    ...baseHero(),
    ...overrides,
  };
}

function baseHero() {
  return {
    id: 'hero-1',
    userId: 'user-1',
    serverId: 'server-1',
    name: 'Hero',
    level: 1,
    rank: 1,
    experience: 0,
    characterPoints: 8,
    totalCharacterPointsEarned: 8,
    originId: null,
    estateId: null,
    profilePicture: null,
    createdAt: null,
  };
}

function createHeroRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'hero-1',
    user_id: 'user-1',
    server_id: 'server-1',
    name: 'Hero',
    level: 1,
    rank: 1,
    experience: 0,
    character_points: 8,
    total_character_points_earned: 8,
    origin_id: null,
    estate_id: null,
    profile_picture: null,
    created_at: null,
    updated_at: null,
    ...overrides,
  } as never;
}
