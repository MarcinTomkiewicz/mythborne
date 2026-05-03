import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { FilterOperator } from '../../enums/filter-operators';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';
import { CharacterPointHistory } from './character-point-history';

describe('CharacterPointHistory', () => {
  let service: CharacterPointHistory;
  let activeHero: jasmine.SpyObj<ActiveHero>;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    activeHero = jasmine.createSpyObj<ActiveHero>('ActiveHero', ['requireActiveHero']);
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll', 'create', 'update', 'delete']);

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
    backend.getAll.and.returnValue(of([ledgerRow()]));

    TestBed.configureTestingModule({
      providers: [
        CharacterPointHistory,
        { provide: ActiveHero, useValue: activeHero },
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(CharacterPointHistory);
  });

  it('loads active hero Character Points ledger as player-safe read models', async () => {
    const result = await firstValueFrom(service.getActiveHeroHistory({ limit: 5 }));

    expect(backend.getAll).toHaveBeenCalledWith({
      table: TABLES.character_point_ledger,
      filters: {
        heroId: { operator: FilterOperator.EQ, value: 'hero-1' },
        serverId: { operator: FilterOperator.EQ, value: 'server-1' },
      },
      orderBy: { column: 'created_at', ascending: false },
      range: { from: 0, to: 4 },
      camelCase: false,
    });
    expect(result[0]).toEqual(jasmine.objectContaining({
      id: 'cp-ledger-1',
      reasonLabel: 'XP-derived Character Points',
      amountLabel: '+120 Character Points',
    }));
    expect(result[0]).not.toEqual(jasmine.objectContaining({
      createdBy: 'system',
      description: 'Internal description.',
      relatedEntityId: 'progression-ledger-1',
    }));
    expect(backend.create).not.toHaveBeenCalled();
    expect(backend.update).not.toHaveBeenCalled();
    expect(backend.delete).not.toHaveBeenCalled();
  });

  it('rejects invalid history limits before querying', () => {
    expect(() => service.getActiveHeroHistory({ limit: 0 })).toThrowError(
      'Character Points history limit must be a positive integer.',
    );

    expect(backend.getAll).not.toHaveBeenCalled();
  });
});

function ledgerRow() {
  return {
    id: 'cp-ledger-1',
    hero_id: 'hero-1',
    server_id: 'server-1',
    reason: 'experience_gain',
    amount_delta: 120,
    balance_after: 180,
    related_entity_type: 'hero_progression_ledger',
    related_entity_id: 'progression-ledger-1',
    description: 'Internal description.',
    created_by: 'system',
    created_at: '2026-05-03T10:00:00.000Z',
  };
}
