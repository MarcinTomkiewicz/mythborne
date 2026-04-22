create table if not exists public.item_generation_bases (
  id uuid not null default gen_random_uuid(),
  key text not null,
  name text not null,
  slot text not null check (slot in ('weapon', 'trinket', 'armor', 'shield')),
  base_value integer not null check (base_value > 0),
  description text,
  created_at timestamptz not null default now(),
  constraint item_generation_bases_pkey primary key (id),
  constraint item_generation_bases_key_key unique (key)
) tablespace pg_default;

create table if not exists public.item_generation_affixes (
  id uuid not null default gen_random_uuid(),
  key text not null,
  kind text not null check (kind in ('prefix', 'suffix')),
  name text not null,
  gold_value integer not null check (gold_value >= 0),
  description text,
  created_at timestamptz not null default now(),
  constraint item_generation_affixes_pkey primary key (id),
  constraint item_generation_affixes_key_key unique (key)
) tablespace pg_default;

create table if not exists public.item_generation_base_bonuses (
  id uuid not null default gen_random_uuid(),
  base_id uuid not null,
  template_id uuid not null,
  value integer not null,
  constraint item_generation_base_bonuses_pkey primary key (id),
  constraint item_generation_base_bonuses_base_template_key unique (base_id, template_id),
  constraint item_generation_base_bonuses_base_id_fkey foreign key (base_id) references public.item_generation_bases (id) on delete cascade,
  constraint item_generation_base_bonuses_template_id_fkey foreign key (template_id) references public.bonus_templates (id) on delete restrict
) tablespace pg_default;

create table if not exists public.item_generation_affix_bonuses (
  id uuid not null default gen_random_uuid(),
  affix_id uuid not null,
  template_id uuid not null,
  value integer not null,
  constraint item_generation_affix_bonuses_pkey primary key (id),
  constraint item_generation_affix_bonuses_affix_template_key unique (affix_id, template_id),
  constraint item_generation_affix_bonuses_affix_id_fkey foreign key (affix_id) references public.item_generation_affixes (id) on delete cascade,
  constraint item_generation_affix_bonuses_template_id_fkey foreign key (template_id) references public.bonus_templates (id) on delete restrict
) tablespace pg_default;
