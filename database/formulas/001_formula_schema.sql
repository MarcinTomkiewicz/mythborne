create table if not exists public.balance_formula_targets (
  id uuid not null default gen_random_uuid(),
  key text not null,
  scope_key text not null,
  label text not null,
  description text null,
  allowed_variables text[] not null default '{}',
  default_test_context jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint balance_formula_targets_pkey primary key (id),
  constraint balance_formula_targets_key_key unique (key),
  constraint balance_formula_targets_default_test_context_object check (
    jsonb_typeof(default_test_context) = 'object'
  )
) tablespace pg_default;

create table if not exists public.balance_formulas (
  id uuid not null default gen_random_uuid(),
  key text not null,
  scope_key text not null,
  label text not null,
  expression text not null,
  description text null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint balance_formulas_pkey primary key (id),
  constraint balance_formulas_key_key unique (key)
) tablespace pg_default;

create table if not exists public.balance_formula_assignments (
  id uuid not null default gen_random_uuid(),
  target_id uuid not null,
  formula_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint balance_formula_assignments_pkey primary key (id),
  constraint balance_formula_assignments_target_id_key unique (target_id),
  constraint balance_formula_assignments_target_id_fkey
    foreign key (target_id) references public.balance_formula_targets (id)
    on delete cascade,
  constraint balance_formula_assignments_formula_id_fkey
    foreign key (formula_id) references public.balance_formulas (id)
    on delete cascade
) tablespace pg_default;

create index if not exists balance_formula_targets_scope_key_idx
  on public.balance_formula_targets (scope_key);

create index if not exists balance_formulas_scope_key_idx
  on public.balance_formulas (scope_key);

create index if not exists balance_formula_assignments_formula_id_idx
  on public.balance_formula_assignments (formula_id);
