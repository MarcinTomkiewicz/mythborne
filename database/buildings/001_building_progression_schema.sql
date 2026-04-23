alter table public.buildings
  add column if not exists key text,
  add column if not exists image_path text,
  add column if not exists sort_order bigint not null default 0,
  add column if not exists base_cost integer not null default 100,
  add column if not exists base_build_time_minutes integer not null default 60,
  add column if not exists max_level integer not null default 0,
  add column if not exists requirements jsonb not null default '{}'::jsonb;

update public.buildings
set key = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
where key is null or btrim(key) = '';

with ordered_buildings as (
  select
    id,
    row_number() over (
      order by rank_required asc, created_at asc nulls last, name asc
    ) * 10 as next_sort_order
  from public.buildings
)
update public.buildings as building
set sort_order = ordered_buildings.next_sort_order
from ordered_buildings
where building.id = ordered_buildings.id
  and coalesce(building.sort_order, 0) = 0;

update public.buildings
set image_path = '/images/buildings/' || key || '.png'
where image_path is null or btrim(image_path) = '';

alter table public.buildings
  alter column key set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'buildings_key_key'
  ) then
    alter table public.buildings
      add constraint buildings_key_key unique (key);
  end if;
end
$$;

alter table public.buildings
  drop constraint if exists buildings_max_level_check;

alter table public.buildings
  add constraint buildings_max_level_check check (max_level >= 0);

alter table public.buildings
  drop constraint if exists buildings_base_cost_check;

alter table public.buildings
  add constraint buildings_base_cost_check check (base_cost >= 0);

alter table public.buildings
  drop constraint if exists buildings_base_build_time_minutes_check;

alter table public.buildings
  add constraint buildings_base_build_time_minutes_check check (base_build_time_minutes >= 0);

alter table public.building_bonuses
  alter column building_id set not null,
  alter column template_id set not null;
