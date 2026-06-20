import { Row } from '../types/supabase.types';
import {
  GetEncounterDefinitionReadinessRpcRow,
  GetTrialDefinitionReadinessRpcRow,
} from '../types/exploration-runtime-rpc.types';
import {
  mapEncounterReadiness,
  mapExplorationReadinessReasonMetadata,
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
