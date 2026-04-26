do $$
begin
  if not exists (select 1 from pg_type where typname = 'bonus_context') then
    create type public.bonus_context as enum (
      'global',
      'pvp_attack',
      'pvp_defense',
      'exploration',
      'trial',
      'combat',
      'economy',
      'building_management'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'bonus_type_v2') then
    create type public.bonus_type_v2 as enum (
      'flat',
      'percent',
      'per_levels',
      'scaled_stat_bonus',
      'resource_flat',
      'resource_percent',
      'capacity_flat',
      'unlock_feature'
    );
  end if;
end $$;

create table if not exists public.bonus_targets (
  id uuid not null default gen_random_uuid(),
  key text not null,
  label text not null,
  kind text not null,
  description text null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint bonus_targets_pkey primary key (id),
  constraint bonus_targets_key_key unique (key)
) tablespace pg_default;

insert into public.bonus_targets (key, label, kind, description, sort_order)
select
  key,
  label,
  'stat',
  null,
  coalesce("order", 0) * 10
from public.stats
on conflict (key) do update
set
  label = excluded.label,
  kind = excluded.kind,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.bonus_targets (key, label, kind, description, sort_order)
select
  key,
  label,
  'derived_stat',
  null,
  coalesce("order", 0) * 10 + 1000
from public.stats_derived
on conflict (key) do update
set
  label = excluded.label,
  kind = excluded.kind,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.bonus_targets (key, label, kind, description, sort_order)
values
  ('drachma', 'Drachma', 'resource', 'Economy resource bonus target.', 2000),
  ('materials', 'Materials', 'resource', 'Economy resource bonus target.', 2010),
  ('workforce', 'Workforce', 'resource', 'Economy resource bonus target.', 2020),
  ('itemCapacity', 'Item Capacity', 'capacity', 'Inventory or item capacity bonus target.', 3000),
  ('buildingCapacity', 'Building Capacity', 'capacity', 'Building capacity bonus target.', 3010),
  ('visibility', 'Visibility', 'capacity', 'Visibility or sight range target.', 3020),
  ('armory', 'Armory', 'feature', 'Feature unlock target.', 4000),
  ('trade', 'Trade', 'feature', 'Feature unlock target.', 4010),
  ('explorationMap', 'Exploration Map', 'feature', 'Feature unlock target.', 4020),
  ('trialAccess', 'Trial Access', 'feature', 'Feature unlock target.', 4030)
on conflict (key) do update
set
  label = excluded.label,
  kind = excluded.kind,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

alter table public.bonus_templates
  add column if not exists key text,
  add column if not exists label text,
  add column if not exists category text not null default 'general',
  add column if not exists context text not null default 'global',
  add column if not exists base_value numeric(12, 3) not null default 0,
  add column if not exists levels_step integer null,
  add column if not exists source_stat text null,
  add column if not exists scaling_factor numeric(12, 3) null,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true;

update public.bonus_templates
set target = case
  when target = 'min_dmg' then 'minDmg'
  when target = 'max_dmg' then 'maxDmg'
  else target
end;

update public.bonus_templates
set
  key = lower(regexp_replace(coalesce(target, 'bonus') || '-' || coalesce(type::text, 'flat'), '[^a-zA-Z0-9]+', '-', 'g')),
  label = initcap(replace(coalesce(target, 'Bonus'), '_', ' ')) || ' / ' || coalesce(type::text, 'flat'),
  category = coalesce(nullif(btrim(category), ''), 'general'),
  context = coalesce(nullif(btrim(context), ''), 'global'),
  sort_order = coalesce(sort_order, 0),
  is_active = coalesce(is_active, true)
where key is null
   or label is null
   or btrim(key) = ''
   or btrim(label) = '';

update public.bonus_templates
set
  levels_step = 4
where coalesce(type::text, 'flat') = 'per_4_levels'
  and levels_step is null;

alter table public.bonus_templates
  alter column type drop default;

alter table public.bonus_templates
  alter column type type public.bonus_type_v2
  using (
    case
      when coalesce(type::text, 'flat') = 'per_4_levels' then 'per_levels'
      else coalesce(type::text, 'flat')
    end
  )::public.bonus_type_v2;

drop type if exists public.bonus_type;
alter type public.bonus_type_v2 rename to bonus_type;

alter table public.bonus_templates
  alter column context type public.bonus_context
  using coalesce(context::text, 'global')::public.bonus_context;

alter table public.bonus_templates
  drop constraint if exists bonus_templates_target_type_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bonus_templates_key_key'
  ) then
    alter table public.bonus_templates
      add constraint bonus_templates_key_key unique (key);
  end if;
end $$;

alter table public.bonus_templates
  alter column key set not null,
  alter column label set not null,
  alter column type set default 'flat'::public.bonus_type,
  alter column type set not null,
  alter column context set default 'global'::public.bonus_context,
  alter column context set not null;

alter table public.item_generation_base_bonuses
  add column if not exists base_value numeric(12, 3) not null default 0,
  add column if not exists levels_step integer null,
  add column if not exists source_stat text null,
  add column if not exists scaling_factor numeric(12, 3) null;

update public.item_generation_base_bonuses
set base_value = coalesce(base_value, value, 0);

alter table public.item_generation_affix_bonuses
  add column if not exists base_value numeric(12, 3) not null default 0,
  add column if not exists levels_step integer null,
  add column if not exists source_stat text null,
  add column if not exists scaling_factor numeric(12, 3) null;

update public.item_generation_affix_bonuses
set base_value = coalesce(base_value, value, 0);

alter table public.building_bonuses
  add column if not exists base_value numeric(12, 3) not null default 0,
  add column if not exists levels_step integer null,
  add column if not exists source_stat text null,
  add column if not exists scaling_factor numeric(12, 3) null;

update public.building_bonuses
set base_value = coalesce(base_value, value, 0);

alter table public.origin_bonuses
  add column if not exists base_value numeric(12, 3) not null default 0,
  add column if not exists levels_step integer null,
  add column if not exists source_stat text null,
  add column if not exists scaling_factor numeric(12, 3) null;

update public.origin_bonuses
set base_value = coalesce(base_value, value, 0);

alter table public.item_bonuses
  add column if not exists base_value numeric(12, 3) not null default 0,
  add column if not exists levels_step integer null,
  add column if not exists source_stat text null,
  add column if not exists scaling_factor numeric(12, 3) null;

update public.item_bonuses
set base_value = coalesce(base_value, value, 0);

update public.item_generation_base_bonuses as row
set levels_step = coalesce(row.levels_step, template.levels_step)
from public.bonus_templates as template
where row.template_id = template.id
  and template.type = 'per_levels'
  and row.levels_step is null;

update public.item_generation_affix_bonuses as row
set levels_step = coalesce(row.levels_step, template.levels_step)
from public.bonus_templates as template
where row.template_id = template.id
  and template.type = 'per_levels'
  and row.levels_step is null;

update public.building_bonuses as row
set levels_step = coalesce(row.levels_step, template.levels_step)
from public.bonus_templates as template
where row.template_id = template.id
  and template.type = 'per_levels'
  and row.levels_step is null;

update public.origin_bonuses as row
set levels_step = coalesce(row.levels_step, template.levels_step)
from public.bonus_templates as template
where row.template_id = template.id
  and template.type = 'per_levels'
  and row.levels_step is null;

update public.item_bonuses as row
set levels_step = coalesce(row.levels_step, template.levels_step)
from public.bonus_templates as template
where row.template_id = template.id
  and template.type = 'per_levels'
  and row.levels_step is null;
