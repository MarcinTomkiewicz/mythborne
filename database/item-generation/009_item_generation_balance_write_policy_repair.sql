alter table public.item_generation_qualities enable row level security;
alter table public.item_generation_bucket_profiles enable row level security;

grant select, insert, update, delete on table public.item_generation_qualities to authenticated;
grant select, insert, update, delete on table public.item_generation_bucket_profiles to authenticated;

drop policy if exists "item_generation_qualities_select_authenticated" on public.item_generation_qualities;
create policy "item_generation_qualities_select_authenticated"
on public.item_generation_qualities
for select
to authenticated
using (true);

drop policy if exists "item_generation_qualities_insert_authenticated" on public.item_generation_qualities;
create policy "item_generation_qualities_insert_authenticated"
on public.item_generation_qualities
for insert
to authenticated
with check (true);

drop policy if exists "item_generation_qualities_update_authenticated" on public.item_generation_qualities;
create policy "item_generation_qualities_update_authenticated"
on public.item_generation_qualities
for update
to authenticated
using (true)
with check (true);

drop policy if exists "item_generation_qualities_delete_authenticated" on public.item_generation_qualities;
create policy "item_generation_qualities_delete_authenticated"
on public.item_generation_qualities
for delete
to authenticated
using (true);

drop policy if exists "item_generation_bucket_profiles_select_authenticated" on public.item_generation_bucket_profiles;
create policy "item_generation_bucket_profiles_select_authenticated"
on public.item_generation_bucket_profiles
for select
to authenticated
using (true);

drop policy if exists "item_generation_bucket_profiles_insert_authenticated" on public.item_generation_bucket_profiles;
create policy "item_generation_bucket_profiles_insert_authenticated"
on public.item_generation_bucket_profiles
for insert
to authenticated
with check (true);

drop policy if exists "item_generation_bucket_profiles_update_authenticated" on public.item_generation_bucket_profiles;
create policy "item_generation_bucket_profiles_update_authenticated"
on public.item_generation_bucket_profiles
for update
to authenticated
using (true)
with check (true);

drop policy if exists "item_generation_bucket_profiles_delete_authenticated" on public.item_generation_bucket_profiles;
create policy "item_generation_bucket_profiles_delete_authenticated"
on public.item_generation_bucket_profiles
for delete
to authenticated
using (true);
