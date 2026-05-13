import { IStat } from '../../interfaces/i-stats/i-stats';
import { IHeroDerived } from '../../types/hero.types';
import {
  HeroDashboardRuntimeStatsReadModel,
  HeroRuntimeDamageRow,
} from './hero-dashboard-runtime-stats';

export interface DashboardBaseStatRow {
  key: string;
  label: string;
  value: number;
}

export interface DashboardDerivedStatRow {
  key: string;
  label: string;
  value: number | string;
  damageRows: HeroRuntimeDamageRow[];
}

export interface DashboardHealthSource {
  currentHealth: number;
  maxHealth: number;
}

export function mapDashboardBaseStatRows(
  statsList: IStat[],
  stats: Record<string, number>,
): DashboardBaseStatRow[] {
  return statsList
    .filter((stat) => Object.hasOwn(stats, stat.key))
    .map((stat) => ({
      key: stat.key,
      label: stat.label,
      value: stats[stat.key],
    }));
}

export function mapDashboardDerivedDisplay(
  runtime: HeroDashboardRuntimeStatsReadModel | null,
): IHeroDerived {
  return {
    health: runtime?.maxHealth ?? 0,
    def: runtime?.defense ?? 0,
    minDmg: 0,
    maxDmg: 0,
    luck: runtime?.luck ?? 0,
    critical: runtime?.criticalChanceBonus ?? 0,
    criticalDamage: runtime?.criticalDamage ?? 0,
    evasion: runtime?.evasionChanceBonus ?? 0,
  };
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
  return [
    {
      key: 'damage',
      label: 'Damage',
      value: runtime?.damageRows.length ? '' : 'No attack sources returned',
      damageRows: runtime?.damageRows ?? [],
    },
    derivedRow('defense', 'Defense', runtime?.defense ?? 0),
    derivedRow('luck', 'Luck', runtime?.luck ?? 0),
    derivedRow(
      'critical_chance',
      'Critical chance',
      percentValue(runtime?.criticalChanceBonus ?? 0),
    ),
    derivedRow(
      'critical_damage',
      'Critical damage',
      percentValue(runtime?.criticalDamage ?? 0),
    ),
    derivedRow(
      'evasion',
      'Evasion',
      percentValue(runtime?.evasionChanceBonus ?? 0),
    ),
    derivedRow('attack_count', 'Attack count', runtime?.attackCount ?? 0),
  ];
}

function derivedRow(
  key: string,
  label: string,
  value: number | string,
): DashboardDerivedStatRow {
  return {
    key,
    label,
    value,
    damageRows: [],
  };
}

function percentValue(value: number): string {
  return `${value}%`;
}
