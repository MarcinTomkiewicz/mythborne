import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TABLES } from '../../constants/tables.const';
import { RPC } from '../../constants/rpc.const';
import { Row } from '../../types/supabase.types';
import { FormulaService } from '../formula/formula';
import { ItemGenerationAdminService } from '../items/item-generation-admin';
import { Backend } from '../backend/backend';
import { CombatOpponentAdmin } from './combat-opponent-admin';

describe('CombatOpponentAdmin', () => {
  let backend: jasmine.SpyObj<Backend>;
  let formulas: jasmine.SpyObj<FormulaService>;
  let itemGeneration: jasmine.SpyObj<ItemGenerationAdminService>;
  let service: CombatOpponentAdmin;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll', 'rpc']);
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', ['getAdminData']);
    itemGeneration = jasmine.createSpyObj<ItemGenerationAdminService>(
      'ItemGenerationAdminService',
      ['getCatalogData', 'getBalanceData'],
    );
    backend.getAll.and.callFake(((opts: { table: string }) => {
      switch (opts.table) {
        case TABLES.combat_opponent_families:
          return of([familyRow()]);
        case TABLES.combat_opponent_definitions:
          return of([opponentRow()]);
        case TABLES.combat_opponent_stat_values:
          return of([statValueRow()]);
        case TABLES.combat_opponent_attack_sources:
          return of([attackSourceRow()]);
        case TABLES.combat_opponent_equipment_entries:
          return of([equipmentEntryRow()]);
        case TABLES.combat_opponent_equipment_mode_definitions:
          return of([equipmentModeRow()]);
        case TABLES.equipment_slot_definitions:
          return of([slotRow()]);
        case TABLES.stats:
          return of([statRow()]);
        case TABLES.combat_source_type_definitions:
        case TABLES.combat_side_definitions:
        case TABLES.combat_outcome_definitions:
        case TABLES.combat_participant_kind_definitions:
        case TABLES.combat_attack_source_kind_definitions:
        case TABLES.combat_candidate_kind_definitions:
          return of([dictionaryRow(opts.table)]);
        default:
          return of([]);
      }
    }) as Backend['getAll']);
    backend.rpc.and.callFake(((fn: string) => {
      if (fn === RPC.get_ui_metadata_entries) {
        return of([uiMetadataRow()]);
      }

      return of(null);
    }) as Backend['rpc']);
    formulas.getAdminData.and.returnValue(of({
      targets: [],
      formulas: [],
      assignments: [],
      entityAssignments: [],
      blocks: [],
    }));
    itemGeneration.getCatalogData.and.returnValue(of({
      baseTypes: [],
      baseTypeTargets: [],
      bases: [],
      prefixes: [],
      suffixes: [],
      bonusTemplates: [],
      bonusTargets: [],
      bonusCategories: [],
    }));
    itemGeneration.getBalanceData.and.returnValue(of({
      qualities: [],
      bucketProfiles: [],
    }));

    TestBed.configureTestingModule({
      providers: [
        CombatOpponentAdmin,
        { provide: Backend, useValue: backend },
        { provide: FormulaService, useValue: formulas },
        { provide: ItemGenerationAdminService, useValue: itemGeneration },
      ],
    });
    service = TestBed.inject(CombatOpponentAdmin);
  });

  it('loads DB-backed opponent definitions, explainability dictionaries and display views', async () => {
    const data = await firstValueFrom(service.getAdminData());

    expect(data.opponents[0].label).toBe('Bandit');
    expect(data.families[0].label).toBe('Bandits');
    expect(data.statValues[0].baseValue).toBe(12);
    expect(data.attackSources[0].label).toBe('Knife');
    expect(data.equipmentEntries[0].slotKey).toBe('main_hand');
    expect(data.equipmentModes[0].label).toBe('Manual');
    expect(data.equipmentSlots[0].label).toBe('Main hand');
    expect(data.dictionaries.attackSourceKinds[0].label).toContain(
      TABLES.combat_attack_source_kind_definitions,
    );
    expect(data.opponentViews[0]).toEqual(
      jasmine.objectContaining({
        familyLabel: 'Bandits (bandits)',
        equipmentModeLabel: 'Manual (manual)',
      }),
    );
    expect(data.opponentViews[0].statBaselines[0].statLabel).toBe('Strength (strength)');
    expect(data.opponentViews[0].naturalAttacks[0].damageLabel).toBe('3-6');
    expect(data.opponentViews[0].equipmentEntries[0].slotLabel).toBe('Main hand (main_hand)');
    expect(data.uiMetadataEntries?.[0].key).toBe('page_header');
    expect(data.emptyState).toBeNull();
  });

  it('queries combat tables with DB ordering and no hardcoded family or slot list', async () => {
    await firstValueFrom(service.getAdminData());

    const calls = backend.getAll.calls.allArgs().map(([options]) => options);

    expect(calls).toContain(
      jasmine.objectContaining({
        table: TABLES.combat_opponent_families,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
    );
    expect(calls).toContain(
      jasmine.objectContaining({
        table: TABLES.equipment_slot_definitions,
        orderBy: [
          { column: 'sort_order', ascending: true },
          { column: 'key', ascending: true },
        ],
        camelCase: false,
      }),
    );
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: 'combat_opponent_configurator_section',
    });
  });

  it('routes combat opponent mutations through canonical RPCs', async () => {
    backend.rpc.and.returnValue(of(familyRow()));

    await firstValueFrom(service.saveFamily({
      key: 'beasts',
      label: 'Beasts',
      description: null,
      helperText: null,
      adminDescription: null,
      sortOrder: 20,
      isActive: true,
      reason: 'Balance pass.',
    }));

    expect(backend.rpc).toHaveBeenCalledWith(RPC.upsert_combat_opponent_family, {
      p_key: 'beasts',
      p_label: 'Beasts',
      p_sort_order: 20,
      p_is_active: true,
      p_reason: 'Balance pass.',
    });
  });

  it('treats empty opponent catalog as a valid configuration state', async () => {
    backend.getAll.and.returnValue(of([]));

    const data = await firstValueFrom(service.getAdminData());

    expect(data.families).toEqual([]);
    expect(data.opponents).toEqual([]);
    expect(data.opponentViews).toEqual([]);
    expect(data.emptyState).toEqual({
      kind: 'empty_opponent_catalog',
      message: 'No combat opponent families or definitions are configured yet.',
    });
  });
});

function familyRow(): Row<'combat_opponent_families'> {
  return {
    key: 'bandits',
    label: 'Bandits',
    description: 'Family description.',
    helper_text: null,
    admin_description: null,
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function opponentRow(): Row<'combat_opponent_definitions'> {
  return {
    id: 'opponent-1',
    key: 'bandit',
    label: 'Bandit',
    description: 'Opponent description.',
    helper_text: null,
    admin_description: null,
    family_key: 'bandits',
    equipment_mode: 'manual',
    default_scaling_formula_id: null,
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function statValueRow(): Row<'combat_opponent_stat_values'> {
  return {
    id: 'stat-value-1',
    opponent_definition_id: 'opponent-1',
    stat_key: 'strength',
    base_value: 12,
    sort_order: 10,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function attackSourceRow(): Row<'combat_opponent_attack_sources'> {
  return {
    id: 'attack-1',
    opponent_definition_id: 'opponent-1',
    key: 'knife',
    label: 'Knife',
    description: null,
    helper_text: null,
    admin_description: null,
    min_damage: 3,
    max_damage: 6,
    critical_chance: 5,
    critical_damage: 150,
    attack_count: 1,
    min_opponent_level: null,
    max_opponent_level: null,
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function equipmentEntryRow(): Row<'combat_opponent_equipment_entries'> {
  return {
    id: 'equipment-1',
    opponent_definition_id: 'opponent-1',
    slot_key: 'main_hand',
    entry_mode: 'manual',
    manual_base_id: 'base-1',
    manual_quality_key: 'common',
    manual_prefix_affix_id: null,
    manual_suffix_affix_id: null,
    generated_bucket_profile_id: null,
    generated_max_quality_key: null,
    min_opponent_level: null,
    max_opponent_level: null,
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function equipmentModeRow(): Row<'combat_opponent_equipment_mode_definitions'> {
  return {
    key: 'manual',
    label: 'Manual',
    description: 'Manual equipment.',
    helper_text: null,
    admin_description: null,
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function slotRow(): Row<'equipment_slot_definitions'> {
  return {
    key: 'main_hand',
    label: 'Main hand',
    description: 'Main weapon slot.',
    helper_text: null,
    admin_description: null,
    equipment_area: 'weapon',
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function statRow(): Row<'stats'> {
  return {
    id: 'stat-1',
    key: 'strength',
    label: 'Strength',
    description: 'Strength stat.',
    helper_text: null,
    admin_description: null,
    order: 10,
  };
}

function dictionaryRow(table: string): Row<'combat_attack_source_kind_definitions'> {
  return {
    key: 'dictionary-key',
    label: `${table} label`,
    description: `${table} description`,
    helper_text: `${table} helper`,
    admin_description: `${table} admin`,
    metadata_json: {},
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function uiMetadataRow(): Row<'ui_metadata_entries'> {
  return {
    id: 'metadata-1',
    namespace: 'combat_opponent_configurator_section',
    key: 'page_header',
    label: 'Combat opponents',
    description: 'Configure opponents.',
    helper_text: null,
    impact_summary: null,
    warning_text: null,
    ui_group_key: null,
    ui_group_label: null,
    metadata_json: {},
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}
