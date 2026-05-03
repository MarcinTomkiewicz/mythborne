import {
  LEVEL_UP_STAT_BONUS_RULE_KIND,
  LevelUpStatBonusAdminData,
  LevelUpStatBonusGrantReadModel,
  LevelUpStatBonusGrantView,
  LevelUpStatBonusRuleReadModel,
  LevelUpStatBonusRuleStatReadModel,
  LevelUpStatBonusRuleView,
} from '../domain/progression/level-up-stat-bonus.model';
import { Row } from '../types/supabase.types';
import { levelMatchLabel } from './level-match-label';

export type StatLabelRow = Pick<Row<'stats'>, 'key' | 'label'>;

export function mapLevelUpStatBonusRule(
  row: Row<'level_up_stat_bonus_rules'>,
): LevelUpStatBonusRuleReadModel {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    ruleKind: row.rule_kind,
    ruleDisplayKind: ruleDisplayKind(row.rule_kind),
    ruleKindLabel: ruleKindLabel(row.rule_kind),
    fixedStatKey: row.fixed_stat_key,
    fixedAmount: row.fixed_amount,
    minTotalAmount: row.min_total_amount,
    maxTotalAmount: row.max_total_amount,
    levelMatchKind: row.level_match_kind,
    levelValue: row.level_value,
    maxLevelValue: row.max_level_value,
    levelInterval: row.level_interval,
    levelMatchLabel: levelMatchLabel({
      levelMatchKind: row.level_match_kind,
      levelValue: row.level_value,
      maxLevelValue: row.max_level_value,
      levelInterval: row.level_interval,
    }),
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLevelUpStatBonusRuleStat(
  row: Row<'level_up_stat_bonus_rule_stats'>,
): LevelUpStatBonusRuleStatReadModel {
  return {
    id: row.id,
    ruleId: row.rule_id,
    statKey: row.stat_key,
    weight: row.weight,
    maxPointsPerLevel: row.max_points_per_level,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLevelUpStatBonusGrant(
  row: Row<'hero_level_stat_bonus_grants'>,
): LevelUpStatBonusGrantReadModel {
  return {
    id: row.id,
    heroId: row.hero_id,
    serverId: row.server_id,
    levelUpLedgerId: row.level_up_ledger_id,
    parentExperienceLedgerId: row.parent_experience_ledger_id,
    ruleId: row.rule_id,
    ruleStatId: row.rule_stat_id,
    statKey: row.stat_key,
    grantKind: row.grant_kind,
    amount: row.amount,
    valueBefore: row.value_before,
    valueAfter: row.value_after,
    reachedLevel: row.reached_level,
    randomTotalAmount: row.random_total_amount,
    randomWeightSnapshot: row.random_weight_snapshot,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
  };
}

export function toLevelUpStatBonusAdminData(input: {
  rules: readonly LevelUpStatBonusRuleReadModel[];
  ruleStats: readonly LevelUpStatBonusRuleStatReadModel[];
  stats: readonly StatLabelRow[];
}): LevelUpStatBonusAdminData {
  const rules = [...input.rules].sort(ruleSort);
  const ruleStats = [...input.ruleStats].sort(ruleStatSort);

  return {
    rules,
    ruleStats,
    ruleViews: rules.map((rule) => toRuleView(rule, ruleStats, input.stats)),
  };
}

export function toLevelUpStatBonusGrantViews(input: {
  grants: readonly LevelUpStatBonusGrantReadModel[];
  rules: readonly LevelUpStatBonusRuleReadModel[];
  ruleStats: readonly LevelUpStatBonusRuleStatReadModel[];
  stats: readonly StatLabelRow[];
}): LevelUpStatBonusGrantView[] {
  return input.grants.map((grant) => {
    const rule = input.rules.find((entry) => entry.id === grant.ruleId);
    const ruleStat = input.ruleStats.find((entry) => entry.id === grant.ruleStatId);

    return {
      grant,
      statLabel: statLabel(input.stats, grant.statKey),
      ruleLabel: rule ? `${rule.label} (${rule.key})` : `Missing rule (${grant.ruleId})`,
      ruleStatLabel: ruleStat ? statLabel(input.stats, ruleStat.statKey) : null,
      valueChangeLabel: `${grant.valueBefore} -> ${grant.valueAfter}`,
    };
  });
}

function toRuleView(
  rule: LevelUpStatBonusRuleReadModel,
  ruleStats: readonly LevelUpStatBonusRuleStatReadModel[],
  stats: readonly StatLabelRow[],
): LevelUpStatBonusRuleView {
  const randomStats = ruleStats
    .filter((entry) => entry.ruleId === rule.id)
    .map((entry) => ({
      stat: entry,
      statLabel: statLabel(stats, entry.statKey),
    }));

  return {
    rule,
    fixedStatLabel: rule.fixedStatKey ? statLabel(stats, rule.fixedStatKey) : null,
    randomStats,
    amountLabel: amountLabel(rule),
    activeRandomStatCount: randomStats.filter((entry) => entry.stat.isActive).length,
  };
}

function ruleDisplayKind(ruleKind: string): LevelUpStatBonusRuleReadModel['ruleDisplayKind'] {
  if (ruleKind === LEVEL_UP_STAT_BONUS_RULE_KIND.fixedStat || ruleKind === 'fixed') {
    return 'fixed_stat';
  }

  if (ruleKind === LEVEL_UP_STAT_BONUS_RULE_KIND.randomPool || ruleKind === 'random') {
    return 'random_pool';
  }

  return 'unknown';
}

function ruleKindLabel(ruleKind: string): string {
  switch (ruleDisplayKind(ruleKind)) {
    case 'fixed_stat':
      return 'Fixed stat';
    case 'random_pool':
      return 'Random pool';
    default:
      return ruleKind;
  }
}

function amountLabel(rule: LevelUpStatBonusRuleReadModel): string {
  if (rule.ruleDisplayKind === 'fixed_stat') {
    return rule.fixedAmount === null ? 'Fixed amount not configured' : `+${rule.fixedAmount}`;
  }

  if (rule.minTotalAmount === null && rule.maxTotalAmount === null) {
    return 'Random amount not configured';
  }

  if (rule.minTotalAmount === rule.maxTotalAmount) {
    return `+${rule.minTotalAmount}`;
  }

  return `+${rule.minTotalAmount ?? '?'}..${rule.maxTotalAmount ?? '?'}`;
}

function statLabel(stats: readonly StatLabelRow[], statKey: string): string {
  const stat = stats.find((entry) => entry.key === statKey);
  return stat ? `${stat.label} (${stat.key})` : statKey;
}

function ruleSort(
  first: LevelUpStatBonusRuleReadModel,
  second: LevelUpStatBonusRuleReadModel,
): number {
  return first.sortOrder - second.sortOrder || first.label.localeCompare(second.label);
}

function ruleStatSort(
  first: LevelUpStatBonusRuleStatReadModel,
  second: LevelUpStatBonusRuleStatReadModel,
): number {
  return first.sortOrder - second.sortOrder || first.statKey.localeCompare(second.statKey);
}
