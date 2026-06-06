export type ExplorationResultSourceKind = 'trial' | 'encounter' | 'unknown';
export type ExplorationResultOutcomeTone = 'success' | 'danger' | 'warning' | 'neutral';

export interface ExplorationResultSourceInput {
  trialDefinitionId?: string | null;
  encounterDefinitionId?: string | null;
}

export interface ExplorationRewardTextViewModel {
  heading: string;
  intro: string;
}
