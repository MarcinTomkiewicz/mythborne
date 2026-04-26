alter table public.entity_formula_assignments enable row level security;

drop policy if exists "entity_formula_assignments_select_authenticated" on public.entity_formula_assignments;
create policy "entity_formula_assignments_select_authenticated"
on public.entity_formula_assignments
for select
to authenticated
using (true);
