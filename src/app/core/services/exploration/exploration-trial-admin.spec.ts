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
      expect(backend.rpc).not.toHaveBeenCalled();
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
      return [{ key: 'spirituality', label: 'Spirituality' }];
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
