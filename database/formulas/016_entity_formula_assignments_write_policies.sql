drop policy if exists "entity_formula_assignments_insert_authenticated" on public.entity_formula_assignments;
create policy "entity_formula_assignments_insert_authenticated"
on public.entity_formula_assignments
for insert
to authenticated
with check (true);

drop policy if exists "entity_formula_assignments_update_authenticated" on public.entity_formula_assignments;
create policy "entity_formula_assignments_update_authenticated"
on public.entity_formula_assignments
for update
to authenticated
using (true)
with check (true);

drop policy if exists "entity_formula_assignments_delete_authenticated" on public.entity_formula_assignments;
create policy "entity_formula_assignments_delete_authenticated"
on public.entity_formula_assignments
for delete
to authenticated
using (true);
