import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  LEVEL_UP_REWARD_SECTION_METADATA_KEYS,
  LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE,
  LEVEL_UP_STAT_BONUS_SECTION_METADATA_KEYS,
  LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE,
  PROGRESSION_CONFIGURATOR_SECTION_METADATA_KEYS,
  PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
  PROGRESSION_DIAGNOSTICS_SECTION_METADATA_KEYS,
  PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
} from '../../constants/progression-ui-metadata.const';
import { RPC } from '../../constants/rpc.const';
import { Row } from '../../types/supabase.types';
import { Backend } from '../backend/backend';
import { ProgressionExplainabilityMetadata } from './progression-explainability-metadata';

describe('ProgressionExplainabilityMetadata', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: ProgressionExplainabilityMetadata;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.callFake(((fn: string, args?: Record<string, unknown>) => {
      if (fn === RPC.get_ui_metadata_entries) {
        const namespace = String(args?.['p_namespace'] ?? '');
        return of([uiMetadataRow(namespace)]);
      }

      return of([]);
    }) as Backend['rpc']);

    TestBed.configureTestingModule({
      providers: [
        ProgressionExplainabilityMetadata,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(ProgressionExplainabilityMetadata);
  });

  it('loads progression explainability metadata through the canonical RPC', async () => {
    const entries = await firstValueFrom(service.getEntries());

    expect(entries.map((entry) => entry.namespace)).toEqual([
      PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
      LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE,
      LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE,
    ]);
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: PROGRESSION_CONFIGURATOR_SECTION_METADATA_NAMESPACE,
      p_keys: [...PROGRESSION_CONFIGURATOR_SECTION_METADATA_KEYS],
      p_include_inactive: false,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: PROGRESSION_DIAGNOSTICS_SECTION_METADATA_NAMESPACE,
      p_keys: [...PROGRESSION_DIAGNOSTICS_SECTION_METADATA_KEYS],
      p_include_inactive: false,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: LEVEL_UP_REWARD_SECTION_METADATA_NAMESPACE,
      p_keys: [...LEVEL_UP_REWARD_SECTION_METADATA_KEYS],
      p_include_inactive: false,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: LEVEL_UP_STAT_BONUS_SECTION_METADATA_NAMESPACE,
      p_keys: [...LEVEL_UP_STAT_BONUS_SECTION_METADATA_KEYS],
      p_include_inactive: false,
    });
  });
});

function uiMetadataRow(namespace: string): Row<'ui_metadata_entries'> {
  return {
    id: `${namespace}/page_header`,
    namespace,
    key: 'page_header',
    label: `${namespace} label`,
    description: `${namespace} description`,
    helper_text: null,
    impact_summary: null,
    warning_text: null,
    ui_group_key: null,
    ui_group_label: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-03T00:00:00Z',
    updated_at: '2026-05-03T00:00:00Z',
  };
}
