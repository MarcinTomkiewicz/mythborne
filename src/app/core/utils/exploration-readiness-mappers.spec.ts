import { Row } from '../types/supabase.types';
import {
  GetEncounterDefinitionReadinessRpcRow,
  GetExplorationStepSelectionDiagnosticRpcRow,
  GetTrialDefinitionReadinessRpcRow,
} from '../types/exploration-runtime-rpc.types';
import {
  mapEncounterReadiness,
  mapExplorationReadinessReasonMetadata,
  mapExplorationStepSelectionDiagnostic,
  mapTrialReadiness,
} from './exploration-readiness-mappers';

describe('exploration readiness mappers', () => {
  it('maps Trial and Encounter readiness rows with DB-backed reasons', () => {
    const trial = mapTrialReadiness(readinessRow('trial', {
      definition_id: 'trial-1',
      definition_key: 'strength_trial',
      is_active: true,
      is_ready: true,
      minigame_key: 'combat',
      reasons_json: [],
    }) as GetTrialDefinitionReadinessRpcRow);
    const encounter = mapEncounterReadiness(readinessRow('encounter', {
      definition_id: 'encounter-1',
      definition_key: 'debuff_mist',
      encounter_kind: 'debuff',
      is_ready: false,
      reasons_json: [
        {
          reason_key: 'missing_effect_payload',
          label: 'Missing effect payload',
          description: 'Configure an active debuff effect payload.',
          severity: 'error',
          is_blocking: true,
          metadata_json: { source: 'db' },
        },
      ],
    }) as GetEncounterDefinitionReadinessRpcRow);

    expect(trial).toEqual(jasmine.objectContaining({
      definitionKind: 'trial',
      statusKey: 'ready',
      minigameKey: 'combat',
    }));
    expect(encounter).toEqual(jasmine.objectContaining({
      definitionKind: 'encounter',
      statusKey: 'incomplete',
      encounterKind: 'debuff',
      blockingReasonCount: 1,
    }));
    expect(encounter.reasons[0]).toEqual(jasmine.objectContaining({
      key: 'missing_effect_payload',
      label: 'Missing effect payload',
      isBlocking: true,
    }));
  });

  it('maps readiness reason metadata without dropping labels or descriptions', () => {
    const metadata = mapExplorationReadinessReasonMetadata({
      key: 'missing_reward_assignment',
      label: 'Missing reward assignment',
      description: 'A runtime Trial needs a reward.',
      severity: 'error',
      is_blocking: true,
      is_active: true,
      sort_order: 20,
      metadata_json: { domain: 'trial' },
      created_at: '2026-05-01T10:00:00.000Z',
      updated_at: '2026-05-01T11:00:00.000Z',
    } as Row<'exploration_readiness_reason_codes'>);

    expect(metadata).toEqual(jasmine.objectContaining({
      key: 'missing_reward_assignment',
      label: 'Missing reward assignment',
      description: 'A runtime Trial needs a reward.',
      isBlocking: true,
    }));
  });

  it('maps selection diagnostics for selected and skipped definitions', () => {
    const diagnostic = mapExplorationStepSelectionDiagnostic(selectionRow({
      outcome_kind: 'encounter',
      encounter_definition_id: 'encounter-1',
      encounter_definition_key: 'light_combat',
      encounter_definition_ready: true,
      encounter_kind: 'combat',
      encounter_selection_skipped_reason: 'incomplete_selected_definition',
      encounter_readiness_reasons_json: [
        {
          key: 'missing_reward_assignment',
          label: 'Missing reward assignment',
          is_blocking: true,
        },
      ],
      metadata_json: { selected_at: '2026-05-01T12:00:00.000Z' },
    }));

    expect(diagnostic.outcomeKind).toBe('encounter');
    expect(diagnostic.selectedDefinition).toEqual(jasmine.objectContaining({
      definitionKind: 'encounter',
      definitionId: 'encounter-1',
      definitionKey: 'light_combat',
      isReady: true,
      encounterKind: 'combat',
    }));
    expect(diagnostic.skippedDefinition).toEqual(jasmine.objectContaining({
      definitionKind: 'encounter',
      reasonKey: 'incomplete_selected_definition',
    }));
    expect(diagnostic.selectedAt).toBe('2026-05-01T12:00:00.000Z');
  });

  it('handles Nothing and missing optional debug payload safely', () => {
    const diagnostic = mapExplorationStepSelectionDiagnostic(selectionRow({
      outcome_kind: 'nothing',
      trial_definition_id: '',
      trial_definition_key: '',
      encounter_definition_id: '',
      encounter_definition_key: '',
      encounter_selection_skipped_reason: '',
      metadata_json: null,
    }));

    expect(diagnostic.outcomeKind).toBe('nothing');
    expect(diagnostic.finalOutcomeKind).toBe('nothing');
    expect(diagnostic.selectedDefinition).toBeNull();
    expect(diagnostic.skippedDefinition).toBeNull();
    expect(diagnostic.metadataJson).toBeNull();
  });

  it('does not emit selected definitions with partial identity', () => {
    const missingKey = mapExplorationStepSelectionDiagnostic(selectionRow({
      outcome_kind: 'trial',
      trial_definition_id: 'trial-1',
      trial_definition_key: '',
      trial_definition_ready: true,
    }));
    const missingId = mapExplorationStepSelectionDiagnostic(selectionRow({
      outcome_kind: 'encounter',
      encounter_definition_id: '',
      encounter_definition_key: 'light_combat',
      encounter_definition_ready: true,
    }));

    expect(missingKey.selectedDefinition).toBeNull();
    expect(missingKey.finalOutcomeKind).toBe('trial');
    expect(missingId.selectedDefinition).toBeNull();
    expect(missingId.finalOutcomeKind).toBe('encounter');
  });
});

function readinessRow(
  definitionKind: string,
  overrides: Partial<GetTrialDefinitionReadinessRpcRow>,
): GetTrialDefinitionReadinessRpcRow {
  return {
    blocking_reason_count: 1,
    combat_candidate_count: 0,
    definition_id: `${definitionKind}-1`,
    definition_key: `${definitionKind}_key`,
    definition_kind: definitionKind,
    effect_payload_count: 0,
    encounter_kind: '',
    is_active: true,
    is_ready: false,
    metadata_json: {},
    minigame_key: '',
    reasons_json: [],
    reward_assignment_count: 0,
    ...overrides,
  };
}

function selectionRow(
  overrides: Partial<GetExplorationStepSelectionDiagnosticRpcRow>,
): GetExplorationStepSelectionDiagnosticRpcRow {
  return {
    challenge_attempt_id: '',
    challenge_status: '',
    encounter_chance: 0,
    encounter_definition_id: '',
    encounter_definition_key: '',
    encounter_definition_ready: false,
    encounter_kind: '',
    encounter_readiness_reasons_json: [],
    encounter_roll: 0,
    encounter_selection_skipped_reason: '',
    exploration_id: 'exploration-1',
    forced_override_id: '',
    hero_id: 'hero-1',
    metadata_json: {},
    outcome_kind: 'nothing',
    readiness_guarded: true,
    reward_grant_id: '',
    server_id: 'server-1',
    step_id: 'step-1',
    step_kind: 'move',
    step_status: 'resolved',
    trial_definition_id: '',
    trial_definition_key: '',
    trial_definition_ready: false,
    trial_opportunity_chance: 0,
    trial_opportunity_roll: 0,
    trial_readiness_reasons_json: [],
    ...overrides,
  };
}
