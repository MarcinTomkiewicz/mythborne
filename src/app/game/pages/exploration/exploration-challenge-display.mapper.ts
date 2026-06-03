import { HeroExplorationChallengeAttemptReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { humanizeKey } from '../../../core/utils/normalize-text';
import { ChallengeFact } from './exploration-challenge.model';

export function explorationChallengeTitle(
  challenge: HeroExplorationChallengeAttemptReadModel | null,
): string {
  if (!challenge) {
    return 'Brak aktywnego wyzwania.';
  }

  return explorationChallengeKindLabel(challenge);
}

export function explorationChallengeFacts(input: {
  challenge: HeroExplorationChallengeAttemptReadModel | null;
  statusLabel: string;
}): ChallengeFact[] {
  const { challenge } = input;

  if (!challenge) {
    return [];
  }

  return [
    { label: 'Rodzaj', value: explorationChallengeKindLabel(challenge) },
    { label: 'Stan', value: input.statusLabel },
    {
      label: 'Szansa ujawnienia',
      value: explorationChallengeChanceLabel(challenge.manifestationChance),
    },
  ];
}

export function explorationChallengeChanceLabel(chance: number | null): string {
  return chance === null ? 'Nieznana' : `około ${Math.round(chance)}%`;
}

export function explorationChallengeKindLabel(
  challenge: HeroExplorationChallengeAttemptReadModel,
): string {
  if (challenge.trialDefinitionId) {
    return 'Próba';
  }

  if (challenge.encounterDefinitionId) {
    return 'Spotkanie';
  }

  return humanizeKey(challenge.challengeKind, 'Wyzwanie');
}

export function explorationChallengeStatusLabel(
  challenge: HeroExplorationChallengeAttemptReadModel | null,
): string {
  if (!challenge) {
    return 'Status';
  }

  const metadata = jsonRecord(challenge.metadataJson);
  const details = jsonRecord(challenge.detailsJson);
  const label = optionalText(read(
    details,
    'statusLabel',
    'status_label',
    'playerStatusLabel',
    'player_status_label',
  )) ?? optionalText(read(
    metadata,
    'statusLabel',
    'status_label',
    'playerStatusLabel',
    'player_status_label',
  ));

  return polishExplorationChallengeStatus(label) ??
    explorationChallengeStatusText(challenge.status);
}

export function explorationChallengeStatusText(status: string): string {
  switch (status) {
    case 'pending':
    case 'awaiting_resolution':
    case 'active':
    case 'in_progress':
      return 'Oczekuje na rozstrzygnięcie';
    case 'completed':
      return 'Rozstrzygnięte';
    case 'failed':
      return 'Nieudane';
    default:
      return humanizeKey(status, 'Status');
  }
}

export function polishExplorationChallengeStatus(label: string | null): string | null {
  if (!label) {
    return null;
  }

  switch (label.trim().toLowerCase()) {
    case 'awaiting resolution':
    case 'awaiting_resolution':
    case 'pending':
    case 'active':
    case 'in progress':
    case 'in_progress':
      return 'Oczekuje na rozstrzygnięcie';
    case 'completed':
      return 'Rozstrzygnięte';
    case 'failed':
      return 'Nieudane';
    default:
      return label;
  }
}
