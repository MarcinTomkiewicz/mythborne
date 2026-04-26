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
    'combat_hit_green_zone',
    'combat_balance',
    'Combat hit green zone',
    'Walking Dead green zone width for the active attack.',
    array['attackerDexterity', 'defenderAgility', 'hitBonusFromItems'],
    '{"attackerDexterity": 8, "defenderAgility": 6, "hitBonusFromItems": 0}'::jsonb,
    60
  ),
  (
    'combat_evasion_chance',
    'combat_balance',
    'Combat evasion chance',
    'Chance to evade after a successful timing hit.',
    array['defenderAgility', 'defenderLuck', 'evasionBonusFromItems'],
    '{"defenderAgility": 6, "defenderLuck": 5, "evasionBonusFromItems": 0}'::jsonb,
    70
  ),
  (
    'combat_critical_chance',
    'combat_balance',
    'Combat critical chance',
    'Chance for a successful attack to become critical.',
    array['attackerCunning', 'attackerLuck', 'critBonusFromItems'],
    '{"attackerCunning": 7, "attackerLuck": 5, "critBonusFromItems": 0}'::jsonb,
    80
  ),
  (
    'combat_final_damage',
    'combat_balance',
    'Combat final damage',
    'Final damage after crit multiplier and defender mitigation.',
    array['rolledDamage', 'critMultiplier', 'defenderDefense'],
    '{"rolledDamage": 12, "critMultiplier": 1, "defenderDefense": 5}'::jsonb,
    90
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
    'combat-hit-green-zone-default',
    'combat_balance',
    'Combat hit green zone / default',
    'clamp(12, 75, 45 + (attackerDexterity - defenderAgility) * 1.5 + hitBonusFromItems)',
    'Default Walking Dead green-zone width.',
    true
  ),
  (
    'combat-evasion-chance-default',
    'combat_balance',
    'Combat evasion chance / default',
    'clamp(0, 35, defenderAgility * 0.8 + defenderLuck * 0.2 + evasionBonusFromItems)',
    'Default chance to evade after a successful timing hit.',
    true
  ),
  (
    'combat-critical-chance-default',
    'combat_balance',
    'Combat critical chance / default',
    'clamp(0, 40, attackerCunning * 0.8 + attackerLuck * 0.2 + critBonusFromItems)',
    'Default critical strike chance.',
    true
  ),
  (
    'combat-final-damage-default',
    'combat_balance',
    'Combat final damage / default',
    'max(1, round(rolledDamage * critMultiplier) - defenderDefense)',
    'Default final damage after crit multiplier and defense.',
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
    (target.key = 'combat_hit_green_zone' and formula.key = 'combat-hit-green-zone-default')
    or (target.key = 'combat_evasion_chance' and formula.key = 'combat-evasion-chance-default')
    or (target.key = 'combat_critical_chance' and formula.key = 'combat-critical-chance-default')
    or (target.key = 'combat_final_damage' and formula.key = 'combat-final-damage-default')
  )
on conflict (target_id) do update
set
  formula_id = excluded.formula_id,
  updated_at = now();

insert into public.balance_formula_blocks (
  scope_key,
  category,
  label,
  token,
  helper_text,
  sort_order
)
values
  ('combat_balance', 'variables', 'attackerDexterity', 'attackerDexterity', 'Attacker Dexterity.', 10),
  ('combat_balance', 'variables', 'defenderAgility', 'defenderAgility', 'Defender Agility.', 20),
  ('combat_balance', 'variables', 'attackerCunning', 'attackerCunning', 'Attacker Cunning.', 30),
  ('combat_balance', 'variables', 'attackerLuck', 'attackerLuck', 'Attacker Luck.', 40),
  ('combat_balance', 'variables', 'defenderLuck', 'defenderLuck', 'Defender Luck.', 50),
  ('combat_balance', 'variables', 'defenderDefense', 'defenderDefense', 'Defender Defense.', 60),
  ('combat_balance', 'variables', 'rolledDamage', 'rolledDamage', 'Rolled base damage before mitigation.', 70),
  ('combat_balance', 'variables', 'critMultiplier', 'critMultiplier', 'Critical multiplier for the current strike.', 80),
  ('combat_balance', 'variables', 'hitBonusFromItems', 'hitBonusFromItems', 'Offensive hit bonus from equipment.', 90),
  ('combat_balance', 'variables', 'critBonusFromItems', 'critBonusFromItems', 'Critical chance bonus from equipment.', 100),
  ('combat_balance', 'variables', 'evasionBonusFromItems', 'evasionBonusFromItems', 'Evasion bonus from equipment.', 110),
  ('combat_balance', 'operators', '+', ' + ', 'Addition.', 120),
  ('combat_balance', 'operators', '-', ' - ', 'Subtraction.', 130),
  ('combat_balance', 'operators', '*', ' * ', 'Multiplication.', 140),
  ('combat_balance', 'operators', '/', ' / ', 'Division.', 150),
  ('combat_balance', 'functions', 'clamp()', 'clamp()', 'Keeps a value between minimum and maximum.', 160),
  ('combat_balance', 'functions', 'round()', 'round()', 'Standard rounding.', 170),
  ('combat_balance', 'functions', 'max()', 'max()', 'Maximum of values.', 180),
  ('combat_balance', 'functions', 'min()', 'min()', 'Minimum of values.', 190),
  ('combat_balance', 'literals', '0', '0', 'Numeric literal.', 200),
  ('combat_balance', 'literals', '1', '1', 'Numeric literal.', 210),
  ('combat_balance', 'literals', '12', '12', 'Numeric literal.', 220),
  ('combat_balance', 'literals', '35', '35', 'Numeric literal.', 230),
  ('combat_balance', 'literals', '40', '40', 'Numeric literal.', 240),
  ('combat_balance', 'literals', '45', '45', 'Numeric literal.', 250),
  ('combat_balance', 'literals', '75', '75', 'Numeric literal.', 260),
  ('combat_balance', 'literals', '0.2', '0.2', 'Numeric literal.', 270),
  ('combat_balance', 'literals', '0.8', '0.8', 'Numeric literal.', 280)
on conflict (scope_key, token) do update
set
  category = excluded.category,
  label = excluded.label,
  helper_text = excluded.helper_text,
  sort_order = excluded.sort_order;
