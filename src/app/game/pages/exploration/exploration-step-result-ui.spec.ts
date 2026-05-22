import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { HeroExplorationStepResolutionReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import {
  explorationStepResultTitle,
  explorationStepResultTypeLabel,
} from './exploration-step-result-ui';

describe('exploration step result UI', () => {
  it('renders trial manifestation failure separately from ordinary no-event outcomes', () => {
    const result = stepResult({
      outcomeKind: 'nothing',
      rawOutcomeKind: 'trial_opportunity',
      metadataJson: {
        trialManifested: false,
        noRewardReason: 'trial_manifestation_failed_no_reward_profile',
      },
    });

    expect(explorationStepResultTitle(result)).toBe('Próba nie przybrała kształtu');
  });

  it('keeps ordinary no-event title for normal nothing outcomes', () => {
    const result = stepResult({
      outcomeKind: 'nothing',
      rawOutcomeKind: 'nothing',
      metadataJson: { nothing: true },
    });

    expect(explorationStepResultTitle(result)).toBe('Bez zdarzenia');
  });

  it('uses encounter kind from the selected read model definition', () => {
    const result = stepResult({
      outcomeKind: 'encounter',
      selectedDefinition: {
        definitionId: 'encounter-1',
        definitionKind: 'encounter',
        definitionKey: 'resource-cache',
        encounterKind: ENCOUNTER_KIND.resource,
        isReady: true,
        readinessReasons: [],
      },
    });

    expect(explorationStepResultTitle(result)).toBe('Spotkanie rozstrzygnięte');
    expect(explorationStepResultTypeLabel(result)).toBe('Zasoby');
  });

  it('uses encounter kind exposed in result metadata when selection diagnostics are absent', () => {
    const result = stepResult({
      outcomeKind: 'encounter',
      encounterDefinitionId: 'encounter-1',
      selectedDefinition: null,
      metadataJson: { encounterKind: ENCOUNTER_KIND.resource },
    });

    expect(explorationStepResultTitle(result)).toBe('Spotkanie rozstrzygnięte');
    expect(explorationStepResultTypeLabel(result)).toBe('Zasoby');
  });
});

function stepResult(
  patch: Partial<HeroExplorationStepResolutionReadModel> = {},
): HeroExplorationStepResolutionReadModel {
  return {
    stepId: 'step-1',
    explorationId: 'exploration-1',
    status: 'resolved',
    outcomeKind: 'nothing',
    currentNodeId: 'node-1',
    toNodeId: 'node-2',
    trialDefinitionId: null,
    encounterDefinitionId: null,
    challengeAttemptId: null,
    rawOutcomeKind: 'nothing',
    remainingTrials: 1,
    trialDryStepCount: 1,
    selectedDefinition: null,
    selectionDiagnostic: null,
    metadataJson: {},
    ...patch,
  } as HeroExplorationStepResolutionReadModel;
}
