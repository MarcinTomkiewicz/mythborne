import { CombatDisplayDictionaries } from './combat-dictionary.model';
import {
  CombatBalanceRules,
  CombatantSnapshot,
} from './combat-sandbox.model';
import { HeroDashboardRuntimeStatsReadModel } from '../hero/hero-dashboard-runtime-stats.model';
import { Origin, OriginBonus } from '../origin/origin.model';
import { IStat } from '../../interfaces/i-stats/i-stats';

export interface CombatPageLoadedData {
  heroId: string;
  origin: Origin | null;
  originBonuses: OriginBonus[];
  statsDefinitions: IStat[];
  runtimeStats: HeroDashboardRuntimeStatsReadModel;
  rules: CombatBalanceRules;
  dictionaries: CombatDisplayDictionaries;
  hero: CombatantSnapshot;
  enemy: CombatantSnapshot;
}
