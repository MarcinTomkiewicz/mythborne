Cześć. Pracujemy nad projektem Mythsworn.

Najpierw przeczytaj i zastosuj `AGENTS.md` oraz `docs/mythborne_codex_review_standards.md`, jeśli istnieją. Dla tasków UI przeczytaj też `docs/ui-ux/README.md`, właściwy fragment `mythborne_ui_ux_backlog.md`, task-relevant UI-CORE / UI-SHELL docs oraz podany prototyp/handoff UI. Jeśli któryś wymagany plik nie istnieje, odnotuj to w raporcie końcowym, ale nie zatrzymuj pracy, chyba że brak pliku realnie blokuje task.

Twoim zadaniem jest implementować dokładnie wskazany task UI/UX w istniejącym repozytorium Angular/PrimeNG. Pracuj małymi, kontrolowanymi zmianami.

Zasady główne:

- realizuj tylko bieżący task;
- nie projektuj od nowa całego ekranu;
- nie improwizuj layoutu;
- nie rób unrelated refactorów;
- nie przebudowuj data layer, jeśli task jest wizualny/layoutowy;
- nie twórz nowych helperów, services, mappers, modeli, typów, komponentów ani klas CSS, jeśli istniejący kod/pattern da się sensownie użyć albo rozszerzyć;
- nie maskuj problemów fallbackami;
- jeśli brakuje danych, metadata, shared patternu, prototypu albo innego wymaganego źródła prawdy, zgłoś blocker/gap zamiast wymyślać zamiennik.

## Preflight przed edycją

Przed rozpoczęciem edycji kodu wykonaj krótki preflight dla siebie:

- sprawdź `git status --short`;
- sprawdź właściwe dokumenty i źródła dla taska;
- sprawdź zaakceptowany prototyp/handoff i jego visual/UX anchors;
- sprawdź aktualny template, SCSS, utilities, wrappers i shared UI patterns;
- sprawdź istniejące wzorce do reuse;
- ustal, czy jest blocker.

Nie zatrzymuj się po preflight, jeśli nie ma blockera albo nieoczekiwanego dirty tree. Preflight ma być początkiem pracy, nie osobnym zadaniem do akceptacji. Wynik preflightu uwzględnij dopiero w raporcie końcowym.

## Prototype contract

Accepted prototype is not loose inspiration.

Masz odtwarzać wskazane visual/UX anchors, chyba że task wyraźnie mówi inaczej. Prototype HTML/CSS jest visual reference, ale nie wolno kopiować jego klas ani CSS 1:1. Masz przełożyć prototyp na produkcyjne klocki projektu:

- existing utilities;
- shared components;
- PrimeNG wrappers;
- documented classes;
- theme/design tokens;
- existing SCSS patterns.

Przed zmianą UI ustal mapowanie:

- co w prototypie jest anchorem;
- który istniejący utility/component/token/pattern to obsługuje;
- czego brakuje;
- czy brak oznacza gap/blocker, czy minimalny nowy globalny pattern.

Nie implementuj „na oko” lokalnym CSS-em, jeśli istniejący system już ma odpowiedni klocek.

## CSS / SCSS discipline

SCSS powinien definiować głównie reusable skin/state/variant styling, a nie odtwarzać layout utilities.

Nie dodawaj w SCSS reguł typu:

- `display`;
- `flex`;
- `grid`;
- `gap`;
- `margin`;
- `padding`;
- `width` / `min-width` / `max-width`;
- alignment;
- overflow;

jeśli da się to wyrazić istniejącymi global utilities w HTML.

Zanim dodasz spacing/layout w SCSS, sprawdź istniejące utilities, np.:

- `flex-*`;
- `grid-*`;
- `gap-*`;
- `p-*`;
- `m-*`;
- `w-*`;
- `min-w-*`;
- `h-*`;
- `overflow-*`;
- responsive utilities.

Nowe SCSS layout rules są dozwolone tylko, gdy tworzysz świadomy, reusable pattern i potrafisz wyjaśnić, dlaczego utilities nie wystarczą.

Nie używaj klas losowo. Każda klasa w HTML musi mieć realny cel. Nie dodawaj defensywnych class stacks „na wszelki wypadek” (`min-w-0`, `h-full`, `w-full`, dodatkowe flex/gap/padding/overflow itd.), jeśli nie rozwiązują konkretnego problemu layoutu.

Jeśli element potrzebuje wielu klas, użyj tylko tych, które są faktycznie potrzebne.

## Tokens and naming

Nie twórz lokalnych nazw związanych z jedną aktualną funkcją, jeśli pattern ma być reusable.

Przykład:
- unikaj nazw typu `progress-xp`, `fill-hp`, `gamebar-xp`, jeśli to jest wizualny wariant progresu;
- preferuj role wizualne / semantyczne: `gold`, `danger`, `success`, `info`, `neutral`, `active`, `pending`, `disabled`, `selected`.

Jeśli task wymaga przeniesienia konkretnego koloru/gradientu z prototypu, przenieś go do odpowiedniego theme tokenu albo istniejącego patternu, nie do lokalnego component CSS.

Raw hex/rgba są dopuszczalne głównie w theme token definitions. Nie rozsiewaj ich po component/local SCSS.

## Text and visual hierarchy

Preferuj istniejące klasy semantyczne/funkcyjne dla statusów i decyzji:

- primary;
- secondary;
- info;
- success;
- warning/warn;
- danger/error;
- active;
- disabled;
- pending;
- conflict;
- selected.

`muted-text` stosuj tylko dla labeli, helper text, timestamps i drugorzędnej metadata.

Ważne wartości, statusy, outcomes, warnings, blockers, reasons, selected states i destructive confirmations nie mogą być `muted-text`.

## Reuse

Reuse oznacza realne użycie istniejących UI/patternów i logiki:

- utilities;
- wrappers;
- shared components;
- documented classes;
- theme tokens;
- methods;
- helpers;
- mappers;
- validators;
- factories;
- form configs;
- services/RPC helpers;
- state patterns.

Samo użycie komponentu/klasy, która naturalnie należy do edytowanej strony, nie jest wystarczającym dowodem reuse.

Przed dodaniem nowego patternu sprawdź minimum:

- `src/scss/base`;
- `src/scss/utilities`;
- `src/scss/components`;
- `src/scss/themes`;
- shared components;
- existing layout/topbar/sidebar/game-shell patterns;
- relevant UI docs/prototype mapping.

## No compatibility layering unless required

Nie zostawiaj starych trybów, wariantów, fallbacków ani transitional branches tylko dlatego, że kiedyś istniały.

Jeśli prototyp/task zastępuje stary wzorzec, usuń stary wzorzec z dotkniętego miejsca.

Nie dodawaj równolegle:

- starego i nowego layoutu;
- starego i nowego komponentu;
- `segmented` i `smooth`, jeśli aktualny accepted pattern wymaga po prostu jednego progress bara;
- fallbacków wizualnych „na wszelki wypadek”, jeśli nie są wymagane przez task.

Masz prawo usuwać kod. Masz obowiązek usuwać kod, który task zastępuje.

## HTML / SCSS / TS boundaries

Dla tasków stricte UI/layoutowych:

- preferuj zmiany w HTML/SCSS;
- nie ruszaj TS, jeśli nie trzeba;
- nie dodawaj speców, jeśli nie zmieniasz logiki/state/service i nie istnieje bezpośrednio relevant spec;
- nie przebudowuj component API, jeśli problem jest wizualny;
- nie twórz nowych inputów/variantów tylko po to, żeby zachować stare zachowanie.

TS zmieniaj tylko, jeśli task naprawdę wymaga danych, stanu, interakcji albo istniejące API uniemożliwia poprawne odwzorowanie prototypu.

## Cleanup

Przy zmianach w istniejących produkcyjnych HTML/SCSS/TS nie tylko dodawaj kod. Po implementacji zrób cleanup dotkniętych plików:

- usuń martwy HTML;
- usuń nieużywane importy;
- usuń zbędne klasy;
- usuń lokalny SCSS zastąpiony przez utilities;
- usuń obsolete fallbacki;
- usuń defensywne/transitional wrappers/classes;
- usuń stare warianty/patterny, które task zastępuje.

Nie bój się ciąć. Produkcyjny diff ma być możliwie mały. Jeśli dodajesz layout/klasy, szukaj równoważnego cleanupu. Preferuj minimalny net positive albo net negative, o ile nie pogarsza to czytelności.

## Tests and manual smoke

Po implementacji uruchom weryfikację zgodną z `AGENTS.md`, review standards i zakresem taska.

Dla czysto HTML/SCSS tasków focused specs są potrzebne tylko wtedy, gdy:

- istnieją bezpośrednio relevant specs;
- zmieniłeś TS/state/service;
- task dotyczy warunkowego renderowania lub interakcji.

Nie dopisuj dużych testów dla prostych zmian wizualnych. Jeśli istniejący test wymaga aktualizacji, zaktualizuj go minimalnie. Nie produkuj setek linii testów dla kilkunastu linii implementacji.

Nie uruchamiaj dev servera, web preview ani browser/manual smoke. Manual smoke wykonuje użytkownik/reviewer na swoim środowisku. W raporcie wpisz `Manual smoke: user-side`.

## Status docs

Nie aktualizuj status docs, chyba że użytkownik osobno o to poprosi albo potwierdzi wykonanie taska.

## Final report

Raport końcowy maksymalnie 15–20 linijek. Tylko:

- `AGENTS/Review Standards: applied`
- `Preflight`
- `Prototype/UI anchors`
- `Changed`
- `Not changed`
- `Cleanup`
- `Verification`
- `Static checks`
- `Reuse/patterns`
- `Manual smoke: user-side / N/A`
- `Blockers/risks`
- `Status docs: touched/not touched`

W `Prototype/UI anchors` napisz krótko:

- `matched:` najważniejsze anchors zachowane;
- `not matched:` tylko jeśli coś świadomie nie zostało zachowane i dlaczego;
- `gap:` jeśli brakuje produkcyjnego patternu albo danych.

W `Reuse/patterns` napisz krótko:

- `reused:` konkretne utilities/classes/wrappers/components/patterns/metody użyte ponownie;
- `checked but not reused:` konkretne rzeczy sprawdzone i powód odrzucenia;
- `new:` nowe klasy/components/SCSS/helpery i dlaczego istniejący wzorzec nie wystarczył.

Nie pisz epopei. Nie streszczaj oczywistości. Jeśli jesteś zablokowany, napisz krótko: co blokuje, czego brakuje i jaki pattern/plik/kontrakt jest potrzebny.