import { IHeroStats } from '../../interfaces/hero/i-hero-stats';

export interface CombatDerivedStats {
  health: number;
  def: number;
  luck: number;
  minDmg: number;
  maxDmg: number;
  critical: number;
  evasion: number;
}

export interface CombatBonusSnapshot {
  hitBonusFromItems: number;
  critBonusFromItems: number;
  evasionBonusFromItems: number;
  damageBonusFromItems: number;
}

export interface CombatantSnapshot {
  key: string;
  name: string;
  level: number;
  baseStats: IHeroStats;
  derived: CombatDerivedStats;
  bonuses: CombatBonusSnapshot;
}

export type CombatEntryResult = 'miss' | 'evaded' | 'hit' | 'critical';
export type CombatOutcome = 'victory' | 'draw' | 'defeat';

export interface CombatRoundEntry {
  turn: number;
  attackerKey: string;
  attackerName: string;
  defenderKey: string;
  defenderName: string;
  indicatorPosition: number | null;
  hitWindowStart: number;
  hitWindowEnd: number;
  hitWindowWidth: number;
  hitChance: number;
  evasionChance: number;
  criticalChance: number;
  rawDamage: number;
  damage: number;
  defenderHealthAfter: number;
  wasCritical: boolean;
  wasDodged: boolean;
  result: CombatEntryResult;
}

export interface CombatResult {
  outcome: CombatOutcome;
  winnerKey: string | null;
  loserKey: string | null;
  rounds: CombatRoundEntry[];
  heroRemainingHealth: number;
  enemyRemainingHealth: number;
  turnsPlayed: number;
}

export interface CombatAssignedFormula {
  targetKey: string;
  targetLabel: string;
  expression: string;
}

export interface CombatBalanceRules {
  hitWindow: CombatAssignedFormula;
  evasionChance: CombatAssignedFormula;
  criticalChance: CombatAssignedFormula;
  finalDamage: CombatAssignedFormula;
}
