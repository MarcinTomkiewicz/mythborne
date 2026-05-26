import {
  CombatDisplayParticipant,
  CombatDisplayBadgeTone,
} from '../domain/combat/combat-display.model';
import { CombatLiveParticipantReadModel } from '../domain/combat/combat-live.model';
import {
  mapCombatParticipantBaseStatCardRows,
  mapCombatParticipantStatCardRows,
} from './combat-participant-stat-card.mapper';

export function combatLiveParticipantPair(
  participants: readonly CombatLiveParticipantReadModel[],
): {
  left: CombatLiveParticipantReadModel | null;
  right: CombatLiveParticipantReadModel | null;
} {
  const left = participants.find((participant) => participant.heroId) ??
    participants.find((participant) => participant.side === 'initiator') ??
    participants[0] ??
    null;
  const right = participants.find((participant) => participant.opponentDefinitionId) ??
    participants.find((participant) => participant.side === 'defender') ??
    participants.find((participant) =>
      participantUiKey(participant) !== (left ? participantUiKey(left) : null),
    ) ??
    null;

  return { left, right };
}

export function combatLiveParticipantCard(input: {
  participant: CombatLiveParticipantReadModel;
  badgeLabel: string;
  badgeTone: Extract<CombatDisplayBadgeTone, 'success' | 'danger'>;
}): CombatDisplayParticipant {
  return {
    id: participantUiKey(input.participant) ?? input.participant.displayName,
    displayName: input.participant.displayName,
    kindLabel: participantKindLabel(input.participant),
    metaLabel: participantMeta(input.participant),
    badgeLabel: input.badgeLabel,
    badgeTone: input.badgeTone,
    avatarTone: input.badgeTone === 'danger' ? 'danger' : 'heading',
    hpCurrent: input.participant.currentHp,
    hpMax: input.participant.maxHp,
    baseStatRows: mapCombatParticipantBaseStatCardRows(input.participant.baseStatRows ?? []),
    combatStatRows: mapCombatParticipantStatCardRows(input.participant.combatStatRows ?? []),
    emptyStatsMessage: 'Podgląd walki nie zawiera wierszy statystyk dla tej strony.',
    side: input.participant.side,
  };
}

function participantKindLabel(participant: CombatLiveParticipantReadModel): string {
  switch (participant.participantKind?.trim().toLowerCase()) {
    case 'hero':
    case 'player':
      return 'Bohater';
    case 'opponent':
    case 'enemy':
      return 'Przeciwnik';
    default:
      break;
  }

  if (participant.heroId || participant.side === 'initiator') {
    return 'Bohater';
  }

  return 'Przeciwnik';
}

function participantMeta(participant: CombatLiveParticipantReadModel): string {
  return [
    participantKindLabel(participant),
    sideLabel(participant),
    participant.statusLabel ?? null,
  ].filter(Boolean).join(' · ');
}

function sideLabel(participant: CombatLiveParticipantReadModel): string {
  switch (participant.side) {
    case 'initiator':
      return 'Atakujący';
    case 'defender':
      return 'Obrońca';
    default:
      return participant.side ?? 'Strona';
  }
}

function participantUiKey(participant: CombatLiveParticipantReadModel): string | null {
  return participant.previewParticipantKey ??
    participant.participantKey ??
    participant.side ??
    participant.participantId;
}
