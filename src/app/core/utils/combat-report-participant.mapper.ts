import { CombatDisplayParticipant } from '../domain/combat/combat-display.model';
import {
  CombatLiveParticipantReadModel,
  CombatResultDetailReadModel,
} from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import { StatCardRow } from '../types/stat-card.types';
import {
  mapCombatParticipantBaseStatCardRows,
  mapCombatParticipantStatCardRows,
} from './combat-participant-stat-card.mapper';
import { humanizeKey } from './normalize-text';
import { jsonRecord, optionalNumber, optionalText, read } from './json-read';
import { combatReportParticipantsJson } from './combat-report-text.mapper';

export function mapCombatReportParticipants(input: {
  participantsJson: Json | undefined;
  winnerSide: string | null;
  loserSide: string | null;
}): CombatDisplayParticipant[] {
  if (!Array.isArray(input.participantsJson)) {
    return [];
  }

  return input.participantsJson.flatMap((entry, index) => {
    const record = jsonRecord(entry);

    if (!record) {
      return [];
    }

    const side = optionalText(read(record, 'side', 'participantSide', 'participant_side'));
    const name = optionalText(read(
      record,
      'displayName',
      'display_name',
      'name',
      'participantName',
      'participant_name',
    )) ?? (side ? combatSideLabel(side) : 'Uczestnik walki');
    const hpCurrent = optionalNumber(read(
      record,
      'healthEnd',
      'health_end',
      'currentHp',
      'current_hp',
      'healthCurrent',
      'health_current',
    ));
    const hpMax = optionalNumber(read(
      record,
      'maxHealth',
      'max_health',
      'maxHp',
      'max_hp',
      'healthMax',
      'health_max',
    ));
    const statusLabel = optionalText(read(
      record,
      'statusLabel',
      'status_label',
      'status',
      'statusKey',
      'status_key',
    )) ?? finalParticipantStatus(hpCurrent);
    const id = optionalText(read(record, 'participantId', 'participant_id', 'id'))
      ?? side
      ?? `${index}`;
    const isWinner = Boolean(side && side === input.winnerSide);
    const isLoser = Boolean(side && side === input.loserSide);
    const baseStatRows = statRowsFromJson(read(record, 'baseStatRows', 'base_stat_rows'));
    const combatStatRows = statRowsFromJson(read(record, 'combatStatRows', 'combat_stat_rows'));

    return [{
      id,
      displayName: name,
      kindLabel: side ? combatSideLabel(side) : 'Strona N/D',
      metaLabel: statusLabel,
      badgeLabel: isWinner ? 'Zwycięzca' : isLoser ? 'Pokonany' : 'Uczestnik',
      badgeTone: isWinner ? 'success' : isLoser ? 'danger' : 'muted',
      avatarTone: isLoser ? 'danger' : 'heading',
      hpCurrent,
      hpMax,
      baseStatRows,
      combatStatRows,
      emptyStatsMessage: emptyStatsMessage(baseStatRows, combatStatRows),
      side,
    } satisfies CombatDisplayParticipant];
  });
}

export function mapCompletedCombatParticipants(input: {
  detail: CombatResultDetailReadModel | null;
  liveParticipants: readonly CombatLiveParticipantReadModel[];
}): CombatDisplayParticipant[] {
  const detailRows = mapCombatReportParticipants({
    participantsJson: combatReportParticipantsJson({
      rawJson: input.detail?.rawJson,
      participantsJson: input.detail?.participants,
    }),
    winnerSide: input.detail?.winnerSide ?? null,
    loserSide: input.detail?.loserSide ?? null,
  });

  if (detailRows.length) {
    return detailRows.map((participant) =>
      withLiveStatFallback(participant, input.liveParticipants),
    );
  }

  return input.liveParticipants.map((participant, index) =>
    liveParticipantReportCard(participant, index, input.detail),
  );
}

export function combatParticipantPair(
  participants: readonly CombatDisplayParticipant[],
): {
  left: CombatDisplayParticipant | null;
  right: CombatDisplayParticipant | null;
} {
  const left = participants.find((participant) => participant.side === 'initiator') ??
    participants[0] ??
    null;
  const right = participants.find((participant) => participant.side === 'defender') ??
    participants.find((participant) => participant.id !== left?.id) ??
    null;

  return { left, right };
}

export function combatSideLabel(value: string): string {
  switch (value) {
    case 'initiator':
      return 'bohater';
    case 'defender':
      return 'przeciwnik';
    default:
      return humanizeKey(value, 'strona');
  }
}

function liveParticipantReportCard(
  participant: CombatLiveParticipantReadModel,
  index: number,
  detail: CombatResultDetailReadModel | null,
): CombatDisplayParticipant {
  const isWinner = Boolean(participant.side && participant.side === detail?.winnerSide);
  const isLoser = Boolean(participant.side && participant.side === detail?.loserSide);

  return {
    id: participant.participantId ??
      participant.previewParticipantKey ??
      participant.participantKey ??
      participant.side ??
      `${index}`,
    displayName: participant.displayName,
    kindLabel: participant.side ? combatSideLabel(participant.side) : 'Strona N/D',
    metaLabel: participant.statusLabel ?? participant.statusKey ?? 'Po walce',
    badgeLabel: isWinner ? 'Zwycięzca' : isLoser ? 'Pokonany' : 'Uczestnik',
    badgeTone: isWinner ? 'success' : isLoser ? 'danger' : 'muted',
    avatarTone: isLoser ? 'danger' : 'heading',
    hpCurrent: participant.currentHp,
    hpMax: participant.maxHp,
    baseStatRows: mapCombatParticipantBaseStatCardRows(participant.baseStatRows ?? []),
    combatStatRows: mapCombatParticipantStatCardRows(participant.combatStatRows ?? []),
    emptyStatsMessage: emptyStatsMessage(participant.baseStatRows ?? [], participant.combatStatRows ?? []),
    side: participant.side,
  };
}

function finalParticipantStatus(hpCurrent: number | null): string {
  return hpCurrent === 0 ? 'Pokonany' : 'Po walce';
}

function withLiveStatFallback(
  participant: CombatDisplayParticipant,
  liveParticipants: readonly CombatLiveParticipantReadModel[],
): CombatDisplayParticipant {
  if (participant.baseStatRows.length && participant.combatStatRows.length) {
    return participant;
  }

  const live = matchingLiveParticipant(participant, liveParticipants);
  const baseStatRows = participant.baseStatRows.length
    ? participant.baseStatRows
    : mapCombatParticipantBaseStatCardRows(live?.baseStatRows ?? []);
  const combatStatRows = participant.combatStatRows.length
    ? participant.combatStatRows
    : mapCombatParticipantStatCardRows(live?.combatStatRows ?? []);

  return {
    ...participant,
    baseStatRows,
    combatStatRows,
    emptyStatsMessage: emptyStatsMessage(baseStatRows, combatStatRows),
  };
}

function matchingLiveParticipant(
  participant: CombatDisplayParticipant,
  liveParticipants: readonly CombatLiveParticipantReadModel[],
): CombatLiveParticipantReadModel | null {
  return liveParticipants.find((live) => live.side === participant.side) ??
    liveParticipants.find((live) => live.participantId === participant.id) ??
    liveParticipants.find((live) => live.displayName === participant.displayName) ??
    null;
}

function statRowsFromJson(value: Json | undefined): StatCardRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index) => {
    const record = jsonRecord(entry);
    const label = optionalText(read(record, 'label', 'name'));
    const rawValue = read(record, 'displayValue', 'display_value', 'value');
    const displayValue = optionalText(rawValue) ??
      (typeof rawValue === 'number' ? String(rawValue) : null);

    if (!label || !displayValue) {
      return [];
    }

    return [{
      key: optionalText(read(record, 'key')) ?? `${index}`,
      label,
      value: displayValue,
      valueClass: optionalText(read(record, 'valueClass', 'value_class')) ?? 'color-heading',
    }];
  });
}

function emptyStatsMessage(
  baseRows: readonly unknown[],
  combatRows: readonly unknown[],
): string | null {
  return baseRows.length || combatRows.length
    ? null
    : 'Raport walki nie zawiera wierszy statystyk dla tej strony.';
}
