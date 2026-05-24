import {
  HeroDashboardDisplayDamageRow,
  HeroDashboardDisplayStatRow,
  HeroDashboardStatTone,
  HeroDashboardRuntimeStatsReadModel,
} from '../../domain/hero/hero-dashboard-runtime-stats.model';
import type { StatCardRow } from '../../types/stat-card.types';
import {
  colorableToneTextClass,
  toneTextClass,
} from '../../utils/stat-tone-class';

export interface DashboardStatValuePart {
  text: string;
  className: string;
}

export interface DashboardDerivedStatRow {
  key: string;
  label: string;
  value: string | null;
  valueClass: string;
  parts: DashboardStatValuePart[];
}

export interface DashboardHealthSource {
  currentHealth: number;
  maxHealth: number;
}

export function mapDashboardBaseStatRows(
  runtime: HeroDashboardRuntimeStatsReadModel | null,
): StatCardRow[] {
  return runtime?.displayStats.heroStats.map((row) => ({
    key: row.statKey,
    label: row.label,
    value: row.displayValue,
    valueClass: colorableToneTextClass(row.tone, row.colorableFinalValue, 'text-lg'),
  })) ?? [];
}

export function mapDashboardHealthDisplay(
  runtime: DashboardHealthSource | null,
): { currentHealth: number; maxHealth: number } {
  return {
    currentHealth: runtime?.currentHealth ?? 0,
    maxHealth: runtime?.maxHealth ?? 0,
  };
}

export function mapDashboardDerivedStatRows(
  runtime: HeroDashboardRuntimeStatsReadModel | null,
): DashboardDerivedStatRow[] {
  if (!runtime) {
    return [];
  }

  return [
    ...runtime.displayStats.damageRows.map(damageRow),
    ...orderDerivedStats(runtime.displayStats.derivedStats)
      .map(derivedStatRow),
  ];
}

function orderDerivedStats(
  rows: HeroDashboardDisplayStatRow[],
): HeroDashboardDisplayStatRow[] {
  const visibleRows = rows.filter((row) => row.statKey !== 'health');
  const luckRows = visibleRows.filter((row) => row.statKey === 'luck');
  const nonLuckRows = visibleRows.filter((row) => row.statKey !== 'luck');

  return [...nonLuckRows, ...luckRows];
}

function damageRow(row: HeroDashboardDisplayDamageRow): DashboardDerivedStatRow {
  const parts = damageParts(row);
  const value = parts.map((part) => part.text).join('');

  return {
    key: `damage-${row.key}`,
    label: row.label,
    value: value || row.displayValue || null,
    valueClass: 'text-md',
    parts: parts.length > 0
      ? parts
      : valueParts(row.displayValue, row.colorableFinalValue ? row.tone : 'neutral'),
  };
}

function derivedStatRow(row: HeroDashboardDisplayStatRow): DashboardDerivedStatRow {
  return {
    key: row.statKey,
    label: row.label,
    value: row.displayValue || null,
    valueClass: colorableToneTextClass(row.tone, row.colorableFinalValue, 'text-md'),
    parts: valueParts(
      row.displayValue,
      row.colorableFinalValue ? row.tone : 'neutral',
    ),
  };
}

function damageParts(row: HeroDashboardDisplayDamageRow): DashboardStatValuePart[] {
  if (!row.finalDamage.min) {
    return [];
  }

  if (!row.finalDamage.max) {
    return valueParts(
      row.finalDamage.min,
      row.colorableFinalValue ? row.minTone : 'neutral',
    );
  }

  return [
    ...valueParts(
      row.finalDamage.min,
      row.colorableFinalValue ? row.minTone : 'neutral',
    ),
    { text: '-', className: toneTextClass('neutral', 'text-md') },
    ...valueParts(
      row.finalDamage.max,
      row.colorableFinalValue ? row.maxTone : 'neutral',
    ),
  ];
}

function valueParts(
  value: string,
  tone: HeroDashboardStatTone,
): DashboardStatValuePart[] {
  return value ? [{ text: value, className: toneTextClass(tone, 'text-md') }] : [];
}
