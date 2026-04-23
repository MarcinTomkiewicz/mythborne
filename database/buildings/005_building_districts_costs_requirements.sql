alter table public.buildings
  add column if not exists district_code text;

update public.buildings
set district_code = coalesce(nullif(btrim(district_code), ''), 'A')
where district_code is null or btrim(district_code) = '';

alter table public.buildings
  alter column district_code set default 'A',
  alter column district_code set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'buildings_district_code_fkey'
  ) then
    alter table public.buildings
      add constraint buildings_district_code_fkey
      foreign key (district_code)
      references public.estate_districts (code);
  end if;
end
$$;

create table if not exists public.building_resource_costs (
  id uuid not null default gen_random_uuid (),
  building_id uuid not null,
  resource_type text not null,
  base_value integer not null,
  applies_from_level integer not null default 1,
  sort_order bigint not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint building_resource_costs_pkey primary key (id),
  constraint building_resource_costs_building_id_fkey foreign key (building_id) references public.buildings (id) on delete cascade,
  constraint building_resource_costs_resource_type_check check (
    resource_type = any (array['drachma'::text, 'materials'::text, 'workforce'::text])
  ),
  constraint building_resource_costs_base_value_check check (base_value >= 0),
  constraint building_resource_costs_applies_from_level_check check (applies_from_level >= 1)
) tablespace pg_default;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'building_resource_costs_building_resource_level_key'
  ) then
    alter table public.building_resource_costs
      add constraint building_resource_costs_building_resource_level_key
      unique (building_id, resource_type, applies_from_level);
  end if;
end
$$;

create table if not exists public.building_requirements (
  id uuid not null default gen_random_uuid (),
  building_id uuid not null,
  requirement_type text not null,
  stat_key text null,
  min_value integer not null,
  applies_from_level integer not null default 1,
  sort_order bigint not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint building_requirements_pkey primary key (id),
  constraint building_requirements_building_id_fkey foreign key (building_id) references public.buildings (id) on delete cascade,
  constraint building_requirements_stat_key_fkey foreign key (stat_key) references public.stats (key),
  constraint building_requirements_type_check check (
    requirement_type = any (array['hero_level'::text, 'hero_rank'::text, 'hero_stat'::text])
  ),
  constraint building_requirements_min_value_check check (min_value >= 0),
  constraint building_requirements_applies_from_level_check check (applies_from_level >= 1),
  constraint building_requirements_stat_usage_check check (
    (requirement_type = 'hero_stat' and stat_key is not null)
    or (requirement_type <> 'hero_stat' and stat_key is null)
  )
) tablespace pg_default;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'building_requirements_building_type_stat_level_key'
  ) then
    alter table public.building_requirements
      add constraint building_requirements_building_type_stat_level_key
      unique (building_id, requirement_type, stat_key, applies_from_level);
  end if;
end
$$;

insert into public.building_resource_costs (
  building_id,
  resource_type,
  base_value,
  applies_from_level,
  sort_order
)
select
  id,
  'drachma',
  coalesce(base_cost, 0),
  1,
  10
from public.buildings
where coalesce(base_cost, 0) > 0
  and not exists (
    select 1
    from public.building_resource_costs cost
    where cost.building_id = buildings.id
      and cost.resource_type = 'drachma'
      and cost.applies_from_level = 1
  );
