do $$
begin
  create type public.bonus_type as enum ('flat', 'percent', 'per_4_levels');
exception
  when duplicate_object then null;
end $$;

update public.bonus_templates
set target = case
  when target = 'min_dmg' then 'minDmg'
  when target = 'max_dmg' then 'maxDmg'
  else target
end;

update public.bonus_templates
set type = 'flat'
where type is null
   or type not in ('flat', 'percent', 'per_4_levels');

with duplicates as (
  select
    id as duplicate_id,
    first_value(id) over (partition by target, type order by id) as keep_id
  from public.bonus_templates
),
replacements as (
  select duplicate_id, keep_id
  from duplicates
  where duplicate_id <> keep_id
)
delete from public.item_generation_base_bonuses as target
using replacements,
      public.item_generation_base_bonuses as existing
where target.template_id = replacements.duplicate_id
  and existing.base_id = target.base_id
  and existing.template_id = replacements.keep_id;

with duplicates as (
  select
    id as duplicate_id,
    first_value(id) over (partition by target, type order by id) as keep_id
  from public.bonus_templates
),
replacements as (
  select duplicate_id, keep_id
  from duplicates
  where duplicate_id <> keep_id
)
update public.item_generation_base_bonuses as target
set template_id = replacements.keep_id
from replacements
where target.template_id = replacements.duplicate_id;

with duplicates as (
  select
    id as duplicate_id,
    first_value(id) over (partition by target, type order by id) as keep_id
  from public.bonus_templates
),
replacements as (
  select duplicate_id, keep_id
  from duplicates
  where duplicate_id <> keep_id
)
delete from public.item_generation_affix_bonuses as target
using replacements,
      public.item_generation_affix_bonuses as existing
where target.template_id = replacements.duplicate_id
  and existing.affix_id = target.affix_id
  and existing.template_id = replacements.keep_id;

with duplicates as (
  select
    id as duplicate_id,
    first_value(id) over (partition by target, type order by id) as keep_id
  from public.bonus_templates
),
replacements as (
  select duplicate_id, keep_id
  from duplicates
  where duplicate_id <> keep_id
)
update public.item_generation_affix_bonuses as target
set template_id = replacements.keep_id
from replacements
where target.template_id = replacements.duplicate_id;

with duplicates as (
  select
    id as duplicate_id,
    first_value(id) over (partition by target, type order by id) as keep_id
  from public.bonus_templates
),
replacements as (
  select duplicate_id, keep_id
  from duplicates
  where duplicate_id <> keep_id
)
update public.building_bonuses as target
set template_id = replacements.keep_id
from replacements
where target.template_id = replacements.duplicate_id;

with duplicates as (
  select
    id as duplicate_id,
    first_value(id) over (partition by target, type order by id) as keep_id
  from public.bonus_templates
),
replacements as (
  select duplicate_id, keep_id
  from duplicates
  where duplicate_id <> keep_id
)
update public.origin_bonuses as target
set template_id = replacements.keep_id
from replacements
where target.template_id = replacements.duplicate_id;

with duplicates as (
  select
    id as duplicate_id,
    first_value(id) over (partition by target, type order by id) as keep_id
  from public.bonus_templates
),
replacements as (
  select duplicate_id, keep_id
  from duplicates
  where duplicate_id <> keep_id
)
update public.item_bonuses as target
set template_id = replacements.keep_id
from replacements
where target.template_id = replacements.duplicate_id;

with duplicates as (
  select
    id as duplicate_id,
    first_value(id) over (partition by target, type order by id) as keep_id
  from public.bonus_templates
)
delete from public.bonus_templates as target
using duplicates
where target.id = duplicates.duplicate_id
  and duplicates.duplicate_id <> duplicates.keep_id;

alter table public.bonus_templates
  drop constraint if exists bonus_templates_type_check;

alter table public.bonus_templates
  alter column type type public.bonus_type
  using coalesce(type, 'flat')::public.bonus_type;

alter table public.bonus_templates
  alter column type set default 'flat'::public.bonus_type,
  alter column type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bonus_templates_target_type_key'
  ) then
    alter table public.bonus_templates
      add constraint bonus_templates_target_type_key unique (target, type);
  end if;
end $$;

insert into public.bonus_templates (target, type, description)
values
  ('critical', 'percent', 'Critical chance bonus in percent points'),
  ('evasion', 'percent', 'Evasion chance bonus in percent points'),
  ('health', 'per_4_levels', 'Adds health every 4 hero levels'),
  ('def', 'per_4_levels', 'Adds defence every 4 hero levels'),
  ('minDmg', 'per_4_levels', 'Adds minimum damage every 4 hero levels'),
  ('maxDmg', 'per_4_levels', 'Adds maximum damage every 4 hero levels'),
  ('luck', 'per_4_levels', 'Adds luck every 4 hero levels')
on conflict (target, type) do update
set description = excluded.description;
