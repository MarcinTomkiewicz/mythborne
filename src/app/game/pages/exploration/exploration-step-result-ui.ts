import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import {
  HeroExplorationEffectReadModel,
  HeroExplorationStepResolutionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';

const ENCOUNTER_KIND_LABEL: Record<string, string> = {
  [ENCOUNTER_KIND.combat]: 'Combat ',
  [ENCOUNTER_KIND.resource]: 'Resource ',
  [ENCOUNTER_KIND.buff]: 'Buff ',
  [ENCOUNTER_KIND.debuff]: 'Debuff ',
};

const EFFECT_ENCOUNTER_LABEL: Record<string, string> = {
  [ENCOUNTER_KIND.buff]: 'Buff Encounter',
  [ENCOUNTER_KIND.debuff]: 'Debuff Encounter',
};

export function explorationStepResultTitle(
  result: HeroExplorationStepResolutionReadModel | null,
): string {
  if (!result) {
    return '';
  }

  if (result.outcomeKind === 'trial') {
    return result.challengeAttemptId
      ? 'Trial manifested'
      : 'Trial outcome missing challenge';
  }

  if (result.outcomeKind === 'encounter') {
    return `${encounterKindPrefix(result)}Encounter ${
      result.challengeAttemptId ? 'started' : 'resolved'
    }`;
  }

  return 'Nothing found';
}

export function explorationStepResultDescription(
  result: HeroExplorationStepResolutionReadModel | null,
  activeEffect: HeroExplorationEffectReadModel | null,
): string {
  if (!result) {
    return '';
  }

  if (result.outcomeKind === 'trial') {
    return result.challengeAttemptId
      ? 'A Trial challenge is active. Resolve it through the supported Trial action to continue exploration.'
      : 'DB returned a Trial outcome without a challenge action. Refresh exploration state or report this runtime state.';
  }

  if (result.outcomeKind === 'encounter') {
    return result.challengeAttemptId
      ? `A ${encounterKindPrefix(result)}Encounter requires resolution before exploration can continue.`
      : encounterOutcomeDescription(result, activeEffect);
  }

  return 'Nothing was selected; this is the database fallback after Trial and Encounter selection.';
}

function encounterKindPrefix(
  result: HeroExplorationStepResolutionReadModel,
): string {
  return ENCOUNTER_KIND_LABEL[result.selectedDefinition?.encounterKind ?? ''] ?? '';
}

function encounterOutcomeDescription(
  result: HeroExplorationStepResolutionReadModel,
  activeEffect: HeroExplorationEffectReadModel | null,
): string {
  const kind = result.selectedDefinition?.encounterKind;

  if (kind === ENCOUNTER_KIND.resource) {
    return 'A Resource Encounter resolved through the database reward flow.';
  }

  if (kind === ENCOUNTER_KIND.buff || kind === ENCOUNTER_KIND.debuff) {
    const label = EFFECT_ENCOUNTER_LABEL[kind];

    return activeEffect
      ? `A ${label} applied DB effect ${activeEffect.effectDefinitionId}.`
      : `A ${label} resolved; DB did not return an active effect row in the refreshed state.`;
  }

  return 'An Encounter outcome was returned by the database runtime.';
}
