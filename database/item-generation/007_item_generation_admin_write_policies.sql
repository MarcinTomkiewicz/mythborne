drop policy if exists "item_generation_bases_insert_authenticated" on public.item_generation_bases;
create policy "item_generation_bases_insert_authenticated"
on public.item_generation_bases
for insert
to authenticated
with check (true);

drop policy if exists "item_generation_bases_update_authenticated" on public.item_generation_bases;
create policy "item_generation_bases_update_authenticated"
on public.item_generation_bases
for update
to authenticated
using (true)
with check (true);

drop policy if exists "item_generation_bases_delete_authenticated" on public.item_generation_bases;
create policy "item_generation_bases_delete_authenticated"
on public.item_generation_bases
for delete
to authenticated
using (true);

drop policy if exists "item_generation_affixes_insert_authenticated" on public.item_generation_affixes;
create policy "item_generation_affixes_insert_authenticated"
on public.item_generation_affixes
for insert
to authenticated
with check (true);

drop policy if exists "item_generation_affixes_update_authenticated" on public.item_generation_affixes;
create policy "item_generation_affixes_update_authenticated"
on public.item_generation_affixes
for update
to authenticated
using (true)
with check (true);

drop policy if exists "item_generation_affixes_delete_authenticated" on public.item_generation_affixes;
create policy "item_generation_affixes_delete_authenticated"
on public.item_generation_affixes
for delete
to authenticated
using (true);

drop policy if exists "item_generation_base_bonuses_insert_authenticated" on public.item_generation_base_bonuses;
create policy "item_generation_base_bonuses_insert_authenticated"
on public.item_generation_base_bonuses
for insert
to authenticated
with check (true);

drop policy if exists "item_generation_base_bonuses_update_authenticated" on public.item_generation_base_bonuses;
create policy "item_generation_base_bonuses_update_authenticated"
on public.item_generation_base_bonuses
for update
to authenticated
using (true)
with check (true);

drop policy if exists "item_generation_base_bonuses_delete_authenticated" on public.item_generation_base_bonuses;
create policy "item_generation_base_bonuses_delete_authenticated"
on public.item_generation_base_bonuses
for delete
to authenticated
using (true);

drop policy if exists "item_generation_affix_bonuses_insert_authenticated" on public.item_generation_affix_bonuses;
create policy "item_generation_affix_bonuses_insert_authenticated"
on public.item_generation_affix_bonuses
for insert
to authenticated
with check (true);

drop policy if exists "item_generation_affix_bonuses_update_authenticated" on public.item_generation_affix_bonuses;
create policy "item_generation_affix_bonuses_update_authenticated"
on public.item_generation_affix_bonuses
for update
to authenticated
using (true)
with check (true);

drop policy if exists "item_generation_affix_bonuses_delete_authenticated" on public.item_generation_affix_bonuses;
create policy "item_generation_affix_bonuses_delete_authenticated"
on public.item_generation_affix_bonuses
for delete
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

drop policy if exists "bonus_templates_insert_authenticated" on public.bonus_templates;
create policy "bonus_templates_insert_authenticated"
on public.bonus_templates
for insert
to authenticated
with check (true);

drop policy if exists "bonus_templates_update_authenticated" on public.bonus_templates;
create policy "bonus_templates_update_authenticated"
on public.bonus_templates
for update
to authenticated
using (true)
with check (true);

drop policy if exists "bonus_templates_delete_authenticated" on public.bonus_templates;
create policy "bonus_templates_delete_authenticated"
on public.bonus_templates
for delete
to authenticated
using (true);
