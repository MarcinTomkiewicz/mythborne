drop policy if exists "building_resource_costs_insert_authenticated" on public.building_resource_costs;
create policy "building_resource_costs_insert_authenticated"
on public.building_resource_costs
for insert
to authenticated
with check (true);

drop policy if exists "building_resource_costs_update_authenticated" on public.building_resource_costs;
create policy "building_resource_costs_update_authenticated"
on public.building_resource_costs
for update
to authenticated
using (true)
with check (true);

drop policy if exists "building_resource_costs_delete_authenticated" on public.building_resource_costs;
create policy "building_resource_costs_delete_authenticated"
on public.building_resource_costs
for delete
to authenticated
using (true);

drop policy if exists "building_requirements_insert_authenticated" on public.building_requirements;
create policy "building_requirements_insert_authenticated"
on public.building_requirements
for insert
to authenticated
with check (true);

drop policy if exists "building_requirements_update_authenticated" on public.building_requirements;
create policy "building_requirements_update_authenticated"
on public.building_requirements
for update
to authenticated
using (true)
with check (true);

drop policy if exists "building_requirements_delete_authenticated" on public.building_requirements;
create policy "building_requirements_delete_authenticated"
on public.building_requirements
for delete
to authenticated
using (true);
