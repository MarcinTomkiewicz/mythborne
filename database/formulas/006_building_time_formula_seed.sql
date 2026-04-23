insert into public.balance_formula_targets (
  key,
  scope_key,
  label,
  description,
  allowed_variables,
  default_test_context,
  sort_order
)
values (
  'building_upgrade_time',
  'building_balance',
  'Building upgrade time',
  'General formula for the next building level construction time in minutes.',
  array['level', 'baseTime', 'rank'],
  '{"level": 1, "baseTime": 60, "rank": 1}'::jsonb,
  35
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
values (
  'building-upgrade-time-default',
  'building_balance',
  'Building upgrade time / default',
  'roundUp(baseTime + level * max(1, roundUp(baseTime * 0.5, 1)) + (rank - 1) * 2, 1)',
  'Default build time curve for the next building level, expressed in minutes.',
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
  on target.key = 'building_upgrade_time'
 and formula.key = 'building-upgrade-time-default'
on conflict (target_id) do update
set
  formula_id = excluded.formula_id,
  updated_at = now();
