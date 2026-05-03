import { Row } from '../types/supabase.types';
import {
  mapLevelUpStatBonusGrant,
  mapLevelUpStatBonusRule,
  mapLevelUpStatBonusRuleStat,
  toLevelUpStatBonusAdminData,
  toLevelUpStatBonusGrantViews,
} from './level-up-stat-bonus-mappers';

describe('level-up stat bonus mappers', () => {
  it('maps fixed and random level-up stat bonus rules into admin views', () => {
    const fixed = mapLevelUpStatBonusRule(ruleRow({
      id: 'rule-fixed',
      key: 'fixed_strength',
      label: 'Fixed Strength',
      rule_kind: 'fixed_stat',
      fixed_stat_key: 'strength',
      fixed_amount: 1,
      level_match_kind: 'exact',
      level_value: 2,
    }));
    const random = mapLevelUpStatBonusRule(ruleRow({
      id: 'rule-random',
      key: 'random_core',
      label: 'Random Core',
      rule_kind: 'random_pool',
      min_total_amount: 1,
      max_total_amount: 3,
      level_match_kind: 'interval',
      level_value: 5,
      level_interval: 5,
      sort_order: 20,
    }));
    const poolStat = mapLevelUpStatBonusRuleStat(ruleStatRow({
      rule_id: 'rule-random',
      stat_key: 'dexterity',
      weight: 4,
      max_points_per_level: 2,
    }));

    const data = toLevelUpStatBonusAdminData({
      rules: [random, fixed],
      ruleStats: [poolStat],
      stats: [
        { key: 'strength', label: 'Strength' },
        { key: 'dexterity', label: 'Dexterity' },
      ],
    });

    expect(data.ruleViews[0]).toEqual(jasmine.objectContaining({
      fixedStatLabel: 'Strength (strength)',
      amountLabel: '+1',
    }));
    expect(data.ruleViews[0].rule.levelMatchLabel).toBe('Reached level 2');
    expect(data.ruleViews[1]).toEqual(jasmine.objectContaining({
      amountLabel: '+1..3',
      activeRandomStatCount: 1,
    }));
    expect(data.ruleViews[1].randomStats[0]).toEqual(jasmine.objectContaining({
      statLabel: 'Dexterity (dexterity)',
    }));
    expect(data.ruleViews[1].rule.levelMatchLabel).toBe('Every 5 levels from 5');
  });

  it('maps actual grant rows without hiding random outcomes in metadata', () => {
    const grant = mapLevelUpStatBonusGrant(grantRow());
    const rule = mapLevelUpStatBonusRule(ruleRow({
      id: 'rule-random',
      key: 'random_core',
      label: 'Random Core',
      rule_kind: 'random_pool',
    }));
    const ruleStat = mapLevelUpStatBonusRuleStat(ruleStatRow({
      id: 'rule-stat-dex',
      rule_id: 'rule-random',
      stat_key: 'dexterity',
    }));

    const [view] = toLevelUpStatBonusGrantViews({
      grants: [grant],
      rules: [rule],
      ruleStats: [ruleStat],
      stats: [{ key: 'dexterity', label: 'Dexterity' }],
    });

    expect(view).toEqual(jasmine.objectContaining({
      statLabel: 'Dexterity (dexterity)',
      ruleLabel: 'Random Core (random_core)',
      ruleStatLabel: 'Dexterity (dexterity)',
      valueChangeLabel: '10 -> 12',
    }));
    expect(view.grant).toEqual(jasmine.objectContaining({
      amount: 2,
      valueBefore: 10,
      valueAfter: 12,
      randomTotalAmount: 3,
      randomWeightSnapshot: 4,
    }));
  });
});

function ruleRow(
  overrides: Partial<Row<'level_up_stat_bonus_rules'>> = {},
): Row<'level_up_stat_bonus_rules'> {
  return {
    id: 'rule-1',
    key: 'rule_key',
    label: 'Rule label',
    description: 'Rule description',
    helper_text: null,
    admin_description: null,
    rule_kind: 'fixed_stat',
    fixed_stat_key: 'strength',
    fixed_amount: 1,
    min_total_amount: null,
    max_total_amount: null,
    level_match_kind: 'any',
    level_value: null,
    max_level_value: null,
    level_interval: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_by: null,
    updated_by: null,
    created_at: '2026-05-03T09:00:00.000Z',
    updated_at: '2026-05-03T09:00:00.000Z',
    ...overrides,
  };
}

function ruleStatRow(
  overrides: Partial<Row<'level_up_stat_bonus_rule_stats'>> = {},
): Row<'level_up_stat_bonus_rule_stats'> {
  return {
    id: 'rule-stat-1',
    rule_id: 'rule-1',
    stat_key: 'strength',
    weight: 1,
    max_points_per_level: null,
    helper_text: null,
    admin_description: null,
    sort_order: 10,
    is_active: true,
    metadata_json: {},
    created_by: null,
    updated_by: null,
    created_at: '2026-05-03T09:00:00.000Z',
    updated_at: '2026-05-03T09:00:00.000Z',
    ...overrides,
  };
}

function grantRow(): Row<'hero_level_stat_bonus_grants'> {
  return {
    id: 'grant-1',
    hero_id: 'hero-1',
    server_id: 'server-1',
    level_up_ledger_id: 'level-ledger-1',
    parent_experience_ledger_id: 'ledger-1',
    rule_id: 'rule-random',
    rule_stat_id: 'rule-stat-dex',
    stat_key: 'dexterity',
    grant_kind: 'random_pool',
    amount: 2,
    value_before: 10,
    value_after: 12,
    reached_level: 2,
    random_total_amount: 3,
    random_weight_snapshot: 4,
    metadata_json: { roll: 0.42 },
    created_by: 'system',
    created_at: '2026-05-03T10:00:00.000Z',
  };
}
