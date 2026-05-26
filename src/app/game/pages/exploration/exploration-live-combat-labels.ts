import {
  CombatDisplayLogGroup,
  CombatDisplayLogRow,
  CombatDisplayValueTone,
} from '../../../core/domain/combat/combat-display.model';
import {
  CombatLiveEventReadModel,
  CombatLiveParticipantReadModel,
  CombatTimingManifestReadModel,
} from '../../../core/domain/combat/combat-live.model';
import { formatCombatLogResultLabel } from '../../../core/utils/combat-log-display-text';

export interface CombatTimelineRow {
  id: string;
  title: string;
  meta: string;
  badges: string[];
  details: string[];
}

export type CombatLogTone = CombatDisplayValueTone;
export type CombatActiveLogGroup = CombatDisplayLogGroup;
export type CombatActiveLogRow = CombatDisplayLogRow;

type CombatLogOutcome =
  'critical' | 'lethal' | 'damage' | 'miss' | 'evade' | 'heal' | 'effect' | 'danger' | 'unknown';

export function participantHpLabel(
  participant: CombatLiveParticipantReadModel,
): string {
  const current = participant.currentHp ?? 'N/D';
  const max = participant.maxHp ?? 'N/D';

  return `${current} / ${max}`;
}

export function combatEventMetaLabel(event: CombatLiveEventReadModel): string {
  return [
    `#${event.eventIndex}`,
    event.roundNumber === null ? null : `runda ${event.roundNumber}`,
    event.actionIndex === null ? null : `akcja ${event.actionIndex}`,
  ].filter(Boolean).join(' - ');
}

export function combatTimelineRows(
  events: CombatLiveEventReadModel[],
): CombatTimelineRow[] {
  return events.map((event) => {
    const title = playerFacingText(event.eventLabel)
      ?? playerFacingText(event.displayText)
      ?? playerFacingText(event.detailText)
      ?? 'Zdarzenie walki';

    return {
      id: String(event.eventIndex),
      title,
      meta: combatEventMetaLabel(event),
      badges: [
        playerFacingText(event.damageDisplay),
        playerFacingText(event.attackSourceLabel),
      ].filter((badge): badge is string => badge !== null),
      details: uniquePlayerFacingText([
        event.detailText,
        event.displayText === title ? null : event.displayText,
      ]),
    };
  });
}

export function combatActiveLogGroups(
  events: CombatLiveEventReadModel[],
  participants: CombatLiveParticipantReadModel[],
): CombatActiveLogGroup[] {
  const rowsByRound = new Map<string, CombatActiveLogRow[]>();
  const roundLabels = new Map<string, string>();

  for (const event of events) {
    const row = activeLogRow(event, participants);

    if (!row) {
      continue;
    }

    const roundKey = event.roundNumber === null ? 'unknown' : String(event.roundNumber);
    const label = playerFacingText(event.roundLabel)
      ?? (event.roundNumber === null ? 'Runda' : `Runda ${event.roundNumber}`);

    roundLabels.set(roundKey, label);
    rowsByRound.set(roundKey, [...(rowsByRound.get(roundKey) ?? []), row]);
  }

  return Array.from(rowsByRound.entries()).map(([id, rows]) => ({
    id,
    label: roundLabels.get(id) ?? 'Runda',
    rows,
  }));
}

export function combatTimingManifestLabel(
  manifest: CombatTimingManifestReadModel | null,
): string {
  if (!manifest) {
    return 'Brak aktywnego okna akcji gracza.';
  }

  const hitChance = manifest.hitChancePercent === null
    ? null
    : `szansa ${manifest.hitChancePercent}%`;
  const streak = manifest.streakBefore === null
    ? null
    : `seria ${manifest.streakBefore}`;
  const evasion = manifest.luckRng?.evasionChance === null ||
    manifest.luckRng?.evasionChance === undefined
    ? null
    : `unik ${manifest.luckRng.evasionChance}%`;
  const critical = manifest.luckRng?.criticalChance === null ||
    manifest.luckRng?.criticalChance === undefined
    ? null
    : `kryt ${manifest.luckRng.criticalChance}%`;

  const baseLabel = manifest.label
    ?? [
      `Strefa ${manifest.zoneStartPercent}-${manifest.zoneEndPercent}%`,
      hitChance,
      evasion,
      critical,
      streak,
    ].filter(Boolean).join(', ');

  return baseLabel;
}

function activeLogRow(
  event: CombatLiveEventReadModel,
  participants: CombatLiveParticipantReadModel[],
): CombatActiveLogRow | null {
  if (!isActiveCombatResultEvent(event)) {
    return null;
  }

  const actorLabel = participantLabel(
    participants,
    event.actorParticipantId,
    event.actorDisplayName,
  );
  const targetLabel = participantLabel(
    participants,
    event.targetParticipantId,
    event.targetDisplayName,
  );
  const attackSourceLabel = activeLogAttackSourceLabel(event.attackSourceLabel);
  const actionText = playerFacingText(event.displayText)
    ?? playerFacingText(event.eventLabel)
    ?? playerFacingText(event.detailText)
    ?? 'Zdarzenie walki';
  const outcome = combatLogOutcome(
    event,
    event.presentationKind,
    event.eventKind,
    actionText,
  );
  const body = actionResultBody(
    actionText,
    actorLabel,
    targetLabel,
    attackSourceLabel,
    outcome,
  );

  return {
    id: String(event.eventIndex),
    actorLabel: actorLabel ?? 'Walka',
    bodyPrefix: body.prefix,
    attackSourceLabel: body.attackSourceLabel,
    bodySuffix: body.suffix,
    detailLines: uniquePlayerFacingText(
      [event.detailText],
      [body.text, actionText, event.damageDisplay],
    ),
    resultLabel: combatResultLabel(event.damageDisplay, outcome),
    tone: combatLogTone(event, actionText),
  };
}

function isActiveCombatResultEvent(event: CombatLiveEventReadModel): boolean {
  const actionText = playerFacingText(event.displayText)
    ?? playerFacingText(event.eventLabel)
    ?? playerFacingText(event.detailText)
    ?? '';

  return playerFacingText(event.damageDisplay) !== null ||
    isCombatResultPresentationKind(event.presentationKind) ||
    isCombatResultPresentationKind(event.eventKind) ||
    combatLogOutcomeFromEventFlags(event) !== 'unknown' ||
    combatLogOutcomeFromPlayerText(actionText) !== 'unknown';
}

function participantLabel(
  participants: CombatLiveParticipantReadModel[],
  participantId: string | null,
  displayName: string | null,
): string | null {
  return playerFacingText(displayName)
    ?? (
      participantId
        ? participants.find((participant) => participant.participantId === participantId)?.displayName ?? null
        : null
    );
}

function combatLogTone(
  event: CombatLiveEventReadModel,
  actionText: string,
): CombatLogTone {
  switch (combatLogOutcome(event, event.presentationKind, event.eventKind, actionText)) {
    case 'critical':
    case 'lethal':
    case 'danger':
      return 'danger';
    case 'damage':
      return 'golden';
    case 'miss':
    case 'evade':
    case 'effect':
      return 'info';
    case 'heal':
      return 'success';
    default:
      return 'muted';
  }
}

function combatLogOutcome(
  event: CombatLiveEventReadModel,
  presentationKind: string | null,
  eventKind: string,
  actionText: string,
): CombatLogOutcome {
  const flagOutcome = combatLogOutcomeFromEventFlags(event);
  const presentationOutcome = combatLogOutcomeFromKind(presentationKind);
  const eventOutcome = combatLogOutcomeFromKind(eventKind);
  const textOutcome = combatLogOutcomeFromPlayerText(actionText);
  const outcomes = [flagOutcome, presentationOutcome, eventOutcome, textOutcome];

  for (const outcome of outcomes) {
    if (outcome === 'miss' || outcome === 'evade') {
      return outcome;
    }
  }

  for (const outcome of outcomes) {
    if (outcome === 'critical' || outcome === 'lethal' || outcome === 'danger') {
      return outcome;
    }
  }

  for (const outcome of outcomes) {
    if (outcome !== 'unknown') {
      return outcome;
    }
  }

  return 'unknown';
}

function combatLogOutcomeFromEventFlags(event: CombatLiveEventReadModel): CombatLogOutcome {
  if (event.evaded === true) {
    return 'evade';
  }

  if (event.timingHit === false) {
    return 'miss';
  }

  if (event.critical === true) {
    return 'critical';
  }

  if (event.timingHit === true) {
    return 'damage';
  }

  return 'unknown';
}

function combatLogOutcomeFromKind(value: string | null): CombatLogOutcome {
  switch (value?.trim().toLowerCase()) {
    case 'critical':
    case 'crit':
    case 'critical_hit':
    case 'critical-hit':
      return 'critical';
    case 'danger':
      return 'danger';
    case 'lethal':
    case 'lethal_hit':
    case 'lethal-hit':
      return 'lethal';
    case 'damage':
    case 'hit':
    case 'normal_damage':
    case 'normal-damage':
    case 'attack_hit':
    case 'attack-hit':
      return 'damage';
    case 'miss':
    case 'missed':
    case 'attack_miss':
    case 'attack-miss':
    case 'attack_missed':
    case 'attack-missed':
      return 'miss';
    case 'evade':
    case 'evaded':
    case 'evasion':
    case 'attack_evade':
    case 'attack-evade':
    case 'attack_evaded':
    case 'attack-evaded':
      return 'evade';
    case 'heal':
    case 'healing':
    case 'success':
      return 'heal';
    case 'effect':
    case 'condition':
    case 'info':
      return 'effect';
    default:
      return 'unknown';
  }
}

function combatLogOutcomeFromPlayerText(value: string): CombatLogOutcome {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return 'unknown';
  }

  if (normalized.includes('chybia') || /\bmiss(?:es|ed)?\b/.test(normalized)) {
    return 'miss';
  }

  if (normalized.includes('unika') || /\bevade(?:s|d)?\b/.test(normalized)) {
    return 'evade';
  }

  return 'unknown';
}

function isCombatResultPresentationKind(value: string | null): boolean {
  switch (value?.trim().toLowerCase()) {
    case 'critical':
    case 'crit':
    case 'lethal':
    case 'danger':
    case 'damage':
    case 'hit':
    case 'normal_damage':
    case 'normal-damage':
    case 'miss':
    case 'evade':
    case 'evasion':
    case 'heal':
    case 'healing':
    case 'effect':
    case 'condition':
      return true;
    default:
      return false;
  }
}

interface CombatActiveLogBody {
  prefix: string;
  attackSourceLabel: string | null;
  suffix: string;
  text: string;
}

function actionResultBody(
  fallbackText: string,
  actorLabel: string | null,
  targetLabel: string | null,
  attackSourceLabel: string | null,
  outcome: CombatLogOutcome,
): CombatActiveLogBody {
  if (!actorLabel || !targetLabel || !attackSourceLabel) {
    return fallbackActionBody(fallbackText, actorLabel, attackSourceLabel);
  }

  const prefix = attackSourceLabel === 'gołymi rękami'
    ? `atakuje ${targetLabel} `
    : `atakuje ${targetLabel} przy użyciu: `;
  const suffix = actionResultSuffix(outcome);

  if (!suffix) {
    return fallbackActionBody(fallbackText, actorLabel, attackSourceLabel);
  }

  return {
    prefix,
    attackSourceLabel,
    suffix,
    text: `${prefix}${attackSourceLabel}${suffix}`,
  };
}

function fallbackActionBody(
  fallbackText: string,
  actorLabel: string | null,
  attackSourceLabel: string | null,
): CombatActiveLogBody {
  const text = actionBodyText(fallbackText, actorLabel);

  if (!attackSourceLabel) {
    return {
      prefix: text,
      attackSourceLabel: null,
      suffix: '',
      text,
    };
  }

  const sourceIndex = text.indexOf(attackSourceLabel);

  if (sourceIndex < 0) {
    return {
      prefix: text,
      attackSourceLabel: null,
      suffix: '',
      text,
    };
  }

  return {
    prefix: text.slice(0, sourceIndex),
    attackSourceLabel,
    suffix: text.slice(sourceIndex + attackSourceLabel.length),
    text,
  };
}

function actionResultSuffix(outcome: CombatLogOutcome): string | null {
  switch (outcome) {
    case 'critical':
      return ' i trafia krytycznie.';
    case 'damage':
    case 'lethal':
      return ' i trafia.';
    case 'miss':
    case 'evade':
      return '.';
    default:
      return null;
  }
}

function activeLogAttackSourceLabel(value: string | null): string | null {
  const text = playerFacingText(value);

  return text?.toLowerCase() === 'unarmed'
    ? 'gołymi rękami'
    : text;
}

function actionBodyText(text: string, actorLabel: string | null): string {
  if (!actorLabel || !text.startsWith(actorLabel)) {
    return text;
  }

  const withoutActor = text.slice(actorLabel.length).trim();

  return withoutActor || text;
}

function combatResultLabel(damageDisplay: string | null, outcome: CombatLogOutcome): string | null {
  switch (outcome) {
    case 'miss':
      return 'chybił';
    case 'evade':
      return 'unik';
    case 'critical':
    case 'lethal':
    case 'damage':
    case 'heal':
    case 'effect':
    case 'danger':
      break;
    default:
      return null;
  }

  const display = playerFacingText(damageDisplay);

  if (display) {
    return formatCombatLogResultLabel(display);
  }

  return null;
}

function uniquePlayerFacingText(
  values: Array<string | null>,
  excludedValues: Array<string | null> = [],
): string[] {
  const result: string[] = [];
  const excluded = excludedValues
    .map((value) => playerFacingText(value))
    .filter((value): value is string => value !== null);

  for (const value of values) {
    const text = playerFacingText(value);

    if (text && !excluded.includes(text) && !result.includes(text)) {
      result.push(text);
    }
  }

  return result;
}

function playerFacingText(value: string | null): string | null {
  const text = value?.trim();

  return text || null;
}

export function explorationCombatRequestId(
  challengeAttemptId: string,
  scope = 'action',
): string {
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `exploration-combat:${scope}:${challengeAttemptId}:${randomId}`;
}
