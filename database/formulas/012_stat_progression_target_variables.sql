update public.balance_formula_targets
set
  allowed_variables = array['heroLevel', 'level', 'statLevel'],
  default_test_context = '{"heroLevel": 1, "level": 1, "statLevel": 1}'::jsonb
where key = 'hero_stat_upgrade_cost';

insert into public.balance_formula_blocks (
  scope_key,
  category,
  label,
  token,
  helper_text,
  sort_order
)
values
  ('hero_progression', 'variables', 'statLevel', 'statLevel', 'Current tested stat level.', 30)
on conflict (scope_key, token) do update
set
  category = excluded.category,
  label = excluded.label,
  helper_text = excluded.helper_text,
  sort_order = excluded.sort_order;
