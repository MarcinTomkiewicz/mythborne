import { ConfigDefinitionExplainability } from '../../types/config-governance.types';

export interface ExplorationStepDurationConfigReadModel {
  serverId: string;
  difficultyKey: string;
  difficultyLabel: string;
  stepDurationMultiplier: number;
  effectiveDurationSeconds: number;
  inferredBaseDurationSeconds: number | null;
}

export type ExplorationStepDurationConfigExplainability = ConfigDefinitionExplainability;
