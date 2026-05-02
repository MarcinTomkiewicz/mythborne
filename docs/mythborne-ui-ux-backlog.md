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

## Task UI-18 — Armory screen: equipment layout and inventory shell

**Goal:**  
Zbudować player-facing ekran `Armory`, który łączy:
- widok założonego ekwipunku w układzie sylwetki / equipment layout,
- listę posiadanych przedmiotów ograniczoną przez aktualną widoczność zbrojowni,
- mechanikę Display Stands jako priorytet widoczności itemów.

Ten ekran nie ma być dashboardem ani admin item catalogiem. Ma być głównym ekranem gracza do zarządzania ekwipunkiem i widocznymi itemami.

**Scope:**
- Route/page dla `Armory`, docelowo np. `src/app/game/pages/armory`.
- Użyć istniejącego shellu/topbara/sidebaru.
- Zachować kierunek wizualny:
  - modern premium browser RPG,
  - dark navy / gold / bronze,
  - lekki ancient-Greek flavor,
  - zgodność z dashboard/statistics/exploration prototypami.
- Lewa część:
  - `Equipped items`,
  - equipment layout z sylwetką i slotami.
- Prawa część:
  - `Inventory`,
  - widoczność ograniczona przez Armory capacity,
  - podział itemów na sekcje Display Stands od Stand 10 do Stand 1.

**Equipment layout:**
- Player-facing label: `Equipped items` albo `Equipment`.
- Nie pokazywać player-facing słowa `Paperdoll`.
- Technicznie komponent może się nazywać `EquipmentPaperdollComponent`.
- Sloty:
  - `main_hand`,
  - `off_hand`,
  - `helmet`,
  - `armor`,
  - `pants`,
  - `boots`,
  - `amulet`,
  - `ring_1`,
  - `ring_2`.
- `Main hand` i `Off hand` mają być po właściwych stronach zgodnie z aktualnym prototypem Armory V2.
- Empty slots muszą być widoczne jako empty/drop target.
- Każdy equipped item powinien otwierać ten sam item popover/detail pattern co item card.

**Inventory summary:**
- Pokazać wyraźnie:
  - total owned items,
  - visible item capacity,
  - np. `270 owned / 30 visible`.
- Capacity nie oznacza ownership limit.
- Jeśli gracz ma 270 itemów i capacity 30, nadal posiada 270 itemów, ale widzi 30 wg stand priority.
- Hidden items nie są usuwane ani tracone.

**Out of scope:**
- Nie robić admin item catalogu.
- Nie robić crafting.
- Nie robić pełnego trade/auction workflow.
- Nie implementować DB schema dla standów, jeśli jej jeszcze nie ma.
- Nie tworzyć nowego item generation systemu.
- Nie robić pełnego porównywarki itemów, jeśli nie ma read modelu.
- Nie dublować dashboardu.

**Data/source rules:**
- Użyć istniejących item read models/services, jeśli są dostępne.
- Użyć item lifecycle/status:
  - active,
  - equipped/current equipment state,
  - locked_trade,
  - locked_auction,
  - scrapped ma nie pojawiać się w normalnym inventory.
- Sloty powinny pochodzić z equipment slot dictionary/read modelu, jeśli istnieje.
- Wartość itemu w drachmach ma pochodzić z item read modelu.
- Item actions muszą używać canonical RPC/domain operations, nie direct writes.

**PrimeNG/vendor rules:**
- Sprawdzić istniejące shared/vendor components dla cards, badges, popover/tooltip, buttons, filters.
- Preferować istniejące PrimeNG/vendor wrappers.
- Nie robić ad hoc `div soup`.
- Nie dodawać nowego globalnego card frameworka bez potrzeby.

**Acceptance criteria:**
- Armory screen pokazuje equipped items i inventory.
- Equipped items używają equipment layoutu z widocznymi slotami.
- `Paperdoll` nie jest player-facing labelem.
- Inventory summary pokazuje `owned / visible`.
- Hidden items są opisane jako owned but not visible.
- Item actions respektują status locks.
- Build/tsc przechodzi.
- Codex raportuje:
  - `reused:`
  - `checked but not reused:`
  - `new component/state/helper added:`
  - `scope kept minimal:`
  - `not added intentionally:`

  ---

  ## Task UI-19 — Armory Display Stands visibility model

**Goal:**  
Dodać UI/UX model **Display Stands** jako mechanikę organizacji i priorytetu widoczności itemów w Armory.

**Concept:**
- Gracz ma zawsze 10 Display Stands.
- `Stand 1` jest domyślny i ma najniższy priorytet.
- `Stand 10` ma najwyższy priorytet widoczności.
- Inventory renderuje sekcje w kolejności:
  - Stand 10,
  - Stand 9,
  - Stand 8,
  - ...
  - Stand 1.
- Armory capacity określa, ile itemów jest widocznych.
- Itemy ze standów o wyższym priorytecie wypełniają widoczną pojemność jako pierwsze.
- Standy puste muszą być nadal widoczne.

**Scope:**
- W Armory inventory pokazać wszystkie 10 standów jako sekcje.
- Każda sekcja pokazuje:
  - numer standu,
  - nazwę standu,
  - liczbę itemów,
  - status widoczności:
    - shown first,
    - visible,
    - partially visible,
    - hidden by capacity,
    - empty,
    - default.
- Sekcje mają być rozwijane albo widoczne zgodnie z prototypem; na start mogą być widoczne.
- Itemy mają być wyświetlane wewnątrz sekcji standu.
- Puste standy mają pokazywać dropzone/empty state.
- Stand 1 ma oznaczenie `default` / `new items`.

**Renameable stand labels:**
- UI powinien zakładać, że stand może mieć player-defined label w przyszłości.
- Jeżeli backend/DB jeszcze tego nie ma, nie implementować trwałego rename.
- Można pokazać placeholder/hint:
  - `Custom name later`,
  - `Rename stand` disabled,
  - albo nie pokazywać akcji rename w pierwszym slice.
- Jeśli Codex widzi istniejącą DB strukturę na nazwy standów, może jej użyć, ale nie ma wymyślać schematu bez potwierdzenia.

**Visibility algorithm for UI:**
- Input:
  - all active owned items,
  - each item’s assigned stand number,
  - visible capacity.
- Sort:
  - by stand descending: 10 → 1,
  - within stand by selected sort order, e.g. value/name/updated date, depending on available data.
- Visible list:
  - take first `capacity` items after stand-priority ordering.
- Section states:
  - jeśli wszystkie itemy w sekcji mieszczą się w capacity: visible,
  - jeśli tylko część itemów z sekcji mieści się w capacity: partially visible,
  - jeśli żaden item z sekcji się nie mieści: hidden by capacity,
  - jeśli sekcja nie ma itemów: empty.

**Out of scope:**
- Nie tworzyć DB migration dla standów bez osobnego taska/akceptacji.
- Nie robić skomplikowanego tree/folder inventory.
- Nie robić standów jako zwykłych filter tabs.
- Nie ukrywać pustych standów.
- Nie robić `Stand 1` jako highest priority.
- Nie usuwać itemów ukrytych przez capacity.

**Acceptance criteria:**
- UI pokazuje dokładnie 10 standów.
- Kolejność renderowania to Stand 10 → Stand 1.
- Stand 1 jest oznaczony jako default/lowest priority.
- Puste standy są widoczne.
- Inventory itemy są pogrupowane w sekcje standów.
- Capacity wpływa na widoczność, nie na ownership.
- UI jasno komunikuje `owned / visible`.
- Build/tsc przechodzi.
- Codex raportuje:
  - `reused:`
  - `checked but not reused:`
  - `new component/state/helper added:`
  - `scope kept minimal:`
  - `not added intentionally:`

  ---

## Task UI-20 — Armory item card and item popover pattern

**Goal:**  
Dodać kompaktowy item card dla Armory oraz wspólny item popover/detail pattern dla hover/click, pokazujący pełne informacje o przedmiocie.

**Scope:**
- Item card w inventory i equipped layout.
- Na kafelku itemu pokazać:
  - nazwę itemu,
  - slot / category,
  - stand number,
  - status badge,
  - wartość w drachmach w osobnej linii.
- Wartość w drachmach nie ma być sklejana w jednej linii z typem itemu.
- Na hover/click itemu pokazać popover/detail:
  - pełna nazwa itemu,
  - quality,
  - prefix,
  - base item,
  - suffix,
  - slot,
  - stand,
  - status,
  - damage range, jeśli dotyczy,
  - suma bonusów,
  - requirements,
  - wartość w drachmach,
  - akcje kontekstowe, jeśli są dopuszczalne.

**Important item semantics:**
- Wysoka wartość w drachmach nie oznacza automatycznie wysokiej użyteczności.
- UI ma pokazywać wartość i bonusy, ale nie może sugerować, że droższy item zawsze jest lepszy.
- Requirements są kluczowe: gracz może mieć item, którego jeszcze nie może założyć.
- Locked itemy nie powinny pokazywać akcji, które są zablokowane przez status.

**Status handling:**
- `active` — normal item.
- `equipped` — item założony; jeśli status/read model reprezentuje to osobno, użyć właściwego źródła.
- `locked_trade` — zablokowany w direct trade.
- `locked_auction` — zablokowany w auction.
- `scrapped` — nie pokazuje się w normalnym inventory.

**Actions:**
- `Equip selected` — tylko jeśli item jest equippable i nie jest locked.
- `Sell to vendor` — przez canonical vendor scrap/sell workflow.
- `Create trade offer` — przez canonical direct trade flow.
- `List auction` — przez canonical auction flow.
- Akcje mogą być disabled z tooltipem/reason.

**Out of scope:**
- Nie robić pełnego trade/auction flow.
- Nie robić pełnego vendor sell confirmation modal, jeśli to osobny task.
- Nie robić permanentnego item comparison engine.
- Nie hardcodować bonusów jako prawdy, jeśli read model istnieje.
- Nie pokazywać staff-only/admin-only pól.

**Data/source rules:**
- Item display name powinien korzystać z istniejącego item display mapper/helper, jeśli jest dostępny.
- Bonusy i requirements mają pochodzić z item read modelu / domain mapperów.
- Value in drachmas z item row/read modelu.
- Actions muszą respektować item lifecycle/status.
- Nie robić direct table writes.

**Acceptance criteria:**
- Item card jest kompaktowy i czytelny.
- Drachma value jest w osobnej linii na kafelku.
- Hover/click pokazuje pełniejszy popover z bonusami, requirements i value.
- Popover pattern jest reuseable dla Armory, Dashboard equipment preview, Trade/Auction i Reports.
- Locked itemy mają właściwe disabled states / badges.
- Build/tsc przechodzi.
- Codex raportuje:
  - `reused:`
  - `checked but not reused:`
  - `new component/state/helper added:`
  - `scope kept minimal:`
  - `not added intentionally:`

  ---

## Task UI-21 — Armory drag and drop / move-to-stand UX slice

**Goal:**  
Dodać UX do przenoszenia itemów między Display Stands, najlepiej przez drag & drop, z fallbackiem na prostą akcję `Move to stand`.

**Scope:**
- UI-only albo read/write slice zależnie od tego, czy istnieje backend support dla item stand assignment.
- Stand sections mają działać jako drop targets.
- Item cards powinny być draggable, jeśli użycie drag/drop jest bezpieczne i zgodne z obecnymi vendorami.
- Puste standy też muszą być drop targets.
- Alternatywnie lub dodatkowo item popover może mieć akcję:
  - `Move to Stand 10`,
  - `Move to Stand 9`,
  - ...
  - `Move to Stand 1`.

**Fallback if no DB/backend support exists:**
- Nie implementować trwałego zapisu stand assignment.
- Pokazać mock/local UX tylko w prototypie albo zgłosić dependency:
  - `DB/read-write support for item display stand assignment needed`.
- Nie zapisywać standu w przypadkowym metadata JSON bez decyzji projektowej.
- Nie dodawać nowej tabeli/migracji bez osobnego taska.

**Expected backend/domain concept, if/when implemented:**
- Każdy item ma przypisany stand number 1–10.
- Nowe itemy defaultowo trafiają na Stand 1.
- Stand assignment wpływa na ordering/visibility, nie na item ownership.
- Stand label/name może być player-defined later.
- Zmiana standu powinna być hero-owned operation, nie admin config.

**UX rules:**
- Po przeciągnięciu itemu na stand:
  - pokazać optimistic local move tylko jeśli można bezpiecznie cofnąć po błędzie,
  - albo wykonać zapis i potem odświeżyć read model.
- Locked itemy mogą być przenoszone między standami tylko jeśli domena to dopuszcza; jeśli nie wiadomo, disabled + reason.
- Przenoszenie itemu nie może zmienić jego statusu trade/auction/equipped.
- DnD ma być dodatkiem UX, nie jedynym sposobem obsługi. Fallback action jest wskazany.

**Out of scope:**
- Nie robić kompletnego inventory folder system.
- Nie robić multi-select bulk move, chyba że istnieje już pattern i zakres pozostaje mały.
- Nie dodawać complex animations.
- Nie robić drag/drop bez accessibility/fallback.
- Nie zmieniać item ownership.
- Nie przenosić hidden itemów do visible capacity inaczej niż przez stand priority.

**Acceptance criteria:**
- Stand sections są czytelnymi drop targets.
- Empty stands są drop targets.
- Item może zostać przeniesiony do innego standu albo UI zgłasza brak backend dependency.
- Stand priority przelicza visible/hidden state po zmianie.
- Fallback bez drag/drop jest dostępny lub zaplanowany.
- Build/tsc przechodzi.
- Codex raportuje:
  - `reused:`
  - `checked but not reused:`
  - `new component/state/helper added:`
  - `scope kept minimal:`
  - `not added intentionally:`

  ---

## Task UI-22 — Armory implementation pass and anti-overengineering check

**Goal:**
Po wdrożeniu pierwszych slice’ów Armory wykonać pass ograniczający overengineering i upewnić się, że ekran pozostaje prosty, cienki, zgodny z projektem oraz faktycznie realizuje zaakceptowany model UI:

* Equipped items / equipment layout po lewej.
* Inventory po prawej.
* Display Stands jako sekcje od Stand 10 do Stand 1.
* Armory capacity jako limit widoczności, nie limit ownership.
* Item cards plus reusable item popover.
* Hidden-by-capacity itemy nadal pozostają owned.

**Scope:**

* Przejrzeć:

  * Armory page,
  * equipment layout component,
  * item card component,
  * item popover/detail component,
  * Display Stand section component,
  * capacity/visibility helper,
  * item actions,
  * SCSS/classes,
  * read-model/service usage.
* Upewnić się, że ekran nie stał się:

  * dashboardem,
  * admin item catalogiem,
  * crafting screenem,
  * trade/auction screenem,
  * formula/debug screenem,
  * jednym ogromnym komponentem,
  * zbiorem ad hoc wrapperów i klas.

**Required model checks:**

* Display Stands są renderowane jako sekcje, nie jako zwykłe filter tabs.
* Sekcje są w kolejności Stand 10 → Stand 1.
* Stand 10 ma najwyższy priorytet widoczności.
* Stand 1 jest defaultowym standem dla nowych itemów i ma najniższy priorytet.
* Puste standy są widoczne.
* Stand labels/names mogą być player-editable później, ale jeśli nie ma DB/backend supportu, Codex nie wymyśla trwałego zapisu.
* Hidden-by-capacity itemy nadal są owned.
* Capacity decyduje, ile itemów jest widocznych.
* Stand priority decyduje, które itemy wchodzą do widocznej puli jako pierwsze.
* Player-facing UI nie używa słowa Paperdoll; techniczny komponent może nazywać się EquipmentPaperdollComponent.

**Required architecture checks:**

* Nie ma direct writes do item tables.
* Item actions idą przez istniejące canonical RPC/domain paths:

  * equip/unequip, jeśli istnieje,
  * vendor sell/scrap,
  * direct trade,
  * auction listing.
* Locked itemy respektują status:

  * locked_trade,
  * locked_auction.
* Scrapped itemy nie pojawiają się w normalnym inventory.
* Item display name, drachma value, requirements i bonuses pochodzą z read modelu/domain mapperów, nie z hardcoded template logic.
* Jeśli stand assignment nie ma jeszcze backend/DB supportu, Codex ma zgłosić dependency zamiast wymyślać trwały zapis w losowym metadata JSON.

**Required reuse checks:**

* Sprawdzić istniejące shared/vendor/PrimeNG patterns dla:

  * card,
  * badge/tag,
  * tooltip/popover,
  * item display,
  * metadata display,
  * buttons/actions,
  * filters/search,
  * drag/drop, jeśli jest wdrażany.
* Item popover powinien być reusable dla:

  * Armory,
  * Dashboard equipment preview,
  * Trade/Auction,
  * Reports.
* Capacity/stand visibility calculation powinno być czystym helperem/testowalne, jeśli implementowane frontendowo.
* Typy/interfejsy nie mogą lądować w komponencie.

**What Codex must not add:**

* No crafting.
* No full trade flow.
* No full auction flow.
* No admin item catalog.
* No permanent DB schema invented for stands.
* No item comparison engine.
* No Angular-only item bonus resolver.
* No direct item table writes.
* No player-facing Paperdoll label.
* No hidden item deletion.
* No new icon framework.
* No massive generic inventory framework.
* No 200k props for future use.

**Required report section:**
Codex po tasku musi jawnie dopisać:

scope kept minimal:

* ...

not added intentionally:

* ...

**Acceptance criteria:**

* Armory screen pozostaje prostym ekranem zarządzania ekwipunkiem i widocznością itemów.
* Display Stands są sekcjami Stand 10 → Stand 1.
* Puste standy są widoczne.
* Item cards i item popover są reusable albo uzasadniono, dlaczego jeszcze nie są.
* Equipment layout nie pokazuje player-facing labela Paperdoll.
* Stand/capacity logic nie udaje, że hidden itemy są usunięte.
* Reuse check jest wiarygodny.
* Nie ma zbędnych properties/states/helpers.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-23 — Estate screen: player-facing estate overview

**Goal:**
Zbudować player-facing ekran Estate dla zarządzania posiadłością bohatera.

Ekran ma być głównym miejscem do:

* obejrzenia aktualnej posiadłości,
* sprawdzenia dostępnych budynków,
* sprawdzenia bonusów budynków,
* rozpoczęcia budowy lub upgrade’u,
* sprawdzenia aktywnego building joba,
* przejścia do listy okolicznych posiadłości.

To nie ma być admin building catalog ani city-builder. To ma być czytelny ekran gracza.

**Scope:**

* Route/page dla Estate, docelowo w obszarze game, zgodnie z project structure.
* Użyć istniejącego shellu, topbara i sidebaru.
* Zachować kierunek wizualny z aktualnego Estate V3 preview:

  * modern premium browser RPG,
  * dark navy / gold / bronze,
  * lekki ancient-Greek flavor,
  * desktop-first.
* Header ekranu:

  * label Estate,
  * adres estate, np. B-0421,
  * krótki opis,
  * badge District B,
  * badge Estate B-0421.
* Nie pokazywać technicznych/project-only badge:

  * one estate per hero,
  * A+B buildings available,
  * cancel not available.
* Prawy summary card:

  * District,
  * Available buildings,
  * Active job,
  * Vicinity / Open estate list.
* Vicinity / Open estate list ma prowadzić do przyszłego widoku listy okolicznych posiadłości.

**Estate address rules:**

* Estate address source of truth to district_code + address_number.
* Nie traktować estates.address jako długoterminowego źródła prawdy.
* Jeśli istnieje helper formatujący adres, użyć helpera.
* Jeśli usunięta zostanie ostatnia zależność od estates.address, Codex ma zgłosić DB cleanup candidate: estates.address.

**Out of scope:**

* Nie implementować listy posiadłości w tym tasku.
* Nie implementować relocation.
* Nie implementować siege/takeover.
* Nie robić admin edycji budynków.
* Nie robić building balance editor.
* Nie robić cancel building job.
* Nie robić collect/claim completed building job.

**Data/source rules:**

* Ładować estate przez active hero i selected server.
* Hero-owned reads nie mogą używać auth uid jako hero id.
* Budynki i building jobs muszą być server/hero/estate scoped.
* Dane definicyjne budynków powinny pochodzić z DB/read modelu, nie z hardcoded list w komponencie.
* UI może previewować koszt/czas, ale authoritative build start musi iść przez DB/RPC.

**Acceptance criteria:**

* Estate screen pokazuje aktualny estate address jako district + number.
* Header nie pokazuje technicznych/project-only informacji.
* Summary ma District, Available buildings, Active job i Vicinity link.
* UI jest desktop-first i spójny z dashboard/statistics/armory style.
* Nie ma player-facing cancel action.
* Nie ma collect/claim completed building job.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-24 — Estate building grid grouped by district

**Goal:**
Dodać do Estate widok budynków pogrupowanych według dystryktu, zgodnie z aktualnym modelem UI z Estate V3 preview.

Dla estate w District B widoczne są sekcje:

* District A buildings,
* District B buildings.

Budynki z wyższych dystryktów nie są pokazywane jako locked. Pojawią się dopiero wtedy, gdy estate osiągnie odpowiedni district.

**Scope:**

* Renderować budynki jako sekcje per district.
* Sekcje mają być w kolejności od najniższego dostępnego dystryktu do aktualnego:

  * District A,
  * District B,
  * District C,
  * District D,
  * District E.
* Dla aktualnego mocka/implementacji District B:

  * pokazać District A buildings,
  * pokazać District B buildings,
  * nie pokazywać District C/D/E.
* Każda sekcja pokazuje:

  * nazwę dystryktu,
  * krótki opis,
  * licznik dostępnych budynków w tej sekcji.
* Budynki spoza dostępnego zakresu dystryktu nie mają być renderowane jako disabled/locked cards.

**Building card content:**
Każdy building card pokazuje:

* obrazek/ilustrację budynku,
* nazwę budynku,
* aktualny poziom,
* opis,
* current bonus,
* next level bonus,
* build time następnego poziomu,
* koszt następnego poziomu:

  * drachmas,
  * materials,
  * workforce,
* akcję Build albo Upgrade.

**Visual direction:**

* 3 kolumny na desktopie są akceptowalne na start.
* Mobile/responsive dopracować później, ale nie łamać podstawowego responsive layoutu.
* Cards mają być spójne z Estate V3:

  * obrazek na górze,
  * info rows w środku,
  * CTA/status na dole.
* Budynki aktualnie budowane powinny być wizualnie wyróżnione.

**Out of scope:**

* Nie robić widoku budynków spoza aktualnego dystryktu.
* Nie robić admin preview.
* Nie robić pełnego building dictionary editor.
* Nie robić drag/drop/reorder budynków.
* Nie tworzyć hardcoded final listy budynków w komponencie, jeśli DB/read model istnieje.

**Data/source rules:**

* Budynek ma minimal district, np. district_code.
* Budynek jest dostępny w swoim district i wyższych districtach.
* Missing/higher district buildings nie są widoczne.
* Max level i district caps muszą pochodzić z DB/read modelu lub istniejącego helpera.
* Requirements/caps są DB-backed i nie powinny być hardcodowane w Angularze.

**Acceptance criteria:**

* Budynki są pogrupowane po district sections.
* District B pokazuje tylko District A i District B buildings.
* District C/D/E buildings nie są pokazane jako locked.
* Każdy building card pokazuje current bonus, next bonus, cost, time i action.
* Układ desktopowy jest czytelny i spójny z aktualnym stylem.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-25 — Estate active building job panel

**Goal:**
Dodać czytelny player-facing panel aktywnej budowy na ekranie Estate.

Panel ma jasno pokazywać, że aktualnie trwa building job, ale nie ma sugerować cancel/claim/collect flow.

**Scope:**

* Panel nad listą budynków:

  * status Building in progress,
  * nazwa budynku,
  * target level,
  * czas pozostały,
  * progress bar,
  * krótki opis skutku aktywnego joba.
* Building card aktualnie budowanego budynku też pokazuje:

  * Level X → Y,
  * Building in progress,
  * progress bar,
  * remaining time albo percent,
  * disabled action.

**Rules:**

* Jeden aktywny job per estate.
* Jeśli active job istnieje, inne Build/Upgrade buttons są disabled.
* Disabled reason:

  * Blocked by active building job
  * albo krótszy wariant spójny z UI.
* Nie pokazywać cancel action.
* Nie pokazywać collect/claim completed action.
* Nie pokazywać “ready to collect”.
* Jeśli job jest completed, read/gameplay workflow powinien go finalizować przed prezentacją stanu.

**Out of scope:**

* Brak cancel.
* Brak admin/system failed/cancelled correction UI.
* Brak queue management.
* Brak wielu równoległych jobów.
* Brak claim completed.

**Data/source rules:**

* Active job pochodzi z estate_building_jobs.
* Przed odczytem aktualnych poziomów budynków workflow/read path powinien respektować finalize_completed_estate_building_jobs.
* Player-facing UI nie musi pokazywać statusów cancelled/failed.
* Jeśli backend zwraca cancelled/failed, pokazać bezpieczny fallback/error state zamiast budować player action.

**Acceptance criteria:**

* Active job panel jest widoczny, gdy trwa budowa.
* Aktualnie budowany building card jest wyróżniony.
* Inne building actions są disabled.
* Nie ma cancel action.
* Nie ma collect/claim action.
* Completed jobs nie są player-facing “ready to collect”.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-26 — Estate building action through canonical RPC

**Goal:**
Podłączyć Build/Upgrade action na ekranie Estate do canonical DB/RPC workflow dla rozpoczęcia budowy lub upgrade’u.

**Canonical operation:**

* start_estate_building_upgrade

**Scope:**

* Kliknięcie Build/Upgrade wywołuje domain/service operation.
* Payload musi zawierać tylko dane wymagane przez RPC:

  * hero id,
  * building id,
  * reason,
  * request id, jeśli obecny pattern go wymaga.
* Po sukcesie:

  * odświeżyć estate,
  * odświeżyć buildings,
  * odświeżyć active job,
  * odświeżyć hero resources.
* Po błędzie:

  * pokazać czytelny feedback,
  * nie robić optimistic trwałej zmiany, jeśli nie ma bezpiecznego rollbacku.
* Loading state per clicked building albo global action state dla estate.

**Critical DB/RPC rules:**

* Frontend nie liczy authoritative cost/time.
* Frontend nie odejmuje resources.
* Frontend nie insertuje estate_building_jobs.
* Frontend nie update’uje estate_buildings bezpośrednio.
* RPC ocenia building_upgrade_cost i building_upgrade_time po stronie DB.
* RPC wydaje drachmas/materials/workforce przez hero_resource_ledger.
* RPC tworzy job i zapisuje audit.

**Preview vs authoritative:**

* UI może pokazać preview kosztu i czasu.
* Preview nie jest źródłem prawdy.
* Jeśli preview różni się od RPC, po sukcesie odświeżony read model wygrywa.
* Jeśli brakuje preview path, można pokazać cost/time z read modelu albo placeholder dependency, ale nie wymyślać formuł w komponencie.

**Stale guards:**

* Jeśli active hero/server/estate zmieni się podczas requestu, response ma zostać zignorowany.
* Stary error/success nie może nadpisać aktualnego widoku.
* Loading kończy się tylko dla aktualnego requestu.

**Out of scope:**

* Brak cancel.
* Brak queue.
* Brak admin override.
* Brak relocation.
* Brak completed job claim.
* Brak direct resource mutation.

**Acceptance criteria:**

* Build/Upgrade używa canonical RPC/domain operation.
* Brak direct writes do resources/jobs/building tables.
* Po sukcesie dane są odświeżone.
* Po błędzie UI pokazuje sensowną informację.
* Stale guards są zaimplementowane.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-27 — Estate vicinity entry point and future estate list boundary

**Goal:**
Dodać na ekranie Estate player-facing entry point do przyszłej listy okolicznych posiadłości, bez implementowania pełnego widoku listy w tym tasku.

**Scope:**

* W summary card Estate dodać:

  * Vicinity,
  * Open estate list.
* Link/akcja prowadzi do planowanej route, np. Estate Vicinity / Nearby Estates.
* Jeśli route jeszcze nie istnieje:

  * przycisk może być disabled z krótkim hintem,
  * albo może prowadzić do placeholder page, jeśli to jest w zakresie taska.
* Nie pokazywać tego jako technical estate registry.
* Player-facing nazwa powinna być bliższa:

  * Vicinity,
  * Nearby estates,
  * Estate vicinity.
* Nie używać nazwy Owned estates, bo hero ma własny estate, a lista ma dotyczyć okolicy / sąsiednich adresów.

**Future behavior to keep in mind:**

* Lista okolicy powinna pokazywać estate addresses wokół aktualnego address_number, np. kilka/kilkanaście niżej i wyżej.
* Empty addresses nie są DB rows.
* Frontend może generować address range z estate_district_address_capacities i overlayować occupied estates.
* Relocation do empty address jest destructive i DB-owned through relocate_hero_estate_to_empty_address.
* Siege/takeover occupied estate to future PvP/guild workflow i nie może używać destructive empty-address relocation.

**Out of scope:**

* Nie implementować pełnej listy okolicznych posiadłości w tym tasku.
* Nie implementować relocation.
* Nie implementować siege/takeover.
* Nie pokazywać empty address move confirmation.
* Nie dodawać mapy/district browsera.
* Nie tworzyć DB schema.

**Acceptance criteria:**

* Estate screen ma czytelny player-facing entry point do Vicinity/Nearby estates.
* Nie ma technical labeli typu one estate per hero.
* Nie ma Owned estates.
* Jeśli route nie istnieje, zachowanie linku/placeholdera jest jasno opisane.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-28 — Mythborne UI style contract extraction

**Goal:**
Wyciągnąć z aktualnych HTML previewów i UI/UX backlogu spójny, praktyczny “UI style contract” dla Codexa, żeby kolejne ekrany wyglądały tak samo bez kopiowania całych mocków HTML.

Ten task nie ma tworzyć finalnego design systemu. Ma zebrać konkretne tokeny, klasy, zachowania i wzorce wizualne, które już zaakceptowaliśmy w dashboard/statistics/armory/estate preview.

**Scope:**

* Dodać albo rozszerzyć sekcję w mythborne-ui-ux-backlog.md.
* Opisać podstawowe tokeny:

  * background,
  * navy,
  * gold/bronze,
  * text colors,
  * border/line colors,
  * shadows,
  * radiuses,
  * layout widths.
* Opisać wzorce:

  * app shell,
  * topbar,
  * sidebar,
  * active nav link,
  * nav icon,
  * page header,
  * summary card,
  * card,
  * badge,
  * chip/resource chip,
  * progress bar,
  * section header,
  * item/building card,
  * hover/focus states.
* Szczególnie opisać active sidebar link:

  * gold/blue subtle gradient,
  * left inset gold accent,
  * soft border,
  * text color shift,
  * no heavy blocky selected state.
* Opisać zasady stylistyczne:

  * modern-first,
  * premium dark RPG,
  * ancient Greek flavor przez kolor/materiał/detal, nie przez ciężką dekorację,
  * desktop-first,
  * no div soup,
  * no random ad hoc classes,
  * prefer shared/vendor/PrimeNG wrappers.

**Do not:**

* Nie przepisywać całych HTML mocków do backlogu.
* Nie tworzyć osobnego pełnego design systemu bez potrzeby.
* Nie narzucać wszystkich tokenów jako immutable, jeśli repo ma już lepsze vendor tokens.
* Nie dodawać nowych ikon ani icon frameworka.
* Nie mieszać statusów tasków Codexa.

**Acceptance criteria:**

* Codex ma jasne wskazówki, jak odtworzyć aktywny sidebar link, topbar, cards, badges i page headers.
* Sekcja wskazuje, że preview HTML jest referencją, ale implementacja ma używać shared/vendor/PrimeNG i istniejących tokenów.
* Style contract nie zastępuje current-decisions ani database-current.
* Nie aktualizuje statusów klasycznego backlogu.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-29 — Auction House screen: one-item listing browser

**Goal:**
Zbudować osobny ekran Auction House jako list-first browser aukcji.

Auction House nie jest Direct Trade. Direct Trade ma być osobnym ekranem dla prywatnych ofert hero-to-hero. Auction House pokazuje publiczne listingi aukcyjne, gdzie każdy listing zawiera dokładnie jeden item.

**Scope:**

* Route/page dla Auction House, docelowo w obszarze game/trade/economy.
* Użyć istniejącego shellu/topbara/sidebaru.
* Zachować aktualny kierunek wizualny:

  * modern premium browser RPG,
  * dark navy / gold / bronze,
  * lekki ancient-Greek flavor,
  * desktop-first.
* Header ekranu:

  * label Auction House,
  * tytuł Browse one-item listings,
  * krótki opis,
  * summary card z:

    * Available CP,
    * Locked CP,
    * Active bids,
    * Your listings.
* Listingi mają być prezentowane jako lista, nie jako mały losowy zestaw kafelków.
* Każdy row/listing pokazuje:

  * ikonę itemu,
  * nazwę itemu,
  * slot/category,
  * seller,
  * time remaining,
  * najważniejsze wymaganie, jeśli istnieje,
  * Cannot equip yet, jeśli gracz nie spełnia wymagań,
  * aktualną cenę w Character Points,
  * buy now price, jeśli listing ma buy now,
  * akcje zależne od auction mode.

**Auction mode actions:**

* Bidding only:

  * Bid,
  * Watch.
* Buy now only:

  * Buy now.
* Bidding with buy now:

  * Bid,
  * Watch,
  * Buy now.
* Own listing:

  * Manage / Open listing tylko dla własnych listingów.
  * Nie pokazywać Buy now dla własnego listingu jako normalnej akcji kupującego.

**Out of scope:**

* Nie robić Direct Trade buildera na tym ekranie.
* Nie robić vendor sell/scrap.
* Nie robić bundle auctions.
* Nie robić multi-item auction.
* Nie pokazywać wartości w drachmach na listing rows.
* Nie robić pełnego item comparison engine.
* Nie robić admin auction inspector.

**Data/source rules:**

* Auction listing = exactly one item.
* Payment is Character Points.
* Drachma value może pojawić się tylko w item popoverze jako informacja o wartości itemu, nie jako cena aukcji.
* Auction data musi pochodzić z existing auction read models/services/RPC-backed flows.
* Item display name, requirements and bonus summary muszą pochodzić z item read model/domain mapperów, nie z hardcoded template logic.
* Persistent actions muszą iść przez existing auction RPC/domain operations, nie direct writes.

**Acceptance criteria:**

* Auction House jest osobnym ekranem od Direct Trade.
* Lista aukcji pokazuje publiczne one-item listings.
* Listing row nie pokazuje drachma value.
* Listing row pokazuje Character Points price.
* Actions zależą od auction mode.
* Cannot equip yet jest wyraźnie widoczne, jeśli wymagania nie są spełnione.
* Własne listingi mają osobne player-facing actions.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-30 — Auction House filters and pagination

**Goal:**
Dodać do Auction House czytelne filtrowanie, sortowanie i paginację, żeby gracz mógł przeglądać dużą listę aukcji nawet wtedy, gdy nie wie dokładnie, czego szuka.

**Scope:**

* Panel filtrów po prawej stronie lub w responsywnym miejscu zgodnym z layoutem.
* Filtry:

  * search: item name, affix, seller, requirement,
  * slot/category:

    * All,
    * Weapon,
    * Head,
    * Chest,
    * Boots,
    * Ring,
    * Amulet,
    * inne sloty, jeśli dictionary/read model je zwraca,
  * CP price range,
  * usability:

    * All items,
    * Can equip now,
    * Cannot equip yet,
    * Hide my listings,
  * auction mode/status, jeśli read model to wspiera.
* Sort:

  * Ending soon,
  * Lowest current bid,
  * Buy now first,
  * Newest listings.
* Paginacja:

  * current page,
  * total pages,
  * visible range, np. Showing 1–12 of 126 active listings,
  * Prev / Next,
  * page numbers,
  * ellipsis dla długich zakresów,
  * per page selector: 12 / 24 / 48 albo DB/config-backed values, jeśli istnieją.

**Out of scope:**

* Nie robić infinite scroll w pierwszym slice.
* Nie robić skomplikowanych saved searches.
* Nie robić advanced query builder.
* Nie hardcodować slot list, jeśli slot dictionary istnieje.
* Nie wykonywać filtrowania wyłącznie lokalnie, jeśli dane są paginowane server-side.

**Data/source rules:**

* Paginacja powinna być server-side albo service-backed, jeśli lista może być duża.
* Query state powinien być możliwie route/query-param friendly, ale nie trzeba robić pełnego deep-linking w pierwszym slice, jeśli to komplikuje zakres.
* Slot/category labels powinny pochodzić z DB dictionary/read modelu, jeśli istnieje.
* Search/filter state powinien resetować paginację do strony 1.
* Stale response guard wymagany przy zmianie filtra/sort/page.

**Acceptance criteria:**

* Auction House ma widoczny panel filtrów.
* Listing można filtrować po slotach.
* Listing ma czytelną paginację.
* Paginacja pokazuje zakres i liczbę wyników.
* Zmiana filtra resetuje current page.
* Stare async responses nie nadpisują nowszego filter/page state.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-31 — Global item hover popover contract

**Goal:**
Wprowadzić globalną zasadę UI: wszędzie tam, gdzie w aplikacji pojawia się item, hover albo click/focus powinien pokazać reusable item popover z pełnym podsumowaniem przedmiotu.

Dotyczy to m.in.:

* Dashboard equipment preview,
* Armory,
* Auction House,
* Direct Trade,
* Reports,
* future reward/result screens.

**Scope:**

* Stworzyć albo wykorzystać istniejący shared item popover component/pattern.
* Popover powinien pokazywać:

  * pełną nazwę itemu,
  * quality,
  * prefix,
  * base item,
  * suffix,
  * slot/category,
  * status, jeśli istotny,
  * sumę bonusów,
  * wymagania po przeliczeniu,
  * informację czy hero spełnia wymagania,
  * damage range, jeśli dotyczy,
  * wartość w drachmach.
* Popover nie pokazuje wartości w Character Points, bo ta jest rynkowa i zależy od aukcji/oferty.
* Item rows/listing cards mogą pokazywać tylko najważniejsze skróty, a popover pokazuje pełnię.

**Important display rules:**

* Wartość w drachmach jest informacją o itemie, nie ceną P2P trade/auction.
* Character Points price pochodzi z auction/direct trade listing/offer, nie z itemu.
* Nie sugerować, że droższy item w drachmach jest automatycznie lepszy.
* Cannot equip yet powinno być widoczne przy itemach, których wymagań hero nie spełnia.
* Popover musi działać też keyboard/focus-friendly, nie tylko mouse hover, jeśli używane w produkcyjnym UI.

**Out of scope:**

* Nie robić item comparison engine.
* Nie robić permanentnego item valuation in Character Points.
* Nie robić admin-only debug fields.
* Nie przepisywać wszystkich ekranów naraz, jeśli komponent można wdrażać etapami.

**Data/source rules:**

* Item display name powinien używać istniejącego item display mapper/helper.
* Bonus summary powinien pochodzić z item read model/domain mapperów.
* Requirements powinny pochodzić z entity requirements/read modelu.
* Drachma value powinno pochodzić z item read modelu.
* Jeśli read model nie dostarcza pełnego popover summary, Codex ma zgłosić dependency lub dodać mały mapper w core, nie składać logiki w komponencie.

**Acceptance criteria:**

* Istnieje reusable item popover/pattern.
* Auction House używa item popover na item name/row.
* Popover pokazuje full item summary.
* Listing rows nie muszą pokazywać drachma value, ale popover pokazuje drachma value.
* Cannot equip yet jest widoczne przy niespełnionych requirements.
* Pattern nadaje się do reuse w Armory i Dashboard.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-32 — Auction House actions through canonical RPC/domain paths

**Goal:**
Podłączyć player-facing actions na Auction House do istniejących canonical auction RPC/domain operations, bez direct writes do tabel aukcji, itemów ani Character Points.

**Scope:**

* Actions:

  * Create auction,
  * Bid,
  * Watch, jeśli istnieje read/write support albo local-only placeholder,
  * Buy now,
  * Manage/Open own listing.
* Actions muszą respektować auction mode:

  * bidding,
  * buy_now,
  * bidding_with_buy_now.
* Actions muszą respektować item/listing status:

  * active listing,
  * expired/cancelled/completed listing,
  * own listing,
  * locked_auction,
  * active bid/outbid/winning.
* CP lock preview i CP availability powinny być czytelne przed akcją.
* Po sukcesie odświeżyć listing list, summary i CP lock/balance view.

**Out of scope:**

* Nie implementować Direct Trade.
* Nie robić vendor sell/scrap.
* Nie robić admin cancellation.
* Nie robić anti-abuse case UI.
* Nie robić transaction history detail, chyba że istnieje już route/pattern.
* Nie robić watchlist backend, jeśli nie ma kontraktu; wtedy Watch może być placeholderem albo dependency.

**Data/source rules:**

* Frontend nie może:

  * insert/update player_auction_listings bez RPC/domain service,
  * insert/update player_auction_bids bez RPC/domain service,
  * mutować items.status bez RPC/domain service,
  * mutować Character Points/locks bez RPC/domain service.
* Buy now powinien używać canonical buy-now operation.
* Bid powinien używać canonical bid operation.
* Create listing powinien używać canonical listing operation.
* Backend/RPC odpowiada za locks, CP validation, listing status, item status i audit.
* Stale guards wymagane przy actions zależnych od listing id / selected server / active hero.

**Acceptance criteria:**

* Bid działa tylko dla listingów z bidding.
* Buy now działa tylko dla listingów z buy_now.
* Bidding with buy now pokazuje i obsługuje oba typy akcji.
* Own listing nie pokazuje buyer actions.
* CP locks/balance odświeżają się po mutacji.
* Brak direct writes do auction/item/CP tables.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-33 — Direct Trade screen: offer builder

**Goal:**
Zbudować osobny ekran Direct Trade jako prywatny offer builder do handlu bezpośredniego między bohaterami.

Direct Trade nie jest Auction House. Auction House jest osobnym ekranem publicznych listingów, gdzie jeden listing zawiera dokładnie jeden item. Direct Trade służy do wysłania oferty do jednego wybranego bohatera.

**Scope:**

* Route/page dla Direct Trade, docelowo w obszarze game/trade/economy.
* Użyć istniejącego shellu/topbara/sidebaru.
* Zachować aktualny kierunek wizualny z Direct Trade V2 preview:

  * modern premium browser RPG,
  * dark navy / gold / bronze,
  * desktop-first,
  * spójność z Auction House, Armory i Estate.
* Header ekranu:

  * Direct Trade,
  * Offer to selected hero,
  * krótki opis,
  * summary card:

    * Available CP,
    * Locked CP,
    * Market slots,
    * Remaining slots.
* Target hero picker:

  * wyszukiwanie bohatera na aktualnym serwerze,
  * bez player-facing informacji typu same server,
  * handel między serwerami nie jest dostępny.
* Offer builder:

  * lewa strona: Your offer,
  * prawa strona: Target response,
  * creator wybiera tylko swoje itemy i swoje Character Points,
  * creator nie wybiera i nie żąda itemów celu,
  * creator nie ustawia target Character Points,
  * target response pozostaje pusty do czasu odpowiedzi celu.
* Your offer:

  * do 5 item slots w aktualnym mocku,
  * limit ma być traktowany jako config/design-backed, nie betonowany, jeśli DB/config mówi inaczej,
  * Character Points input,
  * podsumowanie items selected i CP to lock.
* Target response:

  * puste sloty odpowiedzi,
  * informacja, że odpowiedź pojawi się po reakcji celu,
  * brak wymagania/requestowania konkretnych itemów lub CP.

**Out of scope:**

* Nie implementować Auction House na tym ekranie.
* Nie implementować public marketplace.
* Nie pokazywać inventory celu.
* Nie pozwalać creatorowi żądać konkretnych itemów celu.
* Nie pozwalać creatorowi żądać konkretnej liczby CP celu.
* Nie robić vendor sell/scrap.
* Nie robić anti-abuse admin/debug UI.
* Nie robić bundle auction.
* Nie robić pełnej historii transakcji.

**Data/source rules:**

* Direct trade jest server-scoped.
* Target hero musi pochodzić z aktualnego serwera.
* Creator-side itemy pochodzą z inventory active hero.
* Creator-side itemy muszą być active i owned.
* Scrapped / locked_trade / locked_auction itemy nie mogą być selectable jako nowe offer items.
* Target response data pojawia się dopiero po response workflow.
* Drachma value nie jest trade price i nie pokazuje się jako cena oferty; może pojawić się tylko w item popoverze.
* Character Points są walutą player-to-player.
* Persistent mutations muszą iść przez canonical RPC/domain operations, bez direct table writes.

**Acceptance criteria:**

* Direct Trade jest osobnym ekranem od Auction House.
* Creator wybiera tylko swoje itemy i swoje CP.
* Target response jest puste do czasu odpowiedzi celu.
* UI nie pokazuje inventory celu.
* UI nie pozwala żądać konkretnych itemów lub CP celu przy tworzeniu oferty.
* Item hover używa reusable item popover pattern.
* Drachma value jest tylko w item popoverze.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-34 — Direct Trade pending offers panel and pagination

**Goal:**
Dodać panel Pending offers dla Direct Trade, z paginacją ograniczoną do 5 ofert na stronę.

Panel ma obsługiwać sytuację, w której gracz ma wiele ofert z różnymi użytkownikami albo kilka osobnych ofert z tym samym użytkownikiem.

**Scope:**

* Prawy panel Pending offers.
* Pokazać total count, np. 17 total.
* Pokazać maksymalnie 5 pending offers na stronie.
* Dodać paginację szerokości panelu:

  * zakres, np. 1–5 of 17,
  * previous/next,
  * page numbers,
  * ellipsis dla długich zakresów.
* Oferty mogą być:

  * incoming,
  * outgoing,
  * waiting for target,
  * waiting for creator,
  * locked_trade.
* Oferty do tego samego bohatera mogą występować wielokrotnie jako osobne rekordy/oferty.
* Incoming empty offer nie zużywa market slotu odbiorcy, dopóki odbiorca nie odpowie itemem albo CP.
* Pending offers powinny być nad Rules w prawym panelu.
* Rules i explanation notes są poniżej Pending offers.

**Out of scope:**

* Nie robić pełnego transaction history.
* Nie robić anti-abuse detail panelu.
* Nie robić admin/moderator view.
* Nie robić custom inbox systemu.
* Nie robić infinite scroll.
* Nie pokazywać więcej niż 5 ofert naraz w panelu.

**Data/source rules:**

* Pending offers muszą pochodzić z direct trade read modelu.
* Status labels powinny być mapowane z DB/domain statusów na player-facing copy.
* Paginacja może być server-side albo service-backed.
* Zmiana strony nie może mieszać stale responses.
* Incoming empty offers nie powinny być liczone jako market slot usage odbiorcy, jeśli target nie odpowiedział itemem/CP.
* Outgoing offers, gdzie creator lockuje itemy/CP, zużywają market slot zgodnie z market slot logic.

**Acceptance criteria:**

* Pending offers panel pokazuje total count.
* Panel pokazuje maksymalnie 5 ofert.
* Paginacja jest widoczna i mieści się w panelu.
* Kilka ofert z tym samym hero jest pokazanych jako osobne oferty.
* Incoming empty offer ma czytelny status i nie sugeruje zajęcia slotu targeta.
* Pending offers znajduje się nad Rules.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-35 — Direct Trade market slot summary

**Goal:**
Dodać czytelne summary market slotów dla Direct Trade, zgodne z aktualnym modelem, w którym limit aktywności rynku wynika z poziomu Trade Routes / market level.

Market slots są współdzielone przez:

* outgoing direct offers,
* aktywne auction listings,
* aktywne auction bids.

**Scope:**

* Header summary card Direct Trade:

  * Available CP,
  * Locked CP,
  * Market slots, np. 3 / 5 used,
  * Remaining slots, np. 2.
* Dodać krótką notkę niżej w prawym panelu:

  * market slots są współdzielone przez outgoing offers, active auction listings i active auction bids,
  * incoming offers zaczynają używać slotu dopiero, gdy gracz odpowie itemami albo CP.
* Notka ma być drugorzędna i nie dominować UI.
* Nie pokazywać technicznego tekstu w głównym headerze, jeśli nie jest potrzebny.

**Out of scope:**

* Nie implementować Trade Routes building integration, jeśli backend/read model jeszcze tego nie dostarcza.
* Nie robić pełnego market slot debug UI.
* Nie robić adminowej rozpiski, skąd dokładnie pochodzi limit.
* Nie robić anti-abuse explanation panelu.
* Nie hardcodować finalnego limitu 5, jeśli config/read model istnieje.

**Data/source rules:**

* Limit market slots powinien pochodzić z read modelu/config/runtime, jeśli jest dostępny.
* UI może mockować 3 / 5 used tylko w prototypie.
* Codex nie może zabetonować 5 jako stałej gameplayowej, jeśli istnieje DB/config/building-backed source.
* Slot usage powinno rozróżniać:

  * outgoing direct offers,
  * direct trade responses with locked assets,
  * active auction listings,
  * active auction bids,
  * incoming empty offers that do not consume target slots.

**Acceptance criteria:**

* Header pokazuje market slot usage.
* Remaining slots są widoczne.
* UI nie sugeruje, że incoming empty offers blokują target hero.
* Limit nie jest hardcoded, jeśli jest dostępny DB/config/read model.
* Wyjaśnienie slotów jest krótkie i umieszczone niżej niż pending offers.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-36 — Direct Trade create offer RPC workflow

**Goal:**
Podłączyć wysyłanie direct trade offer do canonical RPC/domain operation, bez direct writes do tabel handlu, itemów ani Character Points.

**Scope:**

* Action: Send offer.
* Payload zawiera tylko creator-side dane:

  * target hero id,
  * creator item ids,
  * creator Character Points,
  * optional description/request id, jeśli istnieje w kontrakcie.
* Payload nie zawiera:

  * target item ids,
  * target Character Points,
  * danych inventory targeta.
* Po wysłaniu:

  * creator itemy/CP są locked przez backend/RPC,
  * oferta przechodzi w status waiting for target / pending_target,
  * odświeżyć pending offers,
  * odświeżyć CP balance/locks,
  * odświeżyć item statuses.
* Po błędzie:

  * pokazać toast/message,
  * nie zostawiać fałszywego optimistic locka.
* Stale guards:

  * selected server,
  * active hero,
  * target hero,
  * current draft id/request id.

**Validation rules:**

* Creator może wysłać 0–N itemów zgodnie z config/limit.
* Creator może wysłać CP.
* CP-only for CP-only nie musi być stałym widocznym elementem UI; jeśli backend odrzuci niedozwolony wariant, pokazać toast/message.
* Nie można wybrać itemów:

  * scrapped,
  * locked_trade,
  * locked_auction,
  * nie-owned,
  * z innego serwera.
* Nie można wysłać oferty, jeśli market slots limit jest wyczerpany.
* Nie można wysłać oferty między serwerami.

**Out of scope:**

* Nie implementować target response RPC w tym tasku, chyba że scope explicitly includes it.
* Nie implementować auction.
* Nie implementować transaction finalization.
* Nie implementować anti-abuse UI.
* Nie robić direct writes do item statusów/CP locks.

**Data/source rules:**

* Używać existing direct trade RPC/domain service.
* Backend/RPC odpowiada za:

  * locks,
  * CP validation,
  * item status validation,
  * market slot validation,
  * audit,
  * anti-abuse signal generation where applicable.
* Frontend nie modyfikuje item.status ani character_point_locks bezpośrednio.

**Acceptance criteria:**

* Send offer wysyła tylko creator-side itemy/CP.
* Target-side itemy/CP nie są częścią create offer payloadu.
* Po sukcesie offer/locks/CP/item statuses się odświeżają.
* Po błędzie UI pokazuje czytelny feedback.
* Brak direct writes do trade/item/CP tables.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-37 — Direct Trade target response UI

**Goal:**
Dodać osobny response flow dla target hero, który otrzymał direct trade offer.

Target może odpowiedzieć własnymi itemami i/lub Character Points. To jest osobny krok od tworzenia oferty przez creatora.

**Scope:**

* Dla incoming offer:

  * panel z tym, co creator oferuje,
  * target response builder:

    * do N itemów zgodnie z config/limit,
    * target Character Points,
  * Review response,
  * Send response,
  * Reject.
* Target response builder używa inventory targeta, czyli active hero gracza odpowiadającego.
* Incoming empty offer nie zajmuje market slotu targeta, dopóki target nie doda itemów lub CP i nie wyśle odpowiedzi.
* Jeśli target odpowie itemem/CP:

  * powinien zostać użyty market slot zgodnie z rules/read model.
* Po response offer przechodzi do statusu waiting for creator / pending_creator.
* Creator musi potem zobaczyć response i móc zaakceptować albo odrzucić, jeśli taki jest aktualny workflow.

**Out of scope:**

* Nie pokazywać inventory targeta creatorowi.
* Nie implementować final transaction completion, jeśli jest osobnym RPC/slice.
* Nie robić anti-abuse review UI.
* Nie implementować auction.
* Nie robić CP-only-for-CP-only explanation jako stałego visible panelu; błędy jako toast/message.

**Data/source rules:**

* Response idzie przez canonical direct trade response RPC/domain operation.
* Frontend nie direct-write:

  * player_trade_offers,
  * trade offer items,
  * item statuses,
  * CP locks.
* Backend/RPC odpowiada za locks, slot validation, CP validation i audit.
* Stale guards wymagane dla offer id / active hero / selected server.

**Acceptance criteria:**

* Incoming offer można odrzucić.
* Incoming offer można uzupełnić target-side itemami/CP i wysłać response.
* Creator nie widzi inventory targeta.
* Empty incoming offer nie zużywa target slotu przed response.
* Po response read model odświeża status i locks.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-38 — Direct Trade item display and popover integration

**Goal:**
Zastosować globalny item hover popover pattern w Direct Trade, zgodnie z zaakceptowanym kierunkiem tooltipa/popupu itemu.

**Scope:**

* Każdy item w Direct Trade:

  * offer builder,
  * target response builder,
  * pending offers,
  * offer review,
  * history/details later,
    powinien używać reusable item popover.
* Main row itemu pokazuje krótko:

  * nazwę,
  * typ/slot,
  * status lock/equip/cannot equip where relevant.
* Popover pokazuje pełne summary:

  * nazwa,
  * quality/tier,
  * prefix/base/suffix naming where available,
  * item type/subtype,
  * equip slot or allowed hand slot,
  * item stats,
  * bonuses,
  * requirements,
  * drachma value,
  * icon placeholder / future Game Icons asset.
* Ikonka typu itemu ma być w popoverze, po prawej stronie headera popovera.
* Drachma value nie jest trade price i pojawia się tylko w popoverze.

**Weapon display rules:**

* Weapon subtype ma być rozróżniany:

  * one-handed weapon,
  * two-handed weapon,
  * ranged weapon.
* Slot/equip wording ma odzwierciedlać equip rules:

  * shield always off hand,
  * one-handed weapon can be main or off hand,
  * two-handed and ranged weapon go main hand,
  * tooltip może pokazywać Hand slot / Main hand / Off hand zależnie od read modelu i kontekstu.
* Nie upraszczać wszystkiego do generic Weapon, jeśli read model dostarcza subtype.

**Item stats and boosted values:**

* Native item stats, np. Damage 18–31, mają być pokazane jako item stat, nie jako bonus z plusem.
* Bonusy wpływające na staty mogą być pokazane osobno w Bonuses, np. Damage +16.
* Jeśli finalna wartość item stat jest podbita przez quality/prefix/suffix/bonus, podbita część albo podbita wartość ma być wyróżniona kolorem gold.
* Jeśli podbity jest tylko max damage, np. 2–31, tylko wartość 31 powinna być wyróżniona.
* Jeśli min i max są podbite, obie wartości powinny być wyróżnione.
* Ten sam wzorzec ma później działać też dla defense na armor/head/boots itd.

**Out of scope:**

* Nie robić pełnego item comparison engine.
* Nie implementować finalnych Game Icons assetów, jeśli nie są jeszcze wybrane.
* Nie hardcodować item stat formulas w komponencie.
* Nie tworzyć osobnego popovera tylko dla Direct Trade, jeśli globalny/shared pattern już istnieje albo jest planowany.

**Data/source rules:**

* Popover używa item read model/domain mapperów.
* Item display name używa istniejącego display name helpera.
* Item stats i boosted flags powinny pochodzić z read modelu lub czystego mappera.
* Jeśli read model nie dostarcza boosted/base split, Codex ma zgłosić dependency zamiast zgadywać w komponencie.
* Requirements mają być przeliczone względem active hero, jeśli dostępne.

**Acceptance criteria:**

* Direct Trade item rows używają item popover.
* Popover ma ikonę po prawej w headerze.
* Popover rozróżnia item stats i bonuses.
* Damage nie jest pokazany jako Damage +18–31.
* Wzmocnione wartości są wyróżnione gold.
* Drachma value jest tylko w popoverze.
* Weapon subtype/slot wording jest zgodny z equip rules.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-39 — PvP Vicinity target selection screen

**Goal:**
Zbudować osobny ekran wyboru celu PvP oparty o listę pobliskich posiadłości.

Ten ekran nie jest ekranem walki. Nie pokazuje Walking Dead, combat logu, result preview ani snapshot data. Służy wyłącznie do znalezienia celu i rozpoczęcia jednej z akcji: spy, attack albo siege.

**Scope:**

* Route/page dla PvP target selection, docelowo w `src/app/game`, zgodnie z podziałem feature areas.
* Użyć istniejącego shellu, topbara i sidebaru.
* Zachować styl z zaakceptowanego preview PvP Targeting V4:

  * modern premium browser RPG,
  * dark navy / gold / bronze,
  * desktop-first,
  * spójność z Estate, Armory, Auction House i Direct Trade.
* Header:

  * `PvP`,
  * `Nearby estates`,
  * opis, że cel wybiera się z okolicy estate,
  * badge: `Your estate: B-0421`,
  * badge: `Vicinity`,
  * badge: `Combat opens after attack`.
* Summary:

  * Daily attacks,
  * Your address,
  * Attack range,
  * Protection.
* Główna karta:

  * tytuł `Vicinity`,
  * tabs/entry points:

    * `Vicinity`,
    * `Ranking`.
* `Vicinity` i `Ranking` muszą mieścić się w jednej linii i być dopchane do prawej strony nagłówka karty.
* `Reports` nie jest tabem na tym ekranie.

**Table columns:**

* Address,
* Hero,
* Level,
* Attack,
* Spy,
* Actions.

Nie pokazywać osobnej kolumny District, bo district wynika z adresu.
Nie pokazywać osobnej kolumny Distance, jeśli travel time jest wystarczającą informacją dla gracza.

**Rows/states:**

* Self row:

  * address,
  * hero name,
  * `Your estate`,
  * badge `You`.
* Occupied attackable estate:

  * address,
  * hero,
  * level,
  * attack travel time,
  * spy travel time,
  * compact action icons.
* Empty plot:

  * badge/status `Empty`,
  * brak akcji.
* Protected target:

  * spy available,
  * siege available if allowed by rules,
  * no attack action,
  * compact status `Protected`, not a large button.
* Guild member:

  * spy available,
  * no attack,
  * no siege,
  * compact status `Guild`.

**Action visibility rules:**

* Spy:

  * available for every occupied estate,
  * including guild members.
* Attack:

  * available only when target is attack-eligible,
  * target is in backend-defined attack range,
  * target is not protected,
  * target is not a guild member.
* Siege:

  * available for non-guild estates,
  * exact siege availability can be backend/read-model driven.
* If action is not available:

  * hide it or show a compact disabled state with tooltip,
  * do not show a large `Unavailable` button.

**Visual rules:**

* Row actions are compact icon buttons, not large buttons.
* Protected/Empty/Guild are compact status pills.
* Actions column must not overflow.
* Buttons should remain slightly smaller than earlier large pill buttons if needed.
* Emoji may be used in the prototype only; production should use the project’s icon system / Game Icons direction.

**Out of scope:**

* No Walking Dead.
* No combat preview.
* No combat log.
* No result preview.
* No report detail.
* No ranking implementation in this task beyond the tab/entry point.
* No siege setup screen.
* No spy result screen.
* No backend distance formula implementation unless already provided by read model.

**Data/source rules:**

* Active hero and selected server must be loaded before hero-owned reads.
* Vicinity rows should come from estate/vicinity/PvP eligibility read model when available.
* Attack availability, protection, travel times and siege availability are backend/read-model outputs.
* Do not compute authoritative PvP eligibility purely in Angular.
* Do not hardcode permanent attack range rules in UI.
* Empty plots may be generated from address range + occupied-estate overlay if that is the accepted estate-vicinity model.
* Do not expose defender private equipment.

**Acceptance criteria:**

* PvP target selection screen does one thing: target/action selection.
* `Vicinity` and `Ranking` are the only tabs in this card.
* `Vicinity` and `Ranking` stay on one line.
* Table does not include District or Distance columns.
* Table includes Attack and Spy travel time columns.
* Actions are compact icon buttons.
* Protected/Guild/Empty do not break table layout.
* Guild member row shows Spy + Guild only.
* Protected row does not show Attack.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-40 — PvP Selected Target side panel

**Goal:**
Dodać prawy panel Selected Target dla ekranu PvP Vicinity, pokazujący dostępne akcje dla aktualnie wybranego celu.

Panel ma być krótki, czytelny i player-facing. Nie ma być debug panelem ani combat preview.

**Scope:**

* Prawy panel `Selected target`.
* Panel pokazuje:

  * Target,
  * Address,
  * Attack travel time,
  * Spy travel time,
  * Siege available.
* Pod spodem compact action buttons/icons:

  * Start attack,
  * Spy,
  * Lay siege.
* Przyciski powinny być kompaktowe i nie rozpychać panelu.
* Brak `Clear` button.
* Jeśli cel jest protected:

  * Start attack ukryty albo disabled z tooltipem,
  * Spy zostaje,
  * Siege zależnie od backend rule.
* Jeśli cel jest guild member:

  * Spy zostaje,
  * Start attack hidden/disabled,
  * Lay siege hidden/disabled,
  * panel pokazuje `Siege available: No`.

**Out of scope:**

* No combat screen.
* No combat result.
* No report snapshot.
* No spy result detail.
* No siege setup flow.
* No resource-steal calculation preview.
* No defender equipment display.

**Data/source rules:**

* Panel korzysta z selected row/read modelu.
* Travel times i availability pochodzą z backend/read modelu.
* UI może pokazać mock values w prototypie, ale implementacja nie może hardcodować finalnych reguł.
* If selected target changes during async action, stale response must be ignored.

**Acceptance criteria:**

* Selected target panel nie overflowuje.
* Panel pokazuje target/address/action travel times.
* Panel pokazuje action buttons compactly.
* Start attack dostępny tylko dla attack-eligible target.
* Spy dostępny dla occupied estate.
* Siege dostępne tylko jeśli target is non-guild and siege eligible.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-41 — PvP Vicinity pagination and search

**Goal:**
Dodać paginację i lekkie wyszukiwanie do listy Vicinity.

Lista okolicy może mieć więcej wpisów niż aktualnie widoczne rows, więc ekran musi obsługiwać paginację w stylu zaakceptowanym dla Auction House i Direct Trade.

**Scope:**

* Search:

  * hero name,
  * address.
* Optional filter:

  * Show only attackable.
* Pagination:

  * current page,
  * total pages,
  * visible range, np. Showing 1–20 around B-0421,
  * Prev / Next,
  * page numbers.
* Page size może być stałe w pierwszym slice, np. 20, jeśli backend/read model nie wspiera configurable page size.
* Paginacja powinna być pod tabelą.
* Search/filter changes reset page to 1.

**Out of scope:**

* No advanced sort like `best opportunity`, `highest resources`, `least protected`.
* No player-resource-based targeting sort.
* No infinite scroll.
* No map view.
* No ranking implementation.

**Data/source rules:**

* Prefer service-backed/server-side pagination if the vicinity list can be large.
* Empty plots can be included if current estate vicinity model supports generated address ranges.
* Search/filter state should not assume UUID-only lookup.
* Stale response guard required for search/filter/page changes.

**Acceptance criteria:**

* Vicinity list has visible pagination.
* Search by hero/address works or is wired to current read-model capability.
* Show only attackable does not invent attack logic in Angular.
* Pagination display matches real result count/range.
* Search/filter resets page to 1.
* Stale async responses do not overwrite current state.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-42 — PvP action start boundaries

**Goal:**
Podłączyć player-facing PvP target actions do właściwych workflow boundaries bez implementowania pełnej walki, szpiegowania ani oblężenia w tym samym ekranie.

**Scope:**

* Actions from Vicinity row and Selected Target panel:

  * Start attack,
  * Spy,
  * Lay siege.
* Start attack:

  * validates selected target,
  * uses canonical backend/RPC/domain operation when available,
  * starts travel timer or opens pending action state,
  * combat screen opens only after attack is ready.
* Spy:

  * starts spy action/travel timer if backend/domain path exists,
  * otherwise show dependency/placeholder, not fake result.
* Lay siege:

  * routes to future siege setup if available,
  * otherwise show dependency/placeholder.
* Action feedback:

  * loading state,
  * toast/message on success/error,
  * disabled/hidden actions when not allowed.

**Out of scope:**

* No Walking Dead.
* No combat implementation.
* No spy result implementation.
* No siege setup implementation unless already exists.
* No resource reward/loot calculation.
* No report generation in this task.
* No direct writes to hero/resources/pvp/combat tables.

**Data/source rules:**

* Persistent action start must go through backend/RPC/domain service.
* Frontend must not directly mutate:

  * daily attack counters,
  * resources,
  * protection windows,
  * combat results,
  * reports.
* Backend/read model decides:

  * attack eligibility,
  * protection,
  * guild restrictions,
  * travel times,
  * action availability.
* Stale guards required for selected target, active hero, selected server and current request.

**Acceptance criteria:**

* Actions are wired to canonical service boundaries or explicitly marked as dependency.
* UI does not fake completed combat/spy/siege.
* Start attack does not show Walking Dead on this screen.
* Action availability follows read model.
* Errors are player-readable.
* No direct writes to durable gameplay tables.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-43 — PvP Ranking entry point

**Goal:**
Przygotować entry point dla PvP Ranking bez mieszania rankingu z Vicinity.

Ranking jest drugim sposobem wyboru celu PvP obok Vicinity, ale nie musi być zaimplementowany w pełni w tym samym slice.

**Scope:**

* Tab/entry point `Ranking` obok `Vicinity`.
* `Vicinity` i `Ranking` muszą być w jednej linii.
* Ranking tab może:

  * prowadzić do osobnej route,
  * przełączać widok w ramach PvP page,
  * albo być placeholderem/dependency, jeśli ranking read model jeszcze nie istnieje.
* Nie pokazywać `Reports` w tym tab barze.
* Ranking powinien później wspierać wybór celu, ale jego sort/range rules mają pochodzić z backend/read modelu.

**Out of scope:**

* No full ranking implementation if backend/read model is missing.
* No fake ranking based on hardcoded levels.
* No fake match range calculations in Angular.
* No combat preview.

**Data/source rules:**

* Ranking source should come from PvP/ranking read model when available.
* Attack availability still comes from PvP eligibility read model.
* Ranking display must not leak private defender equipment.
* If ranking read model does not exist, Codex reports dependency instead of inventing schema.

**Acceptance criteria:**

* Ranking exists as clear UI entry point.
* Vicinity/Ranking tab row is stable and does not wrap on desktop.
* Reports are not included in this tab row.
* No fake ranking logic is added.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-44 — PvP combat screen boundary note

**Goal:**
Zabezpieczyć zakres prac: PvP target selection nie może zamienić się w ekran walki.

To jest task/spec boundary dla przyszłego osobnego ekranu walki PvP.

**Scope:**

* W UI/UX backlogu albo w task notes dopisać jasną granicę:

  * PvP Vicinity/Ranking = wybór celu i start akcji,
  * PvP Combat = osobny ekran walki,
  * Reports = osobny widok wyników/snapshotów.
* PvP Combat screen later may include:

  * Walking Dead,
  * combat log,
  * health bars,
  * turn limit,
  * attack source labels,
  * result display.
* PvP target selection must not include:

  * Walking Dead,
  * combat preview,
  * combat log,
  * result preview,
  * resource reward/loss calculation preview.

**Data/source rules:**

* Core combat remains reusable and caller-agnostic.
* PvP caller interprets result after combat.
* Reports should use durable snapshots, not recompute from live state.
* Full defender equipment remains private; later combat/report UI can show resolved stats and attack source labels where allowed.

**Acceptance criteria:**

* UI backlog/task notes clearly separate target selection from combat screen.
* Future Codex prompts cannot reasonably merge these screens by accident.
* No status docs are updated unless user confirms.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-45 — Reports Center shell with Reports and Notifications tabs

**Goal:**
Zbudować wspólny Reports Center jako player-facing archive hub dla dwóch różnych typów wpisów:

* Reports — pełne raporty gameplayowe.
* Notifications — krótkie komunikaty systemowe/gameplayowe.

To nie ma być audit log, admin log ani action queue.

**Scope:**

* Route/page dla Reports Center.
* Użyć istniejącego shellu/topbara/sidebaru.
* Zachować kierunek wizualny z aktualnych preview:

  * modern premium browser RPG,
  * dark navy / gold / bronze,
  * desktop-first,
  * spójność z Dashboard, Estate, Auction House, Direct Trade i PvP.
* Dodać dwa główne taby:

  * Reports,
  * Notifications.
* Reports i Notifications mogą współdzielić:

  * page header,
  * filters shell,
  * list layout,
  * detail side panel,
  * pagination,
  * unread/read styling,
  * icon placeholder pattern.
* Taby mają przełączać między osobnymi archiwami, nie mieszać typów wpisów w jednej liście.
* Sidebar entry może pozostać jako Reports, jeśli Reports Center jest głównym archiwum.

**Important IA rules:**

* Reports = pełne gameplay records.
* Notifications = krótkie attention/status messages.
* Notifications mogą linkować do Reports, ale nie zastępują report detail.
* Topbar bell/dropdown to quick access do najnowszych notifications, nie pełne archiwum.
* Pełne archiwum notifications jest w Reports Center → Notifications.

**Out of scope:**

* Nie implementować full report detail w tym tasku.
* Nie implementować public share route w tym tasku.
* Nie implementować notification settings w pełni.
* Nie robić action queue/timer dashboard.
* Nie mieszać audit logs z gameplay reports.
* Nie pokazywać staff-only/private metadata.

**Data/source rules:**

* Reports i Notifications powinny mieć osobne read modele/services, jeśli DB/read model je rozróżnia.
* Typy/statusy/severity powinny pochodzić z DB dictionaries/read modelu, jeśli istnieją.
* Jeśli DB foundation dla notifications jest niepełny, Codex ma zgłosić dependency zamiast wymyślać trwały model w Angularze.
* Read/unread powinno być hero/user scoped.
* Nie zakładać hero.id === auth.uid().

**Acceptance criteria:**

* Reports Center ma dwa taby: Reports i Notifications.
* Reports tab pokazuje pełne raporty.
* Notifications tab pokazuje krótkie komunikaty.
* Taby nie mieszają entries.
* Topbar bell nie zastępuje Notifications archive.
* UI nie wygląda jak admin/audit log.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-46 — Reports list/archive screen

**Goal:**
Zbudować Reports tab jako archiwum pełnych raportów gameplayowych.

Reports są pełnymi zapisami wydarzeń, które można otworzyć w detail view albo później w full report route.

**Scope:**

* Reports tab w Reports Center.
* Lista raportów z filtrami i paginacją.
* Report row pokazuje:

  * icon placeholder, np. PV/TL/EX/TR/SP,
  * tytuł,
  * krótki summary,
  * typ raportu,
  * wynik/status,
  * read/unread,
  * czas utworzenia.
* Kategorie raportów:

  * Combat,
  * Trial,
  * Encounter,
  * PvP,
  * Spy/Siege,
  * Trade/Auction.
* Detail side panel pokazuje summary wybranego raportu:

  * title,
  * type,
  * outcome,
  * participants/source,
  * key rewards/changes,
  * created at,
  * privacy/share status.
* Actions:

  * Open full report,
  * Share.
* Nie ma przycisku Mark read. Otwarcie raportu oznacza go jako przeczytany automatycznie.

**Report content examples:**

* PvP victory/defeat/draw.
* Trial success/failure.
* Encounter result.
* Spy report.
* Siege report later.
* Auction sale completed.
* Direct trade completed.
* Exploration result.

**Out of scope:**

* Nie budować pełnego report detail route w tym tasku.
* Nie budować public /report/:publicToken w tym tasku.
* Nie przeliczać raportów z live state.
* Nie robić audit logs.
* Nie dodawać staff moderation reports.
* Nie robić share modal, jeśli share link workflow nie istnieje.

**Data/source rules:**

* Reports muszą renderować ze snapshotów/durable report data, nie z live state.
* Tooltipy w reportach powinny używać snapshot data.
* Public share link ma używać public token, nie internal id, jeśli/when implemented.
* Player names mogą linkować do public in-game profiles where applicable.
* Reports nie mogą expose private account data.
* Jeśli report producer/read model jeszcze nie istnieje dla danego type, pokazać dependency, nie fake durable data.

**Acceptance criteria:**

* Reports tab ma listę raportów i detail summary.
* Report read state jest widoczne.
* Kliknięcie/open traktuje raport jako read.
* Detail actions to Open full report i Share.
* Nie ma Mark read button.
* Nie ma Share later label.
* List ma filters i pagination.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-47 — Full report detail route

**Goal:**
Przygotować osobny full report detail screen dla pełnego raportu gameplayowego.

Reports Center pokazuje listę i summary, ale pełna rozpiska raportu powinna otwierać się osobno.

**Scope:**

* Route/page dla full report detail, np. game/reports/:reportId albo projektowy odpowiednik.
* Private in-app report view w normalnym app shellu.
* Full report powinien renderować ten sam core content, który później może być pokazany publicznie bez app shellu.
* Report detail powinien wspierać różne typy:

  * combat,
  * trial,
  * encounter,
  * pvp_combat,
  * siege later,
  * spy later,
  * trade/auction summary.
* Report detail layout:

  * header z typem, wynikiem i datą,
  * participants/source,
  * main result,
  * timeline/log/turns, jeśli raport combatowy,
  * rewards/loot/resource changes,
  * linked items with snapshot-based item popovers,
  * share action.
* Share action:

  * label: Share,
  * nie Share later.
* Read state:

  * otwarcie raportu oznacza report jako read automatycznie.

**Out of scope:**

* Nie implementować public report route w tym tasku, jeśli scope tego nie obejmuje.
* Nie implementować report producers.
* Nie przeliczać combat/trial/reward z live state.
* Nie expose private defender equipment beyond allowed snapshot/source labels.
* Nie dodawać admin/debug JSON payload jako player-facing UI.

**Data/source rules:**

* Full report reads durable snapshot/report data.
* Combat reports wrap combat result snapshots and attack rows where available.
* Trial/encounter reports wrap outcome/reward snapshots.
* Trade reports show exact buyer/seller/item/Character Points summary from transaction-time snapshots.
* Public token generation/access is separate but should be compatible with this detail content.
* If report snapshot data is missing, show safe fallback/dependency rather than recompute live state.

**Acceptance criteria:**

* Open full report from Reports Center navigates to detail.
* Detail route is readable and player-facing.
* Report renders from snapshot/read model.
* Share action is present where allowed.
* Opening detail marks report as read.
* No live recomputation for historical values.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-48 — Notifications archive tab

**Goal:**
Zbudować Notifications tab jako pełne archiwum krótkich komunikatów systemowych i gameplayowych.

Notifications są krótkimi attention/status messages. Nie są pełnymi raportami, ale mogą linkować do reportów albo ekranów źródłowych.

**Scope:**

* Notifications tab w Reports Center.
* Zachować cztery summary fields/kafle:

  * Unread,
  * Needs attention,
  * Last 24h,
  * Muted categories.
* Lista notyfikacji z filtrami i paginacją.
* Row notyfikacji pokazuje:

  * icon placeholder, np. AU/PV/ES/TR/EX/SY,
  * title,
  * krótki text,
  * category,
  * severity,
  * read/unread,
  * created time,
  * linked source/report indicators if available.
* Filters:

  * category,
  * status,
  * severity,
  * search.
* Detail side panel pokazuje:

  * title,
  * category,
  * severity,
  * source,
  * effect,
  * created time,
  * state,
  * linked report/source,
  * primary action, np. Open auction / Open report / Open estate / Open trade offer.
* Opening a notification marks it as read automatically.
* Nie ma Mark read button jako głównej akcji.

**Notification examples:**

* You were outbid.
* PvP report ready.
* Exploration step ready.
* Building completed.
* Direct offer received.
* Server maintenance scheduled.
* Spy result ready.
* Auction sold.
* Protection expired.

**Out of scope:**

* Nie implementować full notification settings w tym tasku.
* Nie implementować server maintenance admin flow.
* Nie robić pełnego action queue/timer dashboard.
* Nie budować report detail inside notification detail.
* Nie robić audit logs.
* Nie pokazywać raw technical payloads.

**Data/source rules:**

* Notifications powinny być persisted, jeśli gracz nie widział toasta albo event ma pozostać w historii.
* Online event should show toast first and may also persist depending on notification type.
* Category/severity/status labels powinny pochodzić z DB/read modelu, jeśli istnieje.
* Read/unread is user/hero scoped.
* Linked report/source should use stable ids/tokens from backend/read model.
* If backend notification archive does not exist yet, Codex must report dependency instead of inventing permanent local storage.

**Acceptance criteria:**

* Notifications tab has four summary cards.
* Notifications list is short-form and scannable.
* Detail panel does not become full report detail.
* Opening notification marks read automatically.
* Notifications can link to source/report when available.
* Filters and pagination exist.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-49 — Topbar notification bell and recent notifications dropdown

**Goal:**
Dodać do topbara szybki dostęp do najnowszych notifications przez bell/dropdown.

Dropdown jest quick access. Pełne archiwum pozostaje w Reports Center → Notifications.

**Scope:**

* Topbar bell with unread count.
* On click, dropdown shows latest 5–10 notifications.
* Dropdown entry shows:

  * icon placeholder,
  * title,
  * short subtitle,
  * time,
  * unread indicator where applicable.
* Dropdown footer:

  * View all, linking to Reports Center → Notifications.
* Bell count shows unread notifications count.
* If count is zero, show subtle inactive/empty state.
* Dropdown should not break topbar layout.
* Current preview had structural issues after dropdown removal; implementation must keep topbar markup clean:

  * bell/notification anchor,
  * Drachmas,
  * Materials,
  * Workforce,
  * no orphan dropdown nodes.

**Out of scope:**

* Nie implementować full notification archive here.
* Nie implementować notification settings here.
* Nie pokazywać reports list in dropdown.
* Nie robić dropdown jako osobnej strony.
* Nie mieszać toast systemu z dropdown rendererem.

**Data/source rules:**

* Dropdown uses same notification read model as Notifications archive, but limited to latest entries.
* Read/unread count comes from backend/read model.
* Clicking View all routes to Notifications archive.
* Clicking a dropdown item may open source/report/notification detail depending on route support.
* Stale guards if dropdown loads asynchronously.

**Acceptance criteria:**

* Topbar bell shows unread count.
* Dropdown shows recent notifications.
* View all opens Notifications tab/archive.
* Dropdown is not the full archive.
* Topbar markup is valid and does not leave orphan dropdown elements.
* Bell coexists with resource chips without layout breakage.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-50 — Toast-to-notification behavior contract

**Goal:**
Opisać i wdrożyć UI contract dla relacji toastów i notification archive.

Podstawowa zasada: jeśli gracz jest online i dzieje się coś wymagające notyfikacji, widzi toast. Jeśli gracz nie jest online, nie widzi toasta albo event powinien pozostać w historii, notification trafia do archive.

**Scope:**

* Dodać frontend contract/helper/service boundary:

  * toast display for online active session events,
  * persisted notification archive read model for historical items.
* Toasty są krótkie:

  * title,
  * summary,
  * severity,
  * optional action/link.
* Persistent notification archive przechowuje:

  * category,
  * severity,
  * title,
  * message,
  * created time,
  * read state,
  * optional linked report/source.
* Toast click can route to source screen or notification/report detail.
* If the notification is opened from toast, read state should be updated where appropriate.

**Out of scope:**

* Nie budować całego backendu notifications, jeśli nie istnieje.
* Nie zapisywać notifications w localStorage jako trwały model gry.
* Nie tworzyć audit/event log substitute.
* Nie wysyłać staff/private payloads to player notifications.

**Data/source rules:**

* Backend decides which events persist as notifications.
* Frontend displays toast for received live events.
* Backend/read model owns archive and read/unread state.
* If no backend live-event channel exists, Codex should document dependency and wire only available read/archive surfaces.
* Do not infer notification persistence solely from toast state.

**Acceptance criteria:**

* Toast behavior is documented in code/task notes.
* Online events can show toast where event delivery exists.
* Notification archive remains source of persisted messages.
* Toast click can navigate to source/detail where supported.
* No local-only permanent notification store is created.
* Build/tsc przechodzi.
* Codex raportuje:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

---

## Task UI-51 — Admin Overview shell and global admin variant

**Goal:**
Zbudować Admin Overview jako czysty orientation hub dla global admina, zgodny z zaakceptowanym preview Admin Overview V7.

Admin Overview nie ma udawać live dashboardu ani activity feedu. Ma pokazywać kontekst, zakres uprawnień, najważniejsze obszary administracji i mapę pokrycia lewego menu.

**Scope:**

* Route/page dla Admin Overview w `src/app/admin`.
* Użyć istniejącego admin shellu, layout patterns i PrimeNG/vendor wrappers, jeśli istnieją.
* Zachować visual direction:

  * dark navy / gold / bronze,
  * modern premium browser RPG,
  * administracyjny, ale nadal Mythborne,
  * logo/brand z literą `M` jako stały element shellu.
* Wariant w tym tasku: **Global Admin overview**.
* Sidebar:

  * Mythborne brand z literą `M`,
  * Admin context,
  * Server focus,
  * Current role,
  * grupy menu:

    * Overview,
    * Priority Operations,
    * Content & Balance,
    * World & Economy,
    * Gameplay Tools / Sandbox.
* Topbar:

  * Admin Overview,
  * Edit level selector,
  * Server focus selector,
  * role/scope chips,
  * search,
  * View audit action.
* Header:

  * Staff Console,
  * Admin Overview,
  * krótki opis,
  * chips:

    * DB-backed dictionaries first,
    * Reasoned mutations through RPC,
    * Technical keys as secondary metadata.
* Summary card:

  * Server focus,
  * Live servers,
  * Current role,
  * Edit level,
  * Staff managed,
  * Last governance action.

**Global admin vs operator distinction:**

* Global admin sees scope strip.
* Operator does not see global scope strip.
* Global admin can use server focus as a filter/context selector.
* Operator uses selected-server variant only.
* Do not label global admin as Operator.
* Do not show selected-server-only labels when in global admin overview.

**Out of scope:**

* Nie implementować konkretnych modułów admina.
* Nie robić full audit view.
* Nie robić live activity feed.
* Nie robić fake dashboard metrics.
* Nie projektować DB tabeli admin navigation registry w tym tasku.
* Nie zmieniać statusów backlogu/status docs.

**Data/source rules:**

* Staff/admin access comes from current role/access model.
* Global vs server-scoped access must not be guessed in component-local code.
* Server focus list should reuse existing active server/admin server switcher/service where available.
* Role/scope labels should use existing access/read model or DB-backed labels where available.
* Persistent/admin mutations must not be introduced in this task.
* If a needed read/access model is missing, Codex must report dependency.

**Acceptance criteria:**

* Admin Overview renders as global admin variant.
* Branding with the Mythborne `M` is preserved.
* Sidebar groups match accepted preview direction.
* Topbar clearly shows Global Admin edit level and Server focus.
* Summary card does not confuse operator with admin.
* Scope strip is visible in global admin variant.
* No fake Recent Staff Activity.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-52 — Admin scope strip and operator/server-scoped variant boundary

**Goal:**
Dodać jasną zasadę UI/UX i implementacyjną dla scope stripu oraz wariantu operatora.

Scope strip jest elementem global admin UI. Operatorzy server-scoped nie powinni widzieć przełącznika global/server/launch/sandbox jako równorzędnych poziomów edycji, ponieważ działają w przypisanym kontekście serwera.

**Scope:**

* Scope strip dla global admina:

  * Global Admin,
  * Selected Server,
  * Launch New Server,
  * Sandbox / Test.
* Scope strip opisuje tryb pracy, nie jest zwykłą dekoracją.
* Dla operatora:

  * ukryć scope strip,
  * pokazać selected server context,
  * role: Operator,
  * edit level: Selected server,
  * scope: przypisany serwer i dozwolone obszary.
* Dla global admina:

  * role: Admin,
  * edit level: Global admin,
  * server focus może być All servers albo konkretny serwer.
* Scope strip nie powinien pojawiać się player-facing ani w normalnym game shellu.

**Out of scope:**

* Nie implementować pełnego operator dashboardu, jeśli task jest tylko boundary/pattern.
* Nie projektować DB permission modelu.
* Nie zmieniać RLS/RPC.
* Nie tworzyć nowych global roles.
* Nie robić staff assignment workflow.

**Data/source rules:**

* Use existing access model / ActiveServer access / staff access policy where available.
* Do not infer global admin from selected server role.
* Global role and server staff role remain separate.
* If current access model cannot distinguish required states, report dependency.

**Acceptance criteria:**

* Scope strip visible only for global admin.
* Operator/server-scoped variant does not show scope strip.
* Global admin can focus all servers or one server.
* Operator cannot switch to global or launch mode.
* UI labels do not confuse role with server focus.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-53 — Admin sidebar information architecture

**Goal:**
Ułożyć admin sidebar według zaakceptowanej intencji pracy, bez dublowania raw table names i bez mieszania globalnych, serwerowych oraz sandboxowych narzędzi.

**Accepted sidebar groups:**

* Overview
* Priority Operations
* Content & Balance
* World & Economy
* Gameplay Tools / Sandbox

**Accepted entries:**

* Overview:

  * Overview
* Priority Operations:

  * Config Governance
  * Anti-abuse
* Content & Balance:

  * Exploration
  * Rewards & Loot
  * Combat Foundation
  * Formulas
* World & Economy:

  * Estate & Buildings
  * Economy & Trade
  * Server Management
  * Launch New Server
* Gameplay Tools / Sandbox:

  * Sandbox Helpers

**Entry intent:**

* Config Governance:

  * global config,
  * server config,
  * launch config,
  * change sets.
* Anti-abuse:

  * cases,
  * sanctions,
  * signals.
* Exploration:

  * trials,
  * encounters,
  * resource/effect payloads,
  * combat candidates.
* Rewards & Loot:

  * reward profiles,
  * drop references,
  * item generation,
  * quality,
  * affixes.
* Combat Foundation:

  * combat opponents,
  * combat rules,
  * snapshots,
  * later combat admin/sandbox integration.
* Formulas:

  * formula targets,
  * formula definitions,
  * assignments,
  * local overrides.
* Estate & Buildings:

  * buildings,
  * costs,
  * requirements,
  * district caps.
* Economy & Trade:

  * auctions,
  * direct trade,
  * vendor/scrap,
  * market restrictions.
* Server Management:

  * server list,
  * server settings,
  * operator assignment,
  * moderator assignment,
  * staff scopes.
* Launch New Server:

  * launch template,
  * server snapshot,
  * pre-live checks.
* Sandbox Helpers:

  * test tools,
  * debug helpers,
  * sandbox-only actions.

**Out of scope:**

* Nie tworzyć fake working pages.
* Nie zmieniać route guards bez potrzeby.
* Nie usuwać istniejących routes.
* Nie przenosić player-facing pages do admina.
* Nie projektować DB admin nav registry w tym tasku.

**Data/source rules:**

* Existing routes remain reachable.
* If a route does not exist, entry may be hidden, disabled, or omitted according to existing project pattern.
* Do not imply implemented functionality through enabled links.
* Labels/descriptions should be DB/registry-backed later where available, but this UI task may use a local registry if needed.
* Raw keys are secondary metadata only.

**Acceptance criteria:**

* Sidebar matches accepted grouping.
* Config Governance and Anti-abuse are visibly prioritized.
* Exploration groups trials/encounters/payloads together.
* Rewards & Loot groups reward profiles and item generation together.
* Combat Opponents are not a random top-level island; they belong under Combat Foundation.
* Server Management and Launch New Server are separate.
* Existing admin routes remain reachable.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-54 — Admin Area Map and Coverage Checklist

**Goal:**
Zastąpić pseudo-dashboard/Workspaces/Recent Staff Activity uczciwym orientation blockiem: Admin Area Map + Coverage Checklist.

Admin Area Map nie jest drugą nawigacją. To mapa orientacyjna pokazująca, co obejmuje lewy sidebar i czy najważniejsze obszary administracji są uwzględnione.

**Scope:**

* W centralnej części Admin Overview dodać:

  * Admin Area Map,
  * Coverage Checklist.
* Usunąć lub nie implementować:

  * fake Command Board,
  * Recent Staff Activity,
  * live dashboard metrics wymyślone bez realnego read modelu.
* Admin Area Map pokazuje obszary:

  * Config Governance,
  * Anti-abuse,
  * Exploration,
  * Rewards & Loot,
  * Server Management.
* Każdy obszar pokazuje chips/subareas, np.:

  * Config Governance: global config, server config, launch config, change sets, changelog.
  * Anti-abuse: cases, signals, reports, sanctions, CP penalties.
  * Exploration: trials, encounters, resource payloads, effects, combat candidates.
  * Rewards & Loot: reward profiles, drop refs, item generation, quality, affixes.
  * Server Management: server list, server settings, operator, moderators, staff scopes.
* Coverage Checklist pokazuje sanity check:

  * Global config — covered,
  * Server config — covered,
  * Launch new server — slot,
  * Staff assignment — covered,
  * Sandbox tools — separate.
* Dodać krótki note:

  * overview is intentionally light,
  * real work happens inside concrete modules.

**Out of scope:**

* Nie implementować live queue.
* Nie implementować recent activity feed.
* Nie implementować coverage matrix z repo/routes w tym tasku.
* Nie projektować DB-backed admin nav registry.
* Nie robić staff audit view.

**Data/source rules:**

* Admin Area Map may initially be static/local registry, but should be easy to replace with DB/registry-backed metadata later.
* Do not fetch unrelated live data just to fill overview.
* If implementing with a registry, keep it typed and reusable.
* Area descriptions should support label/description/helper/admin-description fields later.

**Acceptance criteria:**

* Workspaces are replaced by Admin Area Map.
* No fake activity feed appears on overview.
* Admin Overview explains admin IA without duplicating sidebar as cards.
* Coverage Checklist exists and is visually secondary.
* The overview feels useful as orientation, not forced dashboard content.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-55 — Admin Context / Explainability panel

**Goal:**
Dodać lub ujednolicić prawy panel Context / Explainability dla Admin Overview i przyszłych admin modułów.

Panel ma pokazywać wyjaśnienie zaznaczonego obszaru lub konfiguracji, używając label/description/helper/admin-description, jeśli są dostępne.

**Scope:**

* Prawy panel `Context / Explainability`.
* Dla selected area, np. Config Governance, pokazuje:

  * Label,
  * Description,
  * Helper text,
  * Admin description,
  * Technical key,
  * Why this matters.
* Technical key jest secondary metadata.
* Panel powinien być podłączalny do:

  * Admin Area Map selected area,
  * konkretnych config definitions,
  * dictionary entries,
  * future admin modules.
* Visual direction zgodny z Admin Overview V7.

**Out of scope:**

* Nie projektować DB tabeli metadata.
* Nie implementować pełnego config definition editor.
* Nie pokazywać raw JSON jako głównego contentu.
* Nie tworzyć osobnego docs viewer.
* Nie robić panelu staff-only leakującego player-private data.

**Data/source rules:**

* Prefer DB/read model metadata where available:

  * label,
  * description,
  * helper_text,
  * admin_description,
  * gameplay impact/warning where applicable.
* If metadata is missing, fallback may come from typed local registry.
* Raw key appears only after human-readable labels.
* The panel should not invent gameplay meaning not backed by config/dictionary/docs.
* Missing metadata should be visible as content debt, not silently hidden if important.

**Acceptance criteria:**

* Context panel renders selected area metadata.
* Technical key is secondary.
* Labels/descriptions are human-readable first.
* Panel can be reused conceptually by concrete admin pages.
* No staff/player privacy leak.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-56 — Server Management admin entry and staff assignment boundary

**Goal:**
Ująć Server Management jako pełnoprawny admin area, widoczny w Admin Overview i sidebarze, z jasną granicą między global adminem i scoped operatorem.

**Scope:**

* Sidebar entry: Server Management.
* Admin Area Map coverage:

  * server list,
  * server settings,
  * operator,
  * moderators,
  * staff scopes.
* Global admin can:

  * see server list,
  * manage any server,
  * assign operator,
  * assign multiple moderators,
  * manage staff scopes subject to backend rules.
* Scoped operator can:

  * manage assigned server context,
  * manage moderators within allowed backend rules,
  * not assign global admin role,
  * not access other servers.
* UI labels must clearly distinguish:

  * global admin,
  * selected server operator,
  * moderator,
  * tester/sandbox roles where applicable.

**Out of scope:**

* Nie implementować full staff assignment form in this task.
* Nie implementować server launch flow here.
* Nie editować DB role modelu.
* Nie obchodzić backend/RPC permission checks.
* Nie direct-write staff assignment tables.

**Data/source rules:**

* Staff assignment must use canonical audited RPC/service where available.
* UI must preserve reason requirement for staff assignment changes.
* Server staff assignment must respect staff-disqualifying history warnings.
* Operators may only manage within their own server scope and backend-enforced limits.
* Sandbox/test server exceptions must remain explicit.

**Acceptance criteria:**

* Server Management appears in sidebar and Admin Area Map.
* Global admin vs operator capabilities are not visually conflated.
* Operator assignment and multiple moderator assignment are represented as future/covered subareas.
* No fake staff mutation is implemented.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-57 — Launch New Server admin entry

**Goal:**
Dodać Launch New Server jako osobny admin area od live Server Management.

Launch New Server dotyczy konfiguracji nowego serwera przed startem. Nie powinien mieszać się z bieżącymi live overrides wybranego serwera.

**Scope:**

* Sidebar entry: Launch New Server.
* Scope strip includes Launch New Server for global admin.
* Admin Area Map/Coverage Checklist includes:

  * launch new server,
  * launch templates,
  * launch snapshots,
  * pre-live checks.
* Topbar/global admin edit level can switch to Launch New Server mode.
* Labeling makes clear this is pre-live setup, not selected live server operation.

**Out of scope:**

* Nie implementować launch flow forms.
* Nie tworzyć server records.
* Nie projektować DB schema for launch templates.
* Nie implementować config snapshot application.
* Nie direct-write server/config tables.

**Data/source rules:**

* If launch-related read models/RPCs do not exist, UI should route to placeholder/dependency or hide disabled according to project pattern.
* Launch config should eventually use config governance/server_launch scope, not ad hoc config JSON.
* Pre-live checks should be backend/read-model driven when implemented.

**Acceptance criteria:**

* Launch New Server appears as separate entry from Server Management.
* Scope strip includes launch mode for global admin only.
* Admin overview does not imply launch flow is already implemented if missing.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

## Task UI-58 — Admin Overview status cards

**Goal:**
Dodać ostrożne, niewymyślone status cards do Admin Overview.

Status cards mogą być informacyjne, ale nie powinny udawać balance AI, staff activity feedu ani live dashboardu bez read modelu.

**Accepted cards for global admin variant:**

* Pending Global Changes
* Server Staff Gaps
* Open Anti-abuse Cases
* Sandbox Tools Ready

**Rules:**

* Pending Global Changes:

  * visible for global admin,
  * source: global/launch-level change sets.
* Server Staff Gaps:

  * global admin card,
  * source should later come from server/staff coverage read model.
* Open Anti-abuse Cases:

  * server-specific data aggregated for global admin,
  * filterable by server focus,
  * visible to scoped operator only for their selected server.
* Sandbox Tools Ready:

  * visible where user has sandbox/test permissions.
* Avoid `Balance Warnings` until there is a real balance warning/read model.

**Out of scope:**

* Nie budować balance warning engine.
* Nie fake’ować staff gaps if no source exists in implementation.
* Nie budować recent staff activity.
* Nie budować command queue unless real read model exists.
* Nie robić audit list in overview.

**Data/source rules:**

* Each card must either connect to real read model/service or be explicitly placeholder/pending in implementation.
* No hardcoded production counts.
* Global admin cards may aggregate across server focus.
* Operator cards must be server-scoped.
* If source read model is missing, Codex must report dependency or hide/placeholder according to project pattern.

**Acceptance criteria:**

* Four accepted cards appear.
* Balance Warnings are not used without real source.
* Counts are not hardcoded in production.
* Operator and admin visibility differs correctly.
* No Recent Staff Activity appears.
* Build/tsc passes.
* Codex reports:

  * reused:
  * checked but not reused:
  * new component/state/helper added:
  * scope kept minimal:
  * not added intentionally:

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
