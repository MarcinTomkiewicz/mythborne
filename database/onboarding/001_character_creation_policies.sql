alter table public.user_data enable row level security;
alter table public.hero enable row level security;
alter table public.hero_stats enable row level security;
alter table public.hero_derived enable row level security;
alter table public.hero_resources enable row level security;
alter table public.estates enable row level security;
alter table public.estate_buildings enable row level security;
alter table public.buildings enable row level security;
alter table public.estate_districts enable row level security;

drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own"
on public.user_data
for select
to authenticated
using (id = auth.uid());

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own"
on public.user_data
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own"
on public.user_data
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "hero_select_own" on public.hero;
create policy "hero_select_own"
on public.hero
for select
to authenticated
using (id = auth.uid());

drop policy if exists "hero_insert_own" on public.hero;
create policy "hero_insert_own"
on public.hero
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "hero_update_own" on public.hero;
create policy "hero_update_own"
on public.hero
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "hero_stats_select_own" on public.hero_stats;
create policy "hero_stats_select_own"
on public.hero_stats
for select
to authenticated
using (hero_id = auth.uid());

drop policy if exists "hero_stats_insert_own" on public.hero_stats;
create policy "hero_stats_insert_own"
on public.hero_stats
for insert
to authenticated
with check (hero_id = auth.uid());

drop policy if exists "hero_stats_update_own" on public.hero_stats;
create policy "hero_stats_update_own"
on public.hero_stats
for update
to authenticated
using (hero_id = auth.uid())
with check (hero_id = auth.uid());

drop policy if exists "hero_derived_select_own" on public.hero_derived;
create policy "hero_derived_select_own"
on public.hero_derived
for select
to authenticated
using (hero_id = auth.uid());

drop policy if exists "hero_derived_insert_own" on public.hero_derived;
create policy "hero_derived_insert_own"
on public.hero_derived
for insert
to authenticated
with check (hero_id = auth.uid());

drop policy if exists "hero_derived_update_own" on public.hero_derived;
create policy "hero_derived_update_own"
on public.hero_derived
for update
to authenticated
using (hero_id = auth.uid())
with check (hero_id = auth.uid());

drop policy if exists "hero_resources_select_own" on public.hero_resources;
create policy "hero_resources_select_own"
on public.hero_resources
for select
to authenticated
using (hero_id = auth.uid());

drop policy if exists "hero_resources_insert_own" on public.hero_resources;
create policy "hero_resources_insert_own"
on public.hero_resources
for insert
to authenticated
with check (hero_id = auth.uid());

drop policy if exists "hero_resources_update_own" on public.hero_resources;
create policy "hero_resources_update_own"
on public.hero_resources
for update
to authenticated
using (hero_id = auth.uid())
with check (hero_id = auth.uid());

drop policy if exists "estates_select_visible" on public.estates;
create policy "estates_select_visible"
on public.estates
for select
to authenticated
using (hero_id = auth.uid() or hero_id is null);

drop policy if exists "estates_insert_own" on public.estates;
create policy "estates_insert_own"
on public.estates
for insert
to authenticated
with check (hero_id = auth.uid());

drop policy if exists "estates_update_claim_or_manage_own" on public.estates;
create policy "estates_update_claim_or_manage_own"
on public.estates
for update
to authenticated
using (hero_id = auth.uid() or hero_id is null)
with check (hero_id = auth.uid());

drop policy if exists "estate_buildings_select_own" on public.estate_buildings;
create policy "estate_buildings_select_own"
on public.estate_buildings
for select
to authenticated
using (
  exists (
    select 1
    from public.estates
    where estates.id = estate_buildings.estate_id
      and estates.hero_id = auth.uid()
  )
);

drop policy if exists "estate_buildings_insert_own" on public.estate_buildings;
create policy "estate_buildings_insert_own"
on public.estate_buildings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.estates
    where estates.id = estate_buildings.estate_id
      and estates.hero_id = auth.uid()
  )
);

drop policy if exists "estate_buildings_update_own" on public.estate_buildings;
create policy "estate_buildings_update_own"
on public.estate_buildings
for update
to authenticated
using (
  exists (
    select 1
    from public.estates
    where estates.id = estate_buildings.estate_id
      and estates.hero_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.estates
    where estates.id = estate_buildings.estate_id
      and estates.hero_id = auth.uid()
  )
);

drop policy if exists "buildings_select_authenticated" on public.buildings;
create policy "buildings_select_authenticated"
on public.buildings
for select
to authenticated
using (true);

drop policy if exists "estate_districts_select_authenticated" on public.estate_districts;
create policy "estate_districts_select_authenticated"
on public.estate_districts
for select
to authenticated
using (true);
