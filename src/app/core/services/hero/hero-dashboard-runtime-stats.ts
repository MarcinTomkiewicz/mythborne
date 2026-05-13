import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { Json } from '../../types/database.types';
import {
  GetHeroDashboardRuntimeStatsRpcArgs,
  GetHeroDashboardRuntimeStatsRpcRow,
} from '../../types/hero-runtime-stats-rpc.types';
import {
  JsonRecord,
  jsonRecord,
  optionalNumber,
  optionalText,
  read,
} from '../../utils/json-read';
import { Backend } from '../backend/backend';
import { ActiveHero } from './active-hero';

export interface HeroRuntimeDamageRow {
  key: string;
  label: string;
  displayValue: string;
}

export interface HeroDashboardRuntimeStatsReadModel {
  heroId: string;
  damageRows: HeroRuntimeDamageRow[];
  stats: Record<string, number>;
  defense: number;
  currentHealth: number;
  maxHealth: number;
  luck: number;
  criticalChanceBonus: number;
  criticalDamage: number;
  evasionChanceBonus: number;
  attackCount: number;
  attackPlanJson: Json;
  sourceJson: Json;
  statsJson: Json;
}

@Injectable({ providedIn: 'root' })
export class HeroDashboardRuntimeStats {
  private readonly activeHero = inject(ActiveHero);
  private readonly backend = inject(Backend);

  getActiveHeroRuntimeStats(): Observable<HeroDashboardRuntimeStatsReadModel> {
    return this.activeHero.requireActiveHero().pipe(
      switchMap((context) => this.getRuntimeStats(context.heroId).pipe(
        map((stats) => {
          if (this.activeHero.state()?.heroId !== context.heroId) {
            throw new Error('Dashboard runtime stats context changed.');
          }

          return stats;
        }),
      )),
    );
  }

  getRuntimeStats(heroId: string): Observable<HeroDashboardRuntimeStatsReadModel> {
    const args: GetHeroDashboardRuntimeStatsRpcArgs = {
      p_hero_id: heroId,
    };

    return this.backend
      .rpc<GetHeroDashboardRuntimeStatsRpcRow[]>(
        RPC.get_hero_dashboard_runtime_stats,
        args,
      )
      .pipe(
        map((rows) => {
          const row = firstRow(rows, RPC.get_hero_dashboard_runtime_stats);

          if (row.hero_id !== heroId) {
            throw new Error('Dashboard runtime stats returned a row for a different hero.');
          }

          return mapHeroDashboardRuntimeStats(row);
        }),
      );
  }
}

function mapHeroDashboardRuntimeStats(
  row: GetHeroDashboardRuntimeStatsRpcRow,
): HeroDashboardRuntimeStatsReadModel {
  return {
    heroId: row.hero_id,
    damageRows: mapDamageRows(row.damage_rows_json),
    stats: mapStats(row.stats_json),
    defense: row.defense,
    currentHealth: row.current_health,
    maxHealth: row.max_health,
    luck: row.luck,
    criticalChanceBonus: row.critical_chance_bonus,
    criticalDamage: row.critical_damage,
    evasionChanceBonus: row.evasion_chance_bonus,
    attackCount: row.attack_count,
    attackPlanJson: row.attack_plan_json,
    sourceJson: row.source_json,
    statsJson: row.stats_json,
  };
}

function mapStats(value: Json): Record<string, number> {
  const record = jsonRecord(value);

  if (!record) {
    return {};
  }

  return Object.entries(record).reduce((stats, [key, entry]) => {
    const value = optionalNumber(entry);

    if (value !== null) {
      stats[key] = value;
    }

    return stats;
  }, {} as Record<string, number>);
}

function mapDamageRows(value: Json): HeroRuntimeDamageRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry, index) => {
    const record = jsonRecord(entry);
    return record ? [mapDamageRow(record, index)] : [];
  });
}

function mapDamageRow(row: JsonRecord, index: number): HeroRuntimeDamageRow {
  const key = optionalText(read(
    row,
    'key',
    'sourceKey',
    'source_key',
    'slotKey',
    'slot_key',
    'attackSourceKey',
    'attack_source_key',
  )) ?? `attack-${index + 1}`;
  const label = optionalText(read(
    row,
    'sourceLabel',
    'source_label',
    'label',
    'name',
    'slotLabel',
    'slot_label',
  )) ?? 'Attack source';

  return {
    key,
    label,
    displayValue: optionalText(read(
      row,
      'displayValue',
      'display_value',
      'valueLabel',
      'value_label',
      'damageDisplay',
      'damage_display',
    )) ?? damageRange(row),
  };
}

function damageRange(row: JsonRecord): string {
  const minDamage = optionalNumber(read(
    row,
    'minDamage',
    'min_damage',
    'finalMinDamage',
    'final_min_damage',
    'min',
  ));
  const maxDamage = optionalNumber(read(
    row,
    'maxDamage',
    'max_damage',
    'finalMaxDamage',
    'final_max_damage',
    'max',
  ));

  if (minDamage !== null && maxDamage !== null) {
    return `${minDamage}-${maxDamage}`;
  }

  return minDamage !== null ? `${minDamage}` : '';
}

function firstRow<T>(rows: readonly T[], rpcName: string): T {
  const row = rows[0];

  if (!row) {
    throw new Error(`${rpcName} returned no runtime stats row.`);
  }

  return row;
}
