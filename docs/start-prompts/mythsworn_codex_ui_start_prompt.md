Cześć. Pracujemy nad projektem Mythsworn.

Najpierw przeczytaj i zastosuj `AGENTS.md` oraz `docs/mythborne_codex_review_standards.md`, jeśli istnieją. Dla tasków UI przeczytaj też `docs/ui-ux/README.md`, właściwy fragment `mythborne_ui_ux_backlog.md`, task-relevant UI-CORE docs oraz podany prototyp/handoff UI. Jeśli któryś wymagany plik nie istnieje, odnotuj to w raporcie końcowym, ale nie zatrzymuj pracy, chyba że brak pliku realnie blokuje task.

Twoim zadaniem jest implementować dokładnie wskazany task UI/UX w istniejącym repozytorium Angular/PrimeNG. Pracuj małymi, kontrolowanymi zmianami:

* realizuj tylko bieżący task;
* nie projektuj od nowa całego ekranu;
* nie improwizuj layoutu;
* nie rób unrelated refactorów;
* nie przebudowuj data layer, jeśli task jest wizualny/layoutowy;
* nie twórz nowych helperów, services, mappers, modeli, typów, komponentów ani klas CSS, jeśli istniejący kod/pattern da się sensownie użyć albo rozszerzyć;
* nie maskuj problemów fallbackami;
* jeśli brakuje danych, metadata, shared patternu, prototypu albo innego wymaganego źródła prawdy, zgłoś blocker/gap zamiast wymyślać zamiennik.

Przed rozpoczęciem edycji kodu wykonaj krótki preflight dla siebie:

* sprawdź `git status --short`;
* sprawdź właściwe dokumenty i źródła dla taska;
* sprawdź zaakceptowany prototyp/handoff i jego visual/UX anchors;
* sprawdź aktualny template, SCSS, utilities, wrappers i shared UI patterns;
* sprawdź istniejące wzorce do reuse;
* ustal, czy jest blocker.

Nie zatrzymuj się po preflight, jeśli nie ma blockera albo nieoczekiwanego dirty tree. Preflight ma być początkiem pracy, nie osobnym zadaniem do akceptacji. Wynik preflightu uwzględnij dopiero w raporcie końcowym.

Accepted prototype is not loose inspiration. Zachowaj wskazane visual/UX anchors, chyba że task wyraźnie mówi inaczej. Prototype HTML/CSS is visual reference only: nie kopiuj CSS/classes 1:1, tylko odtwarzaj layout, hierarchy, density, CTA placement, label/value/status hierarchy, active/hover/focus states i visual emphasis przy użyciu produkcyjnych utilities, shared components, PrimeNG wrappers i design tokens.

Nie używaj klas losowo. Każda klasa musi mieć realny cel. Nie dodawaj defensywnych class stacks „na wszelki wypadek” (`min-w-0`, `h-full`, `w-full`, dodatkowe flex/gap/padding/overflow itd.), jeśli nie rozwiązują konkretnego problemu layoutu. Jeśli element potrzebuje wielu klas, użyj tylko tych, które są faktycznie potrzebne.

Preferuj istniejące klasy semantyczne/funkcyjne dla statusów i decyzji: primary, secondary, info, success, warning/warn, danger/error, active, disabled, pending, conflict. `muted-text` stosuj tylko dla labeli, helper text, timestamps i drugorzędnej metadata. Ważne wartości, statusy, outcomes, warnings, blockers, reasons, selected states i destructive confirmations nie mogą być `muted-text`.

Reuse oznacza przede wszystkim ponowne użycie istniejących UI/patternów i logiki: utilities, wrappers, shared components, documented classes, methods, helpers, mappers, validators, factories, form configs, services/RPC helpers i state patterns. Samo użycie komponentu/klasy, która naturalnie należy do edytowanej strony, nie jest wystarczającym dowodem reuse.

Przy zmianach w istniejących produkcyjnych HTML/SCSS/TS nie tylko dodawaj kod. Po implementacji zrób cleanup dotkniętych plików:

* usuń martwy HTML;
* usuń nieużywane importy;
* usuń zbędne klasy;
* usuń lokalny SCSS zastąpiony przez utilities;
* usuń obsolete fallbacki;
* usuń defensywne/transitional wrappers/classes, które task zastępuje.

Nie bój się ciąć. Produkcyjny diff ma być możliwie mały. Jeśli dodajesz layout/klasy, szukaj równoważnego cleanupu. Preferuj minimalny net positive albo net negative, o ile nie pogarsza to czytelności. Nie zostawiaj starej ścieżki „na wszelki wypadek”, jeśli task ją zastępuje.

Nie aktualizuj status docs, chyba że użytkownik osobno o to poprosi albo potwierdzi wykonanie taska.

Po implementacji uruchom weryfikację zgodną z `AGENTS.md`, review standards i zakresem taska. Dla czysto HTML/SCSS tasków focused specs są potrzebne tylko wtedy, gdy istnieją bezpośrednio relevant specs albo zmieniłeś TS/state/service. Nie udawaj manual/browser smoke — manual smoke jest po stronie użytkownika/reviewera, chyba że faktycznie masz realną sesję, dane i środowisko.

Raport końcowy maksymalnie 15–20 linijek. Tylko:

* `AGENTS/Review Standards: applied`
* `Preflight`
* `Prototype/UI anchors`
* `Changed`
* `Not changed`
* `Cleanup`
* `Verification`
* `Static checks`
* `Reuse/patterns`
* `Manual smoke: user-side / N/A`
* `Blockers/risks`
* `Status docs: touched/not touched`

W `Prototype/UI anchors` napisz krótko:

* `matched:` najważniejsze anchors zachowane;
* `not matched:` tylko jeśli coś świadomie nie zostało zachowane i dlaczego;
* `gap:` jeśli brakuje produkcyjnego patternu albo danych.

W `Reuse/patterns` napisz krótko:

* `reused:` konkretne utilities/classes/wrappers/components/patterns/metody użyte ponownie;
* `checked but not reused:` konkretne rzeczy sprawdzone i powód odrzucenia;
* `new:` nowe klasy/components/SCSS/helpery i dlaczego istniejący wzorzec nie wystarczył.

Nie pisz epopei. Nie streszczaj oczywistości. Jeśli jesteś zablokowany, napisz krótko: co blokuje, czego brakuje i jaki pattern/plik/kontrakt jest potrzebny.
