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
    backend.rpc.and.callFake(<T>(name: string, args?: Record<string, unknown>) => {
      if (name === RPC.get_ui_metadata_entries) {
        return of(uiMetadataRows(String(args?.['p_namespace'] ?? '')) as T);
      }

      return of(null as T);
    });

    service.getAdminData().subscribe((data) => {
      expect(data.encounters[0].label).toBe('Bandit ambush');
      expect(data.rewardAssignments[0].outcomeKind).toBe('success');
      expect(data.rewardOutcomeKinds[0].label).toBe('Success');
      expect(data.rewardProfileEntries[0].entryKind).toBe('experience');
      expect(data.rewardEntryKinds[0].label).toBe('Experience');
      expect(data.rewardEntryAmountModes[0].label).toBe('Fixed');
      expect(data.rewardSourceKinds[0].key).toBe('encounter');
      expect(data.resourceTypes[0].label).toBe('Drachma');
      expect(data.rewardAssignmentMatchKinds[0].key).toBe('exact');
      expect(data.combatCandidates[0].candidateKind).toBe('opponent');
      expect(data.resourcePayloads[0].resourceType).toBe('drachma');
      expect(data.effectDefinitions[0].effectKind).toBe('buff');
      expect(data.effectPayloads[0].effectDefinitionId).toBe('effect-1');
      expect(data.rewardProfiles[0].label).toBe('Encounter reward');
      expect(data.uiMetadataEntries[0].namespace).toBe('encounter_configurator_section');
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.encounter_definitions,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.encounter_combat_candidates,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_outcome_kinds,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_profile_assignments,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_profile_entries,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_entry_kinds,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_entry_amount_modes,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.reward_source_kinds,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.resource_types,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.encounter_resource_payloads,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.encounter_effect_payloads,
      }));
      expect(backend.getAll).toHaveBeenCalledWith(jasmine.objectContaining({
        table: TABLES.exploration_effect_definitions,
      }));
      expect(backend.create).not.toHaveBeenCalled();
      expect(backend.update).not.toHaveBeenCalled();
      expect(backend.upsert).not.toHaveBeenCalled();
      expect(backend.delete).not.toHaveBeenCalled();
      expect(backend.rpc).toHaveBeenCalledWith(
        RPC.get_ui_metadata_entries,
        jasmine.objectContaining({
          p_namespace: 'encounter_configurator_section',
        }),
      );
      expect(backend.rpc).toHaveBeenCalledWith(
        RPC.get_ui_metadata_entries,
        jasmine.objectContaining({
          p_namespace: 'encounter_configurator_field',
        }),
      );
      done();
    });
  });

  it('uses approved RPC paths for encounter mutations and reward assignments', (done) => {
    backend.rpc.and.returnValues(
      of(rowsFor(TABLES.encounter_definitions)[0]),
      of(rowsFor(TABLES.encounter_combat_candidates)[0]),
      of(rowsFor(TABLES.encounter_resource_payloads)[0]),
      of(rowsFor(TABLES.exploration_effect_definitions)[0]),
      of(rowsFor(TABLES.encounter_effect_payloads)[0]),
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
              .upsertEncounterResourcePayload({
                payloadId: 'resource-payload-1',
                encounterDefinitionId: 'encounter-1',
                resourceType: 'drachma',
                amountMode: 'fixed',
                minAmount: 5,
                maxAmount: 5,
                formulaId: null,
                chancePercent: 100,
                description: null,
                helperText: null,
                adminDescription: null,
                sortOrder: 10,
                isActive: true,
                metadataJson: {},
                reason: 'Tune resource.',
              })
              .subscribe(() => {
                expect(backend.rpc).toHaveBeenCalledWith(
                  RPC.upsert_encounter_resource_payload,
                  jasmine.objectContaining({
                    p_encounter_definition_id: 'encounter-1',
                    p_resource_type: 'drachma',
                    p_amount_mode: 'fixed',
                    p_reason: 'Tune resource.',
                  }),
                );

                service
                  .upsertExplorationEffectDefinition({
                    effectDefinitionId: 'effect-1',
                    key: 'olive-blessing',
                    label: 'Olive blessing',
                    description: 'A temporary buff.',
                    helperText: null,
                    adminDescription: null,
                    effectKind: 'buff',
                    bonusTemplateId: 'bonus-1',
                    defaultValue: 2,
                    defaultDurationSteps: 1,
                    sortOrder: 10,
                    isActive: true,
                    metadataJson: {},
                    reason: 'Tune effect.',
                  })
                  .subscribe(() => {
                    expect(backend.rpc).toHaveBeenCalledWith(
                      RPC.upsert_exploration_effect_definition,
                      jasmine.objectContaining({
                        p_effect_definition_id: 'effect-1',
                        p_effect_kind: 'buff',
                        p_bonus_template_id: 'bonus-1',
                        p_reason: 'Tune effect.',
                      }),
                    );

                    service
                      .upsertEncounterEffectPayload({
                        payloadId: 'effect-payload-1',
                        encounterDefinitionId: 'encounter-1',
                        effectDefinitionId: 'effect-1',
                        chancePercent: 75,
                        description: null,
                        helperText: null,
                        adminDescription: null,
                        sortOrder: 10,
                        isActive: true,
                        metadataJson: {},
                        reason: 'Tune payload.',
                      })
                      .subscribe(() => {
                        expect(backend.rpc).toHaveBeenCalledWith(
                          RPC.upsert_encounter_effect_payload,
                          jasmine.objectContaining({
                            p_encounter_definition_id: 'encounter-1',
                            p_effect_definition_id: 'effect-1',
                            p_chance_percent: 75,
                            p_reason: 'Tune payload.',
                          }),
                        );

                        service
                          .upsertRewardProfileAssignment({
                assignmentId: 'assignment-1',
                encounterDefinitionId: 'encounter-1',
                rewardProfileId: 'reward-1',
                outcomeKind: 'success',
                difficultyKey: 'easy',
                difficultyMatchKind: 'exact',
                maxDifficultyKey: null,
                districtCode: null,
                districtMatchKind: 'any',
                maxDistrictCode: null,
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
                    p_difficulty_match_kind: 'exact',
                    p_district_match_kind: 'any',
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
    case TABLES.reward_profile_assignments:
      return [{
        id: 'assignment-1',
        source_kind: 'encounter',
        trial_definition_id: null,
        encounter_definition_id: 'encounter-1',
        reward_profile_id: 'reward-1',
        outcome_kind: 'success',
        difficulty_key: 'easy',
        difficulty_match_kind: 'exact',
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
    case TABLES.reward_assignment_match_kinds:
      return [
        rewardDictionaryRow('exact', 'Exact'),
        rewardDictionaryRow('any', 'Any'),
      ];
    case TABLES.reward_entry_kinds:
      return [
        rewardDictionaryRow('experience', 'Experience'),
        rewardDictionaryRow('resource', 'Resource'),
      ];
    case TABLES.reward_entry_amount_modes:
      return [
        rewardDictionaryRow('fixed', 'Fixed'),
        rewardDictionaryRow('range', 'Range'),
        rewardDictionaryRow('formula', 'Formula'),
        rewardDictionaryRow('none', 'None'),
      ];
    case TABLES.reward_source_kinds:
      return [
        rewardDictionaryRow('encounter', 'Encounter'),
        rewardDictionaryRow('trial', 'Trial'),
      ];
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
    case TABLES.encounter_resource_payloads:
      return [{
        id: 'resource-payload-1',
        encounter_definition_id: 'encounter-1',
        resource_type: 'drachma',
        amount_mode: 'fixed',
        min_amount: 5,
        max_amount: 5,
        formula_id: null,
        chance_percent: 100,
        description: null,
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.exploration_effect_definitions:
      return [{
        id: 'effect-1',
        key: 'olive-blessing',
        label: 'Olive blessing',
        description: 'A temporary buff.',
        helper_text: null,
        admin_description: null,
        effect_kind: 'buff',
        bonus_template_id: 'bonus-1',
        default_value: 2,
        default_duration_steps: 1,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.encounter_effect_payloads:
      return [{
        id: 'effect-payload-1',
        encounter_definition_id: 'encounter-1',
        effect_definition_id: 'effect-1',
        chance_percent: 75,
        description: null,
        helper_text: null,
        admin_description: null,
        sort_order: 10,
        is_active: true,
        metadata_json: {},
        created_at: '2026-05-01T10:00:00.000Z',
        updated_at: '2026-05-01T10:00:00.000Z',
      }];
    case TABLES.bonus_templates:
      return [{
        id: 'bonus-1',
        key: 'olive-blessing-template',
        label: 'Olive blessing template',
        description: null,
        type: 'flat_stat_bonus',
        type_key: 'flat_stat_bonus',
        target: null,
        target_key: 'strength',
        scope_key: 'exploration',
        level_interval: null,
        formula_id: null,
        formula_target_id: null,
        scaling_stat_key: null,
        params_json: {},
        sort_order: 10,
        is_active: true,
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

function uiMetadataRows(namespace: string): any[] {
  return [
    {
      id: `${namespace}-page-header`,
      namespace,
      key: namespace === 'encounter_configurator_section'
        ? 'page_header'
        : 'encounter_key',
      label: namespace === 'encounter_configurator_section'
        ? 'Encounter definitions configurator'
        : 'Generated key',
      description: 'DB-backed UI metadata.',
      helper_text: null,
      impact_summary: null,
      warning_text: null,
      ui_group_key: 'encounter-configurator',
      ui_group_label: 'Exploration encounters',
      sort_order: 10,
      is_active: true,
      metadata_json: {},
      created_at: '2026-05-01T10:00:00.000Z',
      updated_at: '2026-05-01T10:00:00.000Z',
    },
  ];
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
