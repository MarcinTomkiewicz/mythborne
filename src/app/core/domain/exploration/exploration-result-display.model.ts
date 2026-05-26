export type ExplorationResultSourceKind = 'trial' | 'encounter' | 'unknown';
export type ExplorationResultOutcomeTone = 'success' | 'danger' | 'warning' | 'neutral';

export interface ExplorationResultSourceInput {
  trialDefinitionId?: string | null;
  encounterDefinitionId?: string | null;
}

export interface ExplorationOutcomeViewModel {
  title: string;
  tone: ExplorationResultOutcomeTone;
  narrativeLines: readonly string[];
}

export interface ExplorationRewardTextViewModel {
  heading: string;
  intro: string;
}

export interface ExplorationReportActionsViewModel {
  directReportLink: string;
  directReportLabel: string;
  publicReportPath: string | null;
  hasPublicReportLink: boolean;
}
