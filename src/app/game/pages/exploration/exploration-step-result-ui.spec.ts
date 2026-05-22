import { HeroExplorationStepResolutionReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import {
  explorationStepResultDescription,
  explorationStepResultTitle,
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

    expect(explorationStepResultTitle(result)).toBe('Próba się nie ujawniła');
    expect(explorationStepResultDescription(result, null)).toContain(
      'próba nie ujawniła się',
    );
  });

  it('keeps ordinary no-event copy for normal nothing outcomes', () => {
    const result = stepResult({
      outcomeKind: 'nothing',
      rawOutcomeKind: 'nothing',
      metadataJson: { nothing: true },
    });

    expect(explorationStepResultTitle(result)).toBe('Bez zdarzenia');
    expect(explorationStepResultDescription(result, null)).toContain(
      'Szlak nie ujawnił żadnego zdarzenia',
    );
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
