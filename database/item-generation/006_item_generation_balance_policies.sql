alter table public.item_generation_qualities enable row level security;
alter table public.item_generation_bucket_profiles enable row level security;

drop policy if exists "item_generation_qualities_select_authenticated" on public.item_generation_qualities;
create policy "item_generation_qualities_select_authenticated"
on public.item_generation_qualities
for select
to authenticated
using (true);

drop policy if exists "item_generation_bucket_profiles_select_authenticated" on public.item_generation_bucket_profiles;
create policy "item_generation_bucket_profiles_select_authenticated"
on public.item_generation_bucket_profiles
for select
to authenticated
using (true);
