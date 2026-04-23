alter table public.building_resource_costs enable row level security;
alter table public.building_requirements enable row level security;

drop policy if exists "building_resource_costs_select_authenticated" on public.building_resource_costs;
create policy "building_resource_costs_select_authenticated"
on public.building_resource_costs
for select
to authenticated
using (true);

drop policy if exists "building_requirements_select_authenticated" on public.building_requirements;
create policy "building_requirements_select_authenticated"
on public.building_requirements
for select
to authenticated
using (true);
