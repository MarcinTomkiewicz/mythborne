insert into public.balance_formula_targets (
  key,
  scope_key,
  label,
  description,
  allowed_variables,
  default_test_context,
  sort_order
)
values
  (
    'hero_stat_upgrade_cost',
    'hero_progression',
    'Hero stat upgrade cost',
    'Cost in hero points required to raise one primary stat by one level.',
    array['heroLevel', 'level', 'statLevel'],
    '{"heroLevel": 1, "level": 1, "statLevel": 1}'::jsonb,
    10
  ),
  (
    'hero_stat_level_cap',
    'hero_progression',
    'Hero stat level cap',
    'Maximum allowed primary stat value for the current hero level.',
    array['heroLevel'],
    '{"heroLevel": 1}'::jsonb,
    20
  ),
  (
    'building_upgrade_cost',
    'building_balance',
    'Building upgrade cost',
    'General formula for pricing the next building level.',
    array['level', 'baseCost', 'rank'],
    '{"level": 1, "baseCost": 100, "rank": 1}'::jsonb,
    30
  ),
  (
    'building_bonus_growth',
    'building_balance',
    'Building bonus growth',
    'Scaling formula for bonuses granted by a building level.',
    array['level', 'baseBonus'],
    '{"level": 1, "baseBonus": 5}'::jsonb,
    40
  ),
  (
    'item_requirement_level',
    'item_balance',
    'Item required level',
    'Level requirement derived from the item power budget.',
    array['itemPower'],
    '{"itemPower": 300}'::jsonb,
    50
  )
on conflict (key) do update
set
  scope_key = excluded.scope_key,
  label = excluded.label,
  description = excluded.description,
  allowed_variables = excluded.allowed_variables,
  default_test_context = excluded.default_test_context,
  sort_order = excluded.sort_order;

insert into public.balance_formulas (
  key,
  scope_key,
  label,
  expression,
  description,
  is_enabled
)
values
  (
    'hero-stat-upgrade-cost-default',
    'hero_progression',
    'Hero stat upgrade cost / default',
    'roundUp(4 + level * 2 + pow(level, 1.45), 5)',
    'Default cost curve for raising a primary stat.',
    true
  ),
  (
    'hero-stat-level-cap-default',
    'hero_progression',
    'Hero stat level cap / default',
    'heroLevel + 4',
    'Default soft cap linking hero level to primary stat cap.',
    true
  ),
  (
    'building-upgrade-cost-default',
    'building_balance',
    'Building upgrade cost / default',
    'roundUp(baseCost + level * max(5, roundUp(baseCost * 0.1, 5)) + (rank - 1) * 5, 5)',
    'Default cost curve for building upgrades.',
    true
  ),
  (
    'building-bonus-growth-default',
    'building_balance',
    'Building bonus growth / default',
    'round(baseBonus + level * max(1, baseBonus * 0.15))',
    'Default bonus growth per building level.',
    true
  ),
  (
    'item-requirement-level-default',
    'item_balance',
    'Item required level / default',
    'max(1, floor(itemPower / 120))',
    'Default level requirement based on item power.',
    true
  )
on conflict (key) do update
set
  scope_key = excluded.scope_key,
  label = excluded.label,
  expression = excluded.expression,
  description = excluded.description,
  is_enabled = excluded.is_enabled,
  updated_at = now();

insert into public.balance_formula_assignments (target_id, formula_id)
select
  target.id,
  formula.id
from public.balance_formula_targets target
join public.balance_formulas formula
  on (
    (target.key = 'hero_stat_upgrade_cost' and formula.key = 'hero-stat-upgrade-cost-default')
    or (target.key = 'hero_stat_level_cap' and formula.key = 'hero-stat-level-cap-default')
    or (target.key = 'building_upgrade_cost' and formula.key = 'building-upgrade-cost-default')
    or (target.key = 'building_bonus_growth' and formula.key = 'building-bonus-growth-default')
    or (target.key = 'item_requirement_level' and formula.key = 'item-requirement-level-default')
  )
on conflict (target_id) do update
set
  formula_id = excluded.formula_id,
  updated_at = now();
