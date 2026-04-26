alter table public.bonus_targets enable row level security;

drop policy if exists "bonus_targets_select_authenticated" on public.bonus_targets;
create policy "bonus_targets_select_authenticated"
on public.bonus_targets
for select
to authenticated
using (true);
