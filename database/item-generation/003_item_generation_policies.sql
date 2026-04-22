alter table public.item_generation_bases enable row level security;
alter table public.item_generation_affixes enable row level security;
alter table public.item_generation_base_bonuses enable row level security;
alter table public.item_generation_affix_bonuses enable row level security;
alter table public.bonus_templates enable row level security;

drop policy if exists "item_generation_bases_select_authenticated" on public.item_generation_bases;
create policy "item_generation_bases_select_authenticated"
on public.item_generation_bases
for select
to authenticated
using (true);

drop policy if exists "item_generation_affixes_select_authenticated" on public.item_generation_affixes;
create policy "item_generation_affixes_select_authenticated"
on public.item_generation_affixes
for select
to authenticated
using (true);

drop policy if exists "item_generation_base_bonuses_select_authenticated" on public.item_generation_base_bonuses;
create policy "item_generation_base_bonuses_select_authenticated"
on public.item_generation_base_bonuses
for select
to authenticated
using (true);

drop policy if exists "item_generation_affix_bonuses_select_authenticated" on public.item_generation_affix_bonuses;
create policy "item_generation_affix_bonuses_select_authenticated"
on public.item_generation_affix_bonuses
for select
to authenticated
using (true);

drop policy if exists "bonus_templates_select_authenticated" on public.bonus_templates;
create policy "bonus_templates_select_authenticated"
on public.bonus_templates
for select
to authenticated
using (true);
