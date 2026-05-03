import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { FilterOperator } from '../../enums/filter-operators';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';
import { HeroProgressionHistory } from './hero-progression-history';

describe('HeroProgressionHistory', () => {
  let service: HeroProgressionHistory;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll', 'update', 'delete']);

    activeHero.requireActiveHero.and.returnValue(
      of({
        heroRow: {} as never,
        heroId: 'hero-1',
        hero: {} as never,
        userId: 'user-1',
        serverId: 'server-1',
        server: {} as never,
      }),
    );
    backend.getAll.and.returnValue(
      of([
        {
          id: 'ledger-1',
          hero_id: 'hero-1',
          server_id: 'server-1',
          entry_kind: 'experience_gain',
          source_kind: 'trial',
          source_id: 'trial-1',
          experience_delta: 120,
          experience_before: 60,
          experience_after: 0,
          total_experience_earned_before: 60,
          total_experience_earned_after: 180,
          level_before: 1,
          level_after: 2,
          reached_level: null,
          parent_ledger_id: null,
          character_points_gross_delta: 120,
          character_points_balance_after: 25,
          xp_threshold: 180,
          reason: 'Trial completion reward',
          request_id: 'request-1',
          created_by: 'admin-1',
          created_at: '2026-05-03T10:00:00.000Z',
          metadata_json: { outcome: 'success' },
        },
      ]),
    );

    TestBed.configureTestingModule({
      providers: [
        HeroProgressionHistory,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(HeroProgressionHistory);
  });

  it('loads active hero progression history as explicit read models', async () => {
    const result = await firstValueFrom(service.getActiveHeroHistory({ limit: 25 }));

    expect(backend.getAll).toHaveBeenCalledWith({
      table: 'hero_progression_ledger',
      filters: {
        heroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        serverId: { operator: FilterOperator.EQ, value: 'server-1' },
      },
      orderBy: { column: 'created_at', ascending: false },
      range: { from: 0, to: 24 },
      camelCase: false,
    });
    expect(result[0]).toEqual(
      jasmine.objectContaining({
        id: 'ledger-1',
        entryType: 'experience_gain',
        experienceDelta: 120,
      }),
    );
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('rejects invalid history limits before querying', () => {
    expect(() => service.getActiveHeroHistory({ limit: 1.5 })).toThrowError(
      'Progression history limit must be a positive integer.',
    );

    expect(backend.getAll).not.toHaveBeenCalled();
  });
});
