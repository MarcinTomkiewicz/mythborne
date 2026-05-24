import type { StatTone } from '../../utils/stat-tone-class';

export type HeroDashboardStatTone = StatTone;

export interface HeroDashboardDisplayStatRow {
  statKey: string;
  label: string;
  displayValue: string;
  finalValue: string | number | null;
  tone: HeroDashboardStatTone;
  colorableFinalValue: boolean;
  sortOrder: number;
}

export interface HeroDashboardDisplayDamageValue {
  min: string | null;
  max: string | null;
}

export interface HeroDashboardDisplayDamageRow {
  key: string;
  label: string;
  displayValue: string;
  baseDamage: HeroDashboardDisplayDamageValue;
  finalDamage: HeroDashboardDisplayDamageValue;
  minDelta: number | null;
  maxDelta: number | null;
  minTone: HeroDashboardStatTone;
  maxTone: HeroDashboardStatTone;
  tone: HeroDashboardStatTone;
  colorableFinalValue: boolean;
  sortOrder: number;
}

export interface HeroDashboardDisplayStats {
  heroStats: HeroDashboardDisplayStatRow[];
  derivedStats: HeroDashboardDisplayStatRow[];
  damageRows: HeroDashboardDisplayDamageRow[];
}

export interface HeroDashboardRuntimeStatsReadModel {
  heroId: string;
  displayStats: HeroDashboardDisplayStats;
  defense: number;
  currentHealth: number;
  maxHealth: number;
  luck: number;
  criticalChanceBonus: number;
  criticalDamage: number;
  evasionChanceBonus: number;
  attackCount: number;
}
