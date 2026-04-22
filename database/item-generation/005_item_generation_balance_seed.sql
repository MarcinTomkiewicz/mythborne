insert into public.item_generation_qualities (
  key,
  label,
  multiplier,
  weight,
  sort_order,
  is_enabled
)
values
  ('normal', 'Normal', 1.000, 72, 10, true),
  ('quality', 'Quality', 1.500, 22, 20, true),
  ('outstanding', 'Outstanding', 2.000, 6, 30, true)
on conflict (key) do update
set
  label = excluded.label,
  multiplier = excluded.multiplier,
  weight = excluded.weight,
  sort_order = excluded.sort_order,
  is_enabled = excluded.is_enabled;

update public.item_generation_bucket_profiles
set is_active = false
where key <> 'default-drop-profile';

insert into public.item_generation_bucket_profiles (
  key,
  name,
  description,
  bucket_count,
  base_value,
  linear_growth,
  growth_factor,
  rounding_step,
  min_increment,
  is_active
)
values (
  'default-drop-profile',
  'Default Drop Profile',
  'Budget buckets generated from an exponential-linear curve for the item generator.',
  6,
  300,
  120,
  1.430,
  50,
  50,
  true
)
on conflict (key) do update
set
  name = excluded.name,
  description = excluded.description,
  bucket_count = excluded.bucket_count,
  base_value = excluded.base_value,
  linear_growth = excluded.linear_growth,
  growth_factor = excluded.growth_factor,
  rounding_step = excluded.rounding_step,
  min_increment = excluded.min_increment,
  is_active = excluded.is_active;
