alter table public.balance_formula_blocks enable row level security;

drop policy if exists "balance_formula_blocks_select_authenticated" on public.balance_formula_blocks;
create policy "balance_formula_blocks_select_authenticated"
on public.balance_formula_blocks
for select
to authenticated
using (true);
