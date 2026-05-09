import {
  HeroExplorationRngRollReadModel,
  HeroExplorationStepReadModel,
  HeroExplorationStepRngReadModel,
} from '../domain/exploration/exploration-runtime.model';
import { Json } from '../types/database.types';
import {
  jsonRecord,
  jsonValue,
  optionalNumber,
  optionalText,
  read,
} from './json-read';

export function mapHeroExplorationStepRng(
  step: Pick<
    HeroExplorationStepReadModel,
    | 'outcomeKind'
    | 'trialDefinitionId'
    | 'encounterDefinitionId'
    | 'trialOpportunityChance'
    | 'trialOpportunityRoll'
    | 'encounterChance'
    | 'encounterRoll'
    | 'metadataJson'
  >,
): HeroExplorationStepRngReadModel {
  const metadata = jsonRecord(step.metadataJson);
  const rngMetadata = jsonRecord(read(metadata, 'rng', 'rng_json'));

  return {
    finalOutcomeKind: step.outcomeKind,
    trialOpportunity: mapRngRoll({
      surfaceKey: 'trial_opportunity',
      chance: step.trialOpportunityChance,
      roll: step.trialOpportunityRoll,
      selectedEntityId: step.trialDefinitionId,
      metadataJson: jsonValue(
        read(rngMetadata, 'trialOpportunity', 'trial_opportunity'),
      ),
    }),
    encounter: mapRngRoll({
      surfaceKey: 'encounter',
      chance: step.encounterChance,
      roll: step.encounterRoll,
      selectedEntityId: step.encounterDefinitionId,
      metadataJson: jsonValue(read(rngMetadata, 'encounter')),
    }),
    nothingFallback: {
      isFallback: isNothingOutcome(step.outcomeKind),
      outcomeKind: step.outcomeKind,
      reason: optionalText(
        read(metadata, 'nothingFallbackReason', 'nothing_fallback_reason'),
      ),
    },
    luckContextJson: jsonValue(read(metadata, 'luckContext', 'luck_context')),
    formulaContextJson: jsonValue(
      read(metadata, 'formulaContext', 'formula_context', 'formulasJson', 'formulas_json'),
    ),
    explanation: optionalText(read(metadata, 'explanation', 'rngExplanation')),
  };
}

function mapRngRoll(input: {
  surfaceKey: HeroExplorationRngRollReadModel['surfaceKey'];
  chance: number | null;
  roll: number | null;
  selectedEntityId: string | null;
  metadataJson: Json;
}): HeroExplorationRngRollReadModel {
  const metadata = jsonRecord(input.metadataJson);

  return {
    surfaceKey: input.surfaceKey,
    chance: input.chance,
    roll: input.roll,
    selectedEntityId: input.selectedEntityId,
    luckValue: optionalNumber(read(metadata, 'luckValue', 'luck_value')),
    luckInfluence: optionalNumber(read(metadata, 'luckInfluence', 'luck_influence')),
    explanation: optionalText(read(metadata, 'explanation')),
    metadataJson: input.metadataJson,
  };
}

function isNothingOutcome(outcomeKind: string): boolean {
  return outcomeKind === 'nothing';
}
