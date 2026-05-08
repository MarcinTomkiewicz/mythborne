import { PvpAttackResult } from '../../../core/domain/pvp/pvp.model';
import { Json } from '../../../core/types/database.types';
import {
  jsonRecord,
  JsonRecord,
  optionalNumber,
  read,
} from '../../../core/utils/json-read';

export interface PvpAttackResultDisplay {
  summaryFacts: PvpAttackResultDisplayRow[];
  combatantFacts: PvpAttackResultDisplayRow[];
  boundaryNotes: string[];
  sections: PvpAttackResultDisplaySection[];
}

export interface PvpAttackResultDisplaySection {
  title: string;
  rows: PvpAttackResultDisplayRow[];
  emptyText: string;
}

export interface PvpAttackResultDisplayRow {
  label: string;
  value: string;
}

export function pvpAttackResultDisplay(
  result: PvpAttackResult,
): PvpAttackResultDisplay {
  return {
    summaryFacts: [
      { label: 'Outcome', value: result.outcomeLabel },
      { label: 'Winner', value: winnerLabel(result) },
      { label: 'Created', value: dateTimeLabel(result.createdAt) },
      { label: 'Level difference', value: levelDifferenceLabel(result.levelDifference) },
    ],
    combatantFacts: [
      {
        label: 'Attacker',
        value: combatantLabel('Attacker', result.attacker.levelSnapshot, result),
      },
      {
        label: 'Defender',
        value: combatantLabel('Defender', result.defender.levelSnapshot, result),
      },
    ],
    boundaryNotes: [
      'Equipment is part of DB/runtime combat resolution and is not shown as a PvP reward.',
      'Ordinary PvP attacks do not transfer, steal or destroy items.',
    ],
    sections: [
      {
        title: 'Resources',
        rows: resourceRows(result.resourceOutcome.raw),
        emptyText: 'No resource changes were recorded.',
      },
      {
        title: 'XP and rewards',
        rows: rewardRows(result.rewardContext.raw),
        emptyText: 'No XP reward context was recorded.',
      },
      {
        title: 'Prestige',
        rows: prestigeRows(result.prestigeContext),
        emptyText: 'No future Prestige context was recorded.',
      },
    ],
  };
}

function resourceRows(value: Json): PvpAttackResultDisplayRow[] {
  const record = jsonRecord(value);
  return [
    numericRow(record, 'Drachma', 'drachmaDelta', 'drachma_delta'),
    numericRow(record, 'Materials', 'materialsDelta', 'materials_delta'),
    numericRow(record, 'Workforce', 'workforceDelta', 'workforce_delta'),
  ].filter((row): row is PvpAttackResultDisplayRow => row !== null);
}

function rewardRows(value: Json): PvpAttackResultDisplayRow[] {
  const record = jsonRecord(value);
  return [
    numericRow(
      record,
      'XP',
      'xp',
      'xpReward',
      'xp_reward',
      'experienceGained',
      'experience_gained',
    ),
  ].filter((row): row is PvpAttackResultDisplayRow => row !== null);
}

function prestigeRows(value: Json): PvpAttackResultDisplayRow[] {
  const record = jsonRecord(value);
  if (!record) {
    return [];
  }

  const hasPrestigeContext = read(
    record,
    'prestigeDelta',
    'prestige_delta',
    'projectedPrestigeDelta',
    'projected_prestige_delta',
    'future',
    'isFuture',
    'is_future',
  ) !== undefined;

  return hasPrestigeContext
    ? [{
        label: 'Future Prestige context',
        value: 'Recorded for future processing',
      }]
    : [];
}

function numericRow(
  record: JsonRecord | null,
  label: string,
  ...keys: string[]
): PvpAttackResultDisplayRow | null {
  const value = optionalNumber(read(record, ...keys));
  return value === null ? null : { label, value: signedNumber(value) };
}

function combatantLabel(
  role: 'Attacker' | 'Defender',
  level: number,
  result: PvpAttackResult,
): string {
  const heroId = role === 'Attacker'
    ? result.attacker.heroId
    : result.defender.heroId;
  const outcome = heroId === result.winnerHeroId
    ? 'winner'
    : heroId === result.loserHeroId
      ? 'loser'
      : 'draw';

  return `${role} level ${level} - ${outcome}`;
}

function winnerLabel(result: PvpAttackResult): string {
  if (!result.winnerHeroId) {
    return 'Draw';
  }

  if (result.winnerHeroId === result.attacker.heroId) {
    return 'Attacker';
  }

  if (result.winnerHeroId === result.defender.heroId) {
    return 'Defender';
  }

  return 'Recorded in result';
}

function levelDifferenceLabel(value: number): string {
  if (value > 0) {
    return `Attacker +${value}`;
  }

  if (value < 0) {
    return `Defender +${Math.abs(value)}`;
  }

  return 'Even levels';
}

function signedNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function dateTimeLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
}
