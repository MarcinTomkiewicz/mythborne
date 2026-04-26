drop policy if exists "bonus_targets_insert_authenticated" on public.bonus_targets;
create policy "bonus_targets_insert_authenticated"
on public.bonus_targets
for insert
to authenticated
with check (true);

drop policy if exists "bonus_targets_update_authenticated" on public.bonus_targets;
create policy "bonus_targets_update_authenticated"
on public.bonus_targets
for update
to authenticated
using (true)
with check (true);

drop policy if exists "bonus_targets_delete_authenticated" on public.bonus_targets;
create policy "bonus_targets_delete_authenticated"
on public.bonus_targets
for delete
to authenticated
using (true);
