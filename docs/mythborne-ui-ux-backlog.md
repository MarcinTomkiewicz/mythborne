# Mythborne — UI/UX Backlog i wytyczne głównego interfejsu gry

Updated: 2026-05-01 — po review UI backlogu

Ten plik zbiera roboczo zaakceptowany kierunek UI/UX wypracowany w rozmowie prototypowej. Ma działać podobnie jak backlog implementacyjny Codexa, ale dotyczy warstwy wizualnej, layoutu, komponentów, design tokens, PrimeNG/vendorów i sposobu przenoszenia makiet HTML/SCSS do działającego Angulara.

To **nie jest finalny design system** i nie zastępuje istniejących plików projektu. To jest praktyczny, iteracyjny backlog UI/UX, który ma pomagać w kolejnych zadaniach dla Codexa.

---

## 1. Relacja do istniejących dokumentów

Przy implementacji UI Codex powinien czytać i respektować:

1. explicit user instruction,
2. aktualny kod i aktualny stan repozytorium,
3. `project-context.md`,
4. `current-decisions.md`,
5. `database-current.md`,
6. `ui-ux-notes.md`,
7. `project-structure.md`,
8. `codex-mythborne-backlog.md` — jako aktualny backlog/status tasków implementacyjnych,
9. `current-todo.md` i `current-state-summary.md` — jako status i kontekst wykonania, nie jako źródło nowych decyzji designowych,
10. ten plik.

Ten plik jest szczególnie ważny dla:

- głównego shellu gry,
- dashboardu gracza,
- paperdoll/equipment preview,
- topbara/sidebaru,
- tokenów kolorystycznych,
- zasad korzystania z PrimeNG i istniejących vendorów,
- rozpisywania kolejnych UI tasków.

Ten plik **nie jest statusowym źródłem prawdy** dla wykonania prac. Status klasycznych zadań implementacyjnych pozostaje w `codex-mythborne-backlog.md`, `current-todo.md` i `current-state-summary.md`. Jeżeli UI backlog opisuje ekran lub komponent, a klasyczny backlog/status wskazuje, że backend/frontend slice jeszcze nie istnieje, Codex ma potraktować to jako ograniczenie zakresu albo zgłosić zależność/bloker zamiast udawać pełną implementację.

Jeśli ten plik koliduje z aktualną decyzją w `current-decisions.md` lub aktualnym schematem DB, preferuj nowszą decyzję/schemat i zgłoś, że ten plik wymaga aktualizacji.

### 1.1. Relacja do statusów Codexa

Wykonanie taska z tego UI/UX backlogu **nie aktualizuje automatycznie** statusów w klasycznym backlogu Codexa ani w plikach stanu.

Zasada:

- UI task może zostać wykonany jako osobny slice,
- Codex raportuje zmiany i czeka na akceptację użytkownika,
- dopiero po akceptacji można aktualizować `codex-mythborne-backlog.md`, `current-todo.md`, `current-state-summary.md` albo inne status docs,
- jeśli użytkownik mówi, żeby nie aktualizować MD/statusów, Codex nie aktualizuje ich nawet po technicznie udanym buildzie.

Ten plik może definiować UI taski i acceptance criteria, ale nie powinien być traktowany jako potwierdzenie, że funkcjonalność już istnieje w repozytorium.

---

## 2. Nazewnictwo UI

W tym pliku i w nowych UI taskach używamy roboczego labela **Character Points**.

Zasady:

- **Character Points** — aktualny roboczy UI label dla punktów używanych do rozwoju postaci i player-to-player economy.
- **Hero Points** / **PR** — traktować jako legacy albo nazwę historyczną/nieustaloną, nie używać w nowych player-facing UI taskach bez osobnej decyzji.
- Jeśli starsze dokumenty albo kod używają `Hero Points`, `PR` lub podobnych nazw, Codex ma zachować kompatybilność techniczną tam, gdzie jest wymagana, ale w nowych labelach dashboard/shell/tooltip używać **Character Points**.

---

## 3. Główna definicja stylu

Roboczo zaakceptowany kierunek:

> **Modern premium browser RPG UI stylizowany na antyczną Grecję.**

Nie robimy ciężkiego „kamiennego panelu admina”. Nie robimy też generycznego SaaS dashboardu. UI ma być nowoczesny, czytelny i lekki, ale z wyraźnym greckim/mythic fantasy flavor’em.

### 3.1. Styl ma być

- modern-first,
- czytelny,
- premium,
- ciemny,
- browser-game friendly,
- długosesyjny, czyli przyjemny w użyciu przez dłuższy czas,
- stylizowany przez materiały, kolory i detale, nie przez przesadną dekorację.

### 3.2. Unikać

- ciężkich masywnych paneli wszędzie,
- „div soup” i ad hoc klas typu `div-wrapper-thing`,
- duplikowania nawigacji przez dodatkowe `Next actions`, jeśli dana akcja już istnieje w sidebarze,
- wpychania wszystkich systemów gry na dashboard,
- emoji jako docelowych ikon,
- hardcodowania stałych list, jeśli istnieje DB dictionary/read model,
- implementacji całego UI jako jednego wielkiego komponentu,
- tworzenia nowego komponentu bez sprawdzenia istniejących shared/vendor komponentów.

---

## 4. Kolorystyka i tokeny

Kierunek z prototypu Dashboard V3 jest roboczo zaakceptowany. Codex nie musi kopiować tych wartości 1:1, jeśli repo ma już lepsze tokeny/vendor variables, ale powinien preferować ten zakres wizualny.

### 4.1. Bazowe tokeny referencyjne

```scss
// Background
$mb-bg-0: #06080c;
$mb-bg-1: #0b1018;
$mb-bg-2: #101a27;
$mb-bg-3: #152437;

// Navy
$mb-navy-0: #07111d;
$mb-navy-1: #0d2135;
$mb-navy-2: #163b5c;
$mb-navy-3: #2d6e9f;

// Gold / bronze
$mb-gold-0: #5b3a13;
$mb-gold-1: #9c6723;
$mb-gold-2: #c8923a;
$mb-gold-3: #f0c96f;
$mb-bronze: #87582a;

// Text
$mb-text-0: #f6edda;
$mb-text-1: #d7c8ab;
$mb-text-2: #9d8f75;
$mb-text-3: #6f675a;

// Lines / glow
$mb-line-soft: rgba(240, 201, 111, 0.12);
$mb-line: rgba(240, 201, 111, 0.24);
$mb-line-strong: rgba(240, 201, 111, 0.44);
$mb-glow: rgba(240, 201, 111, 0.22);
$mb-shadow: rgba(0, 0, 0, 0.42);
```

### 4.2. Preferencje użycia tokenów

Codex ma **preferować mały, spójny zestaw tokenów**, zamiast próbować wykorzystać wszystkie kolory naraz.

Rekomendacja:

- tło: `bg-0`, `bg-1`, `navy-0`, `navy-1`,
- panele: przezroczyste/granatowe powierzchnie z delikatnym `line-soft`,
- akcenty: `gold-2`, `gold-3`,
- tekst: `text-0`, `text-1`, `text-2`,
- danger/success/info tylko wtedy, gdy semantycznie potrzebne.

Złoto nie oznacza wszystkiego. Używać go dla:

- logo,
- ważnych wartości,
- aktywnego stanu,
- subtelnego premium highlightu,
- selected nav state,
- najważniejszych ramek.

---

## 5. PrimeNG, vendory i komponenty

Projekt korzysta z PrimeNG. Codex powinien zakładać, że:

- część vendor/custom wrappers już istnieje,
- istniejące komponenty trzeba sprawdzić przed dodaniem nowych,
- istniejące vendory można modyfikować, jeśli jest to potrzebne do spełnienia taska,
- lepiej rozszerzyć istniejący wzorzec niż tworzyć lokalny komponent tylko dla jednego ekranu,
- nie używać surowego HTML tam, gdzie istnieje sensowny PrimeNG/vendor wrapper.

### 5.1. Zasada reuse

Przed dodaniem nowego komponentu Codex musi sprawdzić:

- `shared/components`,
- istniejące layout components,
- vendor wrappers,
- istniejące custom icon helpers,
- istniejące button/card/badge/panel patterns,
- PrimeNG component equivalents.

W raporcie Codex ma obowiązkowo dopisać:

```text
reused:
- ...

checked but not reused:
- ...

new component/state/helper added:
- ...
```

To jest szczególnie ważne dla UI tasków.

### 5.2. PrimeNG preferencje

Preferować PrimeNG/vendor komponenty dla:

- buttonów,
- selectów,
- dropdownów,
- tabs,
- tooltips,
- popovers/overlays,
- messages/toasts,
- dialogs/confirmations,
- progress bars,
- cards/panels, jeśli istnieje projektowy wrapper,
- data lists/tables tam, gdzie ma to sens.

Nie oznacza to, że każdy panel ma być `p-card`. Jeśli projekt ma vendor wrapper albo własny `game-card`, używać wrappera.

Codex ma pamiętać, że PrimeNG jest bazą UI, ale styl Mythborne powinien iść przez istniejące vendor wrappers, projektowe tokeny i SCSS. Nie należy „na siłę” mieszać wszystkich tokenów ani obklejać każdego elementu osobną lokalną klasą tylko po to, żeby osiągnąć wygląd z prototypu. Najpierw sprawdzić istniejące vendor styles i custom icon SCSS, potem dopiero rozszerzać.

### 5.3. Brak „div soup”

Nie robić produkcyjnego HTML-a jako przypadkowej zagnieżdżonej struktury `div/div/div` z lokalnymi klasami. Każda większa sekcja powinna mieć semantyczny komponent lub przynajmniej czytelny BEM-like/feature-prefixed układ.

Dobre wzorce nazw:

```text
mb-game-shell
mb-game-topbar
mb-resource-chip
mb-sidebar-context
mb-dashboard-hero
mb-stat-grid
mb-derived-stat-list
mb-equipment-paperdoll
mb-item-summary-popover
```

Niepożądane:

```text
wrapper2
box-new
my-card-left
super-div
content-block-temp
```

---

## 6. Ikony

Ikony z prototypu HTML są placeholderami.

Docelowo:

- używać istniejącego modułu custom icons / SCSS,
- dopuszczalne źródło stylistyczne: Game-icons.net,
- ikony powinny być spójne: raczej mono/duotone, złoto/brąz na granacie,
- nie używać emoji jako finalnych ikon,
- Codex nie powinien wymieniać całego systemu ikon bez zgody.

---

## 7. Główny shell gry

### 7.1. Layout

Główny shell:

- sticky topbar,
- sidebar po lewej,
- main content,
- bez ciężkiego globalnego rightbara na dashboardzie.

Rightbar może pojawić się później w specyficznych ekranach, np. combat, exploration, admin, ale nie jako stały element dashboardu.

### 7.2. Topbar

Topbar kierunkowo zaakceptowany.

Lewa strona:

- Health,
- XP progress,
- Level,
- XP missing to next level.

Środek:

- Mythborne brand/logo.

Prawa strona:

- Drachmas,
- Materials,
- Workforce.

Każdy resource chip powinien pokazywać:

- aktualną wartość,
- przyrost na godzinę.

Przykład:

```text
Drachmas 3,420
+96 / h

Materials 185
+22 / h

Workforce 42
+4 / h
```

### 7.3. Sidebar

Sidebar kierunkowo zaakceptowany.

Góra sidebaru:

- selected server,
- server status,
- Prestige.

Nawigacja robocza:

```text
Hero
- Dashboard
- Exploration
- Hero
- Armory

World
- Estate
- Trade
- PvP
- Reports

Operations
- Staff tools
```

Staff/admin entry point ma być oddzielony od normalnej nawigacji gracza.

---

## 8. Dashboard — zaakceptowany kierunek roboczy

Dashboard ma być **hero-centric**.

Nie ma być:

- landing page’em do wszystkiego,
- operacyjnym panelem serwera,
- preview każdego modułu gry,
- duplikatem sidebaru.

Ma pokazywać:

1. active hero,
2. base stats,
3. derived stats,
4. equipment preview,
5. home/vicinity context,
6. persistent state.

---

## 9. Active Hero panel

Kierunek: dobry, ale utrzymać kompaktowy, modern look.

Pokazywać:

- portret/sylwetkę bohatera,
- imię bohatera,
- origin,
- district/address jako krótki kontekst,
- Character Points available,
- membership status tylko jeśli potrzebne.

Nie pisać:

```text
Theron of A-2374
```

Poprawny kierunek:

```text
Theron
Origin: Athenian
District A
Address A-2374
Character Points: 14 available
```

Nie dodawać panelu `Next actions`; akcje są w sidebarze i w dedykowanych ekranach.

---

## 10. Base stats

Base stats w dashboardzie zostają jako compact stat grid.

Kanon statów:

- Strength,
- Dexterity,
- Endurance,
- Agility,
- Cunning,
- Charisma,
- Wisdom,
- Intelligence,
- Spirituality.

UI:

- małe tiles,
- 3 kolumny desktopowo,
- nie za masywne,
- wartości z read modelu,
- nie hardcodować permanentnie, jeśli istnieje DB dictionary/read model.

---

## 11. Derived stats

Derived stats kierunkowo zaakceptowane.

Muszą uwzględniać co najmniej:

- Health,
- Defense,
- Main-hand damage,
- Off-hand damage,
- Luck,
- Critical chance,
- Critical damage.

Ważne: bohater może używać dwóch broni. Nie używać jednego generycznego `Damage range`, jeśli attack plan zawiera osobne profile dla main/off-hand.

Przykład:

```text
Main-hand damage: 18–31
Off-hand damage: 9–16
```

Critical damage nie może być traktowany jako hardcoded x2. Ma być prezentowany jako derived/combat stat.

---

## 12. Equipment preview / paperdoll

Kierunek zaakceptowany:

> paperdoll-style equipment preview.

Nie zwykła lista slotów, tylko:

- schematyczna sylwetka wojownika,
- sloty wokół sylwetki,
- helmet przy głowie,
- armor przy torsie,
- pants pod armor,
- boots przy nogach,
- amulet przy szyi/klatce, ale nie nachodzący na armor,
- main hand i off hand po bokach,
- ring 1 i ring 2 jako osobne sloty.

### 12.1. Aktualne problemy prototypu

Do dopracowania:

- pozycja boots — w prototypie potrafi wypaść zbyt nisko względem nóg,
- pants powinny być logicznie pod armor,
- amulet trochę niżej niż helmet, ale nie kolidujący z armor,
- prawa lista itemów powinna obejmować wszystkie sloty, nie tylko wybrane,
- tooltip/popover powinien być głównym nośnikiem szczegółów itemu, nie sam slot.

### 12.2. Sloty

Docelowe sloty:

- main hand,
- off hand,
- helmet,
- armor,
- pants,
- boots,
- amulet,
- ring 1,
- ring 2.

Codex ma korzystać z DB dictionary/read modelu slotów, jeśli dostępny, a nie utrzymywać permanentną ręczną listę w komponencie.

---

## 13. Item tooltip / popover

Każdy item w equipment preview, Armory, Trade/Auction i ewentualnie Reports powinien korzystać z jednego reusable tooltip/popover patternu.

Popover powinien pokazywać:

- pełną nazwę itemu,
- obrazek/ikonę,
- slot,
- quality,
- prefix,
- base item,
- suffix,
- damage range, jeśli dotyczy,
- bonusy,
- wymagania,
- wartość w drachmach,
- lifecycle/status,
- akcje kontekstowe, jeśli ekran je dopuszcza.

Item value nie jest automatycznie równe usefulness. UI ma pomagać ocenić item, a nie sugerować, że droższy zawsze jest lepszy.

---

## 14. Home & vicinity

Dashboard może mieć lekki widget estate/vicinity.

Nie używać:

```text
Estate status: Occupied by hero
Owned estates: 3
```

Każdy hero ma swój estate. `Occupied by hero` nie jest stanem i nie powinno być wyświetlane jako status.

Poprawny kierunek:

```text
Estate: A-2374
District: A
Vicinity: A-2364 — A-2384
```

Kliknięcie w estate/dom może otworzyć widok okolicy:

- aktualny adres,
- np. 10 adresów w dół i 10 w górę,
- informacja które adresy są zajęte,
- później potencjalnie relocation/siege/takeover, ale nie w dashboardzie.

---

## 15. Persistent state

Dashboard powinien mieć krótki widget persistent state, ale nie wielki exploration timer.

Pokazywać:

```text
Exploration: Step pending / Idle / Exhausted / Ready to resolve
Trials remaining: 2
Active effect: Clear Omen / None
Building job: No building in progress / Quarry upgrading, 12m remaining
```

Building job:

- nie pokazywać `Quarry ready`, jeśli nie ma graczowego potwierdzania zakończenia,
- albo coś jest w budowie,
- albo `No building in progress`.

---

## 16. Czego nie robić w dashboardzie

Na dashboardzie nie umieszczać na stałe:

- dużego exploration timera,
- dużego combat preview,
- trade/auction table,
- admin notices,
- world context rightbar,
- duplicate next actions,
- rozbudowanych recent outcomes,
- pełnego estate management,
- pełnego inventory.

Te elementy mają mieć własne widoki.

---

## 17. Combat / Walking Dead pattern

Kierunek wizualny dla Walking Dead timing z prototypu jest dobry i można go zachować na przyszły combat screen.

Nie implementować tego jako duży blok dashboardu.

Dla przyszłego Combat screen:

- dwa panele combatants,
- Health bars,
- turn counter,
- Walking Dead timing bar,
- green zone,
- moving indicator,
- attack log,
- hit/evasion/crit/damage feedback,
- final result.

---

## 18. Responsywność

Desktop-first browser game.

Założenia:

- desktop: topbar + sidebar + main,
- tablet: topbar zawijany, sidebar może się zwęzić,
- mobile: sidebar może stać się poziomym menu/compact nav,
- dashboard cards przechodzą do jednej kolumny.

---

## 19. Architektura wdrożenia

Nie implementować wszystkiego jako jednego komponentu.

Rekomendowany podział:

### `src/app/layout`

- `GameShellComponent`,
- `GameTopbarComponent`,
- `GameSidebarComponent`,
- `ResourceChipComponent`,
- `ServerPrestigeContextComponent`.

### `src/app/hero`

- dashboard page,
- hero overview,
- base stats panel,
- derived stats panel,
- equipment preview widget.

### `src/app/game`

- estate/vicinity widget lub estate page,
- exploration state widget,
- future combat screen,
- armory/trade/pvp screens.

### `src/app/shared`

- generic game card,
- badge/chip,
- stat tile,
- tooltip/popover wrappers,
- icon wrapper,
- progress components.

### `src/app/core`

- domain models,
- mappers,
- services,
- read models,
- utils,
- DB dictionary loaders,
- active server / active hero state.

---

## 20. Backlog UI/UX — proponowane taski dla Codexa

### UI-1 — Design tokens and shell skeleton

**Goal:** Wydzielić bazowe tokeny/styling shellu i postawić lekki game shell.

**Scope:**
- SCSS tokens dla Mythborne UI,
- topbar layout,
- sidebar layout,
- main content wrapper,
- bez pełnego dashboardu.

**Acceptance criteria:**
- root App pozostaje cienki,
- nie ma ciężkich importów PrimeNG w root,
- shell korzysta z istniejących vendor/shared komponentów tam, gdzie sensowne,
- Codex raportuje reuse check.

---

### UI-2 — Topbar resources and XP/Health

**Goal:** Wdrożyć topbar zgodny z kierunkiem.

**Scope:**
- Health + XP po lewej,
- Mythborne brand w środku,
- Drachmas/Materials/Workforce + per-hour po prawej.

**Acceptance criteria:**
- resources pokazują amount i perHour,
- loading/empty states są obsłużone,
- brak hardcoded resource list, jeśli istnieje read model/dictionary,
- brak emoji jako final icons.

---

### UI-3 — Sidebar context and navigation

**Goal:** Wdrożyć sidebar z kontekstem server/prestige i nawigacją.

**Scope:**
- selected server,
- server status,
- Prestige,
- nav groups Hero/World/Operations.

**Acceptance criteria:**
- ActiveServer jest źródłem server state,
- staff tools oddzielone od player navigation,
- brak duplikowania akcji z dashboardu.

---

### UI-4 — Dashboard hero overview

**Goal:** Kompaktowy Active Hero panel.

**Scope:**
- portret/sylwetka,
- imię,
- origin,
- district/address,
- Character Points,
- membership status tylko jako stan/kontekst.

**Acceptance criteria:**
- nie używać formatu `Theron of A-2374`,
- brak `Next actions`,
- panel jest lżejszy niż pierwotny prototyp.

---

### UI-5 — Base stats and derived stats dashboard panels

**Goal:** Wdrożyć stat grid i derived stats.

**Scope:**
- base stats,
- Health,
- Defense,
- Main-hand damage,
- Off-hand damage,
- Luck,
- Critical chance,
- Critical damage.

**Acceptance criteria:**
- staty z read modelu,
- derived stats nie używają jednego `Damage range`, jeśli są dwie ręce,
- critical damage nie jest hardcoded x2,
- brak `hero_derived`.

---

### UI-6 — Equipment paperdoll preview

**Goal:** Paperdoll-style equipment preview.

**Scope:**
- sylwetka,
- sloty wokół sylwetki,
- lista itemów obok,
- empty slots,
- main/off hand,
- ring 1/ring 2.

**Acceptance criteria:**
- sloty z dictionary/read modelu, jeśli dostępne,
- tooltip/popover placeholder albo integracja z UI-7,
- brak permanentnej lokalnej listy slotów w komponencie, jeśli słownik jest dostępny,
- pozycje slotów nie rozjeżdżają się wizualnie.

---

### UI-7 — Item tooltip/popover pattern

**Goal:** Reusable item summary popover.

**Scope:**
- nazwa,
- obrazek/ikona,
- quality/prefix/base/suffix,
- value in drachmas,
- requirements,
- bonuses,
- damage jeśli dotyczy,
- lifecycle/status,
- context actions.

**Acceptance criteria:**
- działa w Dashboard, Armory, Trade/Auction,
- używa PrimeNG/vendor overlay/popover/tooltip, jeśli istnieje,
- nie duplikuje kodu prezentacji itemu.

---

### UI-8 — Home & vicinity dashboard widget

**Goal:** Lekki widget estate/vicinity.

**Scope:**
- current address,
- district,
- nearby range,
- link/button do pełnego vicinity view.

**Acceptance criteria:**
- jeden estate per hero,
- brak `owned estates`,
- brak `occupied by hero`,
- address z `district_code + address_number`,
- nearby range generowany na podstawie capacity + occupied estates.

---

### UI-9 — Persistent state dashboard widget

**Goal:** Krótki stan gry na dashboardzie.

**Scope:**
- Exploration state,
- Trials remaining,
- Active effect,
- Building job.

**Acceptance criteria:**
- `No building in progress` zamiast `Quarry ready`,
- jeśli building job aktywny, pokazać nazwę i time remaining,
- nie robić dużego exploration timera na dashboardzie.

---

## Task UI-10 — Exploration screen: difficulty selection

**Goal:**  
Zbudować player-facing ekran eksploracji oparty na wyborze difficulty tier, bez wymyślonych nazw lokacji, mapy fabularnej ani dodatkowych route-fiction elementów.

**Scope:**
- Ekran `/game/exploration` / docelowy exploration page.
- Zachować kierunek wizualny z Dashboard V3:
  - modern premium browser RPG,
  - dark navy / gold / bronze,
  - lekki ancient-Greek flavor,
  - bez ciężkiego „kamiennego panelu”.
- Użyć istniejącego game shellu/topbara/sidebaru, jeśli jest już wdrożony.
- Pokazać:
  - current exploration state,
  - remaining daily Trials,
  - selected difficulty,
  - daily reset / relevant reset info,
  - active effect, jeśli istnieje,
  - blocking content, jeśli Trial/Encounter wymaga rozwiązania.
- Dodać difficulty cards:
  - Easy,
  - Medium,
  - Hard,
  - albo DB-backed active difficulty tiers, jeśli read model już istnieje.
- Na kartach pokazać tylko compact preview:
  - step time,
  - Trial opportunity,
  - approx. manifestation,
  - approx. auto result,
  - reward profile.
- Wybrana trudność ma być wizualnie oznaczona.
- Akcja główna:
  - `Start exploration`,
  - `Continue exploration`,
  - disabled jeśli daily Trials są wyczerpane albo aktywny Trial/Encounter blokuje start.

**Out of scope:**
- Nie implementować pełnego backendu eksploracji, jeśli jeszcze go nie ma.
- Nie tworzyć wymyślonych nazw ścieżek, lokacji, mapy albo route memory UI.
- Nie robić pełnego result screen.
- Nie robić combat/trade/report preview.
- Nie dodawać nowych gameplay concepts ani nowych statusów.
- Nie hardcodować finalnych wartości balansowych jako prawdy.

**Data/source rules:**
- Difficulty labels, aktywność, sort order i finalne wartości powinny pochodzić z DB/config/read modelu, jeśli jest dostępny.
- Frontend może użyć mock/read model placeholder tylko jako tymczasowego UI slice.
- Preview wartości może korzystać z istniejących preview/read RPC/services, jeśli istnieją.
- Frontend nie może traktować preview jako authoritative gameplay resolution.

**PrimeNG/vendor rules:**
- Przed dodaniem nowych komponentów sprawdzić istniejące shared/vendor/PrimeNG wrappers.
- Preferować istniejące card/button/badge/progress/icon patterns.
- Nie robić ad hoc `div soup`, jeśli istnieje odpowiedni shared component.
- Nie wciskać `p-card` wszędzie na siłę, jeśli vendor/project card pattern jest lepszy.

**Acceptance criteria:**
- Ekran jest prosty i czytelny.
- Gracz rozumie: ile ma Trials, jaki difficulty tier wybiera i co mniej więcej ryzykuje.
- Brak wymyślonych nazw typu `Broken road`, `Marble ridge`, `Smoke-lit pass`.
- Trial opportunity, manifestation i auto-result są wizualnie rozróżnione.
- UI nie sugeruje, że Trial i Encounter występują jednocześnie.
- Build/tsc przechodzi.
- Codex raportuje:
  - `reused:`
  - `checked but not reused:`
  - `new component/state/helper added:`
  - `scope kept minimal:`
  - `not added intentionally:`

  ---

  ## Task UI-11 — Exploration pending step modal and inline progress

**Goal:**  
Dodać UX dla aktywnego/pending exploration step: najpierw jako modal/dialog z progress walkerem, a po dismiss/backdrop jako kompaktowy inline progress strip na ekranie eksploracji.

**Scope:**
- Stan pending exploration step.
- Modal/dialog pokazywany:
  - po rozpoczęciu exploration step,
  - przy ponownym wejściu na ekran, jeśli step nadal trwa.
- Dismiss/backdrop:
  - zamyka modal,
  - nie anuluje eksploracji,
  - pokazuje kompaktowy inline progress strip na stronie.
- Inline strip powinien pojawić się między page headerem a difficulty selection albo zamiast difficulty selection, zależnie od końcowego layoutu.
- Progress bar ma być niski/kompaktowy.
- Walker/hoplite idzie nad paskiem lub na pasku, ale nie może zasłaniać tekstu.
- `Check result` disabled do momentu `resolves_at`.
- Outcome ukryty do czasu resolve.

**Out of scope:**
- Nie implementować realnej animacji finalnej, jeśli asset nie jest jeszcze gotowy.
- Nie robić wielkiego pending panelu na dole strony.
- Nie dodawać skomplikowanych stanów modal lifecycle poza potrzebnym minimum.
- Nie anulować/pauzować eksploracji przez dismiss modala.
- Nie traktować dismiss jako gameplay action.

**Sprite/walker guidance:**
- Obecny CSS walker to placeholder.
- Docelowo użyć prawdziwego 8-klatkowego sprite sheetu hoplity.
- Sprite sheet:
  - 8 frames,
  - one row,
  - `steps(8)`,
  - transparent background,
  - side view, walking right.
- Animacje powinny być rozdzielone:
  - walk cycle: `steps(8)` infinite,
  - travel/progress position: zależne od czasu kroku / progress percent.
- Ten sam component/pattern powinien działać w modalu i inline stripie.

**Implementation hint:**
- PrimeNG `p-dialog` może być użyty, jeśli pasuje do istniejących vendor wrappers.
- Jeśli projekt ma własny dialog wrapper, preferować wrapper zamiast bezpośredniego `p-dialog`.
- Backdrop dismiss powinien tylko zmienić local UI state: modal hidden, inline progress visible.
- Realny progress powinien wynikać z `started_at` / `resolves_at`, nie z frontendowego timera jako źródła prawdy.

**Acceptance criteria:**
- Po starcie/powrocie pending step może być pokazany jako modal.
- Po dismiss modala widoczny jest compact inline progress strip.
- Progress bar jest niski i nie dominuje strony.
- Walker nie zasłania tekstu.
- `Check result` jest disabled przed resolve.
- Brak dodatkowych gameplay properties, które nie są potrzebne.
- Build/tsc przechodzi.
- Codex raportuje:
  - `reused:`
  - `checked but not reused:`
  - `new component/state/helper added:`
  - `scope kept minimal:`
  - `not added intentionally:`

  ---

  ## Task UI-12 — Exploration Trial detail by stat

**Goal:**  
Dodać opcjonalny compact breakdown Trial preview per base stat dla wybranej trudności eksploracji.

**Context:**  
Każda z 9 bazowych statystyk ma własny Trial archetype. Difficulty cards nie powinny pokazywać pełnej tabeli dla każdej statystyki, bo rozbije to UI. Karty pokazują wartości approximate, a szczegółowy breakdown jest osobną sekcją.

**Scope:**
- Sekcja `Trial detail by stat`.
- Pokazać 9 canonical base stats:
  - Strength,
  - Dexterity,
  - Endurance,
  - Agility,
  - Cunning,
  - Charisma,
  - Wisdom,
  - Intelligence,
  - Spirituality.
- Dla każdej statystyki pokazać dwa oddzielne preview bary:
  - `Manifest` / `Manifestation`,
  - `Auto result` / `Auto-resolve success`.
- Sekcja dotyczy aktualnie wybranej trudności.
- Sekcja może być domyślnie widoczna w prototypie, ale produkcyjnie może być collapsible / details.
- Wyraźnie rozróżnić:
  - szansę manifestacji Triala,
  - szansę powodzenia auto-resolve.
- Nie mieszać tego z Trial opportunity. Trial opportunity pozostaje compact value na difficulty card albo w summary.

**Out of scope:**
- Nie dodawać osobnych kart difficulty × stat.
- Nie tworzyć nowego systemu triali.
- Nie hardcodować finalnych formuł.
- Nie mieszać `Trial opportunity`, `manifestation` i `auto result` w jedno pole.
- Nie robić z tego pełnego Trial result screen.

**Data/source rules:**
- Stat list powinna pochodzić z canonical stat read model / DB dictionary, jeśli dostępny.
- Trial archetype labels/descriptions powinny pochodzić z DB/config/read modelu, jeśli dostępne.
- Wartości preview powinny pochodzić z preview service/RPC/read modelu, jeśli istnieje.
- Jeżeli backend nie dostarcza jeszcze per-stat preview, użyć tymczasowego UI placeholdera i wyraźnie oznaczyć zależność.

**Acceptance criteria:**
- Sekcja pokazuje wszystkie 9 statystyk.
- Każda statystyka ma dwa oddzielne bary:
  - Manifest,
  - Auto result.
- Użytkownik nie myli szansy wystąpienia/opportunity z szansą manifestacji albo auto-resolve.
- Sekcja jest kompaktowa i nie rozwala difficulty cards.
- Build/tsc przechodzi.
- Codex raportuje:
  - `reused:`
  - `checked but not reused:`
  - `new component/state/helper added:`
  - `scope kept minimal:`
  - `not added intentionally:`

  ---

  ## Task UI-14 — Statistics screen: focused stat allocation page

**Goal:**  
Zbudować osobny ekran `Statistics` / `Hero Statistics` służący wyłącznie do wydawania **Character Points** na bazowe statystyki bohatera.

Ten ekran nie ma być drugim dashboardem. Dashboard pokazuje ogólny stan postaci, ekwipunek i kontekst gry. `Statistics` ma być ekranem roboczym do rozdawania punktów.

**Scope:**
- Route/page dla statystyk/progresji bohatera, np. `src/app/hero/pages/statistics`.
- Użyć istniejącego shellu/topbara/sidebaru.
- Zachować aktualny kierunek wizualny:
  - modern premium browser RPG,
  - dark navy / gold / bronze,
  - lekki ancient-Greek flavor,
  - bez ciężkiego panelu adminowego.
- Pokazać kompaktowy header:
  - `Statistics`,
  - `Spend Character Points`,
  - krótki opis,
  - hero name,
  - level,
  - draft changes,
  - status draftu.
- Główna część ekranu:
  - panel `Base stats allocation`,
  - prawa kolumna `Allocation draft`,
  - prawa kolumna `Derived preview`.

**Base stats allocation:**
- Pokazać 9 canonical base stats:
  - Strength,
  - Dexterity,
  - Endurance,
  - Agility,
  - Cunning,
  - Charisma,
  - Wisdom,
  - Intelligence,
  - Spirituality.
- Dla każdej statystyki pokazać:
  - nazwę,
  - krótki opis/rola,
  - aktualną wartość,
  - wartość po lokalnym drafcie,
  - koszt kolejnego punktu,
  - przycisk `+`,
  - przycisk `-` tylko dla cofnięcia lokalnego draftu, nie do trwałego obniżania statystyk.
- W nagłówku panelu `Base stats allocation`, w tej samej linii co tytuł, pokazać:
  - `Character Points: X`,
  - `Draft spent: Y`,
  - `Remaining after save: Z`.
- Opis panelu ma być pod tytułem i chipami, nie w osobnym ciężkim bloku.

**Out of scope:**
- Nie robić ekwipunku/paperdolla na tym ekranie.
- Nie robić exploration, estate, trade ani combat preview.
- Nie duplikować dashboardu.
- Nie robić profilu/lore postaci.
- Nie dodawać nowych gameplay concepts.
- Nie tworzyć własnego trwałego kalkulatora formuł w komponencie.

**Data/source rules:**
- Stat list powinna pochodzić z canonical stat read model / DB dictionary, jeśli dostępny.
- Koszt kolejnego punktu i cap powinny pochodzić z backend/read/preview path, jeśli istnieje.
- Nie hardcodować formuł `hero_stat_upgrade_cost` ani `hero_stat_level_cap` w Angularze.
- Finalny zapis musi iść przez canonical DB/RPC workflow `save_stat_allocation(...)`.
- Frontend nie może bezpośrednio mutować `hero_stats`, `hero.character_points`, ledgerów ani resource/stat tables.

**Acceptance criteria:**
- Ekran jest focused: służy do rozdawania statystyk.
- Nie powiela dashboardu.
- Wszystkie 9 canonical stats są widoczne.
- `Character Points / Draft spent / Remaining after save` są w linii z tytułem `Base stats allocation`.
- `+` dodaje punkt do lokalnego draftu.
- `-` cofa wyłącznie lokalnie dodany punkt.
- Disabled states są czytelne:
  - brak CP,
  - cap osiągnięty,
  - brak lokalnej zmiany do cofnięcia.
- Nie ma direct writes do tabel.
- Build/tsc przechodzi.
- Codex raportuje:
  - `reused:`
  - `checked but not reused:`
  - `new component/state/helper added:`
  - `scope kept minimal:`
  - `not added intentionally:`

  ---

## 21. Otwarte kwestie UI do dalszego dopracowania

Ten plik jest na razie mocno dashboard/shell oriented. To jest celowe, bo najpierw stabilizujemy główny język UI. Z czasem UI/UX backlog powinien dostać osobne sekcje dla pełnych ekranów:

- Armory,
- Hero/Character,
- Exploration waiting/result,
- Combat,
- Estate/Vicinity,
- Trade/Auction,
- Staff/Admin.

Na razie traktować je jako przyszłe rozszerzenia backlogu, nie jako gotowe acceptance criteria.

- Docelowy zestaw ikon i mapowanie ikon do nawigacji/zasobów/slotów.
- Czy topbar brand ma używać tekstowego logo, obrazka bannera, czy obu zależnie od breakpointu.
- Dokładne proporcje paperdolla.
- Czy equipment preview na dashboardzie ma pokazywać listę po prawej zawsze, czy tylko na desktopie.
- Jak wygląda pełny Armory screen.
- Jak wygląda pełny Hero/Character screen.
- Jak wygląda pełny Exploration waiting screen.
- Jak wygląda pełny Combat screen z Walking Dead.
- Jak stylować PrimeNG overlay/popover/dialog pod Mythborne.

---

## 22. Notatka dla przyszłych rozmów

Jeśli użytkownik mówi „wróćmy do UI/UX backlogu”, używaj tego pliku jako punktu startowego dla UI prac.

Jeśli użytkownik mówi „przygotuj task dla Codexa na UI”, wybierz następny mały task z sekcji 20, doprecyzuj zakres i acceptance criteria, ale nie próbuj implementować całego UI naraz.
