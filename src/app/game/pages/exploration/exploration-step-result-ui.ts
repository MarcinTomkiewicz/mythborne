import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import {
  HeroExplorationEffectReadModel,
  HeroExplorationStepResolutionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';

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

  if (isTrialManifestationFailure(result)) {
    return 'Trial manifestation failed';
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

  if (isTrialManifestationFailure(result)) {
    return 'A Trial opportunity appeared, but manifestation failed. DB did not grant a reward for this outcome.';
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
  return ENCOUNTER_KIND_LABEL[encounterKind(result) ?? ''] ?? '';
}

function encounterOutcomeDescription(
  result: HeroExplorationStepResolutionReadModel,
  activeEffect: HeroExplorationEffectReadModel | null,
): string {
  const kind = encounterKind(result);

  if (kind === ENCOUNTER_KIND.resource) {
    return 'A Resource Encounter resolved through the database reward flow.';
  }

  if (kind === ENCOUNTER_KIND.buff || kind === ENCOUNTER_KIND.debuff) {
    const label = EFFECT_ENCOUNTER_LABEL[kind];

    return activeEffect
      ? `A ${label} applied an exploration effect.`
      : `A ${label} resolved; DB did not return an active effect row in the refreshed state.`;
  }

  return 'An Encounter outcome was returned by the database runtime.';
}

function encounterKind(result: HeroExplorationStepResolutionReadModel): string | null {
  const metadata = jsonRecord(result.metadataJson);

  return result.selectedDefinition?.encounterKind
    ?? optionalText(read(metadata, 'encounterKind', 'encounter_kind'));
}

function isTrialManifestationFailure(
  result: HeroExplorationStepResolutionReadModel,
): boolean {
  const metadata = jsonRecord(result.metadataJson);

  return (
    result.outcomeKind === 'nothing' &&
    (
      result.rawOutcomeKind === 'trial_opportunity' ||
      read(metadata, 'rawOutcomeKind', 'raw_outcome_kind') === 'trial_opportunity'
    ) &&
    read(metadata, 'trialManifested', 'trial_manifested') === false
  );
}
