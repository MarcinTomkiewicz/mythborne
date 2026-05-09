import {
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationChallengeAutoResolveReadModel,
} from '../domain/exploration/exploration-runtime.model';
import { Json } from '../types/database.types';
import {
  jsonRecord,
  jsonValue,
  optionalNumber,
  optionalText,
  read,
} from './json-read';

export function mapHeroExplorationChallengeAutoResolve(
  challenge: Pick<
    HeroExplorationChallengeAttemptReadModel,
    | 'testedStatKey'
    | 'autoResolveChance'
    | 'autoResolveRoll'
    | 'metadataJson'
  >,
): HeroExplorationChallengeAutoResolveReadModel {
  const metadata = jsonRecord(challenge.metadataJson);
  const autoResolveMetadata = jsonValue(
    read(
      metadata,
      'autoResolve',
      'auto_resolve',
      'challengeAutoResolve',
      'challenge_auto_resolve',
    ),
  );
  const autoResolveRecord = jsonRecord(autoResolveMetadata);
  const luckContext = jsonRecord(
    read(autoResolveRecord, 'luckContext', 'luck_context') ??
      read(metadata, 'autoResolveLuckContext', 'auto_resolve_luck_context'),
  );

  return {
    chance: challenge.autoResolveChance,
    roll: challenge.autoResolveRoll,
    testedStatKey:
      optionalText(read(autoResolveRecord, 'testedStatKey', 'tested_stat_key')) ??
      challenge.testedStatKey,
    testedStatValue: optionalNumber(
      read(autoResolveRecord, 'testedStatValue', 'tested_stat_value'),
    ),
    luckValue: optionalNumber(
      read(autoResolveRecord, 'luckValue', 'luck_value') ??
        read(luckContext, 'luckValue', 'luck_value'),
    ),
    luckInfluence: optionalNumber(
      read(autoResolveRecord, 'luckInfluence', 'luck_influence') ??
        read(luckContext, 'luckInfluence', 'luck_influence'),
    ),
    trialPower: optionalNumber(
      read(autoResolveRecord, 'trialPower', 'trial_power') ??
        read(luckContext, 'trialPower', 'trial_power'),
    ),
    difficultyMultiplier: optionalNumber(
      read(autoResolveRecord, 'difficultyMultiplier', 'difficulty_multiplier'),
    ),
    capPercent: optionalNumber(read(autoResolveRecord, 'capPercent', 'cap_percent')),
    autoResolvePenalty: optionalNumber(
      read(autoResolveRecord, 'autoResolvePenalty', 'auto_resolve_penalty'),
    ),
    manualChanceReference: optionalNumber(
      read(autoResolveRecord, 'manualChanceReference', 'manual_chance_reference'),
    ),
    rawSuccessChance: optionalNumber(
      read(
        autoResolveRecord,
        'rawSuccessChance',
        'raw_success_chance',
        'rawAutoResolveSuccessChance',
        'raw_auto_resolve_success_chance',
      ),
    ),
    finalSuccessChance: optionalNumber(
      read(
        autoResolveRecord,
        'finalSuccessChance',
        'final_success_chance',
        'finalAutoResolveSuccessChance',
        'final_auto_resolve_success_chance',
      ),
    ),
    formulaContextJson: jsonValue(
      read(autoResolveRecord, 'formulaContext', 'formula_context'),
    ),
    explanation: optionalText(
      read(autoResolveRecord, 'explanation') ??
        read(metadata, 'autoResolveExplanation', 'auto_resolve_explanation'),
    ),
    metadataJson: autoResolveMetadata,
  };
}
