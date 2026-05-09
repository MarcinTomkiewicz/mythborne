import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { GetLuckLabPreviewContractsRpcRow } from '../../types/luck-rpc.types';
import { Backend } from '../backend/backend';
import { LuckRngSurfaces } from './luck-rng-surfaces';

describe('LuckRngSurfaces', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: LuckRngSurfaces;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);
    backend.rpc.and.returnValue(of([
      contractRow({
        contract_key: 'preview_trial_opportunity_curve',
        panel_key: 'exploration',
        metadata_json: {
          isLuckAware: true,
          isFormulaOwned: true,
        },
      }),
      contractRow({
        contract_key: 'preview_reward_profile_luck',
        panel_key: 'rewards',
        metadata_json: {
          isLuckExcluded: false,
          isConfigOwned: true,
          missingConfigKeys: ['reward_entry_amount'],
        },
      }),
      contractRow({
        contract_key: 'preview_combat_luck_formula_context',
        panel_key: 'combat',
        metadata_json: {},
      }),
    ]));

    TestBed.configureTestingModule({
      providers: [
        LuckRngSurfaces,
        { provide: Backend, useValue: backend },
      ],
    });

    service = TestBed.inject(LuckRngSurfaces);
  });

  it('loads Luck RNG surfaces from the DB-owned registry RPC', (done) => {
    service.getSurfaces().subscribe((surfaces) => {
      expect(backend.rpc).toHaveBeenCalledWith(RPC.get_luck_lab_preview_contracts);
      expect(surfaces.map((surface) => surface.contractKey)).toEqual([
        'preview_trial_opportunity_curve',
        'preview_reward_profile_luck',
        'preview_combat_luck_formula_context',
      ]);
      expect(surfaces[0].status.isLuckAware).toBeTrue();
      expect(surfaces[1].status.isLuckExcluded).toBeFalse();
      expect(surfaces[1].status.missingConfigKeys).toEqual(['reward_entry_amount']);
      expect(surfaces[2].status.isLuckExcluded).toBeNull();
      done();
    });
  });

  it('groups surfaces by DB-returned category keys without local category registry', (done) => {
    service.getSurfaceCategories().subscribe((categories) => {
      expect(categories.map((category) => category.categoryKey)).toEqual([
        'exploration',
        'rewards',
        'combat',
      ]);
      expect(categories[0].surfaces[0].contractKey).toBe(
        'preview_trial_opportunity_curve',
      );
      done();
    });
  });
});

function contractRow(
  overrides: Partial<GetLuckLabPreviewContractsRpcRow>,
): GetLuckLabPreviewContractsRpcRow {
  return {
    anon_execute: false,
    authenticated_execute: true,
    contract_key: 'contract',
    description: 'DB-owned Luck surface.',
    helper_text: 'Read from DB registry.',
    is_available: true,
    label: 'Luck surface',
    metadata_json: {},
    panel_key: 'exploration',
    result_type: 'rows',
    rpc_name: 'preview_surface',
    rpc_signature: 'preview_surface(...)',
    sort_order: 10,
    ...overrides,
  };
}
