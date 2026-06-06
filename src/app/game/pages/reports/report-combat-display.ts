import {
  ReportCombatAttackRow,
  ReportCombatDisplayStatRow,
  ReportCombatParticipantRow,
  ReportCombatSection,
  ReportMissingSection,
} from '../../../core/domain/reports/report.model';
import {
  ReportDetailSectionEntry,
  ReportDetailSectionEntryRow,
} from '../../../core/domain/reports/report-section-display.model';

export function reportCombatEntries(
  section: ReportCombatSection | ReportMissingSection | null,
): readonly ReportDetailSectionEntry[] {
  if (!section) {
    return [];
  }

  if ('missing' in section) {
    return [{
      key: 'combat-missing',
      title: section.title,
      description: section.message,
      chips: [section.sourceLabel],
      lines: [section.summary],
      rows: [],
    }];
  }

  return [
    combatSummaryEntry(section),
    ...section.participants.map(combatParticipantEntry),
    ...section.attacks.map(combatAttackEntry),
  ];
}

function combatSummaryEntry(section: ReportCombatSection): ReportDetailSectionEntry {
  return {
    key: 'combat-summary',
    title: section.title,
    description: section.summary,
    chips: [
      section.sourceLabel,
      section.sourceTypeLabel,
      section.outcomeLabel,
      ...(section.winnerSideLabel ? [section.winnerSideLabel] : []),
      ...(section.loserSideLabel ? [section.loserSideLabel] : []),
    ],
    lines: section.narrativeLines,
    rows: [],
  };
}

function combatParticipantEntry(row: ReportCombatParticipantRow): ReportDetailSectionEntry {
  return {
    key: `combat-participant-${row.side}-${row.displayName}`,
    title: row.displayName,
    description: null,
    chips: [row.sideLabel, row.participantKindLabel],
    lines: [],
    rows: [
      ...combatStatRows(row.baseStatRows, 'base'),
      ...combatStatRows(row.combatStatRows, 'combat'),
    ],
  };
}

function combatAttackEntry(row: ReportCombatAttackRow): ReportDetailSectionEntry {
  return {
    key: `combat-attack-${row.turnNumber}-${row.attackOrder}`,
    title: row.eventLabel ?? row.attackSourceLabel ?? row.attackSourceKindLabel,
    description: row.displayText ?? row.detailText ?? row.summary,
    chips: [
      ...(row.actorDisplayName ? [row.actorDisplayName] : []),
      row.actorSideLabel,
      ...(row.targetDisplayName ? [row.targetDisplayName] : []),
      row.targetSideLabel,
      row.attackSourceKindLabel,
      ...(row.damageDisplay ? [row.damageDisplay] : []),
      ...(row.resultDisplay ? [row.resultDisplay] : []),
    ],
    lines: [],
    rows: [],
  };
}

function combatStatRows(
  rows: readonly ReportCombatDisplayStatRow[],
  keyPrefix: string,
): readonly ReportDetailSectionEntryRow[] {
  return rows.flatMap((row, index) => {
    const label = row.displayLabel ?? row.statLabel ?? row.label;
    const value = combatStatDisplayValue(row, `${keyPrefix}[${index}]`);
    return label && value
      ? [{ key: `${keyPrefix}-${index}-${label}`, label, value }]
      : [];
  });
}

function combatStatDisplayValue(row: ReportCombatDisplayStatRow, field: string): string | null {
  const value = row.displayValue ?? row.value ?? row.statValue ?? row.finalValue;

  if (value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}`;
  }

  throw new Error(`${field} display value must be a string or number.`);
}
