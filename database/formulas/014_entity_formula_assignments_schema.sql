create table if not exists public.entity_formula_assignments (
  id uuid not null default gen_random_uuid(),
  entity_kind text not null,
  entity_id uuid not null,
  target_id uuid not null,
  formula_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entity_formula_assignments_pkey primary key (id),
  constraint entity_formula_assignments_entity_target_key unique (entity_kind, entity_id, target_id),
  constraint entity_formula_assignments_entity_kind_check check (entity_kind in ('building')),
  constraint entity_formula_assignments_target_id_fkey
    foreign key (target_id) references public.balance_formula_targets (id)
    on delete cascade,
  constraint entity_formula_assignments_formula_id_fkey
    foreign key (formula_id) references public.balance_formulas (id)
    on delete cascade
) tablespace pg_default;

create index if not exists entity_formula_assignments_entity_idx
  on public.entity_formula_assignments (entity_kind, entity_id);

create index if not exists entity_formula_assignments_formula_id_idx
  on public.entity_formula_assignments (formula_id);
