import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { TABLES } from '../../constants/tables.const';
import { Backend } from '../backend/backend';
import { ExplorationEncounterAdmin } from './exploration-encounter-admin';

describe('ExplorationEncounterAdmin', () => {
  let backend: jasmine.SpyObj<Backend>;
  let service: ExplorationEncounterAdmin;

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
        ExplorationEncounterAdmin,
        { provide: Backend, useValue: backend },
      ],
    });
    service = TestBed.inject(ExplorationEncounterAdmin);
  });

  it('loads encounter admin dictionaries through read-only table queries', (done) => {
    service.getAdminData().subscribe((data) => {
      expect(data.encounters[0].label).toBe('Bandit ambush');
      expect(data.rewardAssignments[0].outcomeKind).toBe('success');
      expect(data.combatCandidates[0].candidateKind).toBe('opponent');
      expect(data.rewardProfiles[0].label).toBe('Encounter reward');
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.encounter_definitions,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.encounter_combat_candidates,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_profile_assignments,
      }));
      expect(backend.create).not.toHaveBeenCalled();
      expect(backend.update).not.toHaveBeenCalled();
      expect(backend.upsert).not.toHaveBeenCalled();
      expect(backend.delete).not.toHaveBeenCalled();
      expect(backend.rpc).not.toHaveBeenCalled();
      done();
    });
  });

  it('uses approved RPC paths for encounter mutations and reward assignments', (done) => {
    backend.rpc.and.returnValues(
      of(rowsFor(TABLES.encounter_definitions)[0]),
      of(rowsFor(TABLES.encounter_combat_candidates)[0]),
      of(rowsFor(TABLES.reward_profile_assignments)[0]),
    );

    service
      .upsertEncounterDefinition({
        encounterDefinitionId: 'encounter-1',
        key: 'bandit-ambush',
        label: 'Bandit ambush',
        description: 'Ambush.',
        helperText: null,
        adminDescription: null,
        encounterKind: 'combat',
        minigameKey: 'combat',
        rewardProfileId: null,
        minDifficultyKey: 'easy',
        maxDifficultyKey: null,
        minDistrictCode: null,
        maxDistrictCode: null,
        sortOrder: 10,
        isActive: true,
        metadataJson: {},
        reason: 'Tune encounter.',
      })
      .subscribe((encounter) => {
        expect(encounter.id).toBe('encounter-1');
        expect(backend.rpc).toHaveBeenCalledWith(
          RPC.upsert_encounter_definition,
          jasmine.objectContaining({
            p_encounter_definition_id: 'encounter-1',
            p_encounter_kind: 'combat',
            p_minigame_key: 'combat',
            p_reason: 'Tune encounter.',
          }),
        );

        service
          .upsertEncounterCombatCandidate({
            candidateId: 'candidate-1',
            encounterDefinitionId: 'encounter-1',
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
            reason: 'Tune candidate.',
          })
          .subscribe(() => {
            expect(backend.rpc).toHaveBeenCalledWith(
              RPC.upsert_encounter_combat_candidate,
              jasmine.objectContaining({
                p_encounter_definition_id: 'encounter-1',
                p_opponent_definition_id: 'opponent-1',
                p_reason: 'Tune candidate.',
              }),
            );

            service
              .upsertRewardProfileAssignment({
                assignmentId: 'assignment-1',
                encounterDefinitionId: 'encounter-1',
                rewardProfileId: 'reward-1',
                outcomeKind: 'success',
                difficultyKey: 'easy',
                districtCode: null,
                description: null,
                helperText: null,
                sortOrder: 10,
                isActive: true,
                metadataJson: {},
                reason: 'Tune reward.',
              })
              .subscribe(() => {
                expect(backend.rpc).toHaveBeenCalledWith(
                  RPC.upsert_reward_profile_assignment,
                  jasmine.objectContaining({
                    p_source_kind: 'encounter',
                    p_encounter_definition_id: 'encounter-1',
                    p_reward_profile_id: 'reward-1',
                    p_reason: 'Tune reward.',
                  }),
                );
                expect(backend.update).not.toHaveBeenCalled();
                expect(backend.upsert).not.toHaveBeenCalled();
                done();
              });
          });
      });
  });
});

function rowsFor(table: string): any[] {
  switch (table) {
    case TABLES.encounter_definitions:
      return [baseEncounter()];
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
    case TABLES.reward_profile_assignments:
      return [{
        id: 'assignment-1',
        source_kind: 'encounter',
        trial_definition_id: null,
        encounter_definition_id: 'encounter-1',
        reward_profile_id: 'reward-1',
        outcome_kind: 'success',
        difficulty_key: 'easy',
        district_code: null,
        description: null,
        helper_text: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.encounter_combat_candidates:
      return [baseCandidate()];
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
      return [];
    default:
      return [];
  }
}

function baseEncounter(): any {
  return {
    id: 'encounter-1',
    key: 'bandit-ambush',
    label: 'Bandit ambush',
    description: 'Ambush.',
    helper_text: null,
    admin_description: null,
    encounter_kind: 'combat',
    minigame_key: 'combat',
    reward_profile_id: null,
    min_difficulty_key: 'easy',
    max_difficulty_key: null,
    min_district_code: null,
    max_district_code: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}

function baseCandidate(): any {
  return {
    id: 'candidate-1',
    encounter_definition_id: 'encounter-1',
    candidate_kind: 'opponent',
    opponent_definition_id: 'opponent-1',
    family_key: null,
    scaling_formula_id: null,
    difficulty_multiplier: 1,
    weight: 1,
    min_hero_level: null,
    max_hero_level: null,
    sort_order: 10,
    is_active: true,
    created_at: '2026-05-01T10:00:00.000Z',
    updated_at: '2026-05-01T10:00:00.000Z',
  };
}
