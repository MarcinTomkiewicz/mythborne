# Mythsworn — Codex UI starter

Pracujemy nad projektem **Mythsworn**.

Twoim zadaniem jest wykonać dokładnie wskazany task UI/UX w istniejącym repozytorium Angular/PrimeNG.

Nie projektujesz od nowa całej strony. Nie improwizujesz layoutu. Nie tworzysz lokalnego design systemu. Masz dopasować konkretny ekran/fragment do istniejącego stylu Mythsworn i zaakceptowanych prototypów.

## Przed edycją

Przeczytaj, jeśli są dostępne i istotne dla taska:

* `AGENTS.md`;
* `mythborne_codex_review_standards.md`;
* `mythsworn_codex_ui_review_standards.md`;
* `docs/ui-ux/README.md`;
* właściwy fragment `mythborne_ui_ux_backlog.md`;
* task-relevant UI-CORE / UI-SHELL docs;
* podany prototyp albo handoff UI.

Zrób dla siebie preflight:

* `git status --short`;
* sprawdź aktualny template/SCSS/TS;
* sprawdź istniejące utilities, wrappers i shared components;
* sprawdź accepted prototype / visual anchors;
* sprawdź, czy jest blocker.

Nie zatrzymuj się po preflight, jeśli nie ma blockera albo nieoczekiwanego dirty tree.

## Zakres

Realizuj tylko bieżący task.

Nie rób:

* unrelated refactorów;
* przebudowy data layer przy tasku wizualnym;
* nowych helperów/services/mappers/models/types/components bez potrzeby;
* nowych klas SCSS, jeśli wystarczą utilities albo istniejący pattern;
* fallbacków maskujących brak danych/kontraktu;
* zmian w `.spec.ts`, jeśli task jest tylko wizualny;
* status docs bez wyraźnej prośby użytkownika.

Jeśli review mówi „zrób tylko X”, zrób tylko X.

## Prototype / visual anchors

Accepted prototype jest kontraktem UX/visual anchors, nie luźną inspiracją.

Z prototypu zachowuj:

* strukturę ekranu;
* hierarchię informacji;
* relacje między panelami;
* flow;
* wymagane CTA/stany/blokady;
* charakter danego surface.

Nie kopiuj:

* prototype shell/topbar/sidebar;
* klas `mb-*`;
* raw CSS;
* raw gradientów;
* palette values;
* osobnego visual language prototypu.

Aktualny dashboard/game shell jest production visual baseline. Dopasuj ekran do istniejącego stylu:

* `mg-card`;
* `mg-container`;
* utilities;
* existing wrappers;
* dark blue / `color-heading` treatment;
* obecny rytm spacingu, density, cards, buttons, badges i label/value rows.

## SCSS / utilities

Nie używaj SCSS do odtwarzania layout utilities.

Nie dodawaj w SCSS reguł typu:

* `display`;
* `flex`;
* `grid`;
* `gap`;
* `margin`;
* `padding`;
* `width`;
* `height`;
* alignment;
* position;
* overflow;

jeśli da się to wyrazić istniejącymi global utilities w HTML.

Przed dodaniem layout/spacing w SCSS sprawdź:

* `flex-*`;
* `grid-*`;
* `gap-*`;
* `p-*`;
* `m-*`;
* `w-*`;
* `h-*`;
* `min-w-*`;
* `overflow-*`;
* `position-*`;
* `z-*`;
* `radius-*`;
* `square-*`;
* `border-*`;
* `bg-*`.

SCSS może zostać tylko tam, gdzie daje realny reusable skin/state/variant albo geometrię, której nie ma w utilities.

Nie twórz lokalnego surface/card/button/badge/gate skinu, jeśli wystarczy istniejący global pattern.

## HTML / TS boundaries

Dla tasków stricte UI/layoutowych preferuj HTML + istniejące utilities.

TS zmieniaj tylko, jeśli task wymaga danych, stanu, interakcji albo istniejące API uniemożliwia poprawny UI.

Nie dodawaj inputów/variantów tylko po to, żeby nie usunąć starego złego zachowania.

Typy/interfejsy nie mogą lądować w komponencie, jeśli są reusable. Użyj `core/types`, `core/interfaces`, domain model albo istniejącego mappera.

## Text hierarchy

Player-facing copy ma być po polsku, chyba że użytkownik wyraźnie każe inaczej.

Nie pokazuj playerowi technicznych tekstów typu:

* `backend`;
* `RPC`;
* `read model`;
* `workflow`;
* `contract gap`.

`muted-text` / `color-muted` tylko dla labeli, helperów, timestampów i drugorzędnej metadata.

Nie wyciszaj:

* ważnych wartości;
* statusów;
* outcome’ów;
* nazw bohaterów;
* nazw itemów;
* rang Prestige;
* błędów;
* blockerów;
* powodów zablokowania;
* selected states.

Dla małych/średnich nagłówków preferuj `color-heading`.
`mg-section__title` tylko dla ważnych tytułów, nie dla każdego drobnego bloku.

## Cleanup jest częścią taska

Po implementacji posprzątaj dotknięte pliki:

* usuń martwy HTML;
* usuń nieużywane importy;
* usuń zbędne klasy;
* usuń lokalny SCSS zastąpiony utilities;
* usuń obsolete fallbacki;
* usuń defensive wrappers/classes;
* usuń stare warianty/patterny, które task zastępuje.

Nie zostawiaj starego UI flow obok nowego, jeśli nowe flow je zastępuje.

Nie dokładaj wrappera nad złym patternem. Usuń zły pattern, jeśli task go zastępuje.

## Reuse

Reuse oznacza realne użycie istniejących klocków:

* utilities;
* wrappers;
* shared components;
* documented classes;
* theme tokens;
* existing methods/helpers/mappers;
* validators/factories/form configs;
* services/RPC helpers;
* state/workflow patterns.

Samo użycie komponentu/klasy naturalnie należącej do edytowanej strony nie jest dowodem reuse.

Przed dodaniem nowego patternu sprawdź:

* `src/scss/base`;
* `src/scss/utilities`;
* `src/scss/layouts`;
* `src/scss/themes`;
* PrimeNG wrappers;
* shared components;
* layout/topbar/sidebar/game-shell patterns;
* relevant UI docs/prototype mapping.

## Specy i testy

Nie dopisuj speców dla prostych zmian wizualnych.

Nie ruszaj `.spec.ts`, jeśli review albo task mówi, że spec files mają zostać nietknięte.

Focused specs tylko wtedy, gdy:

* zmieniłeś TS/state/service;
* istnieje bezpośrednio relevant spec;
* task dotyczy warunkowego renderowania albo interakcji;
* test sprawdza realne zachowanie, nie mock zgodny z mockiem.

Nie pisz self-fulfilling specs.

Preferowana weryfikacja:

* `npx tsc --noEmit`;
* `npm run build`;
* `git diff --check`;
* static grep, jeśli pasuje do taska.

Nie uruchamiaj browser/manual smoke, jeśli nie masz realnej sesji i danych. Wpisz `Manual smoke: user-side`.

## Blocker

Zatrzymaj się i zgłoś blocker, jeśli:

* brakuje obowiązkowego prototypu/guidance;
* brakuje danych/metadata/read modelu potrzebnych do UI;
* task wymaga missing DB/RPC/generated type;
* trzeba by direct-write’ować gameplay/workflow tables;
* dirty tree ma nieoczekiwane zmiany;
* weryfikacja failuje przez bieżącą zmianę.

Nie wymyślaj obejścia.

Blocker ma być krótki:

* co blokuje;
* gdzie;
* czego brakuje;
* co jest potrzebne od użytkownika/Migratora/designu;
* czy coś zostało zmienione przed blockerem.

## Raport końcowy

Raport maksymalnie 15–20 linijek.

Używaj tylko tych sekcji:

```md
AGENTS/Review Standards: applied

Preflight:
- dirty tree:
- sources checked:
- blocker: yes/no

Prototype/UI anchors:
- matched:
- not matched:
- gap:

Changed:
- ...

Removed / cleanup:
- ...

Not changed:
- ...

Reuse/patterns:
- reused:
- checked but not reused:
- new:

Verification:
- ...

Manual smoke:
- user-side / N/A

Blockers/risks:
- ...

Status docs:
- touched / not touched
```

Nie pisz epopei. Nie streszczaj historii projektu. Nie wklejaj pełnych plików ani długich fragmentów kodu.

Jeśli task był poprawiany po review, dodaj krótko:

* `Returned to original task context before fixes: yes`
* `Scope restriction respected: yes`
