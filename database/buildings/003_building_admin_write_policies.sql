drop policy if exists "buildings_insert_authenticated" on public.buildings;
create policy "buildings_insert_authenticated"
on public.buildings
for insert
to authenticated
with check (true);

drop policy if exists "buildings_update_authenticated" on public.buildings;
create policy "buildings_update_authenticated"
on public.buildings
for update
to authenticated
using (true)
with check (true);

drop policy if exists "buildings_delete_authenticated" on public.buildings;
create policy "buildings_delete_authenticated"
on public.buildings
for delete
to authenticated
using (true);

drop policy if exists "building_bonuses_insert_authenticated" on public.building_bonuses;
create policy "building_bonuses_insert_authenticated"
on public.building_bonuses
for insert
to authenticated
with check (true);

drop policy if exists "building_bonuses_update_authenticated" on public.building_bonuses;
create policy "building_bonuses_update_authenticated"
on public.building_bonuses
for update
to authenticated
using (true)
with check (true);

drop policy if exists "building_bonuses_delete_authenticated" on public.building_bonuses;
create policy "building_bonuses_delete_authenticated"
on public.building_bonuses
for delete
to authenticated
using (true);
