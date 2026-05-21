Cześć. Pracujemy nad projektem Mythsworn.

Najpierw przeczytaj i zastosuj `AGENTS.md` oraz `docs/mythborne_codex_review_standards.md`, jeśli istnieją. Dla tasków UI przeczytaj też `docs/ui-ux/README.md`, właściwy fragment `mythborne_ui_ux_backlog.md`, task-relevant UI-CORE / UI-SHELL docs oraz podany prototyp/handoff UI. Jeśli któryś wymagany plik nie istnieje, odnotuj to w raporcie końcowym, ale nie zatrzymuj pracy, chyba że brak pliku realnie blokuje task.

Twoim zadaniem jest implementować dokładnie wskazany task UI/UX w istniejącym repozytorium Angular/PrimeNG. Pracuj małymi, kontrolowanymi zmianami.

## Zasady główne

- realizuj tylko bieżący task;
- nie projektuj od nowa całego ekranu;
- nie improwizuj layoutu;
- nie rób unrelated refactorów;
- nie przebudowuj data layer, jeśli task jest wizualny/layoutowy;
- jeśli review mówi „zrób tylko X”, zrób tylko X;
- jeśli brakuje danych, metadata, shared patternu, prototypu albo innego źródła prawdy, zgłoś blocker/gap zamiast wymyślać zamiennik;
- nie maskuj problemów fallbackami;
- nie dodawaj helperów, services, mappers, modeli, typów, komponentów ani klas CSS, jeśli istniejący kod/pattern da się sensownie użyć albo rozszerzyć;
- nie wklejaj w raporcie pełnych plików ani długich fragmentów kodu, chyba że użytkownik wyraźnie o to poprosi.

## Preflight przed edycją

Przed edycją sprawdź dla siebie:

- `git status --short`;
- właściwe dokumenty i task;
- prototyp/handoff i jego UX/visual anchors;
- aktualny template, SCSS, utilities, wrappers i shared UI patterns;
- istniejące wzorce do reuse;
- czy jest blocker.

Nie zatrzymuj się po preflight, jeśli nie ma blockera albo nieoczekiwanego dirty tree. Wynik preflightu uwzględnij dopiero w raporcie końcowym.

## Prototype contract + production visual baseline

Accepted prototype is not loose inspiration.

Prototyp jest źródłem odniesienia dla:

- struktury ekranu;
- hierarchii informacji;
- flow użytkownika;
- relacji między panelami;
- wymaganych stanów, CTA i ograniczeń.

Prototyp NIE jest źródłem do kopiowania finalnego skinu 1:1.

Aktualny dashboard / game shell jest production visual baseline. Adaptuj prototyp do obecnego stylu produkcyjnego:

- istniejące `mg-*` karty, utilities, wrappers i shared components;
- obecny dark blue/color-heading treatment;
- obecny rytm dashboardu: spacing, density, cards, buttons, badges, label/value rows;
- obecny topbar/sidebar/game-shell style.

Nie kopiuj prototype shell/topbar/sidebar, klas `mb-*`, raw CSS, prototype gradients ani osobnego visual language. Zachowaj UX/flow prototypu, ale wizualnie dopasuj do dashboard/game-shell baseline.

## CSS / SCSS discipline

SCSS powinien definiować głównie reusable skin/state/variant styling albo wąską, realną geometrię konkretnego komponentu. Nie używaj SCSS do odtwarzania layout utilities.

Nie dodawaj w SCSS layout rules typu `display`, `flex`, `grid`, `gap`, `margin`, `padding`, `width`, `height`, alignment, position albo overflow, jeśli da się to wyrazić istniejącymi global utilities w HTML.

Zanim dodasz spacing/layout w SCSS, sprawdź utilities:

- `flex-*`;
- `grid-*`;
- `gap-*`;
- `p-*`;
- `m-*`;
- `w-*`;
- `h-*`;
- `min-w-*`;
- `overflow-*`;
- `position-*`;
- `z-*`;
- `radius-*`;
- `square-*`;
- `border-*`;
- `bg-*`.

Nie dodawaj defensywnych class stacks „na wszelki wypadek”. Każda klasa w HTML musi mieć realny cel.

Nie twórz lokalnego surface/card/gate/button skinu, jeśli wystarczy `mg-card`, istniejące utility albo istniejący global pattern. Jeśli potrzeba powtarzalnego złotego borderu/glow/hoveru, potraktuj to jako shared/global pattern gap, nie jako feature-local styl dla jednego komponentu.

## Text and visual hierarchy

Player-facing copy ma być po polsku, chyba że użytkownik wyraźnie każe inaczej.

`muted-text` stosuj tylko dla labeli, helper text, timestamps i drugorzędnej metadata. Ważne wartości, statusy, outcomes, warnings, blockers, reasons i selected states nie mogą być `muted-text`.

Dla małych i średnich sekcyjnych nagłówków preferuj `color-heading`, nie ciężki złoty `mg-section__title`. `mg-section__title` stosuj ostrożnie, głównie dla głównych tytułów ekranów albo naprawdę ważnych hero headings.

Dla labeli, nazw cech, statystyk, krótkich metadanych i row labels używaj istniejących `small-caps`, `uppercase`, `text-xs`, `color-muted`, jeśli pasuje to do dashboardowego label/value rhythm.

Player-facing UI nie może zawierać technicznych tekstów typu `backend`, `read model`, `RPC`, `workflow backendu`, `contract gap`, chyba że ekran jest admin/debug.

## Reuse

Reuse oznacza realne użycie istniejących UI/patternów i logiki:

- utilities;
- wrappers;
- shared components;
- documented classes;
- theme tokens;
- methods/helpers/mappers;
- validators/factories/form configs;
- services/RPC helpers;
- state patterns.

Samo użycie komponentu/klasy, która naturalnie należy do edytowanej strony, nie jest wystarczającym dowodem reuse.

Przed dodaniem nowego patternu sprawdź minimum:

- `src/scss/base`;
- `src/scss/utilities`;
- `src/scss/layouts`;
- `src/scss/themes`;
- PrimeNG wrappers;
- shared components;
- layout/topbar/sidebar/game-shell patterns;
- relevant UI docs/prototype mapping.

## HTML / SCSS / TS boundaries

Dla tasków stricte UI/layoutowych:

- preferuj zmiany w HTML/SCSS;
- nie ruszaj TS, jeśli nie trzeba;
- nie dopisuj speców, jeśli nie zmieniasz logiki/state/service i nie istnieje bezpośrednio relevant spec;
- nie przebudowuj component API, jeśli problem jest wizualny;
- nie twórz nowych inputów/variantów tylko po to, żeby zachować stare zachowanie.

TS zmieniaj tylko, jeśli task naprawdę wymaga danych, stanu, interakcji albo istniejące API uniemożliwia poprawne odwzorowanie prototypu.

Typy/interfejsy mają iść do `core/interfaces` / `core/types`; reusable constants do `core/constants`; player-facing copy docelowo do i18n/copy layer, a dopóki go nie ma — minimalnie i blisko miejsca użycia.

## Cleanup

Po implementacji posprzątaj dotknięte pliki:

- usuń martwy HTML;
- usuń nieużywane importy;
- usuń zbędne klasy;
- usuń lokalny SCSS zastąpiony przez utilities;
- usuń obsolete fallbacki;
- usuń defensywne/transitional wrappers/classes;
- usuń stare warianty/patterny, które task zastępuje.

Nie zostawiaj cleanupu „na następny touch”. Jeśli problem jest w dotkniętym kodzie i mieści się w zakresie taska/review, popraw go teraz.

Produkcja ma mieć możliwie mały, czysty diff. Jeśli cleanup zwiększa kod zamiast go redukować, wyjaśnij dlaczego.

## Po review / needs-fix

Jeśli dostajesz review comment, `NEEDS FIX` albo `BLOCKER`:

1. wróć do oryginalnego taska, scope i acceptance;
2. nie traktuj review jako osobnego mini-zadania oderwanego od taska;
3. poprawiaj task, nie tylko ostatni komentarz;
4. jeśli review ogranicza zakres, nie ruszaj nic poza wskazanym zakresem;
5. jeśli review mówi `spec files touched: no`, nie ruszaj `.spec.ts`;
6. jeśli brakuje danych/patternu, zgłoś gap/blocker zamiast dorabiać fallback.

## Tests and manual smoke

Po implementacji uruchom weryfikację zgodną z `AGENTS.md`, review standards i zakresem taska.

Nie dopisuj dużych testów dla prostych zmian wizualnych. Focused specs są potrzebne głównie wtedy, gdy:

- istnieją bezpośrednio relevant specs;
- zmieniłeś TS/state/service;
- task dotyczy warunkowego renderowania lub interakcji.

Nie pisz self-fulfilling specs.

Nie uruchamiaj dev servera, web preview ani browser/manual smoke. Manual smoke wykonuje użytkownik/reviewer. W raporcie wpisz `Manual smoke: user-side`.

Przejście testów, `tsc`, builda i static grepów nie oznacza automatycznie, że task został wykonany. Dla tasków UI/player-facing nie raportuj zachowania jako `pass`, jeśli nie zostało faktycznie potwierdzone manual smoke przez użytkownika/reviewera. Wpisz: `Manual smoke: user-side pending`.

## Status docs

Nie aktualizuj status docs, chyba że użytkownik osobno o to poprosi albo potwierdzi wykonanie taska.

## Final report

Raport końcowy maksymalnie 15–20 linijek.

Używaj tylko tych sekcji:

- `AGENTS/Review Standards: applied`
- `Preflight`
- `Prototype/UI anchors`
- `Changed`
- `Not changed`
- `Cleanup`
- `Verification`
- `Static checks`
- `Reuse/patterns`
- `Manual smoke`
- `Blockers/risks`
- `Status docs`

Nie dodawaj nowych sekcji raportu tylko dlatego, że review comment o coś prosił. Jeśli review wymaga potwierdzenia czegoś konkretnego, umieść to krótko w jednej z powyższych sekcji.

W `Prototype/UI anchors` napisz krótko:

- `matched:` najważniejsze anchors zachowane;
- `not matched:` tylko jeśli coś świadomie nie zostało zachowane i dlaczego;
- `gap:` jeśli brakuje produkcyjnego patternu albo danych.

W `Reuse/patterns` napisz krótko:

- `reused:` konkretne utilities/classes/wrappers/components/patterns/metody użyte ponownie;
- `checked but not reused:` konkretne rzeczy sprawdzone i powód odrzucenia;
- `new:` nowe klasy/components/SCSS/helpery i dlaczego istniejący wzorzec nie wystarczył.

W `Cleanup` napisz krótko:

- co usunięto;
- co zastąpiono utilities/patternem;
- co zostało lokalnie i dlaczego.

Jeśli task był poprawiany po review, dodaj w `Preflight` albo `Cleanup`:

- `Returned to original task context before fixes: yes`

Jeśli review ograniczało zakres poprawki, dodaj:

- `Scope restriction respected: yes`

Nie używaj `pass` przy player-visible acceptance, jeśli potwierdzeniem są tylko testy/build. Wpisz wtedy: `implemented, manual smoke pending`.

Nie wklejaj pełnych plików ani długich fragmentów kodu do raportu. Raport ma być raportem, nie diffem.

Jeśli jesteś zablokowany, napisz krótko: co blokuje, czego brakuje i jaki pattern/plik/kontrakt jest potrzebny.