import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PVP_REWARD_SECTION_METADATA_NAMESPACE,
} from '../../constants/pvp-ui-metadata.const';
import { TABLES } from '../../constants/tables.const';
import { UiMetadataEntryReadModel } from '../../domain/admin-ui-metadata.model';
import { EMPTY_FORMULA_ADMIN_DATA } from '../../types/formula-admin-view.types';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { PvpUiMetadata } from './pvp-ui-metadata';
import { PvpRewardRoutingAdmin } from './pvp-reward-routing-admin';

describe('PvpRewardRoutingAdmin', () => {
  let service: PvpRewardRoutingAdmin;
  let backend: jasmine.SpyObj<Backend>;
  let formulas: jasmine.SpyObj<FormulaService>;
  let metadata: jasmine.SpyObj<PvpUiMetadata>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['getAll']);
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', [
      'getAdminData',
    ]);
    metadata = jasmine.createSpyObj<PvpUiMetadata>('PvpUiMetadata', [
      'getNamespaceEntries',
    ]);

    backend.getAll.and.callFake((query) => of(rowsFor(query.table)) as never);
    formulas.getAdminData.and.returnValue(of(EMPTY_FORMULA_ADMIN_DATA));
    metadata.getNamespaceEntries.and.callFake((namespace) => of([
      metadataEntry(
        namespace as typeof PVP_REWARD_SECTION_METADATA_NAMESPACE
          | typeof PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
        `${namespace}-cp_from_xp`,
      ),
    ]));

    TestBed.configureTestingModule({
      providers: [
        PvpRewardRoutingAdmin,
        { provide: Backend, useValue: backend },
        { provide: FormulaService, useValue: formulas },
        { provide: PvpUiMetadata, useValue: metadata },
      ],
    });

    service = TestBed.inject(PvpRewardRoutingAdmin);
  });

  it('loads formula, reward routing and PvP metadata read models', async () => {
    const data = await firstValueFrom(service.getData());

    expect(data.formulas).toBe(EMPTY_FORMULA_ADMIN_DATA);
    expect(data.outcomeKinds.map((row) => row.key)).toEqual(['attacker_victory']);
    expect(data.profiles.map((row) => row.key)).toEqual(['pvp_xp_profile']);
    expect(data.entries.map((row) => row.entryKind)).toEqual(['experience']);
    expect(data.assignments.map((row) => row.sourceKind)).toEqual(['pvp']);
    expect(data.metadataEntries.map((row) => row.namespace)).toEqual([
      PVP_REWARD_SECTION_METADATA_NAMESPACE,
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
    ]);
    expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
      table: TABLES.reward_profile_assignments,
      camelCase: false,
    }));
    expect(formulas.getAdminData).toHaveBeenCalled();
    expect(metadata.getNamespaceEntries).toHaveBeenCalledWith(
      PVP_REWARD_SECTION_METADATA_NAMESPACE,
    );
    expect(metadata.getNamespaceEntries).toHaveBeenCalledWith(
      PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
    );
  });
});

function rowsFor(table: string): object[] {
  switch (table) {
    case TABLES.reward_outcome_kinds:
      return [outcomeKindRow()];
    case TABLES.reward_profiles:
      return [profileRow()];
    case TABLES.reward_profile_entries:
      return [entryRow()];
    case TABLES.reward_profile_assignments:
      return [assignmentRow()];
    case TABLES.reward_entry_kinds:
      return [dictionaryRow('experience', 'Experience')];
    case TABLES.reward_entry_amount_modes:
      return [dictionaryRow('formula', 'Formula')];
    case TABLES.resource_types:
      return [resourceTypeRow()];
    default:
      return [];
  }
}

function outcomeKindRow() {
  return {
    source_kind: 'pvp',
    key: 'attacker_victory',
    label: 'Attacker victory',
    description: 'Attacker victory reward.',
    helper_text: null,
    admin_description: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-07T00:00:00.000Z',
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}

function profileRow() {
  return {
    id: 'profile-1',
    key: 'pvp_xp_profile',
    label: 'PvP XP profile',
    category: 'pvp',
    description: 'PvP XP profile.',
    helper_text: null,
    admin_description: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-07T00:00:00.000Z',
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}

function entryRow() {
  return {
    id: 'entry-1',
    reward_profile_id: 'profile-1',
    entry_kind: 'experience',
    label: 'XP',
    description: 'XP entry.',
    helper_text: null,
    admin_description: null,
    amount_mode: 'formula',
    min_amount: null,
    max_amount: null,
    resource_type: null,
    formula_id: 'formula-1',
    chance_percent: null,
    min_item_count: null,
    max_item_count: null,
    max_quality_key: null,
    bucket_profile_id: null,
    effect_definition_id: null,
    transfer_source_role: null,
    transfer_recipient_role: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-07T00:00:00.000Z',
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}

function assignmentRow() {
  return {
    id: 'assignment-1',
    reward_profile_id: 'profile-1',
    source_kind: 'pvp',
    outcome_kind: 'attacker_victory',
    trial_definition_id: null,
    encounter_definition_id: null,
    difficulty_key: null,
    difficulty_match_kind: 'any',
    max_difficulty_key: null,
    district_code: null,
    district_match_kind: 'any',
    max_district_code: null,
    level_match_kind: 'any',
    level_value: null,
    max_level_value: null,
    level_interval: null,
    description: null,
    helper_text: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-07T00:00:00.000Z',
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}

function dictionaryRow(key: string, label: string) {
  return {
    key,
    label,
    description: `${label} description.`,
    helper_text: null,
    admin_description: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-07T00:00:00.000Z',
    updated_at: '2026-05-07T00:00:00.000Z',
  };
}

function resourceTypeRow() {
  return {
    ...dictionaryRow('drachma', 'Drachma'),
  };
}

function metadataEntry(
  namespace: typeof PVP_REWARD_SECTION_METADATA_NAMESPACE
    | typeof PVP_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  key: string,
): UiMetadataEntryReadModel {
  return {
    id: key,
    namespace,
    key,
    label: key,
    description: `${key} description.`,
    helperText: null,
    impactSummary: null,
    warningText: null,
    uiGroupKey: null,
    uiGroupLabel: null,
    sortOrder: 10,
    isActive: true,
    metadataJson: {},
    createdAt: '2026-05-07T00:00:00.000Z',
    updatedAt: '2026-05-07T00:00:00.000Z',
  };
}
