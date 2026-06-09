export type ExplorationRuntimeContext = {
  serverId: string;
  heroId: string;
  difficultyKey: string;
};

export type ExplorationSandboxScope = ExplorationRuntimeContext;

export type ExplorationPreferredChallengeReward = {
  explorationId: string;
  challengeAttemptId: string;
};

export type ExplorationRewardSource =
  | { kind: 'challenge_attempt'; explorationId: string; challengeAttemptId: string }
  | { kind: 'step'; explorationId: string; stepId: string };

export type ExplorationDiagnosticRow = {
  label: string;
  value: string;
};
