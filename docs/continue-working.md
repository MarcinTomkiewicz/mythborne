Kontynuuj poprzedni duży refactor domenowy systemu bonusów i formuł **od aktualnego stanu repo**, bez zaczynania od zera i bez przeprojektowywania całości od nowa.

To nie jest nowe zadanie, tylko wznowienie już rozpoczętej pracy.

## Cel refactoru

Chcemy doprowadzić system bonusów i formuł do stanu, w którym:

* bonusy są w pełni bazodanowe i centralnie zarządzane
* bonus templates są osobnym zasobem z własnym CRUD-em
* bonus ma osobne pola typu:

  * `type`
  * `target`
  * `context`
  * `category`
  * parametry zależne od typu
  * `description`
* `per_4_levels` zostało uogólnione do `per_levels`
* wspierane typy bonusów to:

  * `flat`
  * `percent`
  * `per_levels`
  * `scaled_stat_bonus`
  * `resource_flat`
  * `resource_percent`
  * `capacity_flat`
  * `unlock_feature`
* bonus ma `context`, co najmniej:

  * `global`
  * `pvp_attack`
  * `pvp_defense`
  * `exploration`
  * `trial`
  * `combat`
  * `economy`
  * `building_management`
* `category` służy do organizacji i filtrowania bonusów w adminie
* `target` jest osobnym polem wybieranym z listy targetów, a nie zaszytym połączeniem typu i targetu
* budynki mają mieć możliwość przypisywania własnych lokalnych formuł dla:

  * upgrade cost
  * upgrade time
  * bonus growth
  * innych building-related scope’ów, jeśli są wspierane
* jeśli lokalna formuła nie jest przypisana, działa fallback do globalnej formuły dla danego scope
* wszystko ma być w PostgreSQL / Supabase, nie w lokalnych JSON-ach, mockach ani frontend-only state

## Ważne założenia

* nie wprowadzamy osobnego `conditional_bonus`
* warunkowość ma być realizowana przez `context`
* nie chcemy nowej równoległej ścieżki logiki
* nie chcemy półśrodków
* nie chcemy cofania dobrze rozpoczętego refactoru
* nie projektuj tego od nowa, tylko dokończ i dospinaj obecny kierunek

## Co już zostało rozpoczęte / zmienione

Zostały już ruszone migracje i duża część warstwy aplikacyjnej.

### Migracje:

* `database/bonuses/001_bonus_template_system_rework.sql`
* `database/bonuses/002_bonus_target_policies.sql`
* `database/bonuses/003_bonus_target_write_policies.sql`
* `database/bonuses/004_bonus_target_grants.sql`
* `database/formulas/014_entity_formula_assignments_schema.sql`
* `database/formulas/015_entity_formula_assignments_policies.sql`
* `database/formulas/016_entity_formula_assignments_write_policies.sql`
* `database/formulas/017_entity_formula_assignments_grants.sql`

### Zmienione pliki aplikacyjne:

* `src/app/admin/components/balance/bonus-template-balance-section.html`
* `src/app/admin/components/balance/bonus-template-balance-section.ts`
* `src/app/admin/pages/balance/item-generation-balance-page.html`
* `src/app/admin/pages/balance/item-generation-balance-page.ts`
* `src/app/admin/pages/buildings/buildings-page.html`
* `src/app/admin/pages/buildings/buildings-page.ts`
* `src/app/admin/pages/item-catalog/item-generation-item-catalog-page.html`
* `src/app/admin/pages/item-catalog/item-generation-item-catalog-page.ts`
* `src/app/core/config/forms/balance-form.config.ts`
* `src/app/core/constants/tables.const.ts`
* `src/app/core/factories/forms/building-admin-form.factory.ts`
* `src/app/core/factories/forms/item-generation-balance-form.factory.ts`
* `src/app/core/factories/forms/item-generation-item-catalog-form.factory.ts`
* `src/app/core/services/bonus/bonus-template-admin.ts`
* `src/app/core/services/buildings/building-admin-page.facade.ts`
* `src/app/core/services/buildings/building-admin.ts`
* `src/app/core/services/buildings/building-formula-admin.facade.ts`
* `src/app/core/services/buildings/buildings.ts`
* `src/app/core/services/combat/combat-page.facade.ts`
* `src/app/core/services/formula/formula.ts`
* `src/app/core/services/hero/dashboard-page.facade.ts`
* `src/app/core/services/items/item-generation-affix-admin.ts`
* `src/app/core/services/items/item-generation-balance-page.facade.ts`
* `src/app/core/services/items/item-generation-base-admin.ts`
* `src/app/core/services/items/item-generation-bonus-template-admin.ts`
* `src/app/core/services/items/item-generation-catalog-admin.ts`
* `src/app/core/services/items/item-generation-formula-balance.facade.ts`
* `src/app/core/services/items/item-generation-item-catalog-page.facade.ts`
* `src/app/core/services/progression/building-progression.ts`
* `src/app/core/types/bonus.types.ts`
* `src/app/core/types/building.types.ts`
* `src/app/core/types/database.types.ts`
* `src/app/core/types/forms/building-admin-form.types.ts`
* `src/app/core/types/forms/item-generation-balance-form.types.ts`
* `src/app/core/types/forms/item-generation-item-catalog-form.types.ts`
* `src/app/core/types/formula.types.ts`
* `src/app/core/types/item-generation-admin-service.types.ts`
* `src/app/core/types/item-generation-admin.types.ts`
* `src/app/core/types/origin.types.ts`
* `src/app/core/types/progression.types.ts`
* `src/app/core/utils/bonus-calculator.ts`
* `src/app/core/utils/bonus.ts`
* `src/app/core/utils/building-admin-mappers.ts`
* `src/app/core/utils/building-display.ts`
* `src/app/core/utils/formula-admin-mappers.ts`
* `src/app/core/utils/item-catalog-admin.ts`
* `src/app/core/utils/item-generation-admin-mappers.ts`
* `src/app/core/utils/item-generation-catalog-mappers.ts`
* `src/app/core/utils/origin-mappers.ts`
* `src/app/shared/carousel/carousel.html`

## Jak masz pracować teraz

Nie zaczynaj od projektowania. Najpierw sprawdź aktualny stan repo i oceń:

* co już jest poprawnie wdrożone,
* co jest tylko częściowo ruszone,
* co jest niespójne między migracjami, typami, serwisami i admin UI,
* czego jeszcze brakuje, żeby system działał end-to-end.

## Co ma być dopięte

Doprowadź ten refactor do stanu, w którym:

1. bonus templates działają jako centralny zasób z CRUD-em
2. bonus targety działają jako osobny słownik / encja
3. typ bonusu determinuje wymagane parametry
4. context i category są realnie obsłużone w modelu, mapperach, formularzach i zapisie
5. budynki mogą przypisywać lokalne formuły
6. fallback lokalna formuła -> globalna formuła działa poprawnie
7. admin UI pozwala:

   * tworzyć/edytować bonus templates
   * wybierać target
   * wybierać type
   * wybierać context
   * wybierać category
   * wpisywać parametry zależne od typu
   * przypisywać bonusy do budynków
   * przypisywać lokalne formuły do budynków

## Oczekiwany rezultat

Po zakończeniu:

* system ma być spójny bazodanowo i aplikacyjnie
* nie ma być lokalnych obejść ani tymczasowych ścieżek
* bonusy i formuły mają działać jako realny, rozszerzalny system domenowy
* budynki mają korzystać z lokalnych override’ów formuł z fallbackiem do globalnych defaultów

Na końcu pokaż:

* co dokładnie zostało jeszcze zmienione,
* czy jakieś migracje trzeba poprawić,
* co było niespójne i zostało naprawione,
* i co ewentualnie nadal zostaje do dokończenia.
