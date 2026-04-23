drop policy if exists "balance_formula_blocks_insert_authenticated" on public.balance_formula_blocks;
create policy "balance_formula_blocks_insert_authenticated"
on public.balance_formula_blocks
for insert
to authenticated
with check (true);

drop policy if exists "balance_formula_blocks_update_authenticated" on public.balance_formula_blocks;
create policy "balance_formula_blocks_update_authenticated"
on public.balance_formula_blocks
for update
to authenticated
using (true)
with check (true);

drop policy if exists "balance_formula_blocks_delete_authenticated" on public.balance_formula_blocks;
create policy "balance_formula_blocks_delete_authenticated"
on public.balance_formula_blocks
for delete
to authenticated
using (true);
