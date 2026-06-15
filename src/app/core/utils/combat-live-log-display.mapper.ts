import {
  CombatDisplayLogGroup,
  CombatDisplayLogRow,
  CombatDisplayValueTone,
} from '../domain/combat/combat-display.model';
import {
  CombatLiveEventReadModel,
  CombatLiveParticipantReadModel,
  CombatLogActionSegmentReadModel,
  CombatLogResultRowReadModel,
  CombatLogSecondaryRowReadModel,
} from '../domain/combat/combat-live.model';
import { trimToNull } from './normalize-text';

export function mapLiveCombatEventLogGroups(
  events: readonly CombatLiveEventReadModel[],
  participants: readonly CombatLiveParticipantReadModel[],
): CombatDisplayLogGroup[] {
  const groups = new Map<string, CombatDisplayLogRow[]>();
  const labels = new Map<string, string | null>();

  for (const event of events) {
    if (isSystemLogPresentation(event.presentationKind)) {
      continue;
    }

    const rows = liveCombatEventRows(event, participants);

    if (!rows.length) {
      continue;
    }

    const groupId = event.roundNumber === null ? 'live' : String(event.roundNumber);
    const groupLabel = trimToNull(event.roundLabel) ?? trimToNull(event.eventLabel);

    labels.set(groupId, groupLabel);
    groups.set(groupId, [...(groups.get(groupId) ?? []), ...rows]);
  }

  return Array.from(groups.entries()).map(([id, rows]) => ({
    id,
    label: labels.get(id) ?? null,
    rows,
  }));
}

function liveCombatEventRows(
  event: CombatLiveEventReadModel,
  participants: readonly CombatLiveParticipantReadModel[],
): CombatDisplayLogRow[] {
  const actorLabel = participantLabel(
    participants,
    event.actorParticipantId,
    event.actorDisplayName,
  );

  return [
    liveCombatLogRow({
      id: String(event.eventIndex),
      actorLabel,
      actionText: event.actionText,
      actionSegments: event.actionSegments,
      resultRows: event.resultRows,
      eventLabel: event.eventLabel,
      detailText: event.detailText,
      displayText: event.displayText,
      damageDisplay: event.damageDisplay,
      resultDisplay: event.resultDisplay,
      healingDisplay: event.healingDisplay,
      tone: event.tone,
      details: event.details,
      hasSecondaryRows: event.secondaryLogRows.length > 0,
    }),
    ...event.secondaryLogRows.map((row, index) =>
      liveCombatSecondaryLogRow(row, actorLabel, `${event.eventIndex}:secondary:${row.id ?? index}`),
    ),
  ].filter((row): row is CombatDisplayLogRow => row !== null);
}

function liveCombatSecondaryLogRow(
  row: CombatLogSecondaryRowReadModel,
  parentActorLabel: string | null,
  id: string,
): CombatDisplayLogRow | null {
  return liveCombatLogRow({
    id,
    actorLabel: trimToNull(row.actorDisplayName) ?? parentActorLabel,
    actionText: row.actionText,
    actionSegments: row.actionSegments,
    resultRows: row.resultRows,
    eventLabel: row.eventLabel,
    detailText: row.detailText,
    displayText: row.displayText,
    damageDisplay: row.damageDisplay,
    resultDisplay: row.resultDisplay,
    healingDisplay: row.healingDisplay,
    tone: row.tone,
    details: row.details,
    hasSecondaryRows: false,
  });
}

function liveCombatLogRow(input: {
  id: string;
  actorLabel: string | null;
  actionText: string | null;
  actionSegments: readonly CombatLogActionSegmentReadModel[];
  resultRows: readonly CombatLogResultRowReadModel[];
  eventLabel: string | null;
  detailText: string | null;
  displayText: string | null;
  damageDisplay: string | null;
  resultDisplay: string | null;
  healingDisplay: string | null;
  tone: CombatDisplayValueTone | null;
  details: readonly string[];
  hasSecondaryRows: boolean;
}): CombatDisplayLogRow | null {
  const body = combatLogBody(input.actionSegments, input.actionText)
    ?? fallbackCombatLogBody(input.displayText, input.detailText, input.eventLabel);
  const result = combatLogResult(input.resultRows, input);

  if (!input.actorLabel || !body || (!body.prefix && !body.attackSourceLabel && !body.suffix && !result)) {
    return null;
  }

  return {
    id: input.id,
    actorLabel: input.actorLabel,
    bodyPrefix: body.prefix,
    attackSourceLabel: body.attackSourceLabel,
    bodySuffix: body.suffix,
    detailLines: combatLogDetailLines(input, body.text, result),
    resultLabel: result,
    tone: input.tone ?? input.resultRows[0]?.tone ?? 'muted',
  };
}

function combatLogBody(
  segments: readonly CombatLogActionSegmentReadModel[],
  actionText: string | null,
): { prefix: string; attackSourceLabel: string | null; suffix: string; text: string } | null {
  if (segments.length) {
    return combatLogBodyFromSegments(segments);
  }

  const text = trimToNull(actionText);

  return text
    ? {
        prefix: text,
        attackSourceLabel: null,
        suffix: '',
        text,
      }
    : null;
}

function fallbackCombatLogBody(
  displayText: string | null,
  detailText: string | null,
  eventLabel: string | null,
): { prefix: string; attackSourceLabel: string | null; suffix: string; text: string } | null {
  const text = trimToNull(displayText) ?? trimToNull(detailText) ?? trimToNull(eventLabel);

  return text
    ? {
        prefix: text,
        attackSourceLabel: null,
        suffix: '',
        text,
      }
    : null;
}

function combatLogBodyFromSegments(
  segments: readonly CombatLogActionSegmentReadModel[],
): { prefix: string; attackSourceLabel: string | null; suffix: string; text: string } {
  const attackSourceIndex = segments.findIndex((segment) => segment.kind === 'attack_source');

  if (attackSourceIndex === -1) {
    const text = segmentText(segments);

    return {
      prefix: text,
      attackSourceLabel: null,
      suffix: '',
      text,
    };
  }

  const prefix = segmentText(segments.slice(0, attackSourceIndex), { trailingSpace: true });
  const attackSourceLabel = trimToNull(segments[attackSourceIndex]?.text);
  const suffix = segmentText(segments.slice(attackSourceIndex + 1), { leadingSpace: true });

  return {
    prefix,
    attackSourceLabel,
    suffix,
    text: segmentText(segments),
  };
}

function segmentText(
  segments: readonly CombatLogActionSegmentReadModel[],
  options: { leadingSpace?: boolean; trailingSpace?: boolean } = {},
): string {
  const text = segments
    .map((segment) => trimToNull(segment.text))
    .filter((value): value is string => Boolean(value))
    .join(' ');

  if (!text) {
    return '';
  }

  return `${options.leadingSpace ? ' ' : ''}${text}${options.trailingSpace ? ' ' : ''}`;
}

function combatLogResult(
  resultRows: readonly CombatLogResultRowReadModel[],
  input: {
    resultDisplay: string | null;
    damageDisplay: string | null;
    healingDisplay: string | null;
    hasSecondaryRows: boolean;
  },
): string | null {
  const structuredResult = trimToNull(resultRows[0]?.text ?? null);

  if (structuredResult) {
    return structuredResult;
  }

  return trimToNull(input.resultDisplay)
    ?? trimToNull(input.damageDisplay)
    ?? (input.hasSecondaryRows ? null : trimToNull(input.healingDisplay));
}

function combatLogDetailLines(
  input: {
    actionSegments: readonly CombatLogActionSegmentReadModel[];
    actionText: string | null;
    resultRows: readonly CombatLogResultRowReadModel[];
    details: readonly string[];
    detailText: string | null;
    hasSecondaryRows: boolean;
  },
  bodyText: string,
  result: string | null,
): string[] {
  const hasStructuredBody = input.actionSegments.length > 0 || Boolean(trimToNull(input.actionText));
  const hasStructuredResult = input.resultRows.length > 0 || input.hasSecondaryRows;

  if (hasStructuredBody || hasStructuredResult) {
    return [];
  }

  const excluded = [bodyText, result].filter((value): value is string => Boolean(value));

  return (input.details.length ? input.details : [input.detailText])
    .map((line) => trimToNull(line))
    .filter((line): line is string => Boolean(line && !excluded.includes(line)));
}

function participantLabel(
  participants: readonly CombatLiveParticipantReadModel[],
  participantId: string | null,
  displayName: string | null,
): string | null {
  return trimToNull(displayName)
    ?? (
      participantId
        ? participants.find((participant) => participant.participantId === participantId)?.displayName ?? null
        : null
    );
}

function isSystemLogPresentation(value: string | null): boolean {
  const presentation = trimToNull(value);

  return presentation === 'manifest' || presentation === 'round_started';
}
