import { Json } from '../../types/database.types';

export const LEVEL_UP_STAT_BONUS_RULE_KIND = {
  fixedStat: 'fixed_stat',
  randomPool: 'random_pool',
} as const;

export type LevelUpStatBonusRuleDisplayKind =
  | 'fixed_stat'
  | 'random_pool'
  | 'unknown';

export interface LevelUpStatBonusRuleReadModel {
  id: string;
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  ruleKind: string;
  ruleDisplayKind: LevelUpStatBonusRuleDisplayKind;
  ruleKindLabel: string;
  fixedStatKey: string | null;
  fixedAmount: number | null;
  minTotalAmount: number | null;
  maxTotalAmount: number | null;
  levelMatchKind: string;
  levelValue: number | null;
  maxLevelValue: number | null;
  levelInterval: number | null;
  levelMatchLabel: string;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface LevelUpStatBonusRuleStatReadModel {
  id: string;
  ruleId: string;
  statKey: string;
  weight: number;
  maxPointsPerLevel: number | null;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
  metadataJson: Json;
  createdAt: string;
  updatedAt: string;
}

export interface LevelUpStatBonusGrantReadModel {
  id: string;
  heroId: string;
  serverId: string;
  levelUpLedgerId: string;
  parentExperienceLedgerId: string | null;
  ruleId: string;
  ruleStatId: string | null;
  statKey: string;
  grantKind: string;
  amount: number;
  valueBefore: number;
  valueAfter: number;
  reachedLevel: number;
  randomTotalAmount: number | null;
  randomWeightSnapshot: number | null;
  metadataJson: Json;
  createdAt: string;
}

export interface LevelUpStatBonusRuleView {
  rule: LevelUpStatBonusRuleReadModel;
  fixedStatLabel: string | null;
  randomStats: LevelUpStatBonusRuleStatView[];
  amountLabel: string;
  activeRandomStatCount: number;
}

export interface LevelUpStatBonusRuleStatView {
  stat: LevelUpStatBonusRuleStatReadModel;
  statLabel: string;
}

export interface LevelUpStatBonusGrantView {
  grant: LevelUpStatBonusGrantReadModel;
  statLabel: string;
  ruleLabel: string;
  ruleStatLabel: string | null;
  valueChangeLabel: string;
}

export interface LevelUpStatBonusAdminData {
  rules: LevelUpStatBonusRuleReadModel[];
  ruleStats: LevelUpStatBonusRuleStatReadModel[];
  ruleViews: LevelUpStatBonusRuleView[];
}
