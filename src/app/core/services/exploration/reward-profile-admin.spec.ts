import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { Backend } from '../backend/backend';
import { RewardProfileAdmin } from './reward-profile-admin';

describe('RewardProfileAdmin', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: RewardProfileAdmin;

  beforeEach(() => {
    backend = jasmine.createSpyObj<Backend>('Backend', [
      'getAll',
      'create',
      'update',
      'upsert',
      'delete',
      'rpc',
    ]);
    backend.getAll.and.callFake((opts: { table: string }) => of(rowsFor(opts.table)));

    TestBed.configureTestingModule({
      providers: [
        RewardProfileAdmin,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(RewardProfileAdmin);
  });

  it('loads reward dictionaries and entries with read-only table queries', (done) => {
    service.getAdminData().subscribe((data) => {
      expect(data.profiles[0].label).toBe('Encounter reward');
      expect(data.entries[0].entryKind).toBe('experience');
      expect(data.outcomeKinds[0].key).toBe('success');
      expect(data.entryKinds[0].key).toBe('experience');
      expect(data.amountModes[0].key).toBe('fixed');
      expect(data.sourceKinds[0].key).toBe('encounter');
      expect(data.resourceTypes[0].label).toBe('Drachma');
      expect(data.qualities[0].key).toBe('rare');
      expect(data.bucketProfiles[0].key).toBe('default-drops');
      expect(data.effectDefinitions[0].key).toBe('olive-blessing');
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_outcome_kinds,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_profile_entries,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.resource_types,
      }));
      expect(backend.create).not.toHaveBeenCalled();
      expect(backend.update).not.toHaveBeenCalled();
      expect(backend.upsert).not.toHaveBeenCalled();
      expect(backend.delete).not.toHaveBeenCalled();
      expect(backend.rpc).not.toHaveBeenCalled();
      done();
    });
  });

  it('uses approved reward RPCs for durable mutations', (done) => {
    backend.rpc.and.returnValues(
      of(rowsFor(TABLES.reward_profiles)[0]),
      of(rowsFor(TABLES.reward_profile_entries)[0]),
      of(rowsFor(TABLES.reward_outcome_kinds)[0]),
    );

    service.upsertProfile({
      rewardProfileId: 'profile-1',
      key: 'encounter-reward',
      label: 'Encounter reward',
      category: 'encounter',
      description: 'Reward.',
      helperText: null,
      adminDescription: null,
      sortOrder: 10,
      isActive: true,
      metadataJson: {},
      reason: 'Tune profile.',
    }).subscribe(() => {
      expect(backend.rpc).toHaveBeenCalledWith(
        RPC.upsert_reward_profile,
        jasmine.objectContaining({
          p_reward_profile_id: 'profile-1',
          p_key: 'encounter-reward',
          p_reason: 'Tune profile.',
        }),
      );

      service.upsertEntry({
        entryId: 'entry-1',
        rewardProfileId: 'profile-1',
        entryKind: 'resource',
        label: 'Drachma',
        description: 'Resource reward.',
        helperText: null,
        adminDescription: null,
        amountMode: 'range',
        minAmount: 5,
        maxAmount: 10,
          resourceType: 'drachma',
          formulaId: null,
          chancePercent: 100,
        minItemCount: null,
        maxItemCount: null,
        maxQualityKey: null,
        bucketProfileId: null,
        effectDefinitionId: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        reason: 'Tune entry.',
      }).subscribe(() => {
        expect(backend.rpc).toHaveBeenCalledWith(
          RPC.upsert_reward_profile_entry,
          jasmine.objectContaining({
            p_reward_profile_id: 'profile-1',
            p_entry_kind: 'resource',
            p_resource_type: 'drachma',
            p_reason: 'Tune entry.',
          }),
        );

        service.upsertOutcomeKind({
          sourceKind: 'encounter',
          key: 'success',
          label: 'Success',
          description: 'Encounter success.',
          helperText: null,
          adminDescription: null,
          sortOrder: 10,
          isActive: true,
          metadataJson: {},
          reason: 'Tune outcome.',
        }).subscribe(() => {
          expect(backend.rpc).toHaveBeenCalledWith(
            RPC.upsert_reward_outcome_kind,
            jasmine.objectContaining({
              p_source_kind: 'encounter',
              p_key: 'success',
              p_reason: 'Tune outcome.',
            }),
          );
          expect(backend.create).not.toHaveBeenCalled();
          expect(backend.update).not.toHaveBeenCalled();
          expect(backend.upsert).not.toHaveBeenCalled();
          expect(backend.delete).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });
});

function rowsFor(table: string): any[] {
  switch (table) {
    case TABLES.reward_outcome_kinds:
      return [{
        source_kind: 'encounter',
        key: 'success',
        label: 'Success',
        description: 'Encounter success.',
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.reward_profiles:
      return [{
        id: 'profile-1',
        key: 'encounter-reward',
        label: 'Encounter reward',
        category: 'encounter',
        description: 'Reward.',
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.reward_profile_entries:
      return [{
        id: 'entry-1',
        reward_profile_id: 'profile-1',
        entry_kind: 'experience',
        label: 'Experience',
        description: 'Experience reward.',
        helper_text: null,
        admin_description: null,
        amount_mode: 'fixed',
        min_amount: 5,
        max_amount: 5,
        resource_type: null,
        formula_id: null,
        chance_percent: 100,
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
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.reward_entry_kinds:
      return [rewardDictionaryRow('experience', 'Experience')];
    case TABLES.reward_entry_amount_modes:
      return [rewardDictionaryRow('fixed', 'Fixed')];
    case TABLES.reward_source_kinds:
      return [rewardDictionaryRow('encounter', 'Encounter')];
    case TABLES.resource_types:
      return [{
        key: 'drachma',
        label: 'Drachma',
        description: 'Core currency.',
        helper_text: 'Used for most rewards.',
        admin_description: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.item_generation_qualities:
      return [{
        id: 'quality-1',
        key: 'rare',
        label: 'Rare',
        multiplier: 1.5,
        weight: 1,
        sort_order: 10,
        is_enabled: true,
      }];
    case TABLES.item_generation_bucket_profiles:
      return [{
        id: 'bucket-1',
        key: 'default-drops',
        name: 'Default drops',
        description: null,
        bucket_count: 3,
        base_value: 10,
        linear_growth: 1,
        growth_factor: 1,
        rounding_step: 1,
        min_increment: 1,
        is_active: true,
      }];
    case TABLES.exploration_effect_definitions:
      return [{
        id: 'effect-1',
        key: 'olive-blessing',
        label: 'Olive blessing',
        description: 'Buff.',
        helper_text: null,
        admin_description: null,
        effect_kind: 'buff',
        bonus_template_id: null,
        default_value: 1,
        default_duration_steps: 1,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.balance_formulas:
      return [];
    default:
      return [];
  }
}

function rewardDictionaryRow(key: string, label: string): any {
  return {
    key,
    label,
    description: `${label}.`,
    helper_text: null,
    admin_description: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}
