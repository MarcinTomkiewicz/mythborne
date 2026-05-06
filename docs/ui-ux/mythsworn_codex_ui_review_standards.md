# Mythsworn — standardy review Codexa dla UI/UX

Status: working review standard  
Zakres: review tasków UI, UX, Angular templates, global SCSS, feature-local SCSS, PrimeNG wrappers, shared/layout components, prototypów HTML, player/admin screens i UI-adjacent workflow.  
Cel: wymusić spójny, klockowy UI bez utility soup, lokalnych pseudo-design-systemów, przypadkowego `ngModel`, kopiowania CSS z prototypów i słabego smoke/reportingu.

> Uwaga nazewnicza: w repo mogą nadal istnieć pliki z nazwą `mythborne` albo starszym `Monster Hunt`. Nowe UI-facing texty, promptowanie i nowe dokumenty powinny używać nazwy **Mythsworn**, chyba że użytkownik wyraźnie poleci inaczej. Nie zmieniać nazw istniejących plików bez polecenia użytkownika.

---

## 1. Format oczekiwanego review

Preferowany format odpowiedzi asystenta po raporcie Codexa:

1. **Decyzja**: `AKCEPTACJA`, `AKCEPTACJA WARUNKOWA`, `BLOCKER`, albo `DO DOPRECYZOWANIA`.
2. **Krótki komentarz**: dlaczego taka decyzja.
3. **Tabela checków**: najważniejsze obszary, status, komentarz.
4. **Tabela problemów**: problem, waga, co przekazać Codexowi.
5. **Wyjaśnienia / decyzje reviewera**: tylko jeśli trzeba doprecyzować zasady, odróżnić blocker od follow-upu albo rozstrzygnąć konflikt dokumentów.
6. **Pending manual smoke**: tylko realne kroki, które użytkownik może wykonać. Jeśli smoke jest niemożliwy z powodu braku danych/sesji/targetów, oznaczyć `N/A` albo `data-blocked`, a nie udawać pełny smoke.
7. **Gotowy blok komentarza dla Codexa**: zwięzły komentarz, który użytkownik może wkleić Codexowi.

Jeśli użytkownik prosi: **„daj sam review comment”**, nie dodawać tabel, długiej analizy ani sekcji dla użytkownika. Dać gotowy komentarz do Codexa.

### 1.1. Szablon pełnego review

```md
Decyzja: AKCEPTACJA / AKCEPTACJA WARUNKOWA / BLOCKER / DO DOPRECYZOWANIA

Komentarz:
...

Tabela checków:
| Obszar | Status | Komentarz |
|---|---|---|
| Source order / docs | OK / warning / blocker | ... |
| Reuse/shared patterns | OK / warning / blocker | ... |
| UI/SCSS/class budget | OK / warning / blocker | ... |
| PrimeNG wrappers | OK / warning / blocker / N/A | ... |
| Forms | OK / warning / blocker / N/A | ... |
| DB/RPC/data authority | OK / warning / blocker / N/A | ... |
| Stale guards | OK / warning / blocker / N/A | ... |
| Accessibility/responsive | OK / warning / blocker | ... |
| Smoke/verification | OK / warning / blocker / data-blocked | ... |

Problemy do przekazania Codexowi:
| Waga | Problem | Oczekiwana poprawka |
|---|---|---|
| blocker / required / follow-up | ... | ... |

Wyjaśnienia / decyzje reviewera:
- ...

Pending manual smoke:
- ...
- N/A albo data-blocked: ...

Gotowy komentarz dla Codexa:
```text
...
```
```

### 1.2. Jak klasyfikować decyzje

- **AKCEPTACJA** — task spełnia acceptance criteria, nie ma blockerów, ewentualne drobne follow-upy nie blokują użycia.
- **AKCEPTACJA WARUNKOWA** — kierunek jest dobry, ale są poprawki wymagane przed uznaniem taska za docelowo czysty albo przed następnym większym ekranem.
- **BLOCKER** — kod łamie źródło prawdy, DB/RPC authority, security/privacy, formularze, stale guards, UI-CORE no-copy, PrimeNG wrapper rules, albo realnie uniemożliwia flow.
- **DO DOPRECYZOWANIA** — raport albo zakres jest zbyt niejasny, żeby uczciwie ocenić task.

---

## 2. Source order dla UI review

Przy ocenie UI tasków stosować ten source order:

1. Explicit user instruction z bieżącej rozmowy.
2. Aktualny kod repo i faktyczne pliki zmienione przez Codexa.
3. Aktualna baza / migrations / dump / generated `database.types.ts` jako read-only source of truth, jeśli UI dotyka danych.
4. `current-decisions.md`.
5. `database-current.md`.
6. `project-context.md`.
7. `AGENTS.md`.
8. `project-structure.md`.
9. `ui-ux-notes.md`.
10. `current-state-summary.md` i `current-todo.md` jako status/progress, nie schema authority.
11. `mythborne_ui_ux_backlog.md` / UI/UX backlog.
12. UI-CORE documents under `docs/ui-ux/`.
13. Accepted prototypes under `docs/ui-ux/prototypes/` as visual reference only.
14. Legacy concept docs only as historical background, never as override for current DB/code/decisions.

Jeżeli prototyp, backlog i aktualny kod są w konflikcie, review ma wymagać tłumaczenia intencji prototypu na obecne globalne wzorce, a nie kopiowania prototypu.

### 2.1. Repo hygiene, missing docs i generated types

Review powinno sprawdzić trzy zasady startowe, zwłaszcza w nowych konwersacjach Codexa:

1. **Generated types / `database.types.ts`:**
   - Codex może czytać generated types jako source of truth.
   - Codex nie może regenerować ani edytować `database.types.ts` / generated types, chyba że użytkownik wyraźnie to poleci.
   - Sam fakt, że generated types są nieaktualne, powinien być zgłoszony jako dependency/blocker albo warning zależnie od taska; nie jest zgodą na samodzielną regenerację.

2. **Missing docs:**
   - Jeśli plik z listy kontekstowej, np. `AGENTS.md`, `project-context.md`, `current-decisions.md`, `database-current.md`, `ui-ux-notes.md` albo UI-CORE doc, nie istnieje w repo, Codex ma zgłosić warning i kontynuować z dostępnymi źródłami.
   - Brak takiego pliku nie powinien sam z siebie blokować taska.
   - Wyjątek: jeśli użytkownik wyraźnie wskazał dany plik jako wymagany blocker albo task polega na pracy właśnie na tym pliku, wtedy brak pliku jest blockerem/do doprecyzowania.

3. **Dirty working tree:**
   - Codex ma zaczynać od `git status --short` i zgłaszać listę dirty files.
   - Jeśli użytkownik wcześniej wskazał konkretne known dirty files, Codex ma zostawić je nietknięte i może kontynuować, o ile task ich nie dotyka.
   - Jeśli dirty files są nowe, nieznane albo nieautoryzowane, Codex ma zatrzymać się i zapytać użytkownika przed zmianami.
   - Review powinno traktować nadpisanie cudzych/nieautoryzowanych zmian jako blocker.

---

## 3. Dokumenty, które Codex powinien czytać przy większych UI taskach

Dla większych tasków UI, screenów prototypowych, global SCSS lub PrimeNG Codex powinien jawnie uwzględnić:

- `docs/ui-ux/mythsworn-style-contract.md`
- `docs/ui-ux/global-scss-shared-inventory.md`
- `docs/ui-ux/local-scss-budget-checklist.md`
- `docs/ui-ux/prototype-production-mapping.md`
- `docs/ui-ux/primeng-vendor-wrapper-lookup.md`
- `docs/ui-ux/shared-surface-patterns.md`
- `docs/ui-ux/surface-badge-pattern-expansion.md`
- `docs/ui-ux/utility-class-audit.md`
- `docs/ui-ux/layout-section-pattern-cleanup.md`
- `docs/ui-ux/text-utility-semantics.md`
- `docs/ui-ux/icon-brand-registry.md`
- `docs/ui-ux/icon-placeholder-mapping.md`
- `docs/ui-ux/table-paginator-list-decision.md`

Dodatkowo, zależnie od taska:

- itemy/popover/loot/rewards/trade/auction/reports: `docs/ui-ux/item-popover-contract.md`
- shell/sidebar/topbar: style contract, prototype mapping, icon/brand registry, layout cleanup
- reports/notifications: table/list decision, surface patterns, text semantics
- PrimeNG controls/dialogs/popovers/tables/forms: vendor wrapper lookup, local SCSS checklist
- minigame/trial screens: prototype mapping plus renderer boundary; canvas/prototype CSS nadal nie jest produkcyjnym CSS

Brak wzmianki o tych dokumentach w raporcie nie zawsze jest blockerem dla małej poprawki tekstowej, ale jest blockerem dla większego UI taska. Jeśli dokument nie istnieje w repo, właściwe zachowanie Codexa to warning + kontynuacja z dostępnymi źródłami, nie tworzenie placeholdera i nie automatyczny blocker.

---

## 4. Fundamentalna zasada: prototyp HTML nie jest produkcyjnym źródłem

Każdy zaakceptowany prototype HTML jest **visual reference only**.

Codex nie może:

- kopiować CSS z canvas/prototype HTML do Angular feature componentów;
- przenosić `mb-*` klas do produkcji;
- kopiować prototypowych tokenów, gradientów, shadowów, borderów i palet;
- traktować mock copy, mock values albo placeholder IDs jako produkcyjnych danych;
- tworzyć lokalnego design systemu per screen, np. `auction-card`, `trial-card`, `report-card`, jeśli istnieje lub powinien powstać global/shared pattern.

Codex ma:

- rozpoznać intencję wizualną prototypu;
- sprawdzić obecne shared/layout/global/PrimeNG wzorce;
- użyć istniejących `mg-*`, `.tag-badge--*`, layout utilities, PrimeNG wrappers i shared components;
- jeśli wzorzec jest powtarzalny lub prototype-backed, zaproponować global/shared pattern zamiast lokalnej zupy.

Review powinno traktować `copied from prototype: yes` jako blocker, chyba że użytkownik wyjątkowo zatwierdził tymczasowy non-style placeholder.

---

## 5. Global SCSS first i `mg-*` jako production foundation

Obecny system `mg-*` jest production compatibility layer i aktualnym fundamentem. Nie jest idealny, ale Codex nie może go omijać przez tworzenie równoległego lokalnego systemu.

Preferowana kolejność:

1. Shared/layout Angular component.
2. PrimeNG component przez istniejący vendor wrapper.
3. Globalne `mg-*`, `.tag-badge--*`, grid/flex/spacing utilities.
4. Global/shared pattern, jeśli potrzeba jest powtarzalna lub prototype-backed.
5. Feature-local SCSS tylko jako wąski, udokumentowany wyjątek.

Dopuszczalne lokalne SCSS:

- host sizing/containment route lub komponentu;
- jednorazowa kompozycja grid/flex dla konkretnego route layoutu;
- wąskie responsive placement;
- tymczasowy migration wrapper z follow-up.

Niedopuszczalne lokalne SCSS:

- nowe tokeny kolorów;
- nowe systemy card/surface/badge/chip/button;
- lokalne PrimeNG skins;
- lokalne `.p-*` override lub `::ng-deep` bez udokumentowanego bug/workaround;
- gameplay/access-control visibility semantics;
- DB/status/dictionary meaning;
- kopiowane gradienty i canvasowe `mb-*`.

---

## 6. Class budget i utility usage

Review ma być restrykcyjne wobec klas utility. Utility są do kompozycji, nie do budowania lokalnego design systemu.

### 6.1. Budżet klas

| Element | Budżet | Reguła review |
|---|---:|---|
| Zwykły element semantyczny | 1–2 klasy | Domyślne oczekiwanie. |
| Layout wrapper | do 3 klas | Akceptowalne przy grid/flex/spacing. |
| Repeated item/card/list row | do 3 klas | Jeśli powtarzalne, rozważyć shared/global pattern. |
| PrimeNG host | istniejące wrapper classes + host layout | Bez lokalnych `.p-*` skins. |
| > 3 klasy | wyjątek | Wymaga uzasadnienia w raporcie. |

### 6.2. Sygnały utility soup

To powinno wywołać pytanie review:

- ten sam stack `mg-card flex-col gap-* p-*` powtarza się w wielu rows/cardach;
- zagnieżdżone divy istnieją tylko po to, żeby utrzymać spacing;
- utility classes kodują status, permission albo access state;
- `w-px-*`, `h-px-*`, `max-h-*` wymuszają layout kosztem czytelności;
- normalny element ma 5–10 klas bez wyraźnej semantyki;
- Codex dodaje lokalną klasę tylko po to, żeby powtórzyć globalny surface/card/badge pattern.

Review comment powinien wtedy wymagać jednego z:

- użycia istniejącego global patternu;
- stworzenia małego shared componentu;
- stworzenia globalnego patternu w osobnym tasku;
- ograniczenia lokalnego SCSS do host/layout composition.

---

## 7. Target UI klocki, które review powinno promować

Poniższe nazwy są target/pattern API albo planowanymi globalnymi klockami. Review nie ma wymuszać ich użycia, jeśli nie istnieją jeszcze w repo, ale ma wymuszać zgodność kierunku.

Docelowe klocki:

- `mg-page-header`
- `mg-page-header__main`
- `mg-page-header__meta`
- `mg-card`
- `mg-card--elevated`
- `mg-card--selected`
- `mg-row-surface`
- `mg-summary-card`
- `mg-summary-row`
- `mg-stat-card`
- `mg-note-panel`
- `mg-status-pill`
- `mg-chip`
- `mg-detail-panel`

Jeśli klasa jeszcze nie istnieje, Codex ma użyć fallbacku wskazanego w UI-CORE docs, np. `mg-card`, `mg-section__title`, `.tag-badge--*`, grid/flex utilities, albo zgłosić potrzebę global pattern taska.

Review ma blokować sytuację, w której Codex używa nieistniejącej klasy bez jej implementacji albo tworzy lokalny odpowiednik tylko dla jednego ekranu.

---

## 8. PrimeNG i vendor wrappers

Feature-local PrimeNG internals są domyślnie zablokowane.

Codex ma:

1. użyć PrimeNG component normalnie;
2. sprawdzić wrapper w `src/scss/vendors/*`;
3. użyć global utilities tylko dla host/layout composition;
4. jeśli potrzeba jest powtarzalna, rozszerzyć globalny wrapper albo zaproponować osobny task;
5. dodać lokalny SCSS tylko jako opisany wyjątek.

Blockery:

- lokalne `.p-button`, `.p-select`, `.p-datatable`, `.p-popover`, `.p-dialog`, `.p-tabs` skins;
- lokalny `::ng-deep` bez powodu;
- duplikacja focus/hover/disabled state z wrappera;
- tooltip jako jedyna dostępna nazwa dla icon-only control;
- użycie deprecated PrimeNG API;
- użycie PrimeNG component w sposób sprzeczny z obecnym wrapperem lub znanymi bugami projektu.

---

## 9. Formularze: Reactive Forms jako stabilny default

Stabilny default projektu to **Reactive Forms + istniejące form factories/config patterns**.

### 9.1. `ngModel` rule

`ngModel` nie jest dopuszczalny w nowym ani dotykanym kodzie UI.

Review ma traktować jako **BLOCKER**:

- nowy `ngModel`;
- nowe `FormsModule` tylko po to, żeby obsłużyć `ngModel`;
- mieszanie `ngModel` z reactive forms;
- poprawkę UI, która dotyka pliku z istniejącym `ngModel`, ale zostawia dotknięty flow bez planu.

Jeśli Codex dotyka pliku z istniejącym `ngModel`, ma:

1. zastąpić go Reactive Forms w zakresie taska, jeśli jest to rozsądnie małe;
2. albo zgłosić jawny follow-up/refactor, jeśli migracja wykracza poza zakres;
3. nie pogarszać sytuacji przez dokładanie kolejnego `ngModel`.

### 9.2. Signal Forms

Signal Forms mogą być kierunkiem do sprawdzenia dla nowych formularzy signal-first, ale są traktowane jako **experimental / spike-only**, dopóki projekt nie podejmie osobnej decyzji.

Codex nie powinien samodzielnie migrować produkcyjnych formularzy na Signal Forms bez:

- osobnej decyzji użytkownika;
- izolowanego spike’u;
- wyraźnego acceptance criteria;
- planu interoperacyjności z obecnymi form factory/config patterns.

### 9.3. Form architecture

Review ma promować:

- form factories/configs poza komponentem;
- typed form models poza component files;
- reuse istniejących validators/config/renderers;
- krótkie komponenty z cienką logiką;
- stale guard dla submit/save/error path.

---

## 10. Text semantics: `muted-text` i statusy

`muted-text` jest do metadata, labeli, timestampów, helper text i non-critical copy.

`muted-text` nie może być użyte dla:

- blockerów;
- errors;
- warnings action-critical;
- verdicts;
- success/failure outcomes;
- requirements decydujących o dostępie;
- destructive confirmations;
- status transitions;
- gameplay consequences.

Dla statusów i decyzji używać:

- `.tag-badge--*`;
- `mg-status-pill` jeśli istnieje;
- `mg-note-panel` jeśli istnieje;
- result/summary card;
- PrimeNG Message dla inline errors/forms, zgodnie z wrapperami.

---

## 11. DB/RPC/data authority w UI review

UI nie może udawać danych ani logiki, których nie ma w DB/RPC/read model.

Review ma sprawdzić:

- czy UI nie hardcoduje gameplay labels, eligibility, rewards, item legality, combat outcome, report state, admin dictionaries;
- czy player-facing UI nie pokazuje raw keys jako primary label, jeśli istnieje DB label/dictionary;
- czy mutacje gameplay/economy/admin idą przez canonical RPC/domain/governance paths;
- czy Angular nie jest authority dla durable mutation;
- czy brak DB/RPC jest zgłoszony jako blocker/dependency, a nie frontend fallback.

Szczególnie pilnować:

- items / item popover / equipment legality;
- direct trade / auction;
- exploration / trial / encounter / combat;
- reports / notifications;
- PvP target/result/consequences;
- admin config/governance/balance/dictionaries.

---

## 12. Stale guards

Każdy async UI workflow musi mieć stale success/error guard, jeśli zależy od:

- selected server;
- active hero;
- route id;
- selected item;
- selected report;
- selected notification;
- selected trade/listing;
- selected PvP target;
- selected admin entity/config/change set;
- access/gate;
- active trial/challenge/combat attempt.

Wymagania:

- stary success nie nadpisuje current state;
- stary error nie pokazuje błędu po zmianie kontekstu;
- loading kończy się tylko dla aktualnego requestu;
- zmiana contextu czyści stale form state i feedback;
- response po zmianie selected entity jest ignorowany.

Brak stale guard w dotkniętym async workflow jest blockerem, jeśli flow realnie zależy od zmiennego kontekstu.

---

## 13. Accessibility, responsive i motion safety

Minimum review:

- widoczne focus states;
- icon-only controls mają accessible name;
- tooltip/popover/dialog nie jest hover-only dla krytycznych informacji;
- status nie jest komunikowany wyłącznie kolorem;
- klikalne itemy/sloty mają keyboard/click/focus path albo jawny follow-up;
- mobile/tablet może być ograniczone, ale nie może się całkiem rozpaść;
- gęste listy/tabele mają overflow/pagination pattern;
- minigry/prototypy unikają unsafe flashing/strobe i wspierają reduced motion.

Motion safety jest szczególnie ważne dla trial/minigame screens. Szybkie błyski, strobe i gwałtowne kontrasty są blockerem.

---

## 14. Manual smoke i verification

### 14.1. Route smoke nie wystarcza

`route smoke 200` to minimum techniczne, nie UX smoke.

Nie akceptować taska jako UX-ready tylko dlatego, że route się ładuje.

### 14.2. Nie proponować niemożliwego manual smoke

Codex/reviewer nie powinien proponować manual smoke, o którym wiadomo, że nie da się go wykonać z powodu:

- braku zalogowanej sesji;
- braku realnych danych;
- braku drugiego hero/targetu;
- braku DB seedów;
- braku route accessu;
- braku aktywnego challenge/combat/report/trade;
- braku backend contractu.

W takiej sytuacji smoke oznaczyć jako:

- `N/A` — flow nie dotyczy taska;
- `data-blocked` — potrzebne są konkretne dane/sesja/target;
- `environment-blocked` — potrzebny jest inny runtime/env/access;
- `backend-blocked` — brakuje DB/RPC/read model.

Jeśli smoke jest `data-blocked`, raport powinien podać minimalne dane potrzebne do wykonania smoke, np. „hero z active exploration challenge_attempt typu combat” albo „dwa hero na tym samym standard server z estate”.

### 14.3. Verification checklist

Review ma sprawdzić, czy Codex podał:

- komendy uruchomione (`npm run build`, `npx tsc --noEmit`, testy focused);
- komendy nieuruchomione i dlaczego;
- manual smoke checklist tylko wtedy, gdy jest wykonalny;
- user-only smoke dla realnych flow;
- known warnings oddzielone od nowych problemów.

---

## 15. Privacy / player-staff boundary

Player-facing UI nie może wystawiać staff-only pól:

- `adminNotes`;
- `operatorNotes`;
- `statusReason` / `verdictReason` tam, gdzie jest staff-only;
- global account ids;
- private anti-abuse/moderation/admin internals;
- staff-only diagnostics.

Staff-facing UI musi być gated i server-scoped.

Jeśli UI pokazuje historyczne reports/snapshots, musi używać właściwego safe/public/private read modelu, nie refetchować mutable current state jako historycznej prawdy.

---

## 16. Architecture and file placement

Review ma blokować:

- interfejsy, typy i form types w component files;
- domain mappers w page components;
- workflow/state w dużym route component;
- nowe utils w złym miejscu;
- duże komponenty TS/HTML bez uzasadnienia.

Domyślne lokacje:

- domenowe modele: `core/domain/...`;
- typy formularzy: `core/types/forms/...`;
- generyczne typy: `core/types/...`;
- mappery/utils: `core/utils/...`, jeśli są czyste i testowalne;
- workflow/state: `core/services/...` albo dedykowana state/workflow class;
- shared UI: `shared/...`;
- shell/layout: `layout/...`;
- route pages: właściwe `pages/...`.

Duży komponent 250–400+ linii produkcyjnego TS/HTML jest warning sign. Może być akceptowalny w złożonym rendererze/minigame host tylko z uzasadnieniem i planem splitu.

---

## 17. Required Codex report dla UI tasków

Każdy większy UI task powinien raportować:

1. `Task scope` — co obejmował task.
2. `Non-goals` — czego celowo nie ruszał.
3. `Files changed` — lista zmienionych plików.
4. `Repo hygiene` — `git status --short`, known dirty files left untouched, missing docs warnings, generated types not modified unless explicitly requested.
5. `Acceptance mapping` — warunek → status.
6. `Verification` — komendy i wyniki; jeśli czegoś nie uruchomiono, napisać wprost.
7. `Clean-code check` — DRY, KISS, separation of concerns, thin components.
8. `Reuse report`:
   - `reused:` konkretne komponenty/klasy/wrappers/services/mappers/utilities;
   - `checked but not reused:` co sprawdzono i dlaczego nie pasowało;
   - `new component/state/helper added:` co dodano i dlaczego.
9. `UI styling report`:
   - `UI-CORE docs read:` które;
   - `copied from prototype:` yes/no;
   - `prototype classes copied:` yes/no;
   - `local SCSS added:` yes/no + dlaczego;
   - `new global SCSS/pattern added:` yes/no + dlaczego;
   - `PrimeNG local override:` yes/no;
   - `class budget exceptions:` lista albo none;
   - `utility stack reuse risk:` opis;
   - `accessibility/responsive smoke:` co sprawdzono albo pending.
10. `Forms report`, jeśli task dotyka formularzy:
   - `Reactive Forms used:` yes/no;
   - `ngModel added/touched:` no albo wyjaśnienie;
   - `form factory/config reused:` yes/no;
   - `Signal Forms:` not used / spike only / explicitly approved.
11. `Stale guard check` — jakie async/context flows zabezpieczono albo dlaczego nie dotyczy.
12. `Manual smoke checklist for user` — konkretne, wykonalne kroki albo `N/A/data-blocked` z powodem.

Brak tych sekcji nie jest automatycznym blockerem dla drobnej poprawki copy, ale jest blockerem dla większego UI/workflow/screen taska.

---

## 18. Typowe blockery UI review

Traktować jako blocker, jeśli występuje w dotkniętym zakresie:

- skopiowany CSS/prototype classes/palette z prototypu;
- samodzielna regeneracja albo ręczna edycja `database.types.ts` / generated types bez wyraźnego polecenia użytkownika;
- kontynuacja pracy mimo nowych/nieautoryzowanych dirty files bez decyzji użytkownika;
- nadpisanie known dirty files wskazanych przez użytkownika jako nietykalne;
- nowy lokalny card/badge/chip/button system;
- feature-local PrimeNG skin / `.p-*` / `::ng-deep` bez zgody;
- nowy albo pogorszony `ngModel`;
- brak stale guard w async workflow zależnym od contextu;
- hardcoded DB dictionary/gameplay label tam, gdzie istnieje DB source;
- direct workflow table write zamiast canonical RPC/domain operation;
- player-facing leak staff/private fields;
- UI smoke wykazuje, że nie da się wykonać pracy;
- route smoke 200 przedstawiony jako pełny UX smoke;
- niemożliwy manual smoke podany jako wymagany bez oznaczenia `data-blocked`;
- production use of non-existing target class bez implementacji;
- icon-only action bez accessible name.

---

## 19. Gotowy minimalny review comment — szablon

```text
Decyzja: ...

Komentarz:
...

Uwagi do poprawki:
- ...

Pending manual smoke:
- N/A / data-blocked / konkretne kroki ...
```

---

## 20. Reviewer reminder

Nie oceniać UI tylko po tym, czy „wygląda podobnie do prototypu”. Dobre UI taski w Mythsworn mają spełniać trzy warstwy naraz:

1. **UX/visual direction** — ekran jest czytelny, spójny z Mythsworn i realizuje intencję prototypu.
2. **Production structure** — kod używa globalnych/shared/vendor klocków i nie tworzy utility soup.
3. **Data/workflow authority** — UI respektuje DB/RPC/read models, dictionaries, stale guards, privacy i canonical workflow boundaries.
