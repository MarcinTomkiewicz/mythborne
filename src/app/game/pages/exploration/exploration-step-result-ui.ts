import { ENCOUNTER_KIND } from '../../../core/constants/encounter-runtime-keys.const';
import {
  HeroExplorationEffectReadModel,
  HeroExplorationStepResolutionReadModel,
} from '../../../core/domain/exploration/exploration-runtime.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';

const ENCOUNTER_KIND_LABEL: Record<string, string> = {
  [ENCOUNTER_KIND.combat]: 'Bojowe ',
  [ENCOUNTER_KIND.resource]: 'Zasobowe ',
  [ENCOUNTER_KIND.buff]: 'Wzmacniające ',
  [ENCOUNTER_KIND.debuff]: 'Osłabiające ',
};

const EFFECT_ENCOUNTER_LABEL: Record<string, string> = {
  [ENCOUNTER_KIND.buff]: 'wzmacniające spotkanie',
  [ENCOUNTER_KIND.debuff]: 'osłabiające spotkanie',
};

export function explorationStepResultTitle(
  result: HeroExplorationStepResolutionReadModel | null,
): string {
  if (!result) {
    return '';
  }

  if (isTrialManifestationFailure(result)) {
    return 'Próba się nie ujawniła';
  }

  if (result.outcomeKind === 'trial') {
    return result.challengeAttemptId
      ? 'Próba ujawniona'
      : 'Próba wymaga uzupełnienia akcji';
  }

  if (result.outcomeKind === 'encounter') {
    return result.challengeAttemptId
      ? `${encounterKindPrefix(result)}spotkanie rozpoczęte`
      : `${encounterKindPrefix(result)}spotkanie rozstrzygnięte`;
  }

  return 'Bez zdarzenia';
}

export function explorationStepResultDescription(
  result: HeroExplorationStepResolutionReadModel | null,
  activeEffect: HeroExplorationEffectReadModel | null,
): string {
  if (!result) {
    return '';
  }

  if (isTrialManifestationFailure(result)) {
    return 'Pojawiła się szansa na próbę, ale próba nie ujawniła się. To prawidłowy wynik bez nagrody.';
  }

  if (result.outcomeKind === 'trial') {
    return result.challengeAttemptId
      ? 'Aktywna próba czeka na rozstrzygnięcie przed dalszą eksploracją.'
      : 'Próba zatrzymała wyprawę i czeka na dalsze rozstrzygnięcie.';
  }

  if (result.outcomeKind === 'encounter') {
    return result.challengeAttemptId
      ? `${encounterKindPrefix(result)}spotkanie wymaga rozstrzygnięcia przed dalszą eksploracją.`
      : encounterOutcomeDescription(result, activeEffect);
  }

  return 'Szlak nie ujawnił żadnego zdarzenia. Możesz kontynuować wyborem następnego kierunku.';
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
    return 'Zasobowe spotkanie zostało rozstrzygnięte i może mieć nagrodę z wyniku eksploracji.';
  }

  if (kind === ENCOUNTER_KIND.buff || kind === ENCOUNTER_KIND.debuff) {
    const label = EFFECT_ENCOUNTER_LABEL[kind];

    return activeEffect
      ? `${label} nałożyło efekt eksploracji.`
      : `${label} zostało rozstrzygnięte bez aktywnego efektu do pokazania.`;
  }

  return 'Spotkanie zostało rozstrzygnięte i wyprawa może ruszyć dalej.';
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
