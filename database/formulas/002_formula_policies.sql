alter table public.balance_formula_targets enable row level security;
alter table public.balance_formulas enable row level security;
alter table public.balance_formula_assignments enable row level security;

drop policy if exists "balance_formula_targets_select_authenticated" on public.balance_formula_targets;
create policy "balance_formula_targets_select_authenticated"
on public.balance_formula_targets
for select
to authenticated
using (true);

drop policy if exists "balance_formulas_select_authenticated" on public.balance_formulas;
create policy "balance_formulas_select_authenticated"
on public.balance_formulas
for select
to authenticated
using (true);

drop policy if exists "balance_formula_assignments_select_authenticated" on public.balance_formula_assignments;
create policy "balance_formula_assignments_select_authenticated"
on public.balance_formula_assignments
for select
to authenticated
using (true);
