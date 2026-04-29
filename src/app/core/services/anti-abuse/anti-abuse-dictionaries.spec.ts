import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { Backend } from '../backend/backend';
import { AntiAbuseDictionaries } from './anti-abuse-dictionaries';

describe('AntiAbuseDictionaries', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: AntiAbuseDictionaries;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    backend.getAll.and.callFake(((opts: { table: string }) => {
      switch (opts.table) {
        case TABLES.anti_abuse_sanction_types:
          return of([sanctionTypeRow()]);
        case TABLES.player_abuse_report_types:
          return of([reportTypeRow()]);
        case TABLES.player_relationship_declaration_types:
          return of([declarationTypeRow()]);
        case TABLES.anti_abuse_signal_types:
          return of([signalTypeRow()]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);

    TestBed.configureTestingModule({
      providers: [
        AntiAbuseDictionaries,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(AntiAbuseDictionaries);
  });

  it('loads all active anti-abuse dictionary collections', async () => {
    const data = await firstValueFrom(service.getActiveDictionaries());

    expect(data.sanctionTypes[0].label).toBe('Character point fine');
    expect(data.reportTypes[0].label).toBe('Scam');
    expect(data.declarationTypes[0].label).toBe('Shared household');
    expect(data.signalTypes[0].label).toBe('Trade funnel');
    expect(backend.getAll).toHaveBeenCalledTimes(4);
  });
});

function baseRow() {
  return {
    admin_description: null,
    category: 'test',
    created_at: '2026-04-29T00:00:00.000Z',
    created_by: null,
    description: 'Description.',
    helper_text: null,
    id: 'type-1',
    is_active: true,
    key: 'type_key',
    label: 'Type label',
    sort_order: 10,
    updated_at: '2026-04-29T00:00:00.000Z',
    updated_by: null,
  };
}

function sanctionTypeRow() {
  return {
    ...baseRow(),
    key: 'character_point_fine',
    label: 'Character point fine',
    requires_character_points_amount: true,
    requires_duration_days: false,
    requires_item_selection: false,
    requires_reason: true,
    requires_source_hero: false,
    requires_target_hero: true,
  };
}

function reportTypeRow() {
  return {
    ...baseRow(),
    key: 'scam',
    label: 'Scam',
    requires_accused_hero: true,
    requires_description: true,
    requires_item_selection: false,
    requires_trade_selection: true,
  };
}

function declarationTypeRow() {
  return {
    ...baseRow(),
    key: 'shared_household',
    label: 'Shared household',
    max_participants: 4,
    min_participants: 2,
    requires_amount: false,
    requires_expiration: false,
    requires_item_selection: false,
    requires_trade_selection: false,
  };
}

function signalTypeRow() {
  return {
    ...baseRow(),
    key: 'trade_funnel',
    label: 'Trade funnel',
    default_confidence: 0.8,
    default_score: 25,
    default_severity: 'warning',
  };
}
