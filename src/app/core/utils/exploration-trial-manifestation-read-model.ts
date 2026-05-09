import {
  HeroExplorationChallengeAttemptReadModel,
  HeroExplorationTrialManifestationReadModel,
} from '../domain/exploration/exploration-runtime.model';
import { Json } from '../types/database.types';
import {
  jsonRecord,
  jsonValue,
  optionalNumber,
  optionalText,
  read,
} from './json-read';

export function mapHeroExplorationTrialManifestation(
  challenge: Pick<
    HeroExplorationChallengeAttemptReadModel,
    | 'trialDefinitionId'
    | 'testedStatKey'
    | 'manifestationStatus'
    | 'manifestationChance'
    | 'manifestationRoll'
    | 'metadataJson'
  >,
): HeroExplorationTrialManifestationReadModel {
  const metadata = jsonRecord(challenge.metadataJson);
  const rngMetadata = jsonRecord(read(metadata, 'rng', 'rng_json'));
  const manifestationMetadata = jsonValue(
    read(
      metadata,
      'trialManifestation',
      'trial_manifestation',
      'manifestation',
      'manifestationJson',
      'manifestation_json',
    ) ??
      read(
        rngMetadata,
        'trialManifestation',
        'trial_manifestation',
        'manifestation',
      ),
  );
  const manifestationRecord = jsonRecord(manifestationMetadata);
  const luckContext = jsonRecord(
    read(manifestationRecord, 'luckContext', 'luck_context') ??
      read(metadata, 'luckContext', 'luck_context'),
  );

  return {
    status: challenge.manifestationStatus,
    chance: challenge.manifestationChance,
    roll: challenge.manifestationRoll,
    trialDefinitionId: challenge.trialDefinitionId,
    testedStatKey: challenge.testedStatKey,
    luckValue: optionalNumber(
      read(manifestationRecord, 'luckValue', 'luck_value') ??
        read(luckContext, 'luckValue', 'luck_value'),
    ),
    luckInfluence: optionalNumber(
      read(manifestationRecord, 'luckInfluence', 'luck_influence') ??
        read(luckContext, 'luckInfluence', 'luck_influence'),
    ),
    trialPower: optionalNumber(
      read(manifestationRecord, 'trialPower', 'trial_power') ??
        read(luckContext, 'trialPower', 'trial_power'),
    ),
    configIssueKey: optionalText(
      read(
        manifestationRecord,
        'configIssueKey',
        'config_issue_key',
        'configurationIssueKey',
        'configuration_issue_key',
      ),
    ),
    configIssueMessage: optionalText(
      read(
        manifestationRecord,
        'configIssueMessage',
        'config_issue_message',
        'configurationIssueMessage',
        'configuration_issue_message',
      ),
    ),
    explanation: optionalText(
      read(manifestationRecord, 'explanation') ??
        read(metadata, 'manifestationExplanation', 'manifestation_explanation'),
    ),
    metadataJson: manifestationMetadata,
    formulaContextJson: jsonValue(
      read(manifestationRecord, 'formulaContext', 'formula_context') ??
        read(metadata, 'formulaContext', 'formula_context', 'formulasJson', 'formulas_json'),
    ),
  };
}
