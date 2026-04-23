drop policy if exists "balance_formula_targets_insert_authenticated" on public.balance_formula_targets;
create policy "balance_formula_targets_insert_authenticated"
on public.balance_formula_targets
for insert
to authenticated
with check (true);

drop policy if exists "balance_formula_targets_update_authenticated" on public.balance_formula_targets;
create policy "balance_formula_targets_update_authenticated"
on public.balance_formula_targets
for update
to authenticated
using (true)
with check (true);

drop policy if exists "balance_formula_targets_delete_authenticated" on public.balance_formula_targets;
create policy "balance_formula_targets_delete_authenticated"
on public.balance_formula_targets
for delete
to authenticated
using (true);

drop policy if exists "balance_formulas_insert_authenticated" on public.balance_formulas;
create policy "balance_formulas_insert_authenticated"
on public.balance_formulas
for insert
to authenticated
with check (true);

drop policy if exists "balance_formulas_update_authenticated" on public.balance_formulas;
create policy "balance_formulas_update_authenticated"
on public.balance_formulas
for update
to authenticated
using (true)
with check (true);

drop policy if exists "balance_formulas_delete_authenticated" on public.balance_formulas;
create policy "balance_formulas_delete_authenticated"
on public.balance_formulas
for delete
to authenticated
using (true);

drop policy if exists "balance_formula_assignments_insert_authenticated" on public.balance_formula_assignments;
create policy "balance_formula_assignments_insert_authenticated"
on public.balance_formula_assignments
for insert
to authenticated
with check (true);

drop policy if exists "balance_formula_assignments_update_authenticated" on public.balance_formula_assignments;
create policy "balance_formula_assignments_update_authenticated"
on public.balance_formula_assignments
for update
to authenticated
using (true)
with check (true);

drop policy if exists "balance_formula_assignments_delete_authenticated" on public.balance_formula_assignments;
create policy "balance_formula_assignments_delete_authenticated"
on public.balance_formula_assignments
for delete
to authenticated
using (true);
