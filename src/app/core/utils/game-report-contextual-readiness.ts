import { GameReportContextualReadiness } from '../domain/reports/game-report.model';
import { GameReportSourceEntityType } from '../types/game-report-rpc.types';

const TRIAL_REPORT_READINESS: GameReportContextualReadiness = {
  reportTypeKey: 'trial',
  title: 'Trial report producer pending',
  producerStatus: 'Waiting for completed trial result producer.',
  expectedSections: [
    'Trial outcome',
    'Reward summary',
    'Optional combat section',
    'Reward drop item references',
  ],
};

const ENCOUNTER_REPORT_READINESS: GameReportContextualReadiness = {
  reportTypeKey: 'encounter',
  title: 'Encounter report producer pending',
  producerStatus: 'Waiting for completed encounter result producer.',
  expectedSections: [
    'Encounter outcome',
    'Reward, resource or effect summary',
    'Optional combat section',
    'Reward drop item references',
  ],
};

export function resolveGameReportContextualReadiness(input: {
  reportTypeKey: string;
  sourceEntityType: GameReportSourceEntityType;
}): GameReportContextualReadiness | null {
  if (input.reportTypeKey === 'trial' || input.sourceEntityType === 'trial_result') {
    return TRIAL_REPORT_READINESS;
  }

  if (input.reportTypeKey === 'encounter' || input.sourceEntityType === 'encounter_result') {
    return ENCOUNTER_REPORT_READINESS;
  }

  return null;
}
