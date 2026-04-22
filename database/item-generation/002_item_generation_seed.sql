insert into public.bonus_templates (target, type, description)
select 'strength', 'flat', 'Base strength bonus'
where not exists (
  select 1 from public.bonus_templates where target = 'strength' and type = 'flat'
);

insert into public.bonus_templates (target, type, description)
select 'agility', 'flat', 'Base agility bonus'
where not exists (
  select 1 from public.bonus_templates where target = 'agility' and type = 'flat'
);

insert into public.bonus_templates (target, type, description)
select 'health', 'flat', 'Base health bonus'
where not exists (
  select 1 from public.bonus_templates where target = 'health' and type = 'flat'
);

insert into public.bonus_templates (target, type, description)
select 'luck', 'flat', 'Base luck bonus'
where not exists (
  select 1 from public.bonus_templates where target = 'luck' and type = 'flat'
);

insert into public.bonus_templates (target, type, description)
select 'def', 'flat', 'Base defence bonus'
where not exists (
  select 1 from public.bonus_templates where target = 'def' and type = 'flat'
);

insert into public.bonus_templates (target, type, description)
select 'critical', 'flat', 'Base critical bonus'
where not exists (
  select 1 from public.bonus_templates where target = 'critical' and type = 'flat'
);

insert into public.bonus_templates (target, type, description)
select 'minDmg', 'flat', 'Base minimum damage bonus'
where not exists (
  select 1 from public.bonus_templates where target = 'minDmg' and type = 'flat'
);

insert into public.bonus_templates (target, type, description)
select 'maxDmg', 'flat', 'Base maximum damage bonus'
where not exists (
  select 1 from public.bonus_templates where target = 'maxDmg' and type = 'flat'
);

insert into public.item_generation_bases (key, name, slot, base_value, description)
values
  ('dagger', 'Dagger', 'weapon', 200, 'Lekka bron do szybkich i precyzyjnych trafien.'),
  ('club', 'Club', 'weapon', 300, 'Prosta bron obuchowa o niskiej cenie wejscia.'),
  ('sword', 'Sword', 'weapon', 500, 'Uniwersalny orez zapewniajacy solidne obrazenia.'),
  ('spear', 'Spear', 'weapon', 650, 'Bron zasiegowa premiujaca precyzje i tempo walki.'),
  ('mace', 'Mace', 'weapon', 700, 'Ciezsza bron o wysokiej sile uderzenia.'),
  ('amulet', 'Amulet', 'trinket', 450, 'Talizman wzmacniajacy zmysl przetrwania i szczescie.')
on conflict (key) do update
set
  name = excluded.name,
  slot = excluded.slot,
  base_value = excluded.base_value,
  description = excluded.description;

insert into public.item_generation_affixes (key, kind, name, gold_value, description)
values
  ('demonic', 'prefix', 'Demonic', 100, 'Nasyca bron brutalna energia.'),
  ('poisonous', 'prefix', 'Poisonous', 80, 'Wzmacnia obrazenia przez toksyczny efekt.'),
  ('guardian', 'prefix', 'Guardian', 120, 'Zwiksza przezywalnosc i ochrone.'),
  ('fortunate', 'prefix', 'Fortunate', 160, 'Wzmacnia powodzenie i trafne decyzje.'),
  ('honed', 'prefix', 'Honed', 140, 'Daje przewage dzieki lepszemu wykonczeniu ostrza.'),
  ('of_fire', 'suffix', 'of Fire', 150, 'Dodaje goracy impet i wyzsze obrazenia.'),
  ('of_titans', 'suffix', 'of Titans', 200, 'Nagroda za wysoka wartosc i potezne wzmocnienie.'),
  ('of_storms', 'suffix', 'of Storms', 140, 'Laczy dynamike walki z wieksza szansa trafien krytycznych.'),
  ('of_the_owl', 'suffix', 'of the Owl', 110, 'Premiuje rozsadek, obserwacje i szczescie.'),
  ('of_warding', 'suffix', 'of Warding', 130, 'Wzmacnia defensywe i odpornosc.')
on conflict (key) do update
set
  kind = excluded.kind,
  name = excluded.name,
  gold_value = excluded.gold_value,
  description = excluded.description;

insert into public.item_generation_base_bonuses (base_id, template_id, value)
select base_row.id, template_row.id, source.value
from (
  values
    ('dagger', 'minDmg', 'flat', 4),
    ('dagger', 'maxDmg', 'flat', 7),
    ('dagger', 'critical', 'flat', 1),
    ('club', 'minDmg', 'flat', 5),
    ('club', 'maxDmg', 'flat', 9),
    ('sword', 'minDmg', 'flat', 7),
    ('sword', 'maxDmg', 'flat', 12),
    ('sword', 'critical', 'flat', 2),
    ('spear', 'minDmg', 'flat', 8),
    ('spear', 'maxDmg', 'flat', 14),
    ('spear', 'agility', 'flat', 2),
    ('mace', 'minDmg', 'flat', 10),
    ('mace', 'maxDmg', 'flat', 16),
    ('mace', 'def', 'flat', 2),
    ('amulet', 'luck', 'flat', 4),
    ('amulet', 'health', 'flat', 12)
) as source(base_key, target, bonus_type, value)
join public.item_generation_bases as base_row
  on base_row.key = source.base_key
join public.bonus_templates as template_row
  on template_row.target = source.target
 and coalesce(template_row.type, 'flat') = source.bonus_type
on conflict (base_id, template_id) do update
set value = excluded.value;

insert into public.item_generation_affix_bonuses (affix_id, template_id, value)
select affix_row.id, template_row.id, source.value
from (
  values
    ('demonic', 'maxDmg', 'flat', 4),
    ('demonic', 'critical', 'flat', 2),
    ('poisonous', 'minDmg', 'flat', 2),
    ('poisonous', 'maxDmg', 'flat', 2),
    ('guardian', 'def', 'flat', 5),
    ('guardian', 'health', 'flat', 10),
    ('fortunate', 'luck', 'flat', 6),
    ('honed', 'critical', 'flat', 3),
    ('honed', 'agility', 'flat', 2),
    ('of_fire', 'maxDmg', 'flat', 5),
    ('of_titans', 'strength', 'flat', 6),
    ('of_titans', 'health', 'flat', 14),
    ('of_storms', 'agility', 'flat', 5),
    ('of_storms', 'critical', 'flat', 2),
    ('of_the_owl', 'luck', 'flat', 5),
    ('of_warding', 'def', 'flat', 4),
    ('of_warding', 'health', 'flat', 8)
) as source(affix_key, target, bonus_type, value)
join public.item_generation_affixes as affix_row
  on affix_row.key = source.affix_key
join public.bonus_templates as template_row
  on template_row.target = source.target
 and coalesce(template_row.type, 'flat') = source.bonus_type
on conflict (affix_id, template_id) do update
set value = excluded.value;
