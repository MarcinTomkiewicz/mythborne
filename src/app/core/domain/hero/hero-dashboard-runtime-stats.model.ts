import type { StatTone } from '../../utils/stat-tone-class';

export type HeroDashboardStatTone = StatTone;

export interface HeroDashboardDisplayValueSegment {
  text: string;
  tone: HeroDashboardStatTone;
}

export interface HeroDashboardDisplayStatRow {
  statKey: string;
  label: string;
  displayValue: string;
  tone: HeroDashboardStatTone;
  colorableFinalValue: boolean;
  sortOrder: number;
  displaySegments?: HeroDashboardDisplayValueSegment[];
}

export interface HeroDashboardDisplayDamageValue {
  min: string | null;
  max: string | null;
}

export interface HeroDashboardDisplayDamageRow {
  key: string;
  label: string;
  displayValue: string;
  finalDamage: HeroDashboardDisplayDamageValue;
  minTone: HeroDashboardStatTone;
  maxTone: HeroDashboardStatTone;
  tone: HeroDashboardStatTone;
  colorableFinalValue: boolean;
  sortOrder: number;
  displaySegments?: HeroDashboardDisplayValueSegment[];
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
