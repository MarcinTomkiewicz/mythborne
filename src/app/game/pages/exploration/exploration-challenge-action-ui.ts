import { HeroExplorationChallengeAttemptReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import { humanizeKey } from '../../../core/utils/normalize-text';

export const EXPLORATION_CHALLENGE_ACTION_MODE = {
  combat: 'combat',
  manualTrial: 'manual_trial',
  immediateEncounter: 'immediate_encounter',
  missingRuntimeAction: 'missing_runtime_action',
} as const;

export type ExplorationChallengeActionMode =
  typeof EXPLORATION_CHALLENGE_ACTION_MODE[keyof typeof EXPLORATION_CHALLENGE_ACTION_MODE];

export function explorationChallengeActionMode(
  challenge: HeroExplorationChallengeAttemptReadModel | null,
): ExplorationChallengeActionMode {
  if (!challenge) {
    return EXPLORATION_CHALLENGE_ACTION_MODE.missingRuntimeAction;
  }

  if (challenge.minigameKey === ENCOUNTER_KIND.combat) {
    return EXPLORATION_CHALLENGE_ACTION_MODE.combat;
  }

  if (challenge.trialDefinitionId) {
    return EXPLORATION_CHALLENGE_ACTION_MODE.manualTrial;
  }

  if (challenge.encounterDefinitionId) {
    return EXPLORATION_CHALLENGE_ACTION_MODE.immediateEncounter;
  }

  return EXPLORATION_CHALLENGE_ACTION_MODE.missingRuntimeAction;
}

export function explorationChallengeActionBlocker(
  challenge: HeroExplorationChallengeAttemptReadModel | null,
  mode = explorationChallengeActionMode(challenge),
): string | null {
  if (!challenge) {
    return null;
  }

  if (mode === EXPLORATION_CHALLENGE_ACTION_MODE.immediateEncounter) {
    const kind = challenge.minigameKey
      ? `${humanizeKey(challenge.minigameKey, 'Encounter')} Encounter`
      : 'Non-combat Encounter';

    return `DB zwróciła aktywne wyzwanie typu ${kind}, ale ten typ powinien rozwiązać się przez wynik kroku, nagrodę albo efekt. Odśwież stan eksploracji albo zgłoś ten stan wykonania.`;
  }

  if (mode === EXPLORATION_CHALLENGE_ACTION_MODE.missingRuntimeAction) {
    return 'DB zwróciła aktywne wyzwanie bez obsługiwanej akcji próby albo spotkania bojowego.';
  }

  return null;
}

export function hasChallengeAutoResolveChance(
  challenge: HeroExplorationChallengeAttemptReadModel | null,
): boolean {
  return (
    (challenge?.autoResolve?.chance ?? challenge?.autoResolveChance) !== null &&
    (challenge?.autoResolve?.chance ?? challenge?.autoResolveChance) !== undefined
  );
}
