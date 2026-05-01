import { HeroExplorationStateReadModel } from '../../../core/domain/exploration/exploration-runtime.model';

export function explorationCurrentNodeLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const node = state?.currentNode;
  return node?.label ?? node?.id ?? 'No current node';
}

export function explorationActiveStepLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const step = state?.activeStep;

  if (!step) {
    return 'No active movement step.';
  }

  return `${step.stepKind} - ${step.status} - resolves at ${step.resolvesAt}`;
}

export function explorationActiveChallengeLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const challenge = state?.activeChallenge;

  if (!challenge) {
    return 'No active challenge.';
  }

  return `${challenge.challengeKind} - ${challenge.status}`;
}

export function explorationActiveEffectLabel(
  state: HeroExplorationStateReadModel | null,
): string {
  const effect = state?.activeEffect;

  if (!effect) {
    return 'No active exploration effect.';
  }

  return `${effect.effectKind} - ${effect.sourceKind}`;
}
