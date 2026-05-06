# Mythsworn — prompt startowy dla konwersacji Codexa przy UI/UX

Ten plik zawiera dwa tryby startowania rozmowy z Codexem:

1. **Full bootstrap mode** — użyj na początku dużej nowej konwersacji, przy nowym ekranie/prototypie, większym UI tasku, global SCSS, PrimeNG wrapperach albo kiedy poprzednia rozmowa się rozjechała.
2. **Short task mode** — użyj przy małej poprawce, follow-upie, drobnym cleanupie albo kontynuacji, kiedy Codex ma już kontekst, ale nadal musi trzymać standardy UI.

Pełny source order i pełne reguły review są w:

- `docs/ui-ux/mythsworn_codex_ui_review_standards.md` albo aktualnym pliku standardów review UI, jeśli repo używa innej ścieżki;
- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/prototype-production-mapping.md`;
- UI/UX backlogu.

Jeśli start prompt i review standards się różnią, preferuj review standards + explicit user instruction + aktualny kod/DB.

---

## Full bootstrap mode

Skopiuj poniższy prompt jako pierwszy komunikat w nowej większej rozmowie z Codexem.

```text
Pracujemy w projekcie Mythsworn.

Masz działać ostrożnie, małymi krokami, z pełnym poszanowaniem aktualnego repo, DB/RPC contracts, generated types, UI-CORE dokumentów i istniejących globalnych wzorców. Nie traktuj prototypów HTML jako kodu produkcyjnego. Prototypy są visual reference only.

Zanim zaczniesz kodować:

1. Uruchom `git status --short`.
   - Jeśli working tree nie jest clean, wypisz listę zmian.
   - Jeśli użytkownik wcześniej wskazał konkretne known dirty files, zostaw je nietknięte i możesz kontynuować, o ile task ich nie dotyka.
   - Jeśli dirty files są nowe, nieznane albo nieautoryzowane, zatrzymaj się i zapytaj użytkownika przed zmianami.
   - Nie nadpisuj cudzych zmian.

2. Przeczytaj aktualne źródła kontekstu:
   - `AGENTS.md`
   - `project-context.md`
   - `current-decisions.md`
   - `database-current.md`
   - `project-structure.md`
   - `ui-ux-notes.md`
   - `current-state-summary.md`
   - `current-todo.md`
   - relevant backlog task / user prompt

   Jeśli któryś z tych plików nie istnieje w repo, zgłoś warning i kontynuuj z dostępnymi źródłami. Brak takiego pliku nie blokuje taska sam z siebie, chyba że użytkownik wyraźnie wskazał go jako wymagany blocker.

3. Dla tasków UI/UX przeczytaj właściwe UI-CORE docs, minimum:
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

   Jeśli któryś UI-CORE plik z listy nie istnieje w repo, zgłoś warning i kontynuuj z dostępnymi źródłami. Nie twórz brakującego dokumentu ani placeholdera bez polecenia użytkownika.

4. Jeśli task dotyczy itemów, popoverów, lootów, rewards, trade, auction albo reports, przeczytaj też:
   - `docs/ui-ux/item-popover-contract.md`

5. Jeśli task jest prototype-backed, przeczytaj właściwy plik z `docs/ui-ux/prototypes/`, ale pamiętaj:
   - nie kopiuj CSS z prototypu;
   - nie kopiuj `mb-*` classes;
   - nie kopiuj prototypowych tokenów, gradientów, palette values, shadowów ani layout class names;
   - przetłumacz zaakceptowaną intencję wizualną na istniejące global SCSS, PrimeNG wrappers, shared components, layout utilities albo zaproponuj global/shared pattern task.

Source order:

1. explicit user instruction,
2. current repo/code,
3. current DB schema/migrations/dump/generated `database.types.ts` as read-only source of truth,
4. `current-decisions.md`,
5. `database-current.md`,
6. `project-context.md`,
7. `AGENTS.md`,
8. `project-structure.md`,
9. `ui-ux-notes.md`,
10. `current-state-summary.md` and `current-todo.md` as progress/status, not schema authority,
11. UI/UX backlog,
12. UI-CORE docs,
13. accepted prototype direction as visual reference only,
14. legacy concept docs only as background.

Nazwa projektu:
- Nowe UI-facing texty i nowe dokumenty powinny używać nazwy `Mythsworn`.
- Starsze pliki mogą nadal mieć `mythborne`/`Monster Hunt`; nie zmieniaj nazw plików bez polecenia użytkownika.

Zasady Angular/code architecture:

- Angular 21, zoneless, signals-first.
- Preferuj signals/computed/effects tam, gdzie pasuje do obecnych patternów.
- Nie używaj legacy Angular patterns bez powodu.
- Stabilny default formularzy: Reactive Forms + istniejące form factories/config patterns.
- `ngModel` nie jest dopuszczalny w nowym ani dotykanym kodzie.
- Jeśli dotykasz pliku z istniejącym `ngModel`, zastąp go w zakresie taska albo zgłoś explicit follow-up, jeśli migracja wykracza poza scope. Nie dodawaj kolejnego `ngModel`.
- Signal Forms są experimental/spike-only. Nie migruj produkcyjnych formularzy na Signal Forms bez osobnej decyzji użytkownika albo izolowanego spike’u.
- Route page ma być cienka.
- Większy state/workflow nie może siedzieć w komponencie.
- Interfejsy, typy i form types nie mogą lądować w component files.
- Domenowe modele: `core/domain/...`.
- Typy formularzy: `core/types/forms/...`.
- Generyczne typy: `core/types/...`.
- Mappery/utils: `core/utils/...`, jeśli są czyste i testowalne.
- Workflow/state: `core/services/...` albo dedykowana state/workflow class, jeśli logika jest większa niż cienki helper.
- Shared UI trafia do `shared`; shell/layout do `layout`; feature page do właściwego `pages`.
- Duży komponent 250–400+ linii TS/HTML jest warning sign; rozbij go albo uzasadnij.

Zasady UI/SCSS:

- Obecny produkcyjny fundament to `mg-*`, `.tag-badge--*`, global SCSS, layout utilities, vendor wrappers i shared/layout components.
- Nie twórz równoległego lokalnego `mb-*` systemu w Angularze.
- Nie twórz lokalnego card/surface/badge/chip/button systemu.
- Nie dodawaj lokalnych color tokens ani palette values.
- Nie kopiuj canvas/prototype CSS.
- Używaj globalnych klas i wrappers świadomie, ale nie rób utility soup.

Lookup order przed dodaniem lokalnego SCSS albo nowej klasy:

1. Shared/layout Angular component.
2. PrimeNG component + istniejący vendor wrapper.
3. Global `mg-*` surface/layout/utility classes.
4. Existing shared feature-local pattern, jeśli jest w tym module.
5. New global/shared pattern, jeśli potrzeba jest powtarzalna lub prototype-backed.
6. Feature-local SCSS tylko jako wąski, udokumentowany wyjątek.

Class budget:

- Normal semantic element: 1–2 klasy.
- Layout wrapper: do 3 klas.
- Repeated item/card/list row: do 3 klas.
- PrimeNG host/component: istniejące wrapper classes + host layout only.
- Więcej niż 3 klasy na normalnym elemencie wymaga uzasadnienia w raporcie.

Utility discipline:

- Utility classes są do kompozycji, nie do tworzenia lokalnego design systemu.
- Powtarzalne stacki typu `mg-card flex-col gap-* p-*` w wielu rows/cardach są sygnałem do shared/global patternu.
- Nie używaj width/height utilities do ukrywania contentu, access logic albo wymuszania pękających layoutów.
- Nie używaj utility classes jako gameplay/status semantics.

PrimeNG:

- Używaj istniejących `src/scss/vendors/*` wrappers.
- Nie dodawaj lokalnych `.p-button`, `.p-select`, `.p-datatable`, `.p-popover`, `.p-dialog`, `.p-tabs` skins.
- Nie używaj lokalnego `::ng-deep` bez jednoznacznego bug/workaround i follow-upu.
- Icon-only controls muszą mieć accessible name; tooltip nie może być jedyną nazwą.
- Nie używaj deprecated PrimeNG API.

Text semantics:

- `muted-text` tylko dla labeli, helper text, timestampów, secondary metadata i niekrytycznych opisów.
- Nie używaj `muted-text` dla errors, blockers, verdicts, success/failure outcomes, requirements, destructive confirmations ani action-critical warnings.
- Dla statusów używaj `.tag-badge--*`, status pill, note panel, result card albo odpowiedniego global/shared patternu.

DB/RPC/data rules:

- Nie wymyślaj tabel, RPC, helperów, enumów ani generated types.
- Możesz czytać `database.types.ts` / generated types jako source of truth, ale nie regeneruj ich i nie edytuj, chyba że użytkownik wyraźnie to polecił.
- Nie zakładaj `hero.id === auth.uid()`.
- Ładuj selected/current server i active hero przed hero-owned queries.
- Używaj DB dictionaries/configs/read models zamiast hardcoded labels/config/gameplay lists.
- Critical gameplay/economy/admin mutations muszą iść przez canonical DB/RPC/domain/governance paths.
- Nie rób direct `insert/update/upsert/create` do tabel workflow, jeśli istnieje albo powinien istnieć canonical RPC/domain operation.
- Angular może robić preview/admin explainability, ale nie może być authority dla durable gameplay mutation.
- Jeśli brakuje DB/RPC/read model, zgłoś blocker/dependency zamiast frontend fallbacku.

Stale guards:

Każdy async workflow musi mieć stale success/error guard, jeśli zależy od:

- selected server,
- active hero,
- route id,
- selected item,
- selected report,
- selected notification,
- selected trade/listing,
- selected PvP target,
- selected admin entity/config/change set,
- access/gate,
- active trial/challenge/combat attempt.

Wymagania:

- stary success nie nadpisuje current state;
- stary error nie pokazuje błędu po zmianie kontekstu;
- loading kończy się tylko dla aktualnego requestu;
- zmiana contextu czyści stale form state i feedback;
- response po zmianie selected entity jest ignorowany.

Accessibility/responsive baseline:

- Focus states widoczne.
- Icon-only controls mają accessible name.
- Tooltip/popover/dialog nie jest hover-only dla krytycznych informacji.
- Status nie jest komunikowany wyłącznie kolorem.
- Klikalne itemy/sloty mają keyboard/click/focus path albo jawny follow-up.
- Mobile/tablet może być ograniczone, ale nie może się całkiem rozpaść.
- Gęste listy/tabele mają overflow/pagination pattern.
- Ruchome minigry/prototypy unikają unsafe flashing/strobe i wspierają reduced motion.

Privacy:

- Player-facing UI nie może wystawiać staff-only pól: `adminNotes`, `operatorNotes`, `statusReason`, `verdictReason`, global account ids, staff/admin/private internals.
- Staff-facing UI musi być gated i server-scoped.

Nie aktualizuj status docs:

- Nie zmieniaj `current-todo.md`, `current-state-summary.md` ani backlog task statusów, chyba że użytkownik wyraźnie poprosi albo potwierdzi completion.
- Po tasku raportuj zmiany i czekaj na akceptację użytkownika.

Jeżeli przed kodowaniem widzisz problem:

- brak DB/RPC/read model,
- brak zgodnych generated types, które blokują task — zgłoś dependency; nie regeneruj ich bez wyraźnego polecenia użytkownika,
- nieistniejący global pattern, który jest potrzebny,
- working tree ma nowe/nieznane dirty files,
- task wymaga decyzji domenowej,
- prototyp koliduje z obecnym kodem,

zatrzymaj się, opisz blocker/dependency i nie fake’uj funkcjonalności.

Task do wykonania:

[TUTAJ WKLEJ KONKRETNY TASK / EPIC / PROMPT]

W raporcie końcowym użyj takiej struktury:

1. `Task scope` — co obejmował task.
2. `Non-goals` — czego celowo nie ruszałeś.
3. `Files changed` — lista zmienionych plików.
4. `Acceptance mapping` — warunek → status.
5. `Verification` — komendy uruchomione i wyniki; jeśli czegoś nie uruchomiono, napisz wprost.
6. `Clean-code check` — DRY, KISS, separation of concerns, thin components.
7. `Reuse report`:
   - `reused:` konkretne komponenty/klasy/wrappers/services/mappers/utilities;
   - `checked but not reused:` co sprawdzono i dlaczego nie pasowało;
   - `new component/state/helper added:` co dodano i dlaczego.
8. `UI styling report`:
   - `UI-CORE docs read:` które;
   - `copied from prototype:` yes/no;
   - `prototype classes copied:` yes/no;
   - `local SCSS added:` yes/no + dlaczego;
   - `new global SCSS/pattern added:` yes/no + dlaczego;
   - `PrimeNG local override:` yes/no;
   - `class budget exceptions:` lista albo none;
   - `utility stack reuse risk:` opis;
   - `accessibility/responsive smoke:` co sprawdzono albo pending.
9. `Forms report`, jeśli dotyczy:
   - `Reactive Forms used:` yes/no;
   - `ngModel added/touched:` no albo wyjaśnienie/follow-up;
   - `form factory/config reused:` yes/no;
   - `Signal Forms:` not used / spike only / explicitly approved.
10. `Stale guard check` — jakie async/context flows zabezpieczono albo dlaczego nie dotyczy.
11. `Manual smoke checklist for user` — konkretne wykonalne kroki albo `N/A`, `data-blocked`, `environment-blocked`, `backend-blocked` z powodem.
12. Repo hygiene — git status, known dirty files left untouched, missing docs warnings, generated types not modified unless explicitly requested.

Nie proponuj manual smoke, o którym wiadomo, że nie da się go wykonać z powodu braku danych, sesji, targetów, route accessu albo backendu. Oznacz go jako blocked i podaj minimalne dane potrzebne do smoke.

Nie kończ raportu samym „done”. Nie oznaczaj niczego jako completed w dokumentach statusu bez akceptacji użytkownika.
```

---

## Short task mode

Użyj przy małej poprawce UI, follow-upie review albo drobnym cleanupie. Ten tryb nie zwalnia z zasad, tylko ogranicza bootstrap.

```text
Pracujemy w projekcie Mythsworn. To jest mały UI/UX task albo follow-up.

Zanim zaczniesz:

1. Uruchom `git status --short`. Jeśli working tree nie jest clean, wypisz zmiany. Known dirty files wskazane przez użytkownika zostaw nietknięte i kontynuuj, jeśli task ich nie dotyka; nowe/nieautoryzowane dirty files = stop i pytanie do użytkownika.
2. Przeczytaj explicit user instruction i aktualne pliki, których task dotyczy. Jeśli plik kontekstowy z prompta nie istnieje, zgłoś warning i kontynuuj z dostępnymi źródłami, chyba że użytkownik wskazał go jako blocker.
3. Jeśli task dotyka UI/SCSS/PrimeNG/prototypu, sprawdź minimum:
   - `docs/ui-ux/mythsworn-style-contract.md`
   - `docs/ui-ux/local-scss-budget-checklist.md`
   - `docs/ui-ux/prototype-production-mapping.md`
   - `docs/ui-ux/primeng-vendor-wrapper-lookup.md` jeśli jest PrimeNG
   - relevant feature contract, np. `item-popover-contract.md`, jeśli dotyczy
4. Jeśli task dotyka danych/workflow, sprawdź current code + `current-decisions.md` + `database-current.md` + generated types/RPCs. Generated types są read-only, chyba że użytkownik wyraźnie poleci ich regenerację/edycję.

Skrócone zasady:

- Nie kopiuj CSS ani `mb-*` z prototypów.
- Nie twórz lokalnego card/surface/badge/chip/button systemu.
- Używaj istniejących shared/layout, PrimeNG wrapperów, global `mg-*`, `.tag-badge--*`, grid/flex utilities.
- Trzymaj class budget: normalny element 1–2 klasy, layout wrapper do 3. Więcej wymaga raportu.
- Nie rób utility soup. Powtarzalny stack klas zgłoś jako kandydat na shared/global pattern.
- Nie dodawaj lokalnych `.p-*` skinów ani `::ng-deep` bez explicit bug/workaround.
- Formularze: Reactive Forms + istniejące form factories/config patterns. Nie dodawaj `ngModel`. Jeśli dotykasz istniejącego `ngModel`, usuń w zakresie taska albo zgłoś follow-up.
- Signal Forms są experimental; nie migruj produkcyjnych formularzy bez osobnej decyzji/spike’u.
- Nie wymyślaj DB/RPC/read model. Brak kontraktu = blocker/dependency, nie frontend fake. Nie regeneruj ani nie edytuj `database.types.ts` bez wyraźnego polecenia użytkownika.
- Zachowaj stale guards dla async workflow zależnego od selected server/hero/item/report/trade/target/route/admin entity.
- Nie aktualizuj status docs bez potwierdzenia użytkownika.
- Repo hygiene — git status, known dirty files left untouched, missing docs warnings, generated types not modified unless explicitly requested.

Task do wykonania:

[TUTAJ WKLEJ MAŁY TASK / KOMENTARZ REVIEW / FOLLOW-UP]

Raport końcowy ma być krótszy niż w full bootstrap, ale musi zawierać:

1. Scope / non-goals.
2. Files changed.
3. Verification.
4. Reuse report: `reused`, `checked but not reused`, `new`.
5. UI styling report: local SCSS, copied prototype, PrimeNG override, class budget exceptions.
6. Forms report, jeśli dotyczy.
7. Stale guard check, jeśli dotyczy.
8. Manual smoke: tylko wykonalne kroki albo `N/A/data-blocked` z powodem.
```

---

## Kiedy używać którego trybu

| Sytuacja | Tryb |
|---|---|
| Nowa długa konwersacja Codexa | Full bootstrap mode |
| Nowy ekran z prototypu | Full bootstrap mode |
| Global SCSS / shared pattern / PrimeNG wrapper | Full bootstrap mode |
| Duży player/admin workflow | Full bootstrap mode |
| Codex się rozjechał i trzeba go zresetować | Full bootstrap mode |
| Mała poprawka po review | Short task mode |
| Drobny cleanup klas / copy / label | Short task mode |
| Jednoplikowy fix bez zmiany architektury | Short task mode |
| Formularz, DB/RPC albo stale guard nawet w małym tasku | Short task mode + relevant sections obowiązkowo |

---

## Minimalny dopisek do dowolnego taska UI

Jeśli nie chcesz wklejać całego prompta, doklej przynajmniej to:

```text
Trzymaj Mythsworn UI-CORE rules: no prototype CSS copy, no `mb-*` in Angular, global SCSS/PrimeNG/shared first, strict class budget, no utility soup, no local PrimeNG skins, Reactive Forms not ngModel, generated types read-only unless explicitly requested, stale guards for async context, and report reused / checked-but-not-reused / new plus styling report. Manual smoke only if actually executable; otherwise mark N/A or data-blocked.
```
