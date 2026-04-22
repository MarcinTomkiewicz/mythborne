create table if not exists public.item_generation_qualities (
  id uuid not null default gen_random_uuid(),
  key text not null,
  label text not null,
  multiplier numeric(8, 3) not null check (multiplier > 0),
  weight integer not null check (weight >= 0),
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint item_generation_qualities_pkey primary key (id),
  constraint item_generation_qualities_key_key unique (key)
) tablespace pg_default;

create table if not exists public.item_generation_bucket_profiles (
  id uuid not null default gen_random_uuid(),
  key text not null,
  name text not null,
  description text,
  bucket_count integer not null check (bucket_count > 0),
  base_value integer not null check (base_value > 0),
  linear_growth integer not null default 0 check (linear_growth >= 0),
  growth_factor numeric(8, 3) not null check (growth_factor >= 1),
  rounding_step integer not null check (rounding_step > 0),
  min_increment integer not null check (min_increment > 0),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint item_generation_bucket_profiles_pkey primary key (id),
  constraint item_generation_bucket_profiles_key_key unique (key)
) tablespace pg_default;
