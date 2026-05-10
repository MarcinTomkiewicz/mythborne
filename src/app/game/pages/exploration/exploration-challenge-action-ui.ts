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
      ? humanizeKey(challenge.minigameKey, 'Encounter')
      : 'Non-combat';

    return `DB returned an active ${kind} Encounter challenge, but this Encounter type should resolve through the step outcome/reward/effect flow. Refresh exploration state or report this runtime state.`;
  }

  if (mode === EXPLORATION_CHALLENGE_ACTION_MODE.missingRuntimeAction) {
    return 'DB returned an active challenge without a supported Trial or Combat Encounter action.';
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
