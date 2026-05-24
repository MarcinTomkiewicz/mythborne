import type { CombatLiveParticipantStatRow } from '../domain/combat/combat-live.model';
import type { StatCardRow } from '../types/stat-card.types';
import { colorableToneTextClass } from './stat-tone-class';

export function mapCombatParticipantBaseStatCardRows(
  rows: readonly CombatLiveParticipantStatRow[],
): StatCardRow[] {
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    value: row.displayValue,
    valueClass: colorableToneTextClass(row.tone, row.colorableFinalValue),
  }));
}

export function mapCombatParticipantStatCardRows(
  rows: readonly CombatLiveParticipantStatRow[],
): StatCardRow[] {
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    value: row.displayValue,
    valueClass: 'color-heading',
  }));
}
