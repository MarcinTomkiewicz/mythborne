alter table public.building_bonuses enable row level security;

drop policy if exists "building_bonuses_select_authenticated" on public.building_bonuses;
create policy "building_bonuses_select_authenticated"
on public.building_bonuses
for select
to authenticated
using (true);
