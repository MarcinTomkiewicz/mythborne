import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { Backend } from '../backend/backend';
import { ExplorationTrialAdmin } from './exploration-trial-admin';

describe('ExplorationTrialAdmin', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: ExplorationTrialAdmin;

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
    backend.rpc.and.callFake(<T>(name: string, args?: Record<string, unknown>) => {
      if (name === RPC.get_ui_metadata_entries) {
        return of(uiMetadataRows(String(args?.['p_namespace'] ?? '')) as T);
      }

      return of(null as T);
    });

    TestBed.configureTestingModule({
      providers: [
        ExplorationTrialAdmin,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(ExplorationTrialAdmin);
  });

  it('loads trial admin dictionaries through read-only table queries', (done) => {
    service.getAdminData().subscribe((data) => {
      expect(data.trials[0].label).toBe('Combat trial');
      expect(data.minigames[0].label).toBe('Combat');
      expect(data.combatCandidates[0].candidateKind).toBe('opponent');
      expect(data.opponents[0].label).toBe('Bandit');
      expect(data.families[0].label).toBe('Bandits');
      expect(data.formulas[0].label).toBe('Enemy scaling');
      expect(data.rewardProfiles[0].label).toBe('Trial reward');
      expect(data.rewardAssignments[0].sourceKind).toBe('trial');
      expect(data.uiMetadataEntries[0].namespace).toBe('trial_configurator_section');
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.trial_definitions,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.trial_combat_candidates,
      }));
      expect(backend.create).not.toHaveBeenCalled();
      expect(backend.update).not.toHaveBeenCalled();
      expect(backend.upsert).not.toHaveBeenCalled();
      expect(backend.delete).not.toHaveBeenCalled();
      expect(backend.rpc).toHaveBeenCalledWith(
        RPC.get_ui_metadata_entries,
        jasmine.objectContaining({ p_namespace: 'trial_configurator_section' }),
      );
      done();
    });
  });

  it('saves trial definitions through the approved RPC path', (done) => {
    backend.rpc.and.returnValue(of(rowsFor(TABLES.trial_definitions)[0]));

    service
      .upsertTrialDefinition({
        trialDefinitionId: 'trial-1',
        key: 'combat-trial',
        label: 'Combat trial',
        description: 'Fight.',
        helperText: null,
        adminDescription: null,
        testedStatKey: 'spirituality',
        minigameKey: 'combat',
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        reason: 'Balance update.',
      })
      .subscribe((trial) => {
        expect(trial.id).toBe('trial-1');
        expect(backend.rpc).toHaveBeenCalledOnceWith(
          RPC.upsert_trial_definition,
          jasmine.objectContaining({
            p_trial_definition_id: 'trial-1',
            p_key: 'combat-trial',
            p_tested_stat_key: 'spirituality',
            p_minigame_key: 'combat',
            p_reason: 'Balance update.',
          }),
        );
        expect(backend.update).not.toHaveBeenCalled();
        expect(backend.upsert).not.toHaveBeenCalled();
        done();
      });
  });

  it('saves and deactivates combat candidates through approved RPC paths', (done) => {
    backend.rpc.and.returnValues(
      of(rowsFor(TABLES.trial_combat_candidates)[0]),
      of({ ...rowsFor(TABLES.trial_combat_candidates)[0], is_active: false }),
    );

    service
      .upsertTrialCombatCandidate({
        candidateId: 'candidate-1',
        trialDefinitionId: 'trial-1',
        candidateKind: 'opponent',
        opponentDefinitionId: 'opponent-1',
        familyKey: null,
        scalingFormulaId: null,
        difficultyMultiplier: 1,
        weight: 1,
        minHeroLevel: null,
        maxHeroLevel: null,
        sortOrder: 10,
        isActive: true,
        reason: 'Candidate balance update.',
      })
      .subscribe((candidate) => {
        expect(candidate.id).toBe('candidate-1');
        expect(backend.rpc).toHaveBeenCalledWith(
          RPC.upsert_trial_combat_candidate,
          jasmine.objectContaining({
            p_candidate_id: 'candidate-1',
            p_trial_definition_id: 'trial-1',
            p_opponent_definition_id: 'opponent-1',
            p_reason: 'Candidate balance update.',
          }),
        );

        service
          .deactivateTrialCombatCandidate('candidate-1', 'Deactivate stale candidate.')
          .subscribe((deactivated) => {
            expect(deactivated.isActive).toBeFalse();
            expect(backend.rpc).toHaveBeenCalledWith(
              RPC.deactivate_trial_combat_candidate,
              {
                p_candidate_id: 'candidate-1',
                p_reason: 'Deactivate stale candidate.',
              },
            );
            expect(backend.delete).not.toHaveBeenCalled();
            done();
          });
      });
  });
});

function rowsFor(table: string): any[] {
  switch (table) {
    case TABLES.trial_definitions:
      return [{
        id: 'trial-1',
        key: 'combat-trial',
        label: 'Combat trial',
        description: 'Fight.',
        helper_text: null,
        admin_description: null,
        tested_stat_key: 'spirituality',
        minigame_key: 'combat',
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.exploration_minigame_definitions:
      return [{
        key: 'combat',
        label: 'Combat',
        description: 'Combat minigame.',
        helper_text: null,
        admin_description: null,
        implementation_key: 'combat',
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.stats:
      return [{
        id: 'stat-1',
        key: 'spirituality',
        label: 'Spirituality',
        description: 'Spiritual stat.',
        helper_text: null,
        admin_description: null,
        order: 10,
      }];
    case TABLES.exploration_difficulty_tiers:
      return [{
        key: 'easy',
        label: 'Easy',
        description: 'Easy.',
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        step_duration_multiplier: 1,
        trial_reward_multiplier: 1,
        encounter_reward_multiplier: 1,
        trial_opportunity_step_cap: 3,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.estate_districts:
      return [{ code: 'old-town', name: 'Old Town', description: 'Old district.', rank: 1 }];
    case TABLES.reward_profiles:
      return [{
        id: 'reward-1',
        key: 'trial-reward',
        label: 'Trial reward',
        category: 'trial',
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
        reward_profile_id: 'reward-1',
        entry_kind: 'experience',
        label: 'Experience reward',
        description: 'XP.',
        helper_text: null,
        admin_description: null,
        amount_mode: 'fixed',
        min_amount: 10,
        max_amount: 10,
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
    case TABLES.reward_outcome_kinds:
      return [{
        source_kind: 'trial',
        key: 'success',
        label: 'Success',
        description: 'Trial success.',
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.resource_types:
      return [];
    case TABLES.reward_assignment_match_kinds:
      return [{
        key: 'any',
        label: 'Any',
        description: 'Wildcard.',
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.reward_source_kinds:
      return [{
        key: 'trial',
        label: 'Trial',
        description: 'Trial routing.',
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.reward_entry_kinds:
      return [];
    case TABLES.reward_entry_amount_modes:
      return [];
    case TABLES.reward_profile_assignments:
      return [{
        id: 'assignment-1',
        reward_profile_id: 'reward-1',
        source_kind: 'trial',
        outcome_kind: 'success',
        trial_definition_id: 'trial-1',
        encounter_definition_id: null,
        difficulty_key: null,
        difficulty_match_kind: 'any',
        max_difficulty_key: null,
        district_code: null,
        district_match_kind: 'any',
        max_district_code: null,
        description: null,
        helper_text: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.trial_combat_candidates:
      return [{
        id: 'candidate-1',
        trial_definition_id: 'trial-1',
        candidate_kind: 'opponent',
        opponent_definition_id: 'opponent-1',
        family_key: null,
        scaling_formula_id: 'formula-1',
        difficulty_multiplier: 1,
        weight: 1,
        min_hero_level: null,
        max_hero_level: null,
        sort_order: 10,
        is_active: true,
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.combat_opponent_definitions:
      return [{
        id: 'opponent-1',
        key: 'bandit',
        label: 'Bandit',
        description: null,
        helper_text: null,
        admin_description: null,
        family_key: 'bandits',
        equipment_mode: 'generated',
        default_scaling_formula_id: null,
        sort_order: 10,
        is_active: true,
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.combat_opponent_families:
      return [{
        key: 'bandits',
        label: 'Bandits',
        description: null,
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.balance_formulas:
      return [{
        id: 'formula-1',
        key: 'enemy-scaling',
        scope_key: 'combat',
        label: 'Enemy scaling',
        expression: 'hero_level',
        description: null,
        is_enabled: true,
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    default:
      return [];
  }
}

function uiMetadataRows(namespace: string): any[] {
  return [{
    id: `${namespace}-page-header`,
    namespace,
    key: 'page_header',
    label: 'Trial configurator',
    description: 'Trial configurator metadata.',
    helper_text: null,
    impact_summary: null,
    warning_text: null,
    ui_group_key: 'trial-configurator',
    ui_group_label: 'Exploration trials',
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  }];
}
