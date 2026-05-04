import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Backend } from '../backend/backend';
import { BuildingExplainabilityMetadata } from './building-explainability-metadata';

describe('BuildingExplainabilityMetadata', () => {
  let service: BuildingExplainabilityMetadata;
  let backend: jasmine.SpyObj<Backend>;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        BuildingExplainabilityMetadata,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(BuildingExplainabilityMetadata);
  });

  it('loads building admin metadata through get_ui_metadata_entries', () => {
    service.getAdminEntries().subscribe();

    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: 'building_configurator_section',
      p_keys: jasmine.arrayContaining([
        'page_header',
        'building_identity',
        'resource_costs',
        'central_requirements',
      ]),
      p_include_inactive: false,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: 'building_configurator_field',
      p_keys: jasmine.arrayContaining([
        'district_code',
        'starting_level',
        'base_build_time_seconds',
        'max_level',
      ]),
      p_include_inactive: false,
    });
  });

  it('loads estate runtime metadata through get_ui_metadata_entries', () => {
    service.getRuntimeEntries().subscribe();

    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: 'estate_runtime_section',
      p_keys: jasmine.arrayContaining([
        'address_model',
        'relocation_reset',
        'resource_ledger',
      ]),
      p_include_inactive: false,
    });
    expect(backend.rpc).toHaveBeenCalledWith(RPC.get_ui_metadata_entries, {
      p_namespace: 'estate_building_runtime_section',
      p_keys: jasmine.arrayContaining([
        'baseline_initialization',
        'active_job_model',
        'preview_vs_authoritative_rpc',
      ]),
      p_include_inactive: false,
    });
  });
});
