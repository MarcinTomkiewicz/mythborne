# Mythsworn — UI/UX Backlog v2

Status: working draft / canvas edition after reviewer hardening pass
Updated: 2026-05-08 — merged trial/report/onboarding addenda

Purpose: uporządkować UI/UX backlog jako pełnoprawny dokument roboczy dla prototypowania, implementacji Angular + PrimeNG, globalnego SCSS, vendor wrappers i kolejnych UI tasków Codexa.

Ten dokument nie jest finalnym design systemem i nie zastępuje statusów w `codex-mythborne-backlog.md`, `current-todo.md` ani `current-state-summary.md`. Taski UI/UX stają się wykonane dopiero po osobnej akceptacji użytkownika.

Reviewer hardening pass został wpleciony w dokument. Ten wariant zawiera dodatkowo:

- pełną konwencję archiwum prototypów z uwzględnieniem shellu gry,
- mapowanie 11 odzyskanych prototypów,
- wymóg standardowego nagłówka `VISUAL REFERENCE ONLY`,
- minimum viable UI-CORE przed pierwszym ekranem,
- reguły architektury komponentów,
- globalną regułę stale guards,
- accessibility/responsive baseline,
- kontrakt nazw klików i CTA jako task `UI-NAME-1`.

---

## 0. Jak używać tego dokumentu

Ten backlog służy do:

- definiowania kierunku wizualnego Mythsworn,
- porządkowania zaakceptowanych prototypów HTML,
- tworzenia promptowalnych UI/UX tasków dla Codexa,
- ograniczania lokalnego SCSS,
- wskazywania istniejących utilities/vendorów/shared patterns,
- utrzymywania spójności między player UI, admin UI, reports, trade, PvP i przyszłym combat UI.

Ten backlog nie jest:

- statusem wykonania tasków,
- źródłem prawdy dla DB/RPC,
- zastępstwem `current-decisions.md`, `database-current.md`, `project-context.md`,
- miejscem projektowania nowych tabel DB.

Jeśli UI task opisuje ekran, ale backend/RPC/read model jeszcze nie istnieje, Codex ma zgłosić dependency/bloker albo ograniczyć zakres do mock/read-only surface. Nie wolno udawać działającej funkcjonalności.

### 0.1. Source order dla UI tasków

Przy implementacji UI Codex powinien respektować kolejność:

1. explicit user instruction,
2. aktualny kod i aktualny stan repozytorium,
3. aktualny schemat DB / generated types / dump,
4. `current-decisions.md`,
5. `database-current.md`,
6. `project-context.md`,
7. `ui-ux-notes.md`,
8. `project-structure.md`,
9. `AGENTS.md`,
10. `codex-mythborne-backlog.md`,
11. `codex-mythborne-refactor-backlog.md`,
12. `current-todo.md` i `current-state-summary.md` jako status,
13. ten UI/UX backlog.

### 0.2. Related guidance files

- `AGENTS.md` — ogólne zasady wykonawcze dla Codexa, source order, reuse, raportowanie, DB/RPC discipline.
- `project-context.md` — aktualny kontekst operacyjny projektu.
- `current-decisions.md` — aktywne decyzje domenowe i UI-adjacent.
- `ui-ux-notes.md` — quick wins, DB metadata needed, redesign notes.
- `project-structure.md` — gdzie lokować pages/components/layout/shared/core.
- `codex-mythborne-backlog.md` — klasyczny backlog implementacyjny.
- `codex-mythborne-refactor-backlog.md` — refactor/IA/layout hygiene backlog.
- `current-todo.md` / `current-state-summary.md` — status i kontekst wykonania.
- `database-current.md`, current dump, generated types — źródło prawdy dla DB/RPC/read model, jeśli UI dotyka danych.

### 0.3. Status rule

Wykonanie taska UI/UX nie aktualizuje automatycznie status docs. Codex raportuje zmiany i czeka na akceptację użytkownika. Dopiero po akceptacji można aktualizować statusy, jeśli użytkownik tego chce.

### 0.4. Review checklist

Reviewer powinien sprawdzić:

- czy backlog nie zastępuje klasycznego backlogu/status docs,
- czy source order jest jasny,
- czy UI-CORE jest phase zero,
- czy canvas/prototype HTML jest visual reference only,
- czy archive nie dopuszcza placeholderów wygenerowanych z pamięci,
- czy Codex ma używać global SCSS/utilities/vendor wrappers zamiast lokalnego CSS,
- czy legacy `mg-*` jest opisane jako compatibility/migration debt,
- czy utilities mają usage matrix,
- czy `muted-text` ma twarde ograniczenia,
- czy vendor wrappers mają lookup order,
- czy class budget ogranicza defensywne klasy,
- czy admin global/operator/server/launch/sandbox nie są pomieszane,
- czy Reports i Notifications są rozdzielone,
- czy PvP target selection nie jest combat screenem,
- czy Trade rozdziela Direct Trade i Auction House,
- czy taski mają Goal / Scope / Out of scope / Data-source rules / Acceptance criteria / Required report,
- czy dokument jawnie wskazuje open questions.

### 0.5. Phase zero rule

Pierwsze UI/UX taski powinny dotyczyć fundamentu, nie nowych ekranów:

1. style contract extraction,
2. legacy `mg-*` modernization plan,
3. utility usage matrix,
4. vendor wrapper lookup order,
5. global surface/card/badge/chip/page-header patterns,
6. custom icons and brand asset registry,
7. prototype-to-production mapping.

Dopiero po tym Codex powinien przenosić większe zaakceptowane prototypy do Angulara.


### 0.5.1. Minimum viable UI-CORE before first screen

UI-CORE jest phase zero dla większych ekranów, ale nie może stać się długim audytem bez widocznego efektu.

Zanim Codex zacznie implementować pierwszy większy player-facing ekran z prototypu, minimalny wymagany zestaw UI-CORE to:

1. **UI-CORE-1 — Mythsworn UI style contract extraction**.
2. **UI-CORE-2 — Global SCSS and shared pattern inventory**.
3. **UI-CORE-3 — Local SCSS budget and style report checklist**.
4. **UI-CORE-11 — Prototype-to-production SCSS mapping**.
5. **UI-CORE-12 — PrimeNG/vendor wrapper lookup order**.

Po tym minimalnym zestawie Codex może wdrażać pierwszy realny ekran, najlepiej `game-shell-v1.html` jako shell + dashboard foundation albo `exploration-flow-v2.html` jako pierwszy izolowany player-facing flow.

Pozostałe taski UI-CORE są nadal ważne, ale mogą być wykonywane iteracyjnie przy okazji ekranów, które ich realnie potrzebują.

Zasada review:

- jeśli Codex próbuje implementować ekran bez minimalnego UI-CORE, powinien zgłosić dependency;
- jeśli Codex próbuje robić wszystkie 15 UI-CORE tasków przed jakimkolwiek widocznym ekranem, należy ograniczyć zakres do minimum viable UI-CORE.

### 0.6. Task quality standard

Każdy task, który ma trafić do Codexa jako implementowalny slice, powinien mieć poniższy format. Krótsze notatki mogą zostać w sekcjach `Notes` albo `Open questions`, ale nie powinny być traktowane jako gotowe taski.

Required task structure:

- **Goal** — jednoznaczny efekt końcowy.
- **Scope** — co Codex ma realnie zmienić/sprawdzić.
- **Out of scope** — czego nie wolno robić w tym tasku.
- **Data/source rules** — DB/RPC/read model, dictionaries, metadata, access rules, source order.
- **UI/SCSS rules** — global SCSS, utilities, vendor wrappers, shared components, no canvas-copy.
- **Dependencies/blockers** — co zgłosić jako dependency zamiast fake’ować.
- **Acceptance criteria** — konkretne warunki akceptacji.
- **Verification/smoke** — build, route smoke, visual smoke, manual smoke, jeśli potrzebny.
- **Required Codex report** — reuse, local SCSS, styling report, not added intentionally.

Minimum standard dla tasków ekranowych:

- route/page/component target albo informacja, że route może jeszcze nie istnieć,
- existing services/read models/RPCs do sprawdzenia,
- fallback/dependency rule, jeśli backend nie istnieje,
- explicit no direct table writes for gameplay/admin mutations,
- explicit UI pattern reuse rule,
- explicit no local copied prototype CSS rule,
- at least one smoke path.

Minimum standard dla tasków UI-CORE:

- konkretne pliki/katalogi do sprawdzenia,
- konkretne output artifacts: matrix, registry, mapping, global pattern, wrapper update,
- no big-bang refactor unless explicitly approved,
- style compile/build expectation if code changes are made.

---

# 1. UI implementation contract

## 1.1. Canvas HTML is visual reference, not production source

HTML/SCSS z canvasów służy do prototypowania kierunku wizualnego. Codex nie może kopiować canvasowego CSS 1:1 do Angulara.

Do `docs/ui-ux/prototypes/` wolno dodać tylko realny zaakceptowany canvas HTML albo ręcznie odtworzony i ponownie zaakceptowany ekran.

Nie wolno tworzyć paczek placeholderów, w których każdy ekran ma ten sam shell i tylko inną nazwę.

Każdy prototype HTML musi zaczynać się standardowym ostrzeżeniem `VISUAL REFERENCE ONLY`.

Treść standardowego ostrzeżenia:

> VISUAL REFERENCE ONLY.  
> Do not copy this CSS into Angular feature components.  
> Translate approved visual patterns into global SCSS tokens, vendor wrappers, shared components, PrimeNG wrappers, or documented layout utilities.

Jeśli prototyp ma już komentarz domenowy albo scope contract, nie usuwać go. Standardowy header należy dodać nad istniejącym komentarzem.

Nie wolno traktować braku headera jako zgody na kopiowanie CSS z prototypu do Angulara.

## 1.2. Global SCSS first

Globalne utilities, layout styles i vendor wrappers istnieją po to, żeby ich używać zamiast tworzyć lokalny CSS w każdym komponencie.

Codex ma preferować:

- globalne tokeny,
- shared SCSS utilities,
- layout styles,
- vendor wrappers,
- istniejące shared components,
- PrimeNG theme/customization.

Zasada nie brzmi „nie używać utilities/vendorów”. Zasada brzmi: używać ich świadomie, zgodnie z usage matrix, zamiast defensywnie tworzyć lokalne klasy albo losowo składać 15 utility classes.

Allowed local SCSS:

- page-specific grid/layout, jeśli nie istnieje globalny pattern,
- responsive placement of page-local sections,
- minimal spacing composition,
- feature-local wrapper class, jeśli spina istniejące global patterns.

Not allowed local SCSS:

- nowe tokeny kolorów,
- nowe gold/blue gradients,
- nowe card shadows,
- nowy active nav style,
- nowy badge/chip style,
- nowy button style,
- skopiowany item popover styling,
- skopiowany summary-card styling,
- lokalne PrimeNG overrides, jeśli vendor wrapper może zostać rozszerzony globalnie.

## 1.3. Class budget rule

- Normalny element zwykle ma 1–2 klasy.
- Więcej niż 3 klasy wymaga uzasadnienia.
- Nie dodawać klas defensywnie „na przyszłość”.
- Nie dodawać klas stanu, jeśli stan nie jest realnie renderowany.
- Nie tworzyć `div soup`.

Preferowane podejście:

1. shared/vendor component,
2. global pattern class,
3. feature-local class tylko dla układu.

## 1.4. Required Codex UI report

Każdy większy UI task musi kończyć się raportem:

- reused:
- checked but not reused:
- new component/state/helper added:
- scope kept minimal:
- not added intentionally:

Dla stylowania dodatkowo:

- global tokens used:
- shared/vendor components used:
- global/shared SCSS classes used:
- local SCSS added:
- why local SCSS was necessary:
- copied from prototype: yes/no:
- if yes, why it was not converted to shared/global pattern:

## 1.5. Component architecture rule

UI/UX backlog dotyczy warstwy wizualnej, ale implementacja musi zachować aktualną architekturę projektu.

Reguły globalne:

- route page ma być cienką kompozycją widoku, nie miejscem na cały workflow;
- większy state/workflow nie powinien siedzieć w komponencie;
- typy, interfaces, form types, view models i mappers nie mogą lądować w component files;
- shared UI trafia do `src/app/shared` albo `src/app/layout`, zależnie od roli;
- domenowe modele, mappers, services, factories, validators i cross-feature helpers trafiają do `src/app/core`;
- feature-local komponenty są dopuszczalne, jeśli są realnie lokalne dla danego route/page;
- duży komponent produkcyjny, szczególnie około 250–400+ linii TS/HTML, jest warning sign i wymaga rozbicia albo uzasadnienia w raporcie;
- nie tworzyć jednego wielkiego komponentu tylko dlatego, że prototyp HTML był jednym plikiem.

Przed dodaniem nowego komponentu Codex musi sprawdzić:

1. `shared/components`.
2. `layout/components`.
3. Istniejące page-local components w danym feature area.
4. Global SCSS patterns.
5. PrimeNG/vendor wrappers.
6. Istniejące domain/read-model services.

Required Codex report dla większego UI taska musi zawierać także:

- component architecture;
- route page kept thin: yes/no + note;
- state/workflow location;
- shared/core types location;
- large component risk: none / justified / needs split.

## 1.6. Stale guard rule for UI workflows

Każdy async UI workflow musi chronić success i error path przed stale response, jeśli zależy od któregokolwiek z poniższych kontekstów:

- selected server,
- active hero,
- route id,
- selected item,
- selected trade offer,
- selected auction listing,
- selected PvP target,
- selected report,
- selected notification,
- selected admin/config entity,
- selected case/sanction/penalty,
- access/gate state.

Minimalne wymagania:

- stary success nie może nadpisać aktualnego stanu po zmianie kontekstu;
- stary error nie może pokazać błędu dla poprzednio wybranego obiektu;
- loading powinien kończyć się tylko dla aktualnego requestu;
- zmiana contextu powinna czyścić stale form state i feedback;
- jeśli selected entity zmieni się w trakcie requestu, response ma być ignorowany albo bezpiecznie odrzucony;
- przy mutacjach persistent UI powinno odświeżyć dane z canonical read path po sukcesie, nie zakładać lokalnego stanu jako prawdy.

Szczególnie pilnować w ekranach:

- Armory / item actions,
- Auctions,
- Direct Trade,
- PvP target selection,
- Reports,
- Notifications,
- Exploration state/resolve,
- Estate building job actions,
- admin configurators.

Required Codex report dla workflow UI musi zawierać także:

- stale guards;
- context keys guarded;
- success path guarded: yes/no;
- error path guarded: yes/no;
- context reset behavior.

## 1.7. Accessibility and responsive baseline

Mythsworn jest desktop-first browser RPG, ale ekran nie może całkowicie rozpadać się na mniejszych viewportach i nie może być obsługiwany wyłącznie myszą/hoverem.

Minimum accessibility baseline:

- focus states muszą być widoczne dla przycisków, linków, tabów, filtrów, slotów itemów i akcji wierszy;
- status nie może być komunikowany wyłącznie kolorem;
- dialog/popover/tooltip nie może być jedyną ścieżką do ważnych informacji, jeśli jest dostępny tylko na hover;
- klikalne sloty/itemy muszą mieć keyboard path albo opisany follow-up, jeśli aktualny wrapper tego nie zapewnia;
- ikona bez tekstu musi mieć dostępny label albo aria-label;
- destructive/irreversible action wymaga jasnego labela i confirmation pattern, jeśli workflow tego wymaga;
- empty, loading, disabled i blocked states muszą być zrozumiałe bez technicznych UUID-only komunikatów.

Minimum responsive baseline:

- desktop: topbar + sidebar + main layout;
- tablet: content może przejść do węższych kolumn, topbar może zawijać resource chips;
- mobile: pełna optymalizacja nie jest MVP, ale ekran nie może wymagać poziomego scrolla dla podstawowych akcji;
- dense tables/lists muszą mieć overflow/pagination pattern zamiast rozbijania layoutu;
- paperdoll/equipment layout może przejść w stacked/compact mode;
- modals/dialogs muszą mieć sensowną maksymalną wysokość i scroll wewnętrzny.

Required Codex report dla większego UI taska musi zawierać także:

- accessibility/responsive;
- focus states considered: yes/no;
- status not color-only: yes/no;
- hover-only critical info avoided: yes/no;
- tablet/mobile degradation checked: yes/no;
- overflow/pagination pattern.


---

# 2. SCSS modernization and usage matrix

## 2.1. Existing SCSS modernization decision

Obecny katalog `src/scss` pochodzi częściowo ze starszego projektu i nadal używa prefiksów `mg-*` / Monster Hunt. To nie jest docelowy branding Mythsworn, ale jest realną production foundation.

Decyzje:

- nie tworzymy równoległego lokalnego systemu `mb-*` w komponentach,
- istniejący globalny SCSS należy stopniowo zmodernizować,
- stare `mg-*` można zachować jako compatibility layer,
- nowe taski muszą traktować `mg-*` jako legacy naming/migration candidate,
- jeśli istniejący plik ma dobrą funkcję, ale starą nazwę, Codex ma użyć go lub rozszerzyć globalnie, a nie robić lokalny zamiennik.

## 2.2. Production token rule

Aktualnie produkcyjne tokeny są oparte o CSS variables `--mg-*` i SCSS variables z `src/scss/abstracts/_variables.scss`.

Tymczasowy mapping:

| Prototype intent | Current production source | Uwagi |
| --- | --- | --- |
| dark navy background | `--mg-color-bg` / `$color-bg` | używać przez theme/app-shell |
| surface/card | `--mg-color-bg-surface` / `$color-bg-surface` | wymaga surface patternów |
| soft border | `--mg-color-border` / `$color-border` | bez lokalnych rgba borderów |
| gold/bronze accent | `--mg-color-secondary` / `$color-secondary` | nie używać do wszystkiego |
| primary text | `--mg-color-text` / `$color-text` | treść i ważne wartości |
| muted/helper text | `--mg-color-text-muted` / `$color-text-muted` | tylko helper/metadane |
| semantic status | semantic colors | danger/success/warn/info tylko semantycznie |

## 2.3. Text semantics and `muted-text`

Allowed for `muted-text`:

- helper copy,
- metadata,
- timestamps,
- secondary labels,
- explanatory subtext,
- empty-state supporting copy.

Not allowed for `muted-text`:

- decyzje admina,
- reasons,
- notes/operator notes,
- outcomes,
- warning/critical messages,
- ważne wartości liczbowe,
- nazwy itemów/hero/serverów,
- statusy workflow,
- pełne treści raportów i notyfikacji.

Jeżeli tekst niesie znaczenie gameplayowe/adminowe, użyć normalnego tekstu plus badge/status/semantic text, a nie `muted-text`.

## 2.4. Utility SCSS usage matrix

Utilities są globalnym toolboxem i mają być używane zamiast lokalnego CSS, ale zgodnie z semantyką.

| Utility group | Intended use | Do not use for | Notes |
| --- | --- | --- | --- |
| Spacing/gap | drobne korekty spacingu | główne powtarzalne layouty | powtarzalne kombinacje → pattern |
| Display | rzadkie korekty renderowania | struktura komponentów | `d-contents` ostrożnie |
| Position | overlay, badge count, dropdown anchor | zwykłe layouty stron | preferować overlay/vendor |
| Overflow | scrollable tables/lists | ukrywanie layout bugów | nie maskować problemów |
| Height/width | bounded lists, column constraints | pixel-perfect patches | fixed px uzasadnić |
| Text alignment/wrap | tabele, techniczne keys, labels | semantyka tekstu | normalna proza ma być czytelna |
| Truncation | compact rows/previews | ukrywanie ważnych treści | ważny tekst ma detail/popover/full view |
| Visibility | responsive swaps | permission/access control | nigdy jako security |
| Z-index | align with PrimeNG layers | arbitrary stacking fixes | preferować PrimeNG contracts |
| Shadows/opacity/backdrop | exceptional elevation/overlay | fake local card systems | powtarzalne → global pattern |
| Interactions | cursor/select/pointer states | udawanie interakcji | cursor pointer tylko clickable |
| Animations | loading/rare decorative motion | random thematic motion | `floating-dragon` legacy |
| Aspect/object-fit | banners, avatars, item art | non-image layout hacks | dobre dla assetów |

## 2.5. Status text utilities

- `error-text`: błędy, validation, blocked actions.
- `success-text`: realny sukces/completion.
- `info-text`: neutralna informacja.
- `warn-text`: ostrzeżenia wymagające uwagi.
- `arcane-text`: special/magic flavor only.
- `muted-text`: helper/metadata only.

Status workflow powinien preferować badge/status pill zamiast gołego colored text.

## 2.6. Badge aliases

`_tag-badge-aliases.scss` zawiera legacy color aliases:

- `green` → `success`,
- `blue` → `info`,
- `gray` → `muted`,
- `violet` → `arcane`,
- `golden` → `golden`.

Nowe UI powinno preferować semantic variants, nie color-name aliases.

## 2.7. PrimeNG/vendor wrapper usage

Istnieją wrappers dla core PrimeNG surfaces. Codex ma je sprawdzać i używać/rozszerzać przed lokalnym stylem.

| Vendor area | Existing source | Intended use | Notes |
| --- | --- | --- | --- |
| Inputs | `_p-inputtext.scss`, `_p-textarea.scss`, `_p-password.scss` | search, forms, reasons | no local input restyling |
| Select | `_p-select.scss` | filters, server focus, edit level | sprawdzić zbyt szeroki scope |
| Paginator | `_p-paginator.scss` | auction, reports, notifications, vicinity | prefer over custom paginator |
| Table | `_p-table.scss` | admin/dense data | use when table UX fits |
| Popover/Tooltip | `_p-popover.scss`, `_tooltip.scss` | item popover, explainability | extend globally if needed |
| Tabs/Stepper/Accordion | `_p-tabs.scss`, `_p-stepper.scss`, `_p-accordion.scss` | admin configurators, reports tabs | avoid one long form |
| Dialog/Drawer/Confirm | `_p-dialogs.scss`, `_p-drawer.scss`, confirm files | confirmations, side panels | no ad hoc modal CSS |
| Toasts | `_p-toasts.scss` | notification/toast contract | map `mg-toast` to Mythsworn severities |
| Custom icons | `_p-custom-icons.scss`, `_primeicons-local.scss`, `_custom-icons.scss` | PrimeIcons-like classes | no emoji final icons |

Concrete cleanup candidates:

- review `_p-select.scss` broad selector scope,
- map `mg-toast` variants to Mythsworn notification severities,
- verify popover/tooltip as base for item popover and admin explainability,
- make paginator/table default basis for dense lists where appropriate,
- document custom icons registry.

## 2.8. Layout SCSS usage

- `layouts/_components.scss` has section/header/title/subtitle and image preview patterns.
- `layouts/_grid.scss` and `_flex.scss` are layout utilities, not visual design system.
- `layouts/_img.scss` provides media defaults.
- `layouts/_lists.scss` globally customizes `ul/li`; audit for reports/admin prose.
- `layouts/_scrollbars.scss` is global; avoid feature-local scrollbars.

Concrete cleanup candidates:

- document or alias `mg-section`, `mg-section__title`, `mg-section__subtitle`,
- audit global list styling,
- keep scrollbars global,
- avoid local grid systems.

---

# 3. Mythsworn visual language

Accepted direction: modern premium browser RPG UI stylized with ancient-Greek flavor.

UI ma być:

- modern-first,
- czytelny,
- premium,
- ciemny,
- browser-game friendly,
- długosesyjny,
- stylizowany przez kolory, materiały i detale, nie przez ciężką dekorację.

Unikać:

- ciężkiego kamienia wszędzie,
- generycznego SaaS dashboardu,
- przesadnego złota,
- emoji jako final icons,
- hardcoded gameplay lists,
- jednego wielkiego komponentu.

Key motifs:

- dark navy layered background,
- gold/bronze accents,
- soft gold borders,
- subtle blue/gold gradients,
- selected sidebar link with left gold inset,
- premium cards with low-opacity surfaces,
- compact chips/badges,
- readable tables/lists,
- restrained ancient-Greek flavor.

Logo mark: litera `M` w złoto-granatowym znaku z prototypes jest zaakceptowanym fallbackiem i nie może zniknąć z shellu.

---

# 4. Prototype archive convention

Rekomendowany katalog:

`docs/ui-ux/prototypes/`

Zasady:

- archiwizować tylko realne zaakceptowane albo odzyskane HTML prototypes;
- nie tworzyć placeholder packs;
- nie rekonstruować prototypów z pamięci bez ponownego review;
- jeden ekran odzyskiwać albo odtwarzać na raz;
- każdy prototype HTML musi mieć standardowy header `VISUAL REFERENCE ONLY`;
- prototype HTML jest visual reference only, nie production source;
- source filename może różnić się od archive filename, jeśli odzyskany plik miał starszą lub roboczą nazwę;
- archive filename ma odzwierciedlać zatwierdzoną rolę prototypu i jego wersję wizualną.

## 4.1. Current accepted prototype map

| Source file | Archive name | Status | Primary UI area | Notes |
| --- | --- | --- | --- | --- |
| `mythborne_ui_shell_prototype.html` | `game-shell-v1.html` | accepted direction | Game shell / dashboard shell | Fundament shellu: topbar, sidebar, brand mark, resource chips, dashboard layout direction. Nie traktować jako mniej ważny niż ekrany feature. |
| `mythborne_statistics_allocation_v_1.html` | `hero-statistics-v1.html` | accepted direction | Hero / stat allocation | Focused stat spending screen, not a second dashboard. Save przez `save_stat_allocation(...)`, no direct stat/CP writes. |
| `mythborne_armory_v_1.html` | `armory-v2.html` | accepted direction | Armory / equipment | Source title mówi Armory V2. Full Armory screen, equipment layout + inventory by Display Stands, item popover boundary. |
| `mythborne_estate_v_1.html` | `estate-v3.html` | accepted direction | Estate / buildings | Source title mówi Estate V3. One hero has one estate, district/address display, buildings, one active building job, no player-facing cancel action. |
| `mythborne_exploration_flow_v_2.html` | `exploration-flow-v2.html` | accepted direction | Exploration | No invented route-map fiction. Difficulty choice, current exploration status, Trial chance previews, pending step modal/inline strip. |
| `mythborne_trade_v_1.html` | `auction-house-v2.html` | accepted direction | Auction House | Source title mówi Auctions V2. Separate from Direct Trade, one item per listing, Character Points payment, item value only in popover. |
| `direct-trade-v2.html` | `direct-trade-v2.html` | accepted direction | Direct Trade | Private offer screen. Up to 5 items + Character Points per side. No CP-only for CP-only. Canonical RPC/domain operations. |
| `pvp-vicinity-v4.html` | `pvp-vicinity-v4.html` | accepted direction | PvP target selection | Target selection only. No Walking Dead, no combat preview, no combat log. |
| `reports-center-v2.html` | `reports-center-v2.html` | accepted direction | Reports | Full gameplay records/archive. Notifications are separate short rows, not full reports. |
| `notifications-center-v1.html` | `notifications-center-v1.html` | accepted direction | Notifications | Short persistent notification archive. Belongs near Reports Center but does not replace full reports. |
| `admin-overview-v7.html` | `admin-overview-v7.html` | accepted direction | Admin overview | Clean global admin orientation hub, not fake live dashboard. |

## 4.2. Prototype status vocabulary

Use one of:

- `accepted direction` — approved visual/product direction, ready for UI-CORE mapping;
- `needs polish` — direction accepted, but layout/wording/interaction details need another prototype pass;
- `needs review` — recovered/created but not accepted yet;
- `superseded` — kept for history, not current target;
- `missing` — expected prototype does not exist yet.

Do not label a prototype as implemented unless production Angular code exists and the user has accepted the Codex result.

## 4.3. Prototype-to-production rule

Every implementation task based on a prototype must answer:

- prototype source;
- archive name;
- patterns reused;
- patterns intentionally not implemented;
- global SCSS/vendor/shared mapping;
- local SCSS needed;
- copied from prototype: yes/no.

`copied from prototype: yes` should normally be a blocker unless the copied part is non-style static placeholder content explicitly approved for a temporary mock.

---

# 5. Global UI patterns to extract

## 5.1. Shell patterns

- Game Shell,
- Admin Shell,
- Topbar,
- Sidebar,
- active nav link,
- selected server/context block,
- resource chip,
- notification bell.

## 5.2. Surface patterns

- page header,
- standard card,
- premium/elevated card,
- summary card,
- stat card,
- note/info panel,
- badge,
- chip,
- status pill,
- detail side panel,
- selected/active surface,
- empty state.

## 5.3. Data display patterns

- list row,
- table row,
- compact action icons,
- pagination,
- filter panel,
- tab row,
- detail side panel.

## 5.4. Gameplay patterns

- item row,
- item popover,
- equipment/paperdoll preview,
- progress/timer strip,
- Walking Dead timing bar,
- report/notification row.

## 5.5. Admin patterns

- admin scope strip,
- admin area map,
- coverage checklist,
- context/explainability panel,
- config/change-set workflow header,
- reason-required action block.


## 5.6. Action and click naming patterns

Player-facing UI musi używać spójnych nazw klików, CTA i akcji.

Zasada główna:

> CTA label ma opisywać rzeczywistą domenową akcję, nie techniczny klik.

Jeśli backend/RPC/read model nie istnieje albo ekran jest tylko preview/read-only, label musi to jasno oddać:

- używać `View`, `Preview`, `Open details`, `Inspect` tam, gdzie nic nie mutuje;
- używać `Start`, `Save`, `Confirm`, `Create`, `Send`, `Place`, `Cancel` tylko tam, gdzie istnieje rzeczywisty workflow albo task jednoznacznie implementuje jego UI boundary;
- nie używać mocnych czasowników dla fake/mock akcji.

Preferowane nazwy akcji:

| Context | Preferred primary action | Avoid unless justified |
| --- | --- | --- |
| Exploration idle | `Start exploration` | `Go hunting`, `Begin route`, `Launch` |
| Exploration pending | `Check result` / `Resolve step` | `Open reward`, `Finish path` |
| Trial blocker | `Resolve Trial` | `Complete event` |
| Encounter blocker | `Resolve Encounter` | `Complete event` |
| Statistics draft | `Save allocation` | `Upgrade`, `Apply points` |
| Statistics reset | `Reset draft` | `Clear all`, `Undo everything` |
| Equipment slot | `Equip` / `Unequip` | random mix of `Use`, `Wear`, `Put on` |
| Item detail | `View item` or `Inspect item` | mixed `Open` / `Check` / `Show` without rule |
| Vendor/system item conversion | `Scrap for drachmas` | `Sell`, if it can be confused with player trade |
| Direct Trade create | `Create offer` / `Send offer` | `Sell`, `Auction`, `List` |
| Direct Trade response | `Respond` / `Confirm trade` / `Cancel offer` | `Buy`, `Bid` |
| Auction listing | `Create listing` | `Create trade`, `Sell item` |
| Auction bid | `Place bid` | `Offer`, `Pay` |
| Auction buy now | `Buy now` | `Instant trade` |
| PvP target selection | `Select target` | `Fight now`, if combat does not start immediately |
| Reports | `Open report` | `View notification` |
| Notifications | `Open notification` / `Mark as read` | `Open report`, unless linking to a full report |
| Admin/config save draft | `Create draft` / `Add entry` | `Apply`, if change is not applied yet |
| Admin/config apply | `Apply change set` | `Save`, if governance workflow is applying |

Naming decisions should be reflected in prototypes and implementation tasks. If a prototype uses an older label, the backlog naming contract wins unless user explicitly accepts the older label.

## UI-NAME-1 — Player action and CTA naming contract

**Goal:**  
Ujednolicić nazwy klików, CTA i akcji na player-facing ekranach Mythsworn, zanim Codex zacznie masowo przenosić prototypy do Angulara.

**Scope:**
- przejrzeć zaakceptowane prototypy player-facing:
  - `game-shell-v1.html`,
  - `hero-statistics-v1.html`,
  - `armory-v2.html`,
  - `estate-v3.html`,
  - `exploration-flow-v2.html`,
  - `auction-house-v2.html`,
  - `direct-trade-v2.html`,
  - `pvp-vicinity-v4.html`,
  - `reports-center-v2.html`,
  - `notifications-center-v1.html`;
- wypisać wszystkie primary/secondary/destructive CTA;
- zmapować je na wspólny naming contract z sekcji `5.6`;
- wskazać prototype labels do korekty;
- dopisać naming notes do backlog tasków, jeśli dany ekran ma szczególnie ryzykowne akcje.

**Out of scope:**
- implementacja Angulara;
- finalne i18n;
- zmiana DB/RPC nazw;
- projektowanie nowych gameplay workflows;
- renaming istniejących backend functions.

**Data/source rules:**
- UI label nie może sugerować funkcjonalności, której backend/RPC/read model nie obsługuje;
- jeśli action jest read-only, używać `View`, `Preview`, `Open details` albo `Inspect`;
- jeśli action jest persistent mutation, musi odpowiadać canonical RPC/domain workflow;
- jeśli brakuje workflow, label/task ma mówić o blockerze albo boundary, nie udawać gotową akcję.

**UI/SCSS rules:**
- naming contract nie wymaga zmian CSS;
- jeśli zmieniane są prototypy, zachować styl i standardowy `VISUAL REFERENCE ONLY` header;
- nie robić redesignu layoutu przy samej korekcie nazw.

**Dependencies/blockers:**
- jeśli nie wiadomo, czy akcja realnie mutuje stan, sprawdzić aktualny backlog/DB/RPC docs albo oznaczyć jako open question;
- jeśli action label zależy od przyszłego workflow, dodać explicit note zamiast zgadywać.

**Acceptance criteria:**
- istnieje jedna tabela naming contract dla typowych akcji gracza;
- prototypy mają listę labeli do korekty albo potwierdzenie, że są zgodne;
- Direct Trade i Auction House nie mieszają słów `trade`, `offer`, `listing`, `bid`, `buy now`;
- Reports i Notifications nie mieszają `report` z `notification`;
- Exploration nie wraca do legacy `hunt` / `monster hunt` wording;
- Statistics używa `Save allocation`, `Reset draft`, `Character Points`;
- item vendor/system conversion używa `Scrap for drachmas`, nie mylącego `Sell`, jeśli kontekst może sugerować player trade.

**Verification/smoke:**
- documentation/prototype-label pass only: no build;
- jeśli prototyp HTML jest modyfikowany, otworzyć go lokalnie i sprawdzić, czy layout nie został przypadkowo uszkodzony.

**Required Codex report:**
- reused:
- checked but not reused:
- new naming contract added:
- prototype labels changed:
- labels intentionally left unchanged:
- open naming questions:

---

# 6. UI-CORE — Foundations and style contract

Cel: ustabilizować wspólne wzorce, globalne SCSS, reuse rules, vendor wrapper lookup i zasady przenoszenia prototypów do Angulara. UI-CORE jest **phase zero** dla większych ekranów.

## UI-CORE task index

- UI-CORE-1 / formerly UI-28 — Mythsworn UI style contract extraction
- UI-CORE-2 — Global SCSS and shared pattern inventory
- UI-CORE-3 — Local SCSS budget and style report checklist
- UI-CORE-4 — Shared surface/card/badge/chip/page-header patterns
- UI-CORE-5 — Icon placeholder and Game Icons mapping contract
- UI-CORE-6 — Item popover shared component contract
- UI-CORE-7 — Legacy Monster Hunt / `mg-*` SCSS modernization plan
- UI-CORE-8 — Text utility semantics and `muted-text` cleanup
- UI-CORE-9 — Surface/card/badge/chip production pattern expansion
- UI-CORE-10 — Custom icons and brand asset registry
- UI-CORE-11 — Prototype-to-production SCSS mapping
- UI-CORE-12 — PrimeNG/vendor wrapper modernization and lookup order
- UI-CORE-13 — Utility class audit, semantics and usage pass
- UI-CORE-14 — PrimeNG table/paginator/list pattern decision
- UI-CORE-15 — Layout utilities and section pattern cleanup

## UI-CORE-1 / formerly UI-28 — Mythsworn UI style contract extraction

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/mythsworn-style-contract.md`.

**Goal:**  
Zebrać zaakceptowane style z prototypów i rozmowy w praktyczny style contract dla Codexa, bez kopiowania canvas CSS do Angulara.

**Scope:**
- przejrzeć `src/scss/abstracts`, `base`, `themes`, `utilities`, `vendors`, `layouts`,
- przejrzeć istniejące layout/shared components, jeśli są dostępne,
- zmapować prototype visual intent na production tokeny/wrappers/patterns,
- opisać: game shell, admin shell, topbar, sidebar, page header, cards, summary cards, stat cards, badges, chips, item popover, report/notification rows,
- wskazać brakujące global/shared patterns,
- dopisać zasady no canvas-copy, global SCSS first, class budget, no div soup.

**Out of scope:**
- finalny design system,
- big-bang SCSS rewrite,
- zmiana wszystkich istniejących komponentów,
- nowy icon framework,
- DB/schema changes.

**Data/source rules:**
- nie projektować DB metadata ani admin nav registry w tym tasku,
- jeśli pattern wymaga danych z DB/read modelu, opisać dependency zamiast hardcodować runtime meaning.

**UI/SCSS rules:**
- użyć istniejących `mg` variables/wrappers jako aktualnej production foundation,
- oznaczyć `mg-*` jako legacy compatibility,
- nie tworzyć lokalnego `mb-*` token systemu,
- nie kopiować wartości kolorów z prototypów do component SCSS.

**Dependencies/blockers:**
- jeśli repo nie ma widocznych shared components dla card/badge/chip, wskazać brak jako pattern gap,
- jeśli istniejące wrappers są zbyt stare, wskazać je jako UI-CORE follow-up.

**Acceptance criteria:**
- style contract opisuje production usage, nie tylko estetykę,
- Codex ma jasny lookup order dla SCSS/vendor/shared,
- canvas HTML jest visual reference only,
- lista missing global patterns istnieje,
- review może ocenić, czy future UI task używa kontraktu.

**Verification/smoke:**
- jeśli task jest dokumentacyjny: no build required,
- jeśli zmienia SCSS: style compile/build.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- global tokens used:
- shared/vendor components used:
- local SCSS added:
- copied from prototype: yes/no:

## UI-CORE-2 — Global SCSS and shared pattern inventory

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/global-scss-shared-inventory.md`.

**Goal:**  
Stworzyć inventory globalnych SCSS, utilities, layouts, vendor wrappers i shared components, które Codex ma sprawdzać przed implementacją UI.

**Scope:**
- zinwentaryzować `src/scss/abstracts`, `base`, `themes`, `utilities`, `vendors`, `layouts`,
- wskazać production-ready files, legacy/migration candidates, empty placeholders,
- wskazać wrappers dla PrimeNG: buttons, inputs, selects, paginator, table, tabs, popover, tooltip, dialogs, drawer, toasts, custom icons,
- wskazać layout helpers: grid, flex, section/title/subtitle, lists, scrollbars,
- wskazać shared Angular components, jeśli są dostępne w repo.

**Out of scope:**
- refactor wszystkich klas,
- usuwanie plików,
- zmiana visual language,
- implementacja ekranów.

**Data/source rules:**
- inventory ma wskazywać, gdzie UI powinien brać label/metadata, ale nie projektować nowego DB contractu.

**UI/SCSS rules:**
- inventory ma wyjaśniać, które klasy są legacy compatibility,
- empty placeholders typu `functions.scss` / `base/_icons.scss` nie mogą być traktowane jako real icon system,
- custom icons registry ma być wskazany osobno.

**Dependencies/blockers:**
- brak dostępu do repo/shared components -> raport z ograniczeniem,
- niepewne użycie klasy -> oznaczyć jako needs audit, nie zgadywać.

**Acceptance criteria:**
- istnieje tabela/katalog: file/pattern → intended use → status → notes,
- Codex wie, gdzie szukać card/badge/chip/button/table/popover/tabs/section styles,
- inventory wskazuje, czego nie wolno używać losowo,
- review może szybko sprawdzić, czy nowy task pominął reuse.

**Verification/smoke:**
- documentation-only: no build,
- if comments/docs in repo changed: formatting check if available.

**Required Codex report:**
- reused:
- checked but not reused:
- new docs/registry added:
- scope kept minimal:

## UI-CORE-3 — Local SCSS budget and style report checklist

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/local-scss-budget-checklist.md`.

**Goal:**  
Wprowadzić egzekwowalny local SCSS budget i styling report checklist dla wszystkich większych UI tasków.

**Scope:**
- dodać standard raportu stylowania,
- zdefiniować limit klas i zasady uzasadniania 3+ klas,
- zdefiniować kiedy local SCSS jest dopuszczalny,
- zdefiniować zakaz local PrimeNG internals overrides bez uzasadnienia,
- zdefiniować wymagane pytania review dla local SCSS.

**Out of scope:**
- automatyczny linter,
- refactor wszystkich istniejących templatek,
- usuwanie utilities.

**Data/source rules:**
- nie dotyczy DB/RPC, poza regułą, że CSS visibility nie jest access control.

**UI/SCSS rules:**
- global utilities/vendor wrappers mają być używane świadomie,
- powtarzalne utility combinations mają stać się global pattern/component,
- local SCSS layout-only unless justified.

**Dependencies/blockers:**
- jeśli project ma stylelint/ESLint custom rules, sprawdzić czy można później dodać automation; nie robić tego w tym tasku bez zgody.

**Acceptance criteria:**
- task template zawiera styling report,
- class budget jest opisany,
- local SCSS exceptions są jasno opisane,
- Codex musi raportować copied-from-prototype status.

**Verification/smoke:**
- documentation-only no build,
- jeśli dotyka config/lint: build/lint.

**Required Codex report:**
- reused:
- checked but not reused:
- new checklist added:
- not added intentionally:

## UI-CORE-4 — Shared surface/card/badge/chip/page-header patterns

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/shared-surface-patterns.md`.

**Goal:**  
Ujednolicić najczęstsze powierzchnie UI jako globalne klocki, które zastąpią lokalne kopiowanie prototypowego CSS.

**Scope:**
- przejrzeć `base/_surface.scss`, `base/_badges.scss`, `utilities/_shadows.scss`, `_borders.scss`, `_backgrounds.scss`,
- zaprojektować/rozszerzyć globalne patterny:
  - page header,
  - standard card,
  - premium/elevated card,
  - summary card,
  - stat card,
  - note/info panel,
  - badge,
  - chip,
  - status pill,
  - selected/active surface,
  - detail side panel,
- wskazać compatibility aliases i docelowe semantic names.

**Out of scope:**
- implementacja konkretnych ekranów,
- 10+ wariantów kart bez realnego użycia,
- pełny design system,
- local feature SCSS.

**Data/source rules:**
- labels/status variants mają wynikać z semantic meaning, nie z kolorów,
- DB-backed status labels pozostają DB/read-model sourced.

**UI/SCSS rules:**
- gradients/borders/shadows token-driven globalnie,
- badge color aliases `green/blue/gray/violet` compatibility only,
- no local `auction-card/admin-card/pvp-card` if global surface + layout class is enough.

**Dependencies/blockers:**
- jeśli existing components already wrap cards/badges, rozszerzyć je zamiast tworzyć nowe klasy,
- jeśli global token nie istnieje, zgłosić token gap.

**Acceptance criteria:**
- globalny zestaw patterns istnieje albo jest dokładnie zaplanowany,
- taski ekranowe mogą wskazać konkretny pattern,
- no local copied gradients,
- build/style compile passes if code changed.

**Verification/smoke:**
- style compile/build,
- visual smoke on one representative page if pattern applied.

**Required Codex report:**
- global tokens used:
- shared/vendor components used:
- global/shared SCSS classes added/changed:
- local SCSS added:
- why local SCSS was necessary:

## UI-CORE-5 — Icon placeholder and Game Icons mapping contract

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/icon-placeholder-mapping.md`.

**Goal:**  
Opisać docelowe użycie custom icons i placeholderów ikon, żeby Codex nie używał emoji ani losowych bibliotek.

**Scope:**
- przejrzeć `abstracts/_custom-icons.scss`, `vendors/_p-custom-icons.scss`, `vendors/_primeicons-local.scss`,
- zebrać istniejące icon keys/classes,
- zmapować placeholdery `AU/PV/ES/TR/EX/CG/AA/SM` na docelowe icon keys,
- opisać fallback: text placeholder only in prototype,
- opisać color/fill/mask/currentColor strategy, jeśli wynika z istniejącego SCSS.

**Out of scope:**
- pobieranie wszystkich ikon,
- zmiana całego icon systemu,
- emoji as final icons,
- hardcoded external icon URLs.

**Data/source rules:**
- icon key dla DB-backed type może później pochodzić z metadata/dictionary; ten task nie projektuje DB.

**UI/SCSS rules:**
- custom icon registry first,
- missing icon key report,
- no random icon library.

**Dependencies/blockers:**
- jeśli brak konkretnej ikony, raportować missing icon key,
- jeśli SVG nie obsługuje recolor, wskazać asset issue.

**Acceptance criteria:**
- icon registry usage documented,
- placeholder mapping exists,
- no emoji final icons,
- `M` mark preservation documented.

**Verification/smoke:**
- visual smoke for one custom icon if code changes,
- no build required for docs-only.

**Required Codex report:**
- reused icon registry:
- missing icon keys:
- new icons added:
- not added intentionally:

## UI-CORE-6 — Item popover shared component contract

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/item-popover-contract.md`.

**Goal:**  
Zdefiniować jeden item popover pattern dla całej aplikacji: armory, auction, direct trade, reports, rewards.

**Scope:**
- item name + quality/tier,
- item kind and slot,
- icon box on right,
- native item stats,
- bonuses,
- requirements,
- drachma value,
- boosted values,
- not equippable / requirement warning,
- source snapshot support for reports/trade.

**Out of scope:**
- item generation DB changes,
- equip/unequip workflow,
- CP market valuation,
- local tooltip CSS per feature.

**Data/source rules:**
- use current item read model/snapshot if available,
- reports/trade should use snapshot/fallback data where historical,
- no CP value as inherent item value,
- item requirements from DB/read model when available.

**UI/SCSS rules:**
- build on PrimeNG popover/tooltip wrapper where appropriate,
- no per-feature item tooltip CSS,
- icon placeholder uses custom icon registry/fallback.

**Dependencies/blockers:**
- if shared item read model missing, report dependency,
- if item stats not available, show safe partial popover and report data gap.

**Acceptance criteria:**
- one shared popover contract exists,
- damage/stat display distinguishes native stats and bonuses,
- boosted values visually marked,
- no CP valuation,
- accessible hover/focus/click behavior considered.

**Verification/smoke:**
- visual smoke in one item context,
- keyboard/focus smoke if popover implemented,
- build passes.

**Required Codex report:**
- reused popover/vendor:
- item read model source:
- new shared component added:
- local SCSS added:

## UI-CORE-7 — Legacy Monster Hunt / `mg-*` SCSS modernization plan

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/legacy-mg-scss-modernization-plan.md`.

**Goal:**  
Ustalić, co zostaje jako compatibility layer, co dostaje Mythsworn alias, a co wymaga refaktoru.

**Scope:**
- audit public `mg-*` variables/classes/mixins,
- mapping legacy `mg-*` → Mythsworn intent,
- identify empty placeholders: `functions.scss`, `base/_icons.scss`,
- identify wrappers/patterns safe to keep,
- identify aliases needed for future Mythsworn naming.

**Out of scope:**
- big-bang rename,
- removing classes without usage audit,
- rewriting every component,
- local `mb-*` system.

**Data/source rules:**
- not DB/RPC related.

**UI/SCSS rules:**
- keep working production layer,
- change/alias globally, not locally,
- document migration candidates.

**Dependencies/blockers:**
- if usage search unavailable, mark safe-to-change unknown,
- if class used widely, keep compatibility alias.

**Acceptance criteria:**
- legacy naming not treated as final branding,
- migration path minimal,
- mapping table exists,
- build/style compile if code changed.

**Verification/smoke:**
- style compile/build if code changes,
- no visual regressions on touched representative page.

**Required Codex report:**
- reused legacy compatibility:
- aliases added:
- cleanup candidates:
- safe to remove now yes/no/unknown:

## UI-CORE-8 — Text utility semantics and `muted-text` cleanup

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/text-utility-semantics.md`.

**Goal:**  
Ograniczyć nadużycie `muted-text` i status text, nie usuwając przydatnych utilities.

**Scope:**
- audit use of `muted-text`, `error-text`, `success-text`, `info-text`, `warn-text`, `arcane-text`,
- define use/do-not-use matrix,
- fix touched obvious abuses where text carries decision/reason/outcome/status meaning,
- point to badge/status pill alternatives.

**Out of scope:**
- full repo-wide mass rewrite unless approved,
- removing text utilities,
- replacing everything with gold/primary text.

**Data/source rules:**
- status labels may come from DB/dictionaries; styling must not replace semantic status.

**UI/SCSS rules:**
- helper/metadata only for muted,
- decisions/reasons/notes/outcomes not muted,
- status workflow prefers badges/status pills.

**Dependencies/blockers:**
- if a component uses `muted-text` because no badge/status pattern exists, link to UI-CORE-4/9.

**Acceptance criteria:**
- use/do-not-use matrix exists,
- nadużycia w touched files fixed,
- review checklist updated,
- build passes if code changed.

**Verification/smoke:**
- visual smoke for representative page if changes made.

**Required Codex report:**
- text utilities changed:
- muted-text usages removed/kept:
- why kept:

## UI-CORE-9 — Surface/card/badge/chip production pattern expansion

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/surface-badge-pattern-expansion.md`.

**Goal:**  
Rozszerzyć globalne surface/badge patterns do potrzeb zaakceptowanych prototypów.

**Scope:**
- `base/_surface.scss`, `base/_badges.scss`, `_tag-badge-aliases.scss`, shadows/borders/backgrounds,
- create/extend semantic variants for surfaces and badges,
- add doc comments or usage matrix where helpful,
- map repeated prototype surfaces to global patterns.

**Out of scope:**
- implementing full pages,
- replacing every existing card,
- many decorative variants without need.

**Data/source rules:**
- badge labels/statuses are semantic; DB label source remains separate.

**UI/SCSS rules:**
- no local copied gradients,
- token-driven colors,
- color aliases compatibility only,
- repeated surfaces global.

**Dependencies/blockers:**
- if theme token missing, report token gap,
- if shared component exists, extend component/wrapper instead of only class.

**Acceptance criteria:**
- production surface/badge/chip patterns exist,
- Codex has concrete classes/patterns to use,
- page header/summary/stat/note/detail/selected surfaces covered,
- build/style compile passes.

**Verification/smoke:**
- visual smoke on one representative page,
- build/style compile.

**Required Codex report:**
- global classes added/changed:
- variants added:
- compatibility aliases:
- local SCSS avoided:

## UI-CORE-10 — Custom icons and brand asset registry

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/icon-brand-registry.md`.

**Goal:**  
Ujednolicić custom icons i brand assets.

**Scope:**
- document `abstracts/_custom-icons.scss`, `_p-custom-icons.scss`, `_primeicons-local.scss`,
- map prototype placeholders,
- document brand assets slots: logo mark, wordmark, banner,
- preserve CSS `M` fallback.

**Out of scope:**
- downloading all icons,
- changing icon architecture,
- embedding assets as base64,
- hardcoded external URLs.

**Data/source rules:**
- future icon keys may become DB metadata; no DB design now.

**UI/SCSS rules:**
- registry first,
- missing key report,
- no emoji final.

**Dependencies/blockers:**
- real asset paths required for banner/wordmark use,
- missing icons can stay placeholders in prototypes only.

**Acceptance criteria:**
- icon/brand registry documented,
- `M` mark not lost,
- Codex knows missing icon behavior.

**Verification/smoke:**
- visual smoke if asset/icon use changes.

**Required Codex report:**
- icons reused:
- icon keys missing:
- brand assets used:

## UI-CORE-11 — Prototype-to-production SCSS mapping

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/prototype-production-mapping.md`.

**Goal:**  
Stworzyć mapping zaakceptowanych prototypes na production patterns.

**Scope:**
- for each accepted prototype family map:
  - visual pattern,
  - production token/class/component/wrapper,
  - missing pattern,
  - local layout-only class if needed,
- initial families: Dashboard, Admin Overview, Reports/Notifications, Trade, PvP Vicinity, Estate, Armory, Statistics.

**Out of scope:**
- copying prototype HTML/CSS into app,
- implementing screens,
- adding fake placeholders to prototype archive.

**Data/source rules:**
- mapping may reference DB/read model requirements but does not design DB.

**UI/SCSS rules:**
- prototype values translated to global SCSS/vendor/shared,
- local CSS exceptions documented.

**Dependencies/blockers:**
- if prototype HTML missing, recover/review one at a time.

**Acceptance criteria:**
- mapping table exists,
- each major UI task can reference patterns,
- no canvas CSS copy.

**Verification/smoke:**
- docs-only no build.

**Required Codex report:**
- prototypes mapped:
- missing patterns:
- local exceptions:

## UI-CORE-12 — PrimeNG/vendor wrapper modernization and lookup order

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/primeng-vendor-wrapper-lookup.md`.

**Goal:**  
Dopasować vendor wrappers do Mythsworn i wymusić ich używanie/rozszerzanie przed lokalnym stylem.

**Scope:**
- review `src/scss/vendors/*`,
- create lookup order: component → vendor wrapper → utility → local exception,
- review `_p-select.scss` broad selector scope,
- map `_p-toasts.scss` / `mg-toast` to notification severities,
- verify `_p-popover.scss` and `_tooltip.scss` for item popover/explainability,
- make `_p-paginator.scss` and `_p-table.scss` preferred basis for dense lists/tables where appropriate,
- document `_p-custom-icons.scss` and `_primeicons-local.scss`.

**Out of scope:**
- replacing PrimeNG,
- local `.p-*` overrides,
- `::ng-deep` exceptions without reason,
- deleting wrappers.

**Data/source rules:**
- not DB/RPC related.

**UI/SCSS rules:**
- wrappers first,
- extend wrapper globally if visual pattern is reusable,
- no feature-local PrimeNG internals.

**Dependencies/blockers:**
- if broad selector scope is unsafe to change without audit, mark as needs usage audit.

**Acceptance criteria:**
- vendor wrapper usage map,
- wrappers needing polish listed,
- local overrides are exceptions,
- build/style compile if code changed.

**Verification/smoke:**
- visual smoke for touched PrimeNG components,
- build/style compile.

**Required Codex report:**
- wrappers reused:
- wrappers changed:
- local overrides avoided/added:

## UI-CORE-13 — Utility class audit, semantics and usage pass

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/utility-class-audit.md`.

**Goal:**  
Korzystać z global utilities zamiast lokalnego CSS, ale bez losowego/defensywnego składania klas.

**Scope:**
- audit common utility usage,
- focus: `muted-text`, spacing/gap, width/height px, shadow/opacity/backdrop, visibility, animation,
- produce `utility → allowed use → do not use → preferred alternative`,
- identify repeated combinations for extraction.

**Out of scope:**
- deleting utilities,
- discouraging utility use,
- big-bang HTML rewrite.

**Data/source rules:**
- visibility/opacity is not access control.

**UI/SCSS rules:**
- utilities for simple layout/presentation,
- repeated combinations → global pattern,
- fixed px requires justification.

**Dependencies/blockers:**
- if usage cannot be searched fully, mark unknowns.

**Acceptance criteria:**
- utility matrix exists,
- class budget enforceable,
- repeated combos identified.

**Verification/smoke:**
- build if code changes.

**Required Codex report:**
- utility usages audited:
- candidates extracted:
- kept intentionally:

## UI-CORE-14 — PrimeNG table/paginator/list pattern decision

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/table-paginator-list-decision.md`.

**Goal:**  
Ustalić, kiedy używać PrimeNG table/paginator, a kiedy custom list/card row.

**Scope:**
- admin tables,
- reports/notifications,
- auction listings,
- PvP vicinity,
- armory item grids,
- direct trade pending offers.

**Out of scope:**
- full implementation of all pages,
- replacing accepted card/list UX with tables everywhere,
- custom paginator if PrimeNG paginator suffices.

**Data/source rules:**
- pagination source/page size should come from read model/config where available; otherwise document default.

**UI/SCSS rules:**
- PrimeNG paginator preferred for standard paging,
- table for dense comparable data,
- custom list/card rows for item-rich/gameplay-rich content.

**Dependencies/blockers:**
- if existing read model does not paginate, report data/service dependency.

**Acceptance criteria:**
- list vs table decision per major screen,
- pagination pattern chosen,
- no local custom paginator without reason.

**Verification/smoke:**
- visual smoke on one list/table if code changes.

**Required Codex report:**
- table/paginator wrappers reused:
- custom list justified:
- pagination source:

## UI-CORE-15 — Layout utilities and section pattern cleanup

**Status:** accepted 2026-05-06. Production artifact: `docs/ui-ux/layout-section-pattern-cleanup.md`.

**Goal:**  
Uporządkować layout utilities i section/header patterns.

**Scope:**
- review `layouts/_components.scss`, `_grid.scss`, `_flex.scss`, `_lists.scss`, `_scrollbars.scss`, `_img.scss`,
- document or alias `mg-section`, `mg-section__title`, `mg-section__subtitle`,
- audit global `ul/li` styling for reports/admin prose,
- define when grid/flex utilities are appropriate,
- keep scrollbars global,
- support image slots for banner/logo/item art.

**Out of scope:**
- deleting layout utility system,
- big-bang HTML refactor,
- feature-local scrollbar/list resets without reason.

**Data/source rules:**
- not DB/RPC related.

**UI/SCSS rules:**
- section patterns global,
- page architecture should not be repeated utility soup,
- prose lists must remain readable.

**Dependencies/blockers:**
- if global list styling breaks prose, create/reset documented pattern.

**Acceptance criteria:**
- layout usage rules,
- repeated sections have shared/semantic pattern,
- prose/list styling safe,
- build/style compile if code changed.

**Verification/smoke:**
- visual smoke for reports/admin prose if list styles changed.

**Required Codex report:**
- layout utilities reused:
- section patterns added/aliased:
- list/prose impact:

---

# 7. UI-SHELL — Global game shell and dashboard foundation

Cel: ustabilizować globalny game shell, dashboard foundation, topbar/sidebar i resource presentation jako reusable player-facing shell. UI-SHELL powinien powstać po UI-CORE foundation albo przynajmniej zgodnie z jego zasadami.

## UI-SHELL task index

- UI-SHELL-1 / formerly UI-1 — Game shell style foundation
- UI-SHELL-2 — Dashboard hero-centric layout
- UI-SHELL-3 — Topbar resource chips
- UI-SHELL-4 — Sidebar navigation and active state
- UI-SHELL-5 — Persistent state widget boundary

## UI-SHELL-1 / formerly UI-1 — Game shell style foundation

**Status:** conditionally accepted on 2026-05-08. The accepted foundation keeps `_game-shell.scss` limited to the game shell grid skeleton, grid areas, topbar/sidebar/main boundary styling, mobile shell breakpoint and a temporary active-nav inset. Existing layout/position/spacing utilities stay in templates. `mg-card` as a sidebar nav surface and the active inset are follow-up debt for UI-SHELL-4.

**Goal:**  
Ustabilizować globalny player-facing game shell z topbarem, sidebarem i main content, zgodny z zaakceptowanym kierunkiem Mythsworn visual language.

**Scope:**
- sprawdzić istniejące layout/shell components w `src/app/layout`, `src/app/shared`, route shells,
- użyć/rozszerzyć globalne SCSS, layout utilities i vendor wrappers po UI-CORE,
- game topbar: health, XP, brand, resources,
- sidebar: selected server, server status, prestige, grouped player navigation,
- main content: spacing, max-width/desktop-first composition, responsive fallback,
- active nav state with gold left inset,
- preserve CSS/asset `M` mark.

**Out of scope:**
- admin shell,
- feature-specific page details,
- dashboard content redesign beyond shell slots,
- DB/RPC changes,
- new icon framework.

**Data/source rules:**
- selected server and active hero context must come from existing active server/active hero services/read models,
- do not assume `hero.id === auth.uid()`,
- resource values come from current hero/resource read model,
- if a value is unavailable, show safe loading/empty state rather than hardcoded production data.

**UI/SCSS rules:**
- no copied canvas CSS,
- use global shell/topbar/sidebar/resource chip patterns from UI-CORE,
- local SCSS only for page layout glue if unavoidable,
- topbar/sidebar styles should be global/shared, not duplicated per page,
- custom icon registry first; emoji only prototype placeholder.

**Dependencies/blockers:**
- if existing shell architecture is root-heavy, report bundle/layout debt instead of moving everything into root,
- if active hero/server state is unavailable in shell route, report dependency.

**Acceptance criteria:**
- game shell renders with topbar, sidebar and main content,
- `M` mark preserved,
- selected server/status/prestige visible in sidebar,
- active nav link matches accepted style,
- resource chips show value + per-hour where meaningful,
- no feature-local copied shell CSS,
- build passes.

**Verification/smoke:**
- route smoke for at least Dashboard route,
- visual smoke for desktop width,
- responsive smoke for collapsed/narrow width if implementation touches responsive shell,
- build/tsc.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- global/shared SCSS classes used:
- local SCSS added:
- why local SCSS was necessary:
- copied from prototype: yes/no:

## UI-SHELL-2 — Dashboard hero-centric layout

**Goal:**  
Utrzymać dashboard jako hero-centric overview, nie portal do wszystkiego ani kopię sidebara.

**Scope:**
- route/page target: existing dashboard route/page if present,
- active hero header/banner,
- base stats summary,
- derived stats summary,
- equipment preview/paperdoll summary,
- home/vicinity context,
- persistent state summary,
- minimal links into detailed screens only where helpful.

**Out of scope:**
- full Exploration screen,
- full Combat screen,
- Trade/Auction widgets,
- Admin widgets,
- fake next-actions duplicated from sidebar,
- DB/RPC progression redesign.

**Data/source rules:**
- active hero, stats, derived/runtime stats, equipment and estate context must come from existing services/read models,
- if equipment runtime/equip workflow is missing, show read-only preview/dependency, not fake equip actions,
- derived stats should not use legacy `hero_derived` as frontend runtime source if current decisions say runtime service is source,
- no hardcoded permanent stat lists if DB/read model exists.

**UI/SCSS rules:**
- use shared card/summary/stat patterns,
- no local dashboard-only card system,
- no duplicate topbar/sidebar resource styles,
- local layout only for dashboard composition.

**Dependencies/blockers:**
- if runtime derived preview service is incomplete, report dependency and keep static/read-only summaries,
- if equipment preview data unavailable, show safe placeholder without fake equipped items.

**Acceptance criteria:**
- dashboard reads as hero state, not system portal,
- no duplicated navigation/next-actions cards,
- base and derived stats visible,
- equipment preview area exists but does not fake missing equip workflow,
- persistent state shown only if real state exists,
- build passes.

**Verification/smoke:**
- route smoke for dashboard,
- visual smoke with hero loaded,
- empty/loading smoke if no hero/no data state exists,
- build/tsc.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- data sources used:
- local SCSS added:
- not added intentionally:

## UI-SHELL-3 — Topbar resource chips

**Goal:**  
Ujednolicić topbar resource chips jako reusable player-facing pattern.

**Scope:**
- left side: Health, XP progress, Level, XP missing to next,
- center: Mythsworn brand/logo mark,
- right side: Drachmas, Materials, Workforce,
- each production/resource chip should show current value and per-hour where meaningful,
- Character Points may appear in context-specific screens, but not as generic per-hour production resource unless context requires it.

**Out of scope:**
- progression DB/RPC changes,
- resource production formula changes,
- notification dropdown implementation unless included by UI-REPORTS task,
- admin topbar.

**Data/source rules:**
- Health/XP/Level from active hero/progression read model,
- Drachmas/Materials/Workforce from resource read model/dictionary,
- resource labels should use DB-backed `resource_types` where available,
- no hardcoded resource list if current read model supports resource dictionary.

**UI/SCSS rules:**
- resource chip is shared/global pattern,
- no local chip SCSS,
- use semantic icons/custom icon registry where possible,
- per-hour text must be secondary but readable, not hidden as meaningless muted text.

**Dependencies/blockers:**
- if resource dictionary/read service missing, report dependency or use existing current service with TODO note,
- if XP-to-next is not yet canonical, show current available value or safe placeholder per current state.

**Acceptance criteria:**
- topbar chips are consistent across player shell,
- value + per-hour displayed for production resources,
- Character Points not misrepresented as produced resource,
- loading/empty states safe,
- build passes.

**Verification/smoke:**
- visual smoke in shell,
- data smoke with normal hero/resources,
- build/tsc.

**Required Codex report:**
- reused resource/topbar components:
- resource data source:
- checked but not reused:
- local SCSS added:

## UI-SHELL-4 — Sidebar navigation and active state

**Goal:**  
Ujednolicić player sidebar navigation, active route styling i server/prestige context.

**Scope:**
- sidebar groups:
  - Hero: Dashboard, Exploration, Statistics/Hero, Armory,
  - World: Estate, Trade, PvP, Reports,
  - Operations/Staff entry only if user has staff/admin visibility,
- selected server block,
- server status,
- prestige/rank block,
- active route style with gold inset,
- route visibility should follow current access policy.

**Out of scope:**
- admin sidebar IA,
- route guard refactor unless needed for visibility bug,
- player onboarding navigation.

**Data/source rules:**
- selected server from ActiveServer/current server resolver,
- prestige/rank from active hero/read model,
- staff/admin entry visibility from current role/access policy,
- CSS visibility must not be access control.

**UI/SCSS rules:**
- active nav style global/shared,
- no local sidebar CSS per route,
- icon placeholders can be used only where custom icon key missing.

**Dependencies/blockers:**
- if route/access info not available, report dependency and avoid fake links,
- if route does not exist, hide/disable according to existing project convention.

**Acceptance criteria:**
- sidebar groups match accepted IA,
- active route visually clear,
- staff/admin entry separated from player navigation,
- inaccessible routes not exposed as working links,
- build passes.

**Verification/smoke:**
- route smoke for key player routes,
- visual smoke active state,
- access smoke for non-staff vs staff if possible.

**Required Codex report:**
- reused navigation/shell components:
- access source:
- routes checked:
- new links added/omitted:

## UI-SHELL-5 — Persistent state widget boundary

**Goal:**  
Zdefiniować, które długotrwałe stany gracza mogą pojawiać się w dashboard/shell jako persistent state, bez tworzenia fake action queue.

**Scope:**
- identify existing real persistent states:
  - exploration in progress,
  - building job active,
  - pending report/notification indicator,
  - pending trade offers if needed,
- define where they appear: dashboard panel, topbar indicator, route-specific card,
- avoid central action queue unless real backend/read model exists.

**Out of scope:**
- building full action queue,
- timers for every possible system,
- PvP combat timer implementation,
- fake polling/local timers without read model.

**Data/source rules:**
- each persistent state must come from a real read model/service,
- if no read model exists, report dependency and do not render fake production state,
- notifications/reports use UI-REPORTS read models when available.

**UI/SCSS rules:**
- use shared note/status/card pattern,
- no local timer/progress styling if global progress/timer pattern exists,
- status text not muted if action needed.

**Dependencies/blockers:**
- missing read model for a state -> dependency,
- unclear ownership of timers -> design question.

**Acceptance criteria:**
- shell/dashboard can show real persistent state without fake queue,
- action-needed states are visually clear,
- no duplicated module navigation,
- build passes if implemented.

**Verification/smoke:**
- visual smoke with at least one mocked/dev/read state if available,
- no-data state smoke,
- build/tsc.

**Required Codex report:**
- persistent states found:
- read models used:
- states intentionally not added:
- local SCSS added:

---

# 8. UI-HERO — Statistics and character growth

Cel: stat allocation, base stats, derived preview i Character Points spending UI. UI-HERO musi respektować istniejący canonical stat allocation workflow i nie może direct-write hero stats/CP.

## UI-HERO task index

- UI-HERO-1 — Hero statistics page
- UI-HERO-2 — Derived stat delta preview
- UI-HERO-3 — Stat allocation draft and save flow
- UI-HERO-4 — Character Points summary placement

## UI-HERO-1 — Hero statistics page

**Goal:**  
Zbudować Statistics/Hero stats page jako player-facing ekran rozdawania base stats i podglądu derived stats.

**Scope:**
- route/page target: existing hero/statistics route if present, otherwise report target route proposal,
- header/title: `Base stats allocation`,
- same-line CP summary: Character Points, Draft spent, Remaining after save,
- helper/description under title,
- base stats list/grid with current value and draft controls,
- derived stats preview below or beside allocation panel,
- save/reset controls,
- validation/error display.

**Out of scope:**
- DB stat model redesign,
- XP/level-up workflow,
- admin stat correction,
- direct writes to `hero_stats`, `hero.character_points`, `character_point_ledger`, audit tables,
- full equipment management.

**Data/source rules:**
- current stat values from active hero stat read model,
- CP balance from active hero/progression read model,
- save through canonical `save_stat_allocation(...)` or current frontend service wrapping it,
- stat labels/descriptions from DB-backed stat definitions/dictionaries where available,
- do not assume `hero.id === auth.uid()`.

**UI/SCSS rules:**
- use global page header/card/stat/list patterns,
- CP summary must not be duplicated elsewhere on the page,
- `muted-text` only for helper copy, not CP values or validation outcomes,
- no local stat card CSS copied from prototype.

**Dependencies/blockers:**
- if canonical stat allocation service/RPC is missing or incompatible, report blocker,
- if derived preview service is missing, keep save flow and report preview dependency.

**Acceptance criteria:**
- page displays base stats and CP summary in accepted placement,
- draft allocation can be represented without saving immediately,
- invalid drafts disable save or show clear validation,
- save uses canonical workflow,
- no duplicate CP summary,
- build passes.

**Verification/smoke:**
- route smoke for statistics page,
- draft + reset smoke,
- invalid CP overspend smoke,
- save smoke if backend/test data available; otherwise pending manual smoke,
- build/tsc.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- stat/CP data source:
- save path:
- local SCSS added:
- not added intentionally:

## UI-HERO-2 — Derived stat delta preview

**Goal:**  
Pokazać, jak derived stats zmienią się po zapisaniu aktualnego draftu stat allocation.

**Scope:**
- current derived value,
- after-save derived value,
- delta indicator,
- strengthened/boosted visual treatment where value changes,
- clear distinction between base/current and preview/draft,
- support item/equipment/bonus-aware runtime if available.

**Out of scope:**
- formula redesign,
- DB persistence of preview,
- local hardcoded derived formulas,
- equipment equip/unequip workflow.

**Data/source rules:**
- use current runtime derived stats resolver/service where available,
- if runtime resolver already accounts for items/bonuses/equipment, use it,
- if not, report limitation and do not fake item-aware calculations,
- do not use legacy `hero_derived` as runtime source if current decisions say it is not source of truth.

**UI/SCSS rules:**
- derived preview uses shared stat/summary pattern,
- deltas visually clear but not overcolored,
- boosted values use accepted gold/accent treatment,
- `muted-text` only for labels/help, not changed values.

**Dependencies/blockers:**
- missing resolver hook for draft preview -> dependency,
- missing equipment bonus runtime -> limitation/dependency.

**Acceptance criteria:**
- derived current/preview/delta shown clearly,
- preview updates with draft changes if implementation has runtime support,
- no fake formulas,
- missing runtime support reported honestly,
- build passes.

**Verification/smoke:**
- draft stat increment changes preview where supported,
- reset returns preview to current,
- no-data/loading state smoke,
- build/tsc.

**Required Codex report:**
- reused runtime resolver:
- checked but not reused:
- limitations:
- local SCSS added:

## UI-HERO-3 — Stat allocation draft and save flow

**Goal:**  
Ujednolicić draft state, validation and save UX dla stat allocation.

**Scope:**
- local draft state for plus/minus stat changes,
- computed draft spent,
- computed remaining after save,
- stat cost display if available,
- save/reset actions,
- stale guards around async save,
- success/error feedback using toast/messages according to project patterns.

**Out of scope:**
- changing stat cost formulas,
- changing CP ledger semantics,
- granting XP/level-up CP,
- admin correction tools.

**Data/source rules:**
- save through canonical stat allocation operation/RPC,
- no direct update to stat/hero/ledger/audit tables,
- async save must guard against active hero/server change,
- after save, refresh active hero/stat/CP state through existing services.

**UI/SCSS rules:**
- controls use shared buttons/forms/vendor wrappers,
- validation errors use form messages, not muted helper text,
- no local action card styling if global pattern exists.

**Dependencies/blockers:**
- if existing save service lacks needed return data, report service/RPC limitation,
- if stale guard pattern exists, reuse it; if missing, implement local guard carefully and report.

**Acceptance criteria:**
- draft cannot overspend CP,
- save disabled or blocked when invalid,
- successful save refreshes stats and CP,
- stale responses do not overwrite changed active hero/server context,
- build passes.

**Verification/smoke:**
- draft increment/decrement smoke,
- overspend validation smoke,
- save smoke if data available,
- stale/context change note if not testable,
- build/tsc.

**Required Codex report:**
- reused form/state/save service:
- checked but not reused:
- new state/helper added:
- stale guard approach:
- local SCSS added:

## UI-HERO-4 — Character Points summary placement

**Goal:**  
Ustalić i wdrożyć jedną, niedublowaną prezentację Character Points na Statistics page.

**Scope:**
- place Character Points / Draft spent / Remaining after save in same line as `Base stats allocation`,
- description/help text under that line,
- remove duplicated `14 CP available` style blocks if present,
- keep topbar/global CP display only where appropriate and not duplicative.

**Out of scope:**
- changing CP economy,
- CP ledger UI,
- trade CP lock UI,
- XP/CP progression redesign.

**Data/source rules:**
- CP balance from active hero/current progression read model,
- locked CP only if current screen needs it; stats page usually cares about spendable allocation CP,
- no hardcoded CP values.

**UI/SCSS rules:**
- CP values are important values, not `muted-text`,
- use chip/summary inline pattern from UI-CORE,
- avoid local CP badge styling.

**Dependencies/blockers:**
- if active hero CP state is stale after save, link to UI-HERO-3 refresh requirement.

**Acceptance criteria:**
- CP summary appears once in correct placement,
- Draft spent and Remaining after save update with draft,
- no duplicate CP panel,
- build passes.

**Verification/smoke:**
- draft change updates CP summary,
- no duplicate CP visible,
- build/tsc.

**Required Codex report:**
- CP source:
- duplicate UI removed:
- shared pattern used:
- local SCSS added:

---

# 9. UI-ITEMS — Armory, equipment and item display

Cel: armory, equipment preview, stands/sorting, item capacity and shared item popover. UI-ITEMS jest mocno zależne od UI-CORE-6 item popover contract oraz od aktualnego item/equipment read modelu. Nie wolno wymyślać equip/unequip workflow, jeśli DB/RPC go jeszcze nie ma.

## UI-ITEMS task index

- UI-ITEMS-1 — Armory overview and capacity
- UI-ITEMS-2 — Stands sorting UI
- UI-ITEMS-3 — Item popover shared display
- UI-ITEMS-4 — Equipment/paperdoll preview reuse
- UI-ITEMS-5 — Armory item list filtering and visibility

## UI-ITEMS-1 — Armory overview and capacity

**Goal:**  
Zbudować Armory overview pokazujące wyposażenie bohatera oraz listę posiadanych przedmiotów z jasnym rozróżnieniem: ile itemów bohater ma realnie, a ile jest widoczne przez aktualny rozmiar zbrojowni.

**Scope:**
- route/page target: existing armory route/page if present,
- equipment preview consistent with dashboard/paperdoll pattern,
- owned item list/grid,
- visible item count based on armory capacity,
- show real count vs visible capacity, e.g. `270 / 30`,
- item cards/rows with item name, type/slot, key requirements/status, drachma value on separate line,
- item hover/focus/click popover hook,
- empty/loading states.

**Out of scope:**
- equip/unequip workflow unless approved DB/RPC exists,
- item generation/balance admin,
- vendor scrap/sell flow,
- CP valuation for items,
- local item popover implementation if shared one is missing.

**Data/source rules:**
- item ownership/read model from current hero-owned item service,
- use active hero id, not auth uid,
- armory capacity from estate/building/bonus/runtime read model where available,
- if capacity source missing, report dependency and use safe placeholder in prototype only,
- item drachma value from item read model/snapshot, not CP market price.

**UI/SCSS rules:**
- use global item row/card and item popover pattern from UI-CORE,
- value in drachmas displayed on its own line in item card,
- no local copied card/popover CSS,
- item status/requirement warnings use semantic badge/status styling, not muted text.

**Dependencies/blockers:**
- if equip/unequip RPC is missing, keep preview read-only and report blocker for interactive equipment,
- if armory capacity calculation is unavailable, report runtime dependency,
- if shared item popover is missing, link to UI-CORE-6 and avoid local duplicate.

**Acceptance criteria:**
- equipped items and inventory are both visible,
- item capacity distinction visible as real count vs visible count,
- item drachma value appears on separate line,
- hover/focus/click can surface item detail through shared pattern or dependency is reported,
- no fake CP item value,
- build passes.

**Verification/smoke:**
- route smoke for Armory,
- smoke with item count greater than capacity if data/mock available,
- empty inventory smoke,
- item popover smoke if implemented,
- build/tsc.

**Required Codex report:**
- reused item/equipment services:
- capacity source:
- checked but not reused:
- new component/state/helper added:
- local SCSS added:
- not added intentionally:

## UI-ITEMS-2 — Stands sorting UI

**Goal:**  
Dodać stands as armory organization/visibility priority UI: stand 10 has highest visibility priority, stand 1 is default/lowest.

**Scope:**
- 10 stands visible,
- default stand = 1,
- display item groups from stand 10 down to stand 1,
- empty stands visibly present,
- item assignment/stand movement UI if backend/state exists,
- optional drag/drop as UX enhancement only if safe,
- stand labels/names can be shown as editable later but not required now.

**Out of scope:**
- DB schema for named stands if not present,
- persistent drag/drop mutation without approved workflow,
- auto-sorting algorithm beyond display priority,
- hiding empty stands completely.

**Data/source rules:**
- stand assignment must come from item/armory read model if implemented,
- if stand assignment does not exist, render prototype/read-only grouping only or report dependency,
- persistent stand changes must go through canonical RPC/service if available; no direct item updates.

**UI/SCSS rules:**
- stands use shared section/card/list patterns,
- empty stand style must be visible but subtle,
- drag handles/icons from custom icon registry where possible,
- no local drag/drop CSS if project has existing pattern.

**Dependencies/blockers:**
- no stand persistence model -> report DB/read model blocker,
- no drag/drop support pattern -> keep click/select move or postpone.

**Acceptance criteria:**
- all 10 stands represented,
- stand ordering is 10 → 1,
- empty stands visible,
- item visibility priority concept is clear,
- no fake persistent move if backend missing,
- build passes if implemented.

**Verification/smoke:**
- visual smoke with empty and non-empty stands,
- ordering smoke,
- persistence smoke only if backend exists,
- build/tsc.

**Required Codex report:**
- stand data source:
- move/persistence path:
- drag/drop used or deferred:
- local SCSS added:

## UI-ITEMS-3 — Item popover shared display

**Goal:**  
Wprowadzić lub zastosować shared item popover display wszędzie tam, gdzie pojawia się item: Armory, Auction House, Direct Trade, Reports, Rewards.

**Scope:**
- item name with quality/tier,
- item kind and equip slot, e.g. one-handed, two-handed, ranged, shield/offhand, head/chest/ring,
- icon box on right,
- native item stats such as damage/defense,
- bonuses as separate rows,
- requirements and not-equippable state,
- drachma value,
- boosted values visually marked,
- report/trade snapshot compatibility.

**Out of scope:**
- item generation DB changes,
- equip/unequip,
- CP market valuation,
- per-feature tooltip CSS,
- exposing private/staff-only item metadata in player UI.

**Data/source rules:**
- item stats/bonuses/requirements from item read model or snapshot,
- report/trade popovers must use durable snapshot/fallback when historical,
- no live recompute of historical item value if report snapshot exists,
- no CP value as inherent item value.

**UI/SCSS rules:**
- use PrimeNG popover/tooltip wrapper or shared overlay pattern,
- no duplicate local popover styles,
- icon placeholder via custom icon registry/fallback,
- boosted values use gold/accent treatment, not generic success green unless semantically appropriate.

**Dependencies/blockers:**
- missing resolved item stats -> report data dependency,
- missing shared popover -> implement through UI-CORE-6 or report blocker,
- missing requirements read model -> show safe partial and report gap.

**Acceptance criteria:**
- item popover shows all required categories when data exists,
- damage displayed as item stat, not only as bonus,
- bonuses remain visible separately,
- boosted values distinguish base vs boosted,
- no CP valuation,
- build passes.

**Verification/smoke:**
- hover/focus smoke for one item,
- not-equippable example smoke if data available,
- report/trade item smoke if integrated,
- build/tsc.

**Required Codex report:**
- item data source:
- popover/wrapper reused:
- missing fields:
- local SCSS added:

## UI-ITEMS-4 — Equipment/paperdoll preview reuse

**Goal:**  
Ujednolicić equipment/paperdoll preview między Dashboard, Armory i przyszłymi report/combat contexts.

**Scope:**
- main hand/off hand order: main hand first, off hand second,
- visible equipment slots,
- equipped item compact display,
- empty slot display,
- item popover on equipped item,
- read-only preview unless equip workflow exists.

**Out of scope:**
- equip/unequip mutation,
- combat equipment snapshot persistence,
- defender private equipment reveal in PvP reports.

**Data/source rules:**
- read equipped items from current equipment/read model,
- if equipment model exists but equip RPC missing, preview remains read-only,
- report/combat contexts use snapshots/allowed labels, not live/private data.

**UI/SCSS rules:**
- shared paperdoll/equipment component or global pattern,
- no local duplicate equipment slot styling,
- empty slot state visible.

**Dependencies/blockers:**
- missing equipment read model -> dependency,
- missing item popover -> dependency on UI-CORE-6.

**Acceptance criteria:**
- Dashboard and Armory can reuse same preview pattern,
- main/off hand order correct,
- empty slots clear,
- no fake equip actions,
- build passes.

**Verification/smoke:**
- visual smoke with equipped and empty slots,
- item popover smoke,
- build/tsc.

**Required Codex report:**
- equipment source:
- shared component reused/added:
- mutation intentionally not added:
- local SCSS added:

## UI-ITEMS-5 — Armory item list filtering and visibility

**Goal:**  
Dodać podstawowe, rozsądne filtrowanie itemów w Armory bez komplikowania inventory UI.

**Scope:**
- filters by slot/kind, equippable/not equippable, stand, search,
- visible count respects armory capacity and stand priority,
- pagination/scrolling if item count large,
- row/card states for locked_trade, locked_auction, scrapped hidden from normal inventory where appropriate.

**Out of scope:**
- advanced sorting economy tools,
- auction/direct trade creation from Armory unless explicitly routed,
- vendor scrap UI unless separate task.

**Data/source rules:**
- item statuses from item lifecycle read model,
- normal inventory hides scrapped items,
- locked trade/auction states are visible if relevant and not selectable for equip/trade actions,
- no direct item writes.

**UI/SCSS rules:**
- use shared filters/paginator/list patterns,
- do not build local dense item table unless UI-CORE-14 chooses table for this context,
- important lock/equippable states use badges/status pills.

**Dependencies/blockers:**
- if read model lacks status/stand/equippable fields, report dependency,
- if item count pagination missing, use safe client display only for prototype or report service gap.

**Acceptance criteria:**
- filters are clear and not overbuilt,
- visible items respect capacity/stand priority,
- locked/scrapped handling follows lifecycle rules,
- build passes.

**Verification/smoke:**
- filter smoke,
- locked item display smoke if data exists,
- large list smoke if available,
- build/tsc.

**Required Codex report:**
- item filter data source:
- lifecycle statuses handled:
- paginator/list pattern used:
- local SCSS added:

---

# 10. UI-EXPLORATION — Exploration flow

Cel: difficulty choice, trial detail, progress timer/modal, direction choice, result/report boundary. Exploration UI musi rozróżniać start flow, progress state, trial/encounter challenge and report result. Nie wolno budować fake mapy ani fake action queue.

## UI-EXPLORATION task index

- UI-EXPLORATION-1 — Exploration start/difficulty screen
- UI-EXPLORATION-2 — Trial detail by stat
- UI-EXPLORATION-3 — Exploration timer/modal and inline state
- UI-EXPLORATION-4 — Direction choice and step state
- UI-EXPLORATION-5 — Result/report boundary

## UI-EXPLORATION-1 — Exploration start/difficulty screen

**Goal:**  
Zbudować czytelny start screen do wyboru difficulty i rozpoczęcia exploration, bez udawania mapy/story systemu, którego nie ma.

**Scope:**
- route/page target: existing exploration route if present,
- difficulty cards/list,
- available attempts/daily counters if read model exists,
- current exploration state if already in progress,
- clear start action,
- helper copy explaining difficulty impact,
- disabled/locked difficulty states if backend/read model provides them.

**Out of scope:**
- full branching map,
- trial challenge implementation,
- encounter result screen,
- reward persistence,
- fake timer if backend state missing.

**Data/source rules:**
- difficulty/dictionary labels from DB/read model if available,
- active hero/server context required,
- start action must use canonical exploration RPC/service if exists,
- no hardcoded permanent difficulty lists if DB exists.

**UI/SCSS rules:**
- use global card/page header/button patterns,
- difficulty cards should not become separate local card system,
- locked/disabled states use semantic badges/status, not opacity only.

**Dependencies/blockers:**
- if exploration start RPC/read model missing, render planning/prototype surface only and report blocker,
- if daily action counters missing, do not fake counters.

**Acceptance criteria:**
- player can understand/select difficulty where supported,
- unavailable choices are clearly disabled/blocked,
- no fake map,
- start action not direct-write,
- build passes.

**Verification/smoke:**
- route smoke,
- difficulty selection smoke,
- start action smoke if backend exists; otherwise pending manual/dependency,
- build/tsc.

**Required Codex report:**
- difficulty source:
- start workflow source:
- checked but not reused:
- local SCSS added:

## UI-EXPLORATION-2 — Trial detail by stat

**Goal:**  
Pokazać trial detail z jasnym rozdzieleniem manifestation chance i auto-result success chance według konkretnej statystyki.

**Scope:**
- trial type/label,
- tested stat,
- manifestation chance display,
- auto-result success chance display,
- manual challenge entry if needed,
- stat contribution/explanation,
- clear failure/success state placeholders if result already known.

**Out of scope:**
- final minigame implementations,
- combat challenge UI,
- reward granting,
- local chance calculations if backend/read model owns them.

**Data/source rules:**
- trial definitions, tested stat, minigame, labels from DB-backed definitions/dictionaries,
- chance values from backend/read model if available,
- if chance values missing, show dependency rather than fake formulas,
- no hardcoded stat list if stats dictionary exists.

**UI/SCSS rules:**
- two separate visual bars/rows for manifestation and auto-result,
- labels must make difference obvious,
- use shared progress/bar/stat patterns if available,
- important probabilities not muted.

**Dependencies/blockers:**
- missing chance read model -> blocker/dependency,
- missing minigame route -> show route pending, not fake.

**Acceptance criteria:**
- manifestation and auto-result are not conflated,
- tested stat visible,
- labels/descriptions DB-backed where available,
- no fake chance math,
- build passes.

**Verification/smoke:**
- visual smoke for one trial,
- missing-data state smoke,
- build/tsc.

**Required Codex report:**
- trial data source:
- chance source:
- DB labels/metadata used:
- local SCSS added:

## UI-EXPLORATION-3 — Exploration timer/modal and inline state

**Goal:**  
Pokazać exploration progress timer jako modal first, a po dismiss jako inline persistent progress state.

**Scope:**
- modal with timer/progress when exploration step starts,
- dismiss action moves progress to inline panel/card,
- inline state shows time remaining / check result availability,
- route back to current exploration state,
- safe stale/loading/error handling.

**Out of scope:**
- global action queue,
- timers for unrelated systems,
- fake local-only timer as production state,
- combat/PvP timers.

**Data/source rules:**
- timer state from exploration read model/service,
- if timer is backend-owned, frontend countdown is display only,
- stale guard if active hero/server changes,
- no localStorage permanent gameplay state.

**UI/SCSS rules:**
- modal/dialog through PrimeNG/vendor wrapper,
- progress/timer through global/shared pattern,
- inline state uses persistent state pattern from UI-SHELL-5,
- action-needed state not muted.

**Dependencies/blockers:**
- missing timer read model -> dependency,
- missing modal/vendor wrapper -> use existing PrimeNG dialog wrapper or report gap.

**Acceptance criteria:**
- modal appears at start where state exists,
- dismiss leaves inline progress visible,
- check result action appears only when available,
- no fake action queue,
- build passes.

**Verification/smoke:**
- modal open/dismiss smoke,
- inline progress smoke,
- completed timer/check result smoke if data available,
- build/tsc.

**Required Codex report:**
- timer data source:
- dialog/progress wrapper reused:
- stale guard approach:
- local SCSS added:

## UI-EXPLORATION-4 — Direction choice and step state

**Goal:**  
Zaprojektować/zaimplementować ekran wyboru kierunku po kroku exploration, jeśli backend/read model go wspiera.

**Scope:**
- current exploration scene/step summary,
- up to three direction choices,
- direction labels/descriptions,
- disabled/locked states if any,
- action starts next wait/timer,
- link to report/result when step resolved.

**Out of scope:**
- procedural map generation,
- story authoring system,
- fake branching if backend has no choices,
- reward result UI.

**Data/source rules:**
- direction choices from exploration read model/backend,
- if no direction model exists, report dependency and keep prototype only,
- mutations through canonical exploration service/RPC,
- active hero/server guard required.

**UI/SCSS rules:**
- choice cards use shared card/action pattern,
- direction arrows/icons from custom icon registry or placeholders in prototype only,
- no local map CSS.

**Dependencies/blockers:**
- missing choice read model -> dependency,
- missing next-step RPC -> dependency.

**Acceptance criteria:**
- direction choices are readable,
- max three choices supported,
- unavailable choices clear,
- next action starts proper state where backend exists,
- build passes.

**Verification/smoke:**
- choice selection smoke if backend exists,
- no-choice/loading state smoke,
- build/tsc.

**Required Codex report:**
- direction data source:
- mutation path:
- missing backend notes:
- local SCSS added:

## UI-EXPLORATION-5 — Result/report boundary

**Goal:**  
Ustalić UI boundary między exploration result summary a pełnym reportem.

**Scope:**
- trial result summary,
- encounter result summary,
- reward summary,
- item drops with shared item popovers,
- Open full report action,
- Continue exploration / return actions where backend supports them.

**Out of scope:**
- full report route implementation if handled by UI-REPORTS,
- live recomputation of historical results,
- reward granting logic,
- permanent local result storage.

**Data/source rules:**
- result from durable backend result/read model,
- report from game report snapshot/source where available,
- item drops through item read model or report references,
- no live recompute of historical rewards.

**UI/SCSS rules:**
- use shared report/result summary pattern,
- item popovers via UI-CORE-6,
- success/failure outcomes use badges/status, not just color text.

**Dependencies/blockers:**
- if report generation not implemented, show result summary and report dependency,
- if reward snapshot missing, report data gap.

**Acceptance criteria:**
- result summary is readable,
- full report handoff clear,
- item drops show shared popover where possible,
- no recompute/fake report,
- build passes.

**Verification/smoke:**
- result summary smoke with sample/read data,
- full report link smoke if available,
- item popover smoke,
- build/tsc.

**Required Codex report:**
- result data source:
- report source/link:
- item popover reused:
- limitations:

---

# 11. UI-ESTATE — Estate, buildings and vicinity

Cel: estate overview, building cards, active building job, build action boundary and future vicinity/list entry. Estate UI musi pokazywać budynki dostępne dla aktualnego district context i nie może oferować cancel/claim, jeśli gameplay decyzje tego nie przewidują.

## UI-ESTATE task index

- UI-ESTATE-1 / formerly UI-23 — Estate overview
- UI-ESTATE-2 / formerly UI-24 — Building cards and district grouping
- UI-ESTATE-3 / formerly UI-25 — Active building job panel
- UI-ESTATE-4 / formerly UI-26 — Build action RPC boundary
- UI-ESTATE-5 / formerly UI-27 — Estate list / vicinity entry boundary

## UI-ESTATE-1 / formerly UI-23 — Estate overview

**Goal:**  
Zbudować Estate overview jako player-facing ekran posiadłości z budynkami dostępnymi w aktualnym district context, active building job i build actions.

**Scope:**
- route/page target: existing estate route/page if present,
- page header with estate/address context,
- available building summary,
- building cards/grid,
- current level,
- current bonus/effect,
- next level bonus/effect,
- next level build time,
- next level cost,
- build button/action where eligible,
- active building job shown prominently if one exists,
- link/entry to estate list/vicinity if present in navigation.

**Out of scope:**
- cancel building job player action,
- claim/collect completed building job if DB finalizes lazily,
- building admin/configurator,
- DB schema changes,
- fake production values if backend/read model missing.

**Data/source rules:**
- estate data from active hero/selected server estate read model,
- address source should use `district_code + address_number` where current decisions require it,
- building definitions and current levels from canonical building/estate services,
- costs/time/requirements from DB/read model/formula preview where available,
- no direct writes to estate/building tables.

**UI/SCSS rules:**
- use shared page header/card/stat/note patterns,
- building image/placeholder uses global image/card pattern,
- no local repeated building-card CSS if global card pattern can cover it,
- no player-facing technical copy like “one estate per hero”.

**Dependencies/blockers:**
- if build execution RPC is missing, show read-only/disabled action and report dependency,
- if active job read model missing, report dependency,
- if cost/time preview missing, show safe partial and report data gap.

**Acceptance criteria:**
- estate overview shows available buildings for current context,
- each building card shows current level, bonus, next build time/cost where data exists,
- active job visible if present,
- no Cancel button/copy,
- no fake claim/collect flow,
- build passes.

**Verification/smoke:**
- route smoke for Estate,
- visual smoke with active job and without active job if data possible,
- disabled/ineligible build smoke,
- build/tsc.

**Required Codex report:**
- reused estate/building services:
- cost/time source:
- active job source:
- checked but not reused:
- local SCSS added:

## UI-ESTATE-2 / formerly UI-24 — Building cards and district grouping

**Goal:**  
Pokazać budynki według district availability, tak aby district B mógł pokazywać budynki z A+B, a wyższe district contexts mogły rozszerzać dostępność.

**Scope:**
- building grouping/sections by source district or availability band,
- available buildings count,
- visual distinction between current district and inherited lower-district buildings,
- building cards with image/placeholder, current level, next cost/time/effect,
- desktop-first grid, mobile later as responsive fallback,
- link to estate list/vicinity where relevant.

**Out of scope:**
- player-facing copy about internal district logic,
- building district cap editor,
- admin building configuration,
- new DB schema for district grouping.

**Data/source rules:**
- `buildings.district_code` is minimum district where building is available,
- building available in that district and higher districts unless current DB says otherwise,
- level caps/requirements from read model/canonical building services,
- no hardcoded permanent building list if DB definitions exist.

**UI/SCSS rules:**
- use section/card/chip patterns,
- avoid badge copy like “A+B buildings available” if it reads technical/player-hostile,
- show “Available buildings” or more player-facing label instead of “Buildings on”.

**Dependencies/blockers:**
- if district availability resolver missing, report dependency,
- if building images/assets missing, use consistent placeholder and report asset gap.

**Acceptance criteria:**
- district B example can show A+B building availability,
- buildings outside available districts are not shown,
- grouping is understandable without technical jargon,
- build passes.

**Verification/smoke:**
- visual smoke for district A and B contexts if data available,
- empty/no-buildings smoke,
- build/tsc.

**Required Codex report:**
- building availability source:
- grouping logic source:
- image/asset fallback:
- local SCSS added:

## UI-ESTATE-3 / formerly UI-25 — Active building job panel

**Goal:**  
Pokazać aktywną budowę w estate UI bez sugerowania cancel/claim, jeśli te akcje nie są player-facing.

**Scope:**
- active job card/panel,
- building name/image/icon,
- target level,
- started/remaining/completes at,
- cost summary if useful,
- progress bar/timer,
- link/highlight matching building card,
- completed state messaging if backend surfaces completed but not finalized.

**Out of scope:**
- cancel action,
- claim/collect action,
- multi-job queue unless backend supports it,
- action queue dashboard.

**Data/source rules:**
- active job from canonical estate_building_job read model/service,
- status labels from DB enum/read model where available,
- timer is display-only if backend owns completion,
- no local mutation to mark job completed.

**UI/SCSS rules:**
- use global progress/timer/status card pattern,
- active job must be visually clear but not oversized,
- completed/failed/cancelled internal statuses should be handled safely without player-facing cancel flow.

**Dependencies/blockers:**
- missing active job read model -> dependency,
- missing timer/progress global pattern -> link to UI-CORE/shell persistent state.

**Acceptance criteria:**
- active job visible when present,
- no cancel UI,
- progress/remaining time displayed where data exists,
- state remains safe if no active job,
- build passes.

**Verification/smoke:**
- active job smoke,
- no active job smoke,
- completed job edge smoke if available,
- build/tsc.

**Required Codex report:**
- active job source:
- timer/progress pattern reused:
- statuses handled:
- not added intentionally:

## UI-ESTATE-4 / formerly UI-26 — Build action RPC boundary

**Goal:**  
Upewnić się, że Build action w Estate przechodzi przez canonical DB/RPC workflow, z właściwymi disabled states i feedbackiem.

**Scope:**
- build button on eligible building cards,
- disabled states for missing requirements/resources/active job/max level,
- cost/requirement display,
- canonical build RPC/service call where available,
- success toast / inline error using PrimeNG/vendor wrappers,
- stale guard if active hero/server changes.

**Out of scope:**
- direct writes to estate/building/job/resource tables,
- cancel/claim actions,
- cost formula redesign,
- admin build correction.

**Data/source rules:**
- build action through existing canonical RPC/service only,
- requirement/cost validation from backend/read model,
- frontend preview is explanatory and not authority,
- after success refresh estate/job/resources through existing services.

**UI/SCSS rules:**
- use shared buttons/messages/toasts/vendor wrappers,
- blocked reason visible and not muted if action is blocked,
- no local loading button CSS if shared pattern exists.

**Dependencies/blockers:**
- if canonical build RPC/service missing, report blocker and do not implement fake mutation,
- if requirements read model missing, show safe disabled state/dependency.

**Acceptance criteria:**
- build button only enabled when read model says eligible,
- action uses canonical workflow,
- stale success/error cannot update wrong hero/server context,
- resources/job refresh after success,
- build passes.

**Verification/smoke:**
- route smoke,
- disabled build smoke,
- build action smoke if backend/test data available,
- stale/context note if not testable,
- build/tsc.

**Required Codex report:**
- build RPC/service used:
- requirement/cost source:
- stale guard approach:
- local SCSS added:
- not added intentionally:

## UI-ESTATE-5 / formerly UI-27 — Estate list / vicinity entry boundary

**Goal:**  
Zdefiniować granicę między własnym Estate overview a listą posiadłości/vicinity, która może służyć wejściu do PvP target selection i world browsing.

**Scope:**
- entry/link from Estate to estate list/vicinity if route exists,
- short orientation copy,
- clarify that own estate view is not the full vicinity list,
- if estate list route exists: show lightweight navigation slot,
- if route missing: show no fake working link or mark pending by project convention.

**Out of scope:**
- full estate list implementation,
- PvP target selection implementation,
- ranking/vicinity table,
- siege/spy actions.

**Data/source rules:**
- estate list/vicinity data comes from server estate read model if implemented,
- no hardcoded estate list,
- PvP target actions belong to UI-PVP tasks.

**UI/SCSS rules:**
- link/card uses global navigation/entry pattern,
- avoid confusing labels like technical “Buildings on”,
- no second sidebar/duplicated nav.

**Dependencies/blockers:**
- if estate list route missing, report future route/UX dependency,
- if PvP vicinity is the intended route, link only when available and gated.

**Acceptance criteria:**
- user can see how Estate relates to wider estate list/vicinity,
- no fake list rendered without data,
- no PvP actions on Estate overview unless explicitly part of route,
- build passes if code changed.

**Verification/smoke:**
- link smoke if route exists,
- no-link/pending state smoke if route missing,
- build/tsc.

**Required Codex report:**
- route/link checked:
- read model availability:
- not added intentionally:
- local SCSS added:

---

# 12. UI-TRADE — Auction House and Direct Trade

Cel: osobne player-facing ekrany Auction House i Direct Trade, zgodne z CP economy, item lock rules, market slot rules i anti-abuse/audit boundaries. Trade UI nie może direct-write item/auction/trade/CP tables.

## UI-TRADE task index

- UI-TRADE-1 / formerly UI-29 — Auction House one-item listing browser
- UI-TRADE-2 / formerly UI-30 — Auction filters, summary and pagination
- UI-TRADE-3 / formerly UI-32 — Auction actions through canonical RPC/domain paths
- UI-TRADE-4 / formerly UI-33 — Direct Trade offer builder
- UI-TRADE-5 / formerly UI-34 — Direct Trade pending offers with pagination
- UI-TRADE-6 / formerly UI-35 — Trade market slot summary
- UI-TRADE-7 / formerly UI-36 — Direct Trade create offer RPC workflow
- UI-TRADE-8 / formerly UI-37 — Direct Trade target response UI
- UI-TRADE-9 / formerly UI-38 — Trade item display and popover integration

## UI-TRADE-1 / formerly UI-29 — Auction House one-item listing browser

**Goal:**  
Zbudować Auction House listing browser jako osobny ekran od Direct Trade. Auction listing pokazuje maksymalnie jeden item i CP-based price/bid actions.

**Scope:**
- route/page target: existing auction/trade route if present,
- listing list/table/card pattern per UI-CORE-14 decision,
- one item per listing,
- item name with shared item popover,
- current bid in Character Points,
- buy now amount in Character Points if available,
- auction mode: bidding, buy now, bidding with buy now,
- actions:
  - bidding listing: Bid, Watch, Buy now if available,
  - buy-now-only listing: Buy,
- seller/listing metadata,
- pagination.

**Out of scope:**
- Direct Trade builder,
- bundle/set auctions,
- drachma pricing for player-to-player trade,
- create listing flow unless separate task,
- anti-abuse case UI.

**Data/source rules:**
- listings from auction read model/service,
- item display from item snapshot/read model,
- prices/bids in Character Points only,
- drachmas may appear only as item inherent/vendor value in popover, not trade price,
- no direct writes to auction/item/CP tables.

**UI/SCSS rules:**
- use PrimeNG paginator/table or global list pattern per UI-CORE-14,
- item hover/focus uses shared popover,
- actions use shared buttons/action icons,
- status/requirements as badges/status pills.

**Dependencies/blockers:**
- if auction read model/service missing, report blocker,
- if item popover missing, link UI-CORE-6 dependency,
- if watch action unsupported, omit or mark pending, do not fake.

**Acceptance criteria:**
- auction and direct trade are visually/route-separated,
- one item per listing,
- CP displayed for bid/buy now,
- no drachma P2P price,
- actions match auction mode,
- pagination visible,
- build passes.

**Verification/smoke:**
- route smoke,
- listing render smoke,
- mode/action smoke for bidding vs buy-now,
- item popover smoke,
- build/tsc.

**Required Codex report:**
- auction read model used:
- item popover reused:
- paginator/list pattern:
- unsupported actions omitted:
- local SCSS added:

## UI-TRADE-2 / formerly UI-30 — Auction filters, summary and pagination

**Goal:**  
Dodać wygodne filtrowanie i paginację dla Auction House bez tworzenia niemożliwych filtrów albo fake danych.

**Scope:**
- filters by item category/slot/kind,
- equippable / not equippable / requirements warning if read model supports it,
- auction mode filter,
- search by item/seller/listing where available,
- summary cards/chips: available CP, locked CP, active bids, your listings,
- page controls and current range.

**Out of scope:**
- advanced market analytics,
- price history,
- sorting by hidden item usefulness,
- local fake counts.

**Data/source rules:**
- filter options from dictionaries/read models where available,
- available/locked CP from Character Point read model/locks,
- active bids/listings from auction service,
- if read model does not support a filter, do not show it as functional.

**UI/SCSS rules:**
- filters use PrimeNG/vendor inputs/selects/chips,
- pagination uses project/PrimeNG paginator pattern if available,
- no local custom paginator unless justified by UI-CORE-14.

**Dependencies/blockers:**
- missing pagination in service -> report service dependency,
- missing CP lock summary -> show only available CP and report gap.

**Acceptance criteria:**
- filters are functional or clearly omitted,
- summary values are not hardcoded,
- pagination shows current range/page,
- no filter implies unavailable backend behavior,
- build passes.

**Verification/smoke:**
- filter change smoke,
- pagination smoke,
- empty result smoke,
- build/tsc.

**Required Codex report:**
- filters source:
- CP/lock source:
- pagination source:
- filters omitted intentionally:

## UI-TRADE-3 / formerly UI-32 — Auction actions through canonical RPC/domain paths

**Goal:**  
Podpiąć/wyznaczyć granicę dla Auction House actions przez canonical domain/RPC paths.

**Scope:**
- bid action,
- buy now action,
- watch action only if supported,
- disabled/blocked states,
- confirmation where needed,
- success/error feedback,
- refresh listing/CP locks after action,
- stale guard if active hero/server changes.

**Out of scope:**
- direct table writes,
- new auction RPCs unless task explicitly includes backend,
- create listing flow,
- anti-abuse admin review.

**Data/source rules:**
- use existing auction mutation service/RPC,
- CP locks/refunds reflected from backend read model,
- no direct `items`, `player_auction_*`, `character_point_*` mutations,
- active hero/server context required.

**UI/SCSS rules:**
- shared buttons/confirm/toast/messages,
- error states not muted,
- no local dialog CSS.

**Dependencies/blockers:**
- if action RPC missing, report blocker and leave disabled/pending,
- if watch unsupported, omit.

**Acceptance criteria:**
- actions call canonical paths,
- invalid/blocked actions disabled or show backend error cleanly,
- state refreshes after success,
- stale responses ignored if context changed,
- build passes.

**Verification/smoke:**
- bid smoke if backend/test data available,
- buy now smoke if available,
- blocked insufficient CP smoke,
- build/tsc.

**Required Codex report:**
- RPC/service used:
- locks/refunds source:
- stale guard:
- unsupported actions:

## UI-TRADE-4 / formerly UI-33 — Direct Trade offer builder

**Goal:**  
Zbudować Direct Trade offer builder, w którym creator wybiera wyłącznie własne itemy i własne Character Points. Creator nie może żądać konkretnych itemów/CP od targeta.

**Scope:**
- route/page target: Direct Trade route or Trade route tab,
- target hero search/select,
- creator item selection 0–5,
- creator CP amount,
- offer note/message,
- creator side preview,
- target response placeholder,
- item popover on selected items,
- rules/helper panel explaining creator side vs target response,
- validation: item count, CP amount, target required.

**Out of scope:**
- target inventory browsing,
- requested item/CP UI,
- CP-only-for-CP-only explanation in main UI unless backend error requires it,
- auction UI,
- direct writes.

**Data/source rules:**
- target hero search from server-scoped hero search/read service,
- creator items from active hero inventory with eligible statuses,
- creator CP from active hero/CP read model,
- create action through canonical direct trade RPC/service,
- no direct write to trade/item/CP tables.

**UI/SCSS rules:**
- use shared item row/popover,
- use vendor form inputs/selects,
- target response panel visibly empty until target answers,
- no local copied prototype CSS.

**Dependencies/blockers:**
- missing hero search -> report dependency,
- missing direct trade create service/RPC -> report blocker,
- missing item eligibility data -> show safe disabled selection and report gap.

**Acceptance criteria:**
- no requested item/CP UI exists,
- target response placeholder is clear,
- creator can select up to five own eligible items,
- CP validation prevents overspend,
- create offer uses canonical workflow,
- build passes.

**Verification/smoke:**
- route smoke,
- target select smoke,
- item selection count smoke,
- CP overspend smoke,
- create smoke if backend data available,
- build/tsc.

**Required Codex report:**
- target search source:
- item eligibility source:
- CP source:
- create RPC/service:
- local SCSS added:

## UI-TRADE-5 / formerly UI-34 — Direct Trade pending offers with pagination

**Goal:**  
Pokazać pending direct trade offers jako paged list, maksymalnie pięć widocznych na panel/stronę.

**Scope:**
- pending offers list,
- total count,
- page controls,
- statuses: pending target, pending creator, incoming, expires soon, completed/rejected if included by filter,
- selected offer detail summary,
- incoming empty offer state does not block market slot,
- action entry points where supported: respond, review, cancel own offer if backend supports it.

**Out of scope:**
- full response builder if handled by UI-TRADE-8,
- fake cancel if no backend action,
- auction listings.

**Data/source rules:**
- offers from direct trade read model/service,
- market slot blocking from backend/read model if available,
- incoming empty offers must not be counted as blocking creator’s slot unless backend says otherwise,
- no local status inference that conflicts with backend.

**UI/SCSS rules:**
- use shared list/pagination/status patterns,
- pagination should fit pending panel width,
- status labels as badges/pills, not muted text.

**Dependencies/blockers:**
- missing pagination/read model -> report dependency,
- missing slot impact info -> report limitation.

**Acceptance criteria:**
- five visible offers per page,
- total pending count visible,
- empty incoming offer does not visually block slot,
- statuses clear,
- build passes.

**Verification/smoke:**
- pagination smoke,
- selected offer smoke,
- empty incoming offer smoke if data available,
- build/tsc.

**Required Codex report:**
- pending offers source:
- pagination source:
- slot impact source:
- local SCSS added:

## UI-TRADE-6 / formerly UI-35 — Trade market slot summary

**Goal:**  
Pokazać market slot budget i CP lock context w sposób zrozumiały dla gracza.

**Scope:**
- available CP,
- locked CP,
- market slots,
- remaining slots,
- helper/tooltip explaining that direct offers, active auction listings and active winning bids share slot budget for now,
- slot impact in Direct Trade and Auction House screens.

**Out of scope:**
- building/Trade Routes design changes,
- changing slot calculation,
- admin config of slots,
- fake slot numbers.

**Data/source rules:**
- slot limit from trade rules/building/runtime read model where available,
- CP locks from CP lock read model,
- if slot source missing, report dependency and avoid hardcoded production values.

**UI/SCSS rules:**
- summary values important, not muted,
- use shared summary/card/chip patterns,
- helper copy can be muted/secondary but must be readable.

**Dependencies/blockers:**
- missing slot read model -> dependency,
- missing CP lock summary -> partial summary and report gap.

**Acceptance criteria:**
- summary visible on trade screens,
- no confusing technical copy in main UI,
- values sourced or dependency reported,
- build passes.

**Verification/smoke:**
- visual smoke,
- lock/slot values smoke if data available,
- build/tsc.

**Required Codex report:**
- market slot source:
- CP lock source:
- values hardcoded yes/no:
- local SCSS added:

## UI-TRADE-7 / formerly UI-36 — Direct Trade create offer RPC workflow

**Goal:**  
Podpiąć Direct Trade create offer do canonical RPC/service z walidacją, feedbackiem i stale guards.

**Scope:**
- validate target, items 0–5, CP amount,
- call direct trade create RPC/service,
- show success toast and refresh offers/locks/items,
- show inline/form errors for validation/RPC errors,
- stale guard for active hero/server/target changes.

**Out of scope:**
- target response workflow,
- auction create listing,
- direct table writes,
- backend RPC creation unless task explicitly includes backend.

**Data/source rules:**
- canonical direct trade RPC/service only,
- item locks/CP locks backend-owned,
- no direct writes to `items`, trade tables, CP tables,
- refresh active hero/items/offers after success.

**UI/SCSS rules:**
- vendor form messages/toasts,
- no local loading/error CSS if shared pattern exists,
- important RPC errors not muted.

**Dependencies/blockers:**
- missing create RPC/service -> blocker,
- missing lock refresh read model -> report limitation.

**Acceptance criteria:**
- invalid drafts cannot submit,
- successful create locks creator assets via backend,
- stale response guarded,
- UI refreshes after success,
- build passes.

**Verification/smoke:**
- validation smoke,
- create offer smoke if data available,
- failure smoke for insufficient CP/ineligible item if available,
- build/tsc.

**Required Codex report:**
- create RPC/service:
- validation rules:
- refresh paths:
- stale guard:

## UI-TRADE-8 / formerly UI-37 — Direct Trade target response UI

**Goal:**  
Zaprojektować/zaimplementować target-side response UI, gdzie target widzi creator side i wybiera własne itemy/CP jako odpowiedź.

**Scope:**
- show creator committed side from offer snapshot/read model,
- target selects own eligible items 0–5,
- target CP amount,
- accept/respond/reject actions where backend supports them,
- target response preview,
- item popovers,
- validation.

**Out of scope:**
- target seeing creator private inventory beyond offer,
- modifying creator side,
- auction UI,
- direct table writes.

**Data/source rules:**
- creator side from direct trade offer snapshot/read model,
- target items from active hero eligible inventory,
- response through canonical RPC/service,
- no access to other hero inventory except committed offer items.

**UI/SCSS rules:**
- two-side offer layout reusable with builder,
- item popovers shared,
- response statuses as badges/pills.

**Dependencies/blockers:**
- missing response RPC/service -> blocker,
- missing offer snapshot read model -> dependency.

**Acceptance criteria:**
- target can understand creator side,
- target cannot edit creator side,
- response uses canonical path,
- no privacy leak,
- build passes.

**Verification/smoke:**
- open incoming offer smoke,
- response validation smoke,
- accept/reject smoke if backend exists,
- build/tsc.

**Required Codex report:**
- offer snapshot source:
- target item source:
- response RPC/service:
- privacy boundaries:

## UI-TRADE-9 / formerly UI-38 — Trade item display and popover integration

**Goal:**  
Upewnić się, że każdy item w Auction House i Direct Trade korzysta ze shared item display/popover.

**Scope:**
- Auction listing item,
- Direct Trade selected/offered item,
- pending offer item summary,
- report/trade transaction item if present,
- requirements/equippable status,
- drachma value in popover or item row as appropriate.

**Out of scope:**
- CP item valuation,
- local tooltip CSS,
- item generation changes.

**Data/source rules:**
- item display from item read model/snapshot,
- historical transaction items use snapshots where available,
- no live recompute if snapshot exists,
- no private data leakage.

**UI/SCSS rules:**
- UI-CORE-6 shared item popover,
- status/requirements badges,
- no duplicate per-screen item styling.

**Dependencies/blockers:**
- missing shared popover -> dependency,
- missing snapshot data -> report gap and safe fallback.

**Acceptance criteria:**
- item hover/focus detail consistent across trade screens,
- requirements, bonuses and drachma value visible,
- no CP inherent value,
- build passes.

**Verification/smoke:**
- item popover smoke in auction and direct trade,
- not-equippable item smoke if data exists,
- build/tsc.

**Required Codex report:**
- item popover reused:
- item data/snapshot source:
- local CSS avoided:
- missing data fields:

---

# 13. UI-PVP — PvP target selection and future combat boundary

Cel: PvP target selection przez Vicinity/Ranking, z jasną granicą względem właściwego combat screen. UI-PVP target selection nie może zawierać Walking Dead, combat preview, result preview ani combat log. Dostępność akcji musi pochodzić z backend/read modelu.

## UI-PVP task index

- UI-PVP-1 / formerly UI-39 — PvP Vicinity target selection screen
- UI-PVP-2 / formerly UI-40 — Selected target side panel
- UI-PVP-3 / formerly UI-41 — Vicinity pagination and search
- UI-PVP-4 / formerly UI-42 — PvP action start boundaries
- UI-PVP-5 / formerly UI-43 — PvP Ranking entry point
- UI-PVP-6 / formerly UI-44 — PvP combat screen boundary note

## UI-PVP-1 / formerly UI-39 — PvP Vicinity target selection screen

**Goal:**  
Zbudować PvP target selection screen oparty o Vicinity, gdzie gracz wybiera cel ataku/szpiegowania/oblężenia z listy posiadłości w okolicy.

**Scope:**
- route/page target: existing PvP route/page if present,
- top tabs/entry points: Vicinity and Ranking,
- self hero/estate address visible,
- list/table of nearby estates,
- fields: address, hero name, level/rank if available, attack travel time, spy travel time, action availability,
- row states: self, empty plot, protected, guild member, attackable, siege-only/spy-only,
- compact action icons/buttons: Spy, Attack, Lay siege where available,
- selected target side panel summary,
- pagination if many nearby estates.

**Out of scope:**
- Walking Dead timing,
- combat preview,
- result preview,
- combat log,
- spy result detail,
- siege setup form,
- ranking full implementation unless part of separate task.

**Data/source rules:**
- target list from backend/read model for vicinity/estate list,
- eligibility and action availability from backend/read model, not frontend guessing,
- attack travel time and spy travel time from backend/read model,
- guild membership/protection/range rules from backend/read model,
- no direct writes to PvP/combat/report tables,
- do not assume `hero.id === auth.uid()`.

**UI/SCSS rules:**
- use shared table/list/pagination patterns per UI-CORE-14,
- action icons should use custom icon registry where available,
- disabled/protected/guild states use badges/status pills, not opacity only,
- no local combat-specific CSS on target selection screen.

**Dependencies/blockers:**
- missing vicinity read model -> dependency/blocker,
- missing eligibility flags -> do not infer; report backend dependency,
- missing PvP action RPCs -> actions disabled/pending and reported.

**Acceptance criteria:**
- Vicinity and Ranking controls fit in one line where desktop space allows,
- own estate row clearly marked,
- empty plots are visible but not attackable,
- protected target shows Spy/Siege where allowed plus Protected state, no overflowing button text,
- guild member shows Spy + Guild, no Attack/Siege,
- target selection does not show combat UI,
- build passes.

**Verification/smoke:**
- route smoke,
- visual smoke for self, empty, protected, guild, attackable rows,
- pagination smoke if data supports it,
- build/tsc.

**Required Codex report:**
- target/vicinity data source:
- eligibility source:
- actions implemented/omitted:
- checked but not reused:
- local SCSS added:

## UI-PVP-2 / formerly UI-40 — Selected target side panel

**Goal:**  
Dodać compact selected target side panel pokazujący najważniejsze dane i dostępne akcje dla wybranego celu.

**Scope:**
- target hero name,
- address,
- attack travel time,
- spy travel time,
- siege available yes/no,
- protection/guild/range state if relevant,
- action buttons/icons: Start attack, Spy, Lay siege when available,
- short “what happens next” helper copy.

**Out of scope:**
- Clear button,
- combat log/preview,
- detailed enemy equipment,
- spy result details,
- siege setup options.

**Data/source rules:**
- selected target state from current row/read model,
- action availability from backend flags,
- do not reveal private defender equipment,
- if data stale after refresh, selected target should update or clear safely.

**UI/SCSS rules:**
- use shared detail side panel/card patterns,
- buttons must fit; prefer icon actions if text buttons overflow,
- no redundant distance/district if address already carries location context,
- statuses as badges/status pills.

**Dependencies/blockers:**
- missing selected target read model fields -> partial display and report dependency,
- missing action workflow -> disabled action with dependency report.

**Acceptance criteria:**
- target, address, attack travel time, spy travel time and siege availability visible,
- actions fit and match row eligibility,
- no Clear button,
- no defender private data leak,
- build passes.

**Verification/smoke:**
- select row smoke,
- protected/guild row selected smoke,
- refresh/stale note if not testable,
- build/tsc.

**Required Codex report:**
- selected target data source:
- action availability source:
- private data avoided:
- local SCSS added:

## UI-PVP-3 / formerly UI-41 — Vicinity pagination and search

**Goal:**  
Dodać pagination/search/filtering dla Vicinity target list bez tworzenia fake sortowania przeciwników.

**Scope:**
- search by hero/address if backend/read model supports it,
- pagination with current range, e.g. showing 1–20,
- optional “attackable only” filter if supported,
- ranking tab remains separate entry point,
- stable selected target behavior across pages.

**Out of scope:**
- arbitrary strength sorting,
- frontend-calculated match range,
- enemy recommendations,
- full ranking UI.

**Data/source rules:**
- pagination and search should use backend/read model where available,
- if only client-side list exists, do not imply server-side search,
- availability filters only if backend supports them,
- no frontend guessing attack range/match range.

**UI/SCSS rules:**
- use PrimeNG paginator/global pagination pattern,
- search input through vendor input wrapper,
- no local custom paginator unless justified by UI-CORE-14.

**Dependencies/blockers:**
- missing server-side pagination/search -> report service dependency,
- missing filter support -> omit filter or mark disabled per convention.

**Acceptance criteria:**
- page controls visible and fit table/list width,
- search/filter does not imply unsupported backend behavior,
- selected target updates safely when page changes,
- build passes.

**Verification/smoke:**
- pagination smoke,
- search smoke if backend supports it,
- selected target page-change smoke,
- build/tsc.

**Required Codex report:**
- pagination source:
- search/filter support:
- paginator pattern reused:
- local SCSS added:

## UI-PVP-4 / formerly UI-42 — PvP action start boundaries

**Goal:**  
Ustalić i/lub podpiąć action start boundaries dla Attack, Spy i Lay siege bez implementowania samego combat/spy/siege result screen.

**Scope:**
- action handlers for available row/selected target actions,
- pre-action confirmation if needed,
- call canonical PvP/spy/siege start RPC/service where available,
- show travel timer/state if backend returns one and UI pattern exists,
- success/error feedback,
- refresh action availability after start.

**Out of scope:**
- combat screen,
- Walking Dead,
- spy result details,
- siege configuration details,
- direct writes to combat/pvp/report tables.

**Data/source rules:**
- use canonical backend RPC/service for each action,
- frontend is not authority for eligibility,
- backend error wins and must be shown cleanly,
- no direct persistent mutations,
- active hero/server context required.

**UI/SCSS rules:**
- confirmation/dialog/toast through vendor wrappers,
- action-needed/error text not muted,
- no local timer styling unless global pattern missing and justified.

**Dependencies/blockers:**
- missing attack/spy/siege RPC -> leave action disabled/pending and report blocker,
- missing travel timer read model -> show success and report persistent state dependency.

**Acceptance criteria:**
- unavailable actions cannot start,
- available actions call canonical path if implemented,
- errors/blocked states clear,
- target selection remains separate from combat,
- build passes.

**Verification/smoke:**
- action click smoke if backend available,
- blocked action smoke,
- success feedback smoke,
- build/tsc.

**Required Codex report:**
- action RPCs/services used:
- backend blockers:
- refresh paths:
- local SCSS added:

## UI-PVP-5 / formerly UI-43 — PvP Ranking entry point

**Goal:**  
Dodać Ranking jako drugi target source / entry point obok Vicinity, bez pełnego projektowania rankingu, jeśli nie jest jeszcze gotowy.

**Scope:**
- Ranking tab/route entry,
- placeholder/disabled state only if route/data missing and project convention allows it,
- if ranking read model exists: list entries with same action availability rules as Vicinity,
- clear separation between ranking list and vicinity list.

**Out of scope:**
- full ranking algorithm,
- leaderboards polish,
- opponent sorting hacks,
- duplicate eligibility logic.

**Data/source rules:**
- ranking list from backend/read model,
- action eligibility still from backend flags,
- no frontend match range guessing.

**UI/SCSS rules:**
- reuse target list/action patterns from Vicinity,
- no separate local ranking card system,
- pending/empty state uses shared empty state pattern.

**Dependencies/blockers:**
- if ranking read model missing, report dependency and keep entry pending/omitted per project convention.

**Acceptance criteria:**
- ranking entry exists only if useful and not misleading,
- no fake working ranking,
- action rules consistent with Vicinity,
- build passes if implemented.

**Verification/smoke:**
- tab/route smoke,
- pending state smoke if no data,
- build/tsc.

**Required Codex report:**
- ranking source:
- omitted/pending reason:
- reused target patterns:
- local SCSS added:

## UI-PVP-6 / formerly UI-44 — PvP combat screen boundary note

**Goal:**  
Utrwalić granicę: target selection kończy się na rozpoczęciu akcji, a właściwy combat screen jest osobnym widokiem/taskiem.

**Scope:**
- add code comments/docs/task notes where useful,
- ensure PvP target screen does not include combat timing/log/result,
- route/action handoff points to future combat/travel/report flow,
- align with UI-COMBAT future tasks.

**Out of scope:**
- combat screen implementation,
- combat engine/RPC changes,
- reports generation,
- Walking Dead.

**Data/source rules:**
- combat result/report data belongs to combat/report read models,
- target selection should not read defender private equipment beyond allowed eligibility/display fields.

**UI/SCSS rules:**
- no combat-specific widgets on target selection,
- helper copy should be concise and player-facing.

**Dependencies/blockers:**
- if current UI mixes combat preview into target selection, report cleanup scope.

**Acceptance criteria:**
- boundary documented,
- target selection UI remains clean,
- future combat screen has clear next task,
- build passes if code changed.

**Verification/smoke:**
- visual scan/no combat widgets,
- route smoke if code changed.

**Required Codex report:**
- combat-related elements removed/avoided:
- future dependencies:
- not added intentionally:

---

# 14. UI-REPORTS — Reports and Notifications

Cel: Reports Center, Reports archive, Notifications archive, full report detail, topbar bell/dropdown i toast-to-notification contract. Reports i Notifications są różnymi typami informacji i nie mogą być mieszane w jednej liście.

## UI-REPORTS task index

- UI-REPORTS-1 / formerly UI-45 — Reports Center shell
- UI-REPORTS-2 / formerly UI-46 — Reports list/archive screen
- UI-REPORTS-3 / formerly UI-47 — Full report detail route
- UI-REPORTS-4 / formerly UI-48 — Notifications archive tab
- UI-REPORTS-5 / formerly UI-49 — Topbar notification bell and recent notifications dropdown
- UI-REPORTS-6 / formerly UI-50 — Toast-to-notification behavior contract

## UI-REPORTS-1 / formerly UI-45 — Reports Center shell

**Goal:**  
Zbudować wspólny Reports Center shell dla dwóch osobnych archiwów: Reports i Notifications.

**Scope:**
- route/page target: existing reports route if present,
- tabs: Reports and Notifications,
- shared page header,
- shared filter/list/detail layout,
- read/unread visual state,
- pagination,
- empty/loading states,
- topbar bell considered quick access only, not archive replacement.

**Out of scope:**
- full report detail route,
- notification settings,
- public share report route,
- action queue/timer dashboard,
- audit/admin logs.

**Data/source rules:**
- Reports and Notifications should use separate read models/services if backend separates them,
- read/unread is user/hero scoped according to backend contract,
- do not mix audit/player-abuse reports with gameplay reports,
- if Notifications backend/archive missing, report dependency.

**UI/SCSS rules:**
- use global tabs/list/detail/pagination patterns,
- no local copied report card CSS,
- icons from custom registry/placeholders,
- statuses as badges/pills.

**Dependencies/blockers:**
- missing reports read model -> blocker for Reports tab,
- missing notifications read model -> blocker for Notifications tab,
- missing read state mutation -> open marks read disabled/dependency.

**Acceptance criteria:**
- Reports and Notifications tabs exist,
- entries are not mixed,
- layout supports list + detail panel,
- topbar bell not treated as archive,
- build passes.

**Verification/smoke:**
- route smoke,
- tab switch smoke,
- empty/loading state smoke,
- build/tsc.

**Required Codex report:**
- reports source:
- notifications source:
- shared components reused:
- local SCSS added:
- not added intentionally:

## UI-REPORTS-2 / formerly UI-46 — Reports list/archive screen

**Goal:**  
Zbudować Reports tab jako archiwum pełnych gameplay records, z listą, filtrami i summary/detail panelem.

**Scope:**
- report list rows/cards,
- categories: Combat, Trial, Encounter, PvP, Spy/Siege, Trade/Auction,
- report title, short summary, type, outcome/status, created time, read/unread,
- filters by type/status/time/search,
- pagination,
- detail side panel with participants/source/outcome/rewards/changes summary,
- actions: Open full report, Share.

**Out of scope:**
- Mark read button; opening marks read automatically,
- Share later label,
- full detail route implementation,
- public report route,
- live recomputation of historical reports,
- audit/player-abuse reports.

**Data/source rules:**
- reports render from durable report/snapshot data,
- item references use report item references/snapshots where available,
- opening report/detail should mark read through canonical read-state path if available,
- no private defender equipment leak.

**UI/SCSS rules:**
- use shared list/pagination/detail side panel patterns,
- type/outcome as badges/icons,
- report content not muted if meaningful,
- no local card system.

**Dependencies/blockers:**
- missing report read model -> dependency,
- missing mark-read path -> report limitation,
- missing share token/path -> show Share only if available or report dependency.

**Acceptance criteria:**
- Reports tab lists full reports,
- read state visible,
- clicking/opening marks read where backend supports it,
- detail summary visible,
- Open full report and Share actions present only where supported,
- build passes.

**Verification/smoke:**
- list render smoke,
- filter smoke,
- pagination smoke,
- open/mark-read smoke if backend available,
- build/tsc.

**Required Codex report:**
- report read model:
- mark-read path:
- share path:
- item snapshot handling:
- local SCSS added:

## UI-REPORTS-3 / formerly UI-47 — Full report detail route

**Goal:**  
Zbudować osobny full report detail screen dla trwałego gameplay reportu.

**Scope:**
- route/page target: e.g. `/reports/:reportId` or project route convention,
- header with report type/outcome/date,
- participants/source,
- main result summary,
- combat timeline/turns/log if combat report,
- rewards/loot/resource changes,
- item references with shared item popovers,
- Share action where allowed,
- read state update on open.

**Out of scope:**
- public share route unless separate task,
- report producer backend,
- live recomputation from current state,
- exposing private data not in snapshot.

**Data/source rules:**
- read durable report snapshot/read model,
- combat reports read combat result snapshots,
- trade reports show exact buyer/seller/item/CP summary from transaction-time data,
- item references use report item reference fallback where source item is missing,
- mark read through canonical path if available.

**UI/SCSS rules:**
- use report detail/page header/timeline patterns,
- item popovers via UI-CORE-6,
- technical ids secondary,
- no raw JSON payload as player-facing UI.

**Dependencies/blockers:**
- missing report detail read model -> blocker,
- missing timeline/log data -> render summary and report partial dependency,
- missing share token -> hide/disable Share and report dependency.

**Acceptance criteria:**
- full report route opens from Reports Center,
- report content is durable snapshot-based,
- opening marks read where supported,
- item references display safely,
- no privacy leak,
- build passes.

**Verification/smoke:**
- route smoke for report detail,
- combat report smoke if data exists,
- trade/report item smoke if data exists,
- missing report/404 smoke,
- build/tsc.

**Required Codex report:**
- report detail source:
- mark-read path:
- item reference handling:
- share capability:
- local SCSS added:

## UI-REPORTS-4 / formerly UI-48 — Notifications archive tab

**Goal:**  
Zbudować Notifications tab jako pełne archiwum krótkich komunikatów systemowych/gameplayowych.

**Scope:**
- four summary cards:
  - Unread,
  - Needs attention,
  - Last 24h,
  - Muted categories,
- notification list rows,
- category/severity/status/read state,
- filters: category/status/severity/search,
- pagination,
- detail side panel,
- linked source/report action,
- opening notification marks read where supported.

**Out of scope:**
- full notification settings page,
- report detail inside notification detail,
- action queue/timer dashboard,
- audit logs,
- raw technical payloads.

**Data/source rules:**
- notifications from persistent notification read model,
- online toasts do not replace archive,
- read/unread user/hero scoped per backend,
- severity/category from DB/dictionary/read model where available,
- if backend archive missing, report dependency and do not create permanent local store.

**UI/SCSS rules:**
- short scannable rows,
- notification detail remains short-form,
- severity as badges/status, not only colored text,
- no localStorage archive UI.

**Dependencies/blockers:**
- missing notification read model -> blocker,
- missing mark-read path -> read state limitation,
- missing muted categories source -> hide/placeholder according to convention.

**Acceptance criteria:**
- Notifications tab has four summary cards,
- list is short-form and scannable,
- detail panel links to source/report where available,
- opening marks read where supported,
- no fake local archive,
- build passes.

**Verification/smoke:**
- tab smoke,
- filter/pagination smoke,
- open/mark-read smoke if backend available,
- empty state smoke,
- build/tsc.

**Required Codex report:**
- notification source:
- category/severity source:
- mark-read path:
- source/report link handling:
- local SCSS added:

## UI-REPORTS-5 / formerly UI-49 — Topbar notification bell and recent notifications dropdown

**Goal:**  
Dodać topbar bell/dropdown jako quick access do najnowszych notifications, bez zastępowania pełnego archiwum.

**Scope:**
- bell icon/button in topbar,
- unread count badge,
- dropdown with latest 5–10 notifications,
- entry title, short subtitle, severity/category icon, time, unread marker,
- footer/action: View all -> Reports Center > Notifications,
- zero-count inactive state,
- close/click outside behavior through existing overlay pattern.

**Out of scope:**
- full notifications archive,
- notification settings,
- reports list in dropdown,
- custom overlay system if PrimeNG/vendor exists.

**Data/source rules:**
- same notification read model as archive but limited to latest entries,
- unread count from backend/read model,
- clicking item may route to source/report/detail if supported,
- no local permanent state.

**UI/SCSS rules:**
- use topbar/bell/overlay/popover vendor patterns,
- no orphan dropdown nodes in topbar,
- bell coexists with resource chips without layout breakage.

**Dependencies/blockers:**
- missing latest notifications source -> hide/dropdown pending and report dependency,
- missing overlay wrapper -> use PrimeNG overlay/popover or report gap.

**Acceptance criteria:**
- bell shows unread count,
- dropdown shows recent notifications only,
- View all opens Notifications archive,
- topbar layout stable,
- build passes.

**Verification/smoke:**
- open/close dropdown smoke,
- unread count smoke,
- View all route smoke,
- zero notifications smoke,
- build/tsc.

**Required Codex report:**
- latest notification source:
- overlay/wrapper reused:
- topbar layout changed:
- local SCSS added:

## UI-REPORTS-6 / formerly UI-50 — Toast-to-notification behavior contract

**Goal:**  
Opisać i/lub wdrożyć kontrakt między online toastami a persistent notification archive.

**Scope:**
- online active event can show toast where live event delivery exists,
- persistent archive remains source for historical items,
- toast fields: title, summary, severity, optional action/link,
- archive fields: category, severity, title, message, created time, read state, optional linked source/report,
- toast click routes to source/detail where supported,
- if opened from toast, mark read where appropriate.

**Out of scope:**
- building backend notification system if missing,
- permanent localStorage notification store,
- audit/event log substitute,
- staff/private payloads in player notifications.

**Data/source rules:**
- backend decides which events persist,
- frontend displays received live events,
- backend/read model owns archive and read/unread,
- no inference of persistence from toast state only.

**UI/SCSS rules:**
- use PrimeNG/vendor toast wrapper,
- severities map to Mythsworn notification severity names,
- toast content short and action-oriented.

**Dependencies/blockers:**
- missing live event channel -> document dependency and implement archive surfaces only,
- missing notification archive backend -> no permanent local substitute.

**Acceptance criteria:**
- contract documented in code/docs/task notes,
- toasts and archive responsibilities not confused,
- click routing described/implemented where supported,
- no local-only permanent store,
- build passes if code changed.

**Verification/smoke:**
- toast visual smoke if event/mock available,
- route/action smoke from toast if implemented,
- archive still source of truth,
- build/tsc.

**Required Codex report:**
- live event source:
- archive source:
- toast wrapper reused:
- persistence not added intentionally:

---

# 15. UI-ADMIN — Admin Overview and admin IA

Cel: admin shell, global/admin/operator distinctions, Admin Overview, Admin Area Map, Server Management, Launch New Server and future concrete admin modules. Admin UI ma być uporządkowane według intencji pracy, nie raw table names. Admin overview jest orientation hub, nie fake dashboard.

## UI-ADMIN task index

- UI-ADMIN-1 / formerly UI-51 — Admin Overview shell and global admin variant
- UI-ADMIN-2 / formerly UI-52 — Admin scope strip and operator/server-scoped variant boundary
- UI-ADMIN-3 / formerly UI-53 — Admin sidebar information architecture
- UI-ADMIN-4 / formerly UI-54 — Admin Area Map and Coverage Checklist
- UI-ADMIN-5 / formerly UI-55 — Admin Context / Explainability panel
- UI-ADMIN-6 / formerly UI-56 — Server Management admin entry and staff assignment boundary
- UI-ADMIN-7 / formerly UI-57 — Launch New Server admin entry
- UI-ADMIN-8 / formerly UI-58 — Admin Overview status cards
- UI-ADMIN-9 — Concrete admin module shell pattern
- UI-ADMIN-10 — Admin route coverage matrix

## UI-ADMIN-1 / formerly UI-51 — Admin Overview shell and global admin variant

**Goal:**  
Zbudować Admin Overview jako global admin orientation hub zgodny z zaakceptowanym Admin Overview V7: czysty, lekki, bez fake live dashboardu i bez Recent Staff Activity.

**Scope:**
- route/page target: existing `/admin` overview route if present,
- admin shell/branding with `M` mark,
- global admin topbar:
  - edit level,
  - server focus,
  - role/scope chips,
  - search/audit entry if route exists,
- sidebar groups:
  - Overview,
  - Priority Operations,
  - Content & Balance,
  - World & Economy,
  - Gameplay Tools / Sandbox,
- page header and summary card,
- global admin scope strip,
- cautious status cards,
- Admin Area Map,
- Coverage Checklist,
- Context / Explainability panel.

**Out of scope:**
- concrete admin module implementation,
- full audit view,
- fake recent staff activity,
- fake command board/live queue,
- DB/admin navigation registry design,
- staff assignment form,
- server launch workflow.

**Data/source rules:**
- current user global role/access from canonical access/read model,
- server focus list from existing server/admin server switcher/read model where available,
- counts/cards must come from real read models or be omitted/placeholder per project convention,
- no hardcoded production counts,
- do not infer global admin from selected server role.

**UI/SCSS rules:**
- use admin shell/global surface patterns from UI-CORE,
- no local copied Admin Overview canvas CSS,
- scope strip only global admin,
- technical keys are secondary metadata,
- no `muted-text` for role/access/status values.

**Dependencies/blockers:**
- missing global admin route/access resolver -> dependency,
- missing status card read models -> omit/placeholder and report,
- missing server focus service -> show current context only and report.

**Acceptance criteria:**
- Admin Overview renders as global admin variant,
- user role shows Admin, not Operator,
- Server focus can be All servers or one server where supported,
- no fake Recent Staff Activity,
- Admin Area Map and Coverage Checklist present,
- `M` mark preserved,
- build passes.

**Verification/smoke:**
- admin route smoke,
- global admin visual smoke,
- non-admin access smoke if route guard exists,
- build/tsc.

**Required Codex report:**
- reused admin shell/access services:
- server focus source:
- status card sources:
- checked but not reused:
- local SCSS added:
- not added intentionally:

## UI-ADMIN-2 / formerly UI-52 — Admin scope strip and operator/server-scoped variant boundary

**Goal:**  
Wprowadzić jasną granicę UI między global adminem a server-scoped operatorem. Scope strip jest widoczny tylko dla global admina.

**Scope:**
- global admin scope strip:
  - Global Admin,
  - Selected Server,
  - Launch New Server,
  - Sandbox / Test,
- operator variant:
  - no global scope strip,
  - selected server context,
  - Role: Operator,
  - Edit level: Selected server,
- clear labeling of role vs server focus vs edit level.

**Out of scope:**
- backend role model redesign,
- full operator dashboard,
- staff assignment mutation,
- RLS/RPC changes.

**Data/source rules:**
- global admin role and server staff role are separate,
- do not infer admin from server staff assignment,
- operator can only see assigned server scope according to backend/access model,
- CSS visibility is not access control.

**UI/SCSS rules:**
- scope strip uses shared admin pattern,
- hidden controls must also be blocked by route/access logic,
- labels must not conflate Admin with Operator.

**Dependencies/blockers:**
- if current access model cannot distinguish global admin vs server operator, report blocker,
- if operator selected server resolution missing, report dependency.

**Acceptance criteria:**
- scope strip visible only for global admin,
- operator cannot switch to global/launch modes,
- global admin can focus All servers or one server,
- labels clear,
- build passes.

**Verification/smoke:**
- global admin smoke,
- operator/scoped user smoke if test user available,
- access/visibility smoke,
- build/tsc.

**Required Codex report:**
- access model source:
- role/scope states tested:
- controls hidden/disabled:
- local SCSS added:

## UI-ADMIN-3 / formerly UI-53 — Admin sidebar information architecture

**Goal:**  
Ułożyć admin sidebar według zaakceptowanej intencji pracy, bez dublowania raw table names i bez mieszania global/server/sandbox narzędzi.

**Accepted groups and entries:**
- Overview:
  - Overview
- Priority Operations:
  - Config Governance
  - Anti-abuse
- Content & Balance:
  - Exploration
  - Rewards & Loot
  - Combat Foundation
  - Formulas
- World & Economy:
  - Estate & Buildings
  - Economy & Trade
  - Server Management
  - Launch New Server
- Gameplay Tools / Sandbox:
  - Sandbox Helpers

**Scope:**
- update/admin navigation config if present,
- keep existing reachable routes,
- hide/disable missing routes by project convention,
- indicate route groups/section labels,
- ensure Config Governance and Anti-abuse are visually prioritized.

**Out of scope:**
- concrete module screens,
- DB-backed admin nav registry,
- route guard redesign unless needed for visibility bug,
- removing existing routes without replacement.

**Data/source rules:**
- route visibility from admin/global/server role/access model,
- server-scoped routes must honor selected server context,
- sandbox tools visible only to allowed roles/server kinds.

**UI/SCSS rules:**
- use shared admin sidebar/nav patterns,
- active state matches style contract,
- raw technical keys are not primary labels,
- icon placeholders only where registry key missing.

**Dependencies/blockers:**
- if route does not exist, mark pending/omit per convention,
- if coverage unknown, add to UI-ADMIN-10 coverage matrix.

**Acceptance criteria:**
- sidebar matches accepted grouping,
- Config Governance and Anti-abuse prioritized,
- Trials/Encounters grouped under Exploration,
- Reward profiles and item generation grouped under Rewards & Loot,
- Combat Opponents under Combat Foundation,
- Server Management and Launch New Server separate,
- build passes.

**Verification/smoke:**
- route smoke for existing admin entries,
- active nav visual smoke,
- non-authorized visibility smoke if possible,
- build/tsc.

**Required Codex report:**
- navigation config reused:
- routes checked:
- missing routes:
- access visibility source:
- local SCSS added:

## UI-ADMIN-4 / formerly UI-54 — Admin Area Map and Coverage Checklist

**Goal:**  
Zastąpić Workspaces/Command Board uczciwym orientation blockiem: Admin Area Map + Coverage Checklist.

**Scope:**
- central Admin Area Map with major admin areas:
  - Config Governance,
  - Anti-abuse,
  - Exploration,
  - Rewards & Loot,
  - Server Management,
- subarea chips under each area,
- Coverage Checklist:
  - Global config — covered,
  - Server config — covered,
  - Launch new server — slot,
  - Staff assignment — covered,
  - Sandbox tools — separate,
- note that overview is intentionally light,
- selected area can feed Context / Explainability panel.

**Out of scope:**
- fake live queue,
- recent staff activity,
- command board,
- full route coverage audit implementation,
- DB-backed admin area registry design.

**Data/source rules:**
- content may start as typed local registry/static config,
- do not fetch fake live data to fill overview,
- if counts/statuses appear, they must come from real source.

**UI/SCSS rules:**
- use admin area map/global card/chip patterns,
- not a second menu pretending to be dashboard,
- no local copied card CSS.

**Dependencies/blockers:**
- if selected-area state should drive explainability, define local state or registry; no DB schema design in this task.

**Acceptance criteria:**
- Workspaces/Command Board not present,
- Admin Area Map visible,
- Coverage Checklist visible and secondary,
- no Recent Staff Activity,
- overview feels like orientation hub,
- build passes.

**Verification/smoke:**
- route visual smoke,
- selected area/explainability smoke if interactive,
- build/tsc.

**Required Codex report:**
- area registry/source:
- live data intentionally not used:
- shared patterns reused:
- local SCSS added:

## UI-ADMIN-5 / formerly UI-55 — Admin Context / Explainability panel

**Goal:**  
Dodać reusable admin Context / Explainability panel pokazujący label/description/helper/admin_description dla zaznaczonego obszaru lub konfiguracji.

**Scope:**
- right panel with:
  - Label,
  - Description,
  - Helper text,
  - Admin description,
  - Technical key,
  - Why this matters,
- selected Admin Area Map area as initial source,
- future compatibility with config definitions and dictionary metadata,
- safe missing metadata state.

**Out of scope:**
- DB metadata table design,
- full config definition editor,
- raw JSON payload viewer,
- staff-only private data exposure.

**Data/source rules:**
- prefer DB/read model metadata where available: label, description, helper_text, admin_description, gameplay impact/warning,
- fallback to typed local registry if no DB metadata,
- raw key secondary only,
- missing important metadata should be visible as content debt where appropriate.

**UI/SCSS rules:**
- use shared detail side panel/note/code chip patterns,
- important descriptions readable, not over-muted,
- technical key as small secondary chip.

**Dependencies/blockers:**
- if metadata read model exists but not wired, report wiring task,
- if metadata missing, record key/area gap.

**Acceptance criteria:**
- context panel renders selected area metadata,
- human-readable text first,
- technical key secondary,
- no private data leak,
- build passes.

**Verification/smoke:**
- selected area smoke,
- missing metadata smoke,
- build/tsc.

**Required Codex report:**
- metadata source:
- fallback registry used:
- missing metadata keys:
- local SCSS added:

## UI-ADMIN-6 / formerly UI-56 — Server Management admin entry and staff assignment boundary

**Goal:**  
Ująć Server Management jako pełnoprawny admin area z jasną granicą między global adminem i scoped operatorem.

**Scope:**
- sidebar entry: Server Management,
- Admin Area Map coverage:
  - server list,
  - server settings,
  - operator,
  - moderators,
  - staff scopes,
- global admin capabilities described/represented,
- scoped operator capabilities described/represented,
- no fake staff assignment form unless real workflow exists.

**Out of scope:**
- full staff assignment form,
- server launch flow,
- DB role model changes,
- bypassing backend/RPC permission checks,
- direct write to staff assignment tables.

**Data/source rules:**
- global admin can manage server list/operator/moderators if backend allows,
- operator may manage moderators only within assigned server and backend rules,
- staff assignment must use canonical audited RPC/service where available,
- reason requirement must be preserved,
- staff-disqualifying history warnings respected.

**UI/SCSS rules:**
- labels clearly distinguish Admin, Operator, Moderator, Tester,
- access/status values not muted,
- use admin cards/forms/vendor wrappers.

**Dependencies/blockers:**
- missing server staff read model/RPC -> dependency,
- missing user search for staff assignment -> dependency,
- missing disqualifying history warning source -> dependency.

**Acceptance criteria:**
- Server Management appears in sidebar and Area Map,
- global admin/operator capabilities not conflated,
- operator assignment and multiple moderator assignment represented as future/covered subareas,
- no fake staff mutation,
- build passes.

**Verification/smoke:**
- navigation smoke,
- visibility smoke for admin/operator if available,
- no mutation smoke unless workflow exists,
- build/tsc.

**Required Codex report:**
- server/staff sources:
- RPCs checked:
- access boundaries:
- not added intentionally:

## UI-ADMIN-7 / formerly UI-57 — Launch New Server admin entry

**Goal:**  
Dodać Launch New Server jako osobny admin area od live Server Management i live server overrides.

**Scope:**
- sidebar entry: Launch New Server,
- scope strip includes Launch New Server for global admin,
- Area Map/Coverage Checklist includes launch templates, snapshots, pre-live checks,
- topbar/edit level can represent Launch New Server mode if supported,
- clear pre-live setup labeling.

**Out of scope:**
- launch flow forms,
- creating server records,
- DB schema for launch templates,
- config snapshot application,
- direct writes to server/config tables.

**Data/source rules:**
- launch config should eventually use config governance/server_launch scope,
- if launch read models/RPCs missing, route entry can be pending/disabled per convention,
- pre-live checks backend/read-model driven when implemented.

**UI/SCSS rules:**
- launch entry distinct from Server Management,
- no fake server creation button if backend missing,
- use admin status/cards/patterns.

**Dependencies/blockers:**
- missing launch route/workflow -> dependency,
- missing launch snapshot source -> dependency.

**Acceptance criteria:**
- Launch New Server is separate from Server Management,
- launch mode not available to scoped operator,
- overview does not imply implemented launch flow if missing,
- build passes.

**Verification/smoke:**
- nav/entry smoke,
- disabled/pending state smoke if route missing,
- access smoke if possible,
- build/tsc.

**Required Codex report:**
- launch route/source checked:
- scope/access behavior:
- pending/disabled reason:
- local SCSS added:

## UI-ADMIN-8 / formerly UI-58 — Admin Overview status cards

**Goal:**  
Dodać ostrożne, niewymyślone status cards do Admin Overview.

**Accepted cards:**
- Pending Global Changes,
- Server Staff Gaps,
- Open Anti-abuse Cases,
- Sandbox Tools Ready.

**Scope:**
- render four status cards when data/source exists,
- cards adapt by role/scope:
  - global admin may aggregate across server focus,
  - operator sees server-scoped cards only,
- each card links or routes to relevant area if route exists,
- safe empty/loading states.

**Out of scope:**
- Balance Warnings without real engine/read model,
- fake staff gaps,
- Recent Staff Activity,
- fake command queue,
- audit list on overview.

**Data/source rules:**
- Pending Global Changes from config change set read model,
- Server Staff Gaps from server/staff coverage read model if exists,
- Open Anti-abuse Cases from anti-abuse read model, server-scoped where appropriate,
- Sandbox Tools Ready from access/server kind/tool availability if exists,
- no hardcoded production counts.

**UI/SCSS rules:**
- use summary/stat card patterns,
- counts important, not muted,
- cards should not visually overpower orientation map.

**Dependencies/blockers:**
- missing source -> omit/placeholder and report dependency,
- no balance warning engine -> do not add Balance Warnings.

**Acceptance criteria:**
- accepted cards appear only with real source or safe placeholder convention,
- no Balance Warnings card,
- operator/admin visibility differs correctly,
- no Recent Staff Activity,
- build passes.

**Verification/smoke:**
- card render smoke,
- missing source smoke,
- role/scope smoke if possible,
- build/tsc.

**Required Codex report:**
- source per card:
- omitted cards:
- hardcoded counts yes/no:
- local SCSS added:

## UI-ADMIN-9 — Concrete admin module shell pattern

**Goal:**  
Zdefiniować reusable shell/pattern dla konkretnych admin modułów takich jak Config Governance, Exploration, Rewards, Combat Foundation, Server Management.

**Scope:**
- page header with module label/context,
- tab/section layout,
- list/detail/editor split where appropriate,
- reason-required action block,
- metadata/explainability panel,
- read-only vs edit state,
- scoped server/global context chip,
- audit/change summary slot.

**Out of scope:**
- implementing every admin module,
- DB metadata design,
- concrete forms for each module,
- global admin overview.

**Data/source rules:**
- module metadata from DB/read model where available,
- reason required for governed mutations,
- direct table writes forbidden,
- global vs server scope must be explicit.

**UI/SCSS rules:**
- use admin global patterns from UI-CORE/UI-ADMIN,
- no per-module card/form CSS duplication,
- PrimeNG tabs/table/forms/vendor wrappers first.

**Dependencies/blockers:**
- if existing admin modules have divergent layout, report migration candidates,
- if module metadata missing, show safe fallback and report content debt.

**Acceptance criteria:**
- reusable module shell pattern documented or implemented,
- supports DB-backed explainability,
- supports reason-required mutations,
- future admin modules have consistent structure,
- build passes if code changed.

**Verification/smoke:**
- apply pattern to one admin module if in scope,
- build/tsc,
- visual smoke for read-only and edit states if implemented.

**Required Codex report:**
- existing admin modules checked:
- pattern reused/added:
- metadata source:
- local SCSS added:

## UI-ADMIN-10 — Admin route coverage matrix

**Goal:**  
Przygotować route/configurator → admin area coverage matrix, żeby sidebar/Admin Area Map pokrywały realne istniejące konfiguratory i admin routes.

**Scope:**
- inventory current admin routes/navigation config,
- inventory known configurators from backlog/docs/current route files,
- map each route to:
  - admin area,
  - global/server/launch/sandbox scope,
  - required role/access,
  - metadata/explainability source,
  - route status: implemented/pending/deprecated,
- identify gaps/duplicates.

**Out of scope:**
- moving routes unless explicitly approved,
- DB admin nav registry design,
- implementing missing pages,
- removing routes without user acceptance.

**Data/source rules:**
- route coverage based on actual repo route config and docs,
- access based on current guards/services/RPC semantics where visible,
- if route source uncertain, mark unknown instead of guessing.

**UI/SCSS rules:**
- not a visual task unless navigation config changes are included,
- if navigation updated, use admin sidebar patterns.

**Dependencies/blockers:**
- repo route files required for accurate matrix,
- if routes incomplete, report limitations.

**Acceptance criteria:**
- matrix exists,
- every known admin route/configurator has a proposed area,
- duplicates/gaps identified,
- Admin sidebar IA can be reviewed against real coverage.

**Verification/smoke:**
- docs-only no build,
- if nav config changed: route smoke/build.

**Required Codex report:**
- routes inventoried:
- unmapped routes:
- deprecated/pending routes:
- recommended moves:

---

# 16. UI-COMBAT — Future combat screen

Cel: osobny future combat screen dla Walking Dead, combatants, combat log, attack source labels i outcome/report handoff. Combat UI jest źródłowo neutralny: Trial, Encounter, PvP, Sandbox/Admin Test mogą używać tego samego combat result presentation. Target selection i combat result/report są osobnymi ekranami.

## UI-COMBAT task index

- UI-COMBAT-1 — Combat screen shell
- UI-COMBAT-2 — Combatants panels and health bars
- UI-COMBAT-3 — Walking Dead timing component
- UI-COMBAT-4 — Combat log and attack source labels
- UI-COMBAT-5 — Combat result display and report handoff
- UI-COMBAT-6 — Combat privacy and snapshot boundary

## UI-COMBAT-1 — Combat screen shell

**Goal:**  
Zdefiniować/zbudować combat screen shell jako osobny ekran po rozpoczęciu walki, niezależny od PvP target selection.

**Scope:**
- route/page target proposal or existing combat route,
- combat source label: trial/encounter/pvp/sandbox/admin_test,
- initiator/defender side labels,
- combatants area,
- Walking Dead timing slot,
- combat log slot,
- outcome/report handoff slot,
- loading/error/no combat state.

**Out of scope:**
- PvP target selection,
- target eligibility,
- combat engine implementation,
- reward persistence,
- live recomputation of completed results.

**Data/source rules:**
- combat data from combat result/session/read model where available,
- source type from DB-backed combat source type dictionary/read model,
- participant sides use initiator/defender semantics, not hero/opponent assumptions,
- completed combat should prefer durable snapshot.

**UI/SCSS rules:**
- use global page/card/timeline/progress patterns,
- no local heavy decorative arena unless accepted,
- combat screen must remain readable and not overdecorated,
- labels from dictionaries/metadata where available.

**Dependencies/blockers:**
- if no active combat/session read model exists, keep task as prototype/shell and report backend dependency,
- if combat result snapshot exists only after completion, live combat UI may be future blocker.

**Acceptance criteria:**
- combat screen is separate from PvP target selection,
- source/side labels visible,
- shell supports combatants/timer/log/result slots,
- no fake live combat data,
- build passes if implemented.

**Verification/smoke:**
- route smoke if route exists,
- loading/no combat state smoke,
- completed result smoke if data exists,
- build/tsc.

**Required Codex report:**
- combat data source:
- source/side dictionary source:
- missing live data blockers:
- local SCSS added:

## UI-COMBAT-2 — Combatants panels and health bars

**Goal:**  
Pokazać combatants in a clear two-side layout, with health bars and allowed snapshot data.

**Scope:**
- initiator panel,
- defender panel,
- participant kind: hero/opponent,
- name/label,
- health/current HP,
- key visible stats if allowed,
- status/effects if available,
- attack source/equipment summary only where allowed by snapshot/privacy.

**Out of scope:**
- full private equipment reveal,
- live derived stat recompute,
- equip/unequip,
- admin opponent editor.

**Data/source rules:**
- combatants from combat participant snapshot/read model,
- defender private equipment not exposed unless snapshot/report policy allows,
- opponent equipment is blueprint/generated fight snapshot, not real player item,
- health values from combat snapshot/session state.

**UI/SCSS rules:**
- health bars use shared progress pattern,
- two panels balanced visually,
- important HP/status not muted,
- icons via custom registry/placeholders.

**Dependencies/blockers:**
- missing HP/current state -> show static participant summary and report blocker,
- missing privacy policy fields -> omit sensitive details.

**Acceptance criteria:**
- initiator/defender both visible,
- HP bars readable,
- participant kind clear,
- privacy boundaries preserved,
- build passes.

**Verification/smoke:**
- hero vs opponent smoke,
- hero vs hero smoke if PvP data exists,
- low HP/defeated state smoke,
- build/tsc.

**Required Codex report:**
- participant data source:
- privacy fields omitted:
- progress pattern reused:
- local SCSS added:

## UI-COMBAT-3 — Walking Dead timing component

**Goal:**  
Zaprojektować Walking Dead timing component for the actual combat screen, not target selection.

**Scope:**
- timing bar/track,
- current actor/next action indication where backend supports it,
- turn/round or timing explanation,
- paused/completed/loading states,
- integration slot in combat screen.

**Out of scope:**
- combat timing engine,
- target selection timing,
- arbitrary animation without backend state,
- live polling architecture unless current project supports it.

**Data/source rules:**
- timing state from combat session/read model if live combat exists,
- if only final snapshots exist, component remains future/prototype or shows timeline from snapshot,
- do not generate local fake timing for production.

**UI/SCSS rules:**
- use global progress/timer patterns where possible,
- motion restrained and accessible,
- no constant distracting animation unless useful.

**Dependencies/blockers:**
- missing live combat timing model -> blocker/future note,
- missing timer pattern -> UI-CORE/shell dependency.

**Acceptance criteria:**
- component is clearly located on combat screen only,
- supports loading/completed/no-live-state,
- does not fake backend timing,
- build passes if implemented.

**Verification/smoke:**
- static/completed state smoke,
- live timing smoke if backend exists,
- reduced-motion/accessibility consideration,
- build/tsc.

**Required Codex report:**
- timing data source:
- live support yes/no:
- animation choices:
- local SCSS added:

## UI-COMBAT-4 — Combat log and attack source labels

**Goal:**  
Pokazać combat log/timeline z czytelnymi attack source labels i bez wycieku private equipment.

**Scope:**
- ordered combat log rows,
- turn/sequence index,
- actor side/name,
- attack/source label,
- damage/heal/effect summary,
- miss/crit/block if data exists,
- attack source kind labels: natural, unarmed, player_item, opponent_manual, opponent_generated where available.

**Out of scope:**
- generating combat log from scratch,
- live recomputation,
- exposing full defender equipment if not in snapshot,
- raw JSON log display.

**Data/source rules:**
- log from combat result attacks/snapshot/read model,
- attack source dictionaries from DB-backed combat explainability dictionaries,
- item references only when snapshot/report policy allows,
- opponent generated/manual equipment labels should not pretend to be player inventory.

**UI/SCSS rules:**
- use timeline/list row pattern,
- source labels as badges/chips,
- important outcomes not muted,
- technical keys secondary.

**Dependencies/blockers:**
- missing combat attack rows -> show summary only and report data gap,
- missing dictionaries -> report metadata dependency or fallback safely.

**Acceptance criteria:**
- combat log rows readable,
- attack source labels meaningful,
- no raw JSON player-facing,
- privacy preserved,
- build passes.

**Verification/smoke:**
- log render smoke with sample/snapshot data,
- source kind variety smoke if available,
- empty log smoke,
- build/tsc.

**Required Codex report:**
- combat log source:
- dictionary/metadata source:
- privacy omissions:
- local SCSS added:

## UI-COMBAT-5 — Combat result display and report handoff

**Goal:**  
Pokazać wynik walki i przejście do durable report, bez mieszania live combat screen z report archive.

**Scope:**
- outcome banner: initiator victory, defender victory, draw,
- rewards/resource/item summary if allowed and available,
- participant final HP/status,
- action: Open report,
- action: Return to source context where available,
- share/report action only where report supports it.

**Out of scope:**
- reward granting logic,
- report producer backend,
- public share route,
- live recomputation of rewards.

**Data/source rules:**
- outcome from combat result snapshot,
- rewards from reward/result/report read model if available,
- report handoff through game_reports/source mapping where implemented,
- no fake reward summary if backend missing.

**UI/SCSS rules:**
- outcome as prominent but readable banner/card,
- status badges for victory/defeat/draw,
- item popovers via UI-CORE-6,
- report button clear.

**Dependencies/blockers:**
- missing report link -> show result only and report dependency,
- missing reward snapshot -> omit reward summary and report gap.

**Acceptance criteria:**
- result state visible,
- report handoff clear if available,
- no fake rewards,
- no privacy leak,
- build passes.

**Verification/smoke:**
- victory/defeat/draw visual smoke if data available,
- report link smoke,
- missing report state smoke,
- build/tsc.

**Required Codex report:**
- outcome source:
- reward/report source:
- omitted rewards/reports:
- local SCSS added:

## UI-COMBAT-6 — Combat privacy and snapshot boundary

**Goal:**  
Utrwalić zasady prywatności i snapshotów dla combat UI, szczególnie PvP.

**Scope:**
- document/display rules for hero vs opponent combat,
- allowed fields for defender/player equipment,
- source labels vs full item details,
- completed result snapshot vs live state,
- admin/sandbox exceptions if any.

**Out of scope:**
- RLS/RPC policy changes,
- changing snapshot schema,
- defender equipment reveal,
- admin debug payload UI.

**Data/source rules:**
- combat result snapshots are durable source for completed reports,
- live player state should not be used to reconstruct historical combat,
- defender private equipment not exposed unless snapshot/report policy allows,
- admin_test/sandbox may have different debug permissions but must be explicit.

**UI/SCSS rules:**
- technical/debug data not player-facing,
- privacy omissions should fail closed,
- helper copy concise if a field is hidden.

**Dependencies/blockers:**
- unclear snapshot/privacy policy -> decision dependency,
- missing allowed labels -> metadata dependency.

**Acceptance criteria:**
- privacy rules documented for combat UI,
- player-facing combat/report screens fail closed,
- admin/sandbox exceptions explicit,
- build passes if code changed.

**Verification/smoke:**
- review checklist item added,
- no private equipment shown in PvP smoke if data available.

**Required Codex report:**
- privacy policy source:
- fields intentionally omitted:
- snapshot vs live source:
- open decisions:

---

# 17. UI-OPEN — Open questions

- Exact Game Icons mapping.
- Mobile layout strategy for dense tables and admin screens.
- Full PvP combat UX.
- Full Exploration result UX.
- Full Siege setup/result UX.
- Full Spy result UX.
- Public report share page.
- Notification settings page.
- Admin route coverage matrix and possible DB/registry source.
- Full concrete admin modules after overview IA.

---

## Common UI/UX implementation rules for the merged addenda

These merged sections inherit the global UI/UX backlog rules:

- HTML prototypes are **visual reference only**.
- Codex must not copy `mb-*`, canvas CSS, gradient values, palette values, layout class names or JS prototype logic 1:1 into Angular.
- Production must translate approved visual directions into global SCSS, `mg-*`, vendor wrappers, shared components, PrimeNG wrappers and documented utilities.
- Missing DB/RPC/read-model/runtime contracts are dependencies/blockers, not permission to fake durable gameplay state in Angular.
- Critical gameplay/account creation mutations must go through canonical DB/RPC/domain workflows, never direct Angular table writes.
- Implementation tasks inherit the global required UI/UX report: reused / checked but not reused / new component-state-helper / local SCSS / copied from prototype / PrimeNG override / stale guards where applicable.


# UI-TRIALS — Trial minigame prototypes and renderer boundary

Cel: uporządkować zaakceptowane kierunki manual Trial minigames, wspólny host/rendering boundary oraz integrację z reports/result flow.

## UI-TRIALS-1A — Shared Trial Minigame Host / Renderer Shell Spec And Production Mapping

**Goal:**  
Zdefiniować production mapping dla jednego wspólnego player-facing hosta manual Trial minigames, zanim Codex spróbuje implementować host w Angularze.

**Scope:**
- Opisać docelową granicę hosta triala:
  - trial header,
  - god label,
  - tested stat,
  - manual/auto state,
  - minigame content slot,
  - safe auto-resolve action,
  - warning modal before auto-resolve,
  - result/report handoff,
  - failed/not manifested/completed handling,
  - accessibility and mobile constraints.
- Zmapować, które elementy powinny być shared/global patterns, vendor wrappers albo local host layout.
- Zidentyfikować minimalny DB/RPC/read-model contract wymagany dla hosta.
- Spisać, które zaakceptowane prototypes są tylko visual reference, a które mają być archived as accepted references.

**Out of scope:**
- Implementacja Angular hosta.
- Implementacja konkretnych minigier.
- Kopiowanie canvasowego CSS/JS.
- Projektowanie nowych tabel DB.
- Direct writes z Angulara.
- Finalny balans trudności.

**Data/source rules:**
- Trial definition, tested stat, god identity, difficulty/runtime config and result state must come from DB/RPC/read model.
- Auto-resolve success chance and result must be backend/RPC-owned.
- Completed result handoff must use durable trial/report result source, not local UI-only state.
- If runtime config contract is missing, report dependency.

**UI/SCSS rules:**
- Use global page/header/card/status patterns.
- Use existing buttons/vendor wrappers.
- Use `tag-badge--*` / future status pill/chip patterns for state.
- No copied `mb-*` prototype classes.

**Dependencies/blockers:**
- Missing trial runtime read model/config contract.
- Missing action/submit RPC for manual minigame result.
- Missing report/result handoff route or read model.

**Acceptance criteria:**
- Spec describes a single renderer host pattern that can contain all manual trial minigames.
- Auto-resolve warning and report/result handoff are explicitly mapped.
- Host implementation dependencies are identified before coding.
- No production code changes are required in this spec task.

**Verification/smoke:**
- Docs-only review.
- Confirm source prototype references with the user before archiving or implementing.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- host boundary proposed:
- runtime/read models required:
- missing runtime dependencies:
- local SCSS added:
- copied from prototype: yes/no:

## UI-TRIALS-1B — Shared Trial Minigame Host Implementation

**Goal:**  
Implementować wspólny Trial Minigame Host dopiero po zaakceptowaniu UI-TRIALS-1A i po potwierdzeniu, że potrzebny DB/RPC/read-model contract istnieje albo zakres jest jawnie mock/read-only.

**Scope:**
- Build one reusable player-facing host/shell for manual trial minigames.
- Host must support:
  - trial header;
  - god label;
  - tested stat;
  - manual/auto state;
  - minigame content slot;
  - auto-resolve action with warning modal;
  - completed/failed/not-manifested handoff to report/result.
- Use production patterns and shared wrappers instead of copied prototype classes.
- Plug in one placeholder/minigame only if the runtime contract supports it, otherwise implement host as read-only/spec surface and report blocker.

**Out of scope:**
- Implementing all nine minigames in this task.
- Copying any canvas CSS/JS.
- Hardcoding final difficulty config.
- Direct table writes or frontend-authoritative trial completion.

**Data/source rules:**
- Runtime state and result handoff must come from DB/RPC/read model.
- Auto-resolve must be backend/RPC-owned.
- Missing runtime contract is a blocker unless the task is explicitly constrained to static/read-only shell.

**UI/SCSS rules:**
- Use UI-CORE patterns, PrimeNG/vendor wrappers and shared/global SCSS.
- Local SCSS only for host geometry if no shared pattern exists; report it.
- No `mb-*` classes from prototypes.

**Acceptance criteria:**
- One host component/page boundary can host different trial minigame components.
- Host does not duplicate game shell/nav.
- Host fails closed when trial runtime data is missing.
- Auto-resolve warning path is visible and testable.
- Build/tsc passes if code is changed.

**Verification/smoke:**
- Route smoke for host if route exists.
- Visual smoke with one plugged placeholder/minigame or read-only fixture.
- Auto-resolve modal smoke.
- Stale guard smoke for load/action responses where applicable.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- host boundary implemented:
- runtime/read models used:
- missing runtime dependencies:
- local SCSS added:
- copied from prototype: yes/no:

## UI-TRIALS-2 — Accepted Manual Trial Prototype Map

**Goal:**  
Dodać do UI/UX backlogu aktualną mapę zaakceptowanych lub wstępnie zaakceptowanych manual Trial minigame directions.

**Scope:**
- Maintain the table below as the prototype direction map.
- Mark these as prototype directions, not production source.
- Keep concept-only entries separate from HTML-backed accepted references.
- Do not claim DB/RPC runtime readiness from prototype acceptance alone.

| Trial / God | Stat | Direction | Prototype status | HTML file/reference |
| --- | --- | --- | --- | --- |
| Ares | Strength | Combat Trial using DB-owned live combat session / Walking Dead manifest. Combat remains DB-authoritative; frontend must not implement combat resolution authority. | Accepted direction / existing combat prototype family | Existing combat screen/report prototypes; DB-owned live combat contract |
| Artemis | Dexterity | Harpy Hunt aiming/shooting minigame; no strobe, no rapid flashing. | HTML direction accepted in conversation | Manual canvas prototype to archive after user-provided final file |
| Apollo | Agility | Path of Light / fading path tiles; move before light disappears. | HTML direction accepted in conversation | Manual canvas prototype to archive after user-provided final file |
| Hephaestus | Endurance | Divine Forge / heat, strain and sustained process-control. | HTML direction accepted in conversation | Manual canvas prototype to archive after user-provided final file |
| Hermes | Cunning | Shifting Seals: four procedural seals, reveal then shuffle, no riddle database. | HTML direction accepted in conversation | Manual canvas prototype to archive after user-provided final file |
| Aphrodite | Charisma | The Graces’ Court: timing/turn-taking, moving receptive arc, no dialogue database. | HTML direction accepted in conversation | Manual canvas prototype to archive after user-provided final file |
| Athena | Wisdom | Scales of Judgment: procedural omen selection under incomplete information, qualitative reveals. | HTML direction accepted in conversation | Manual canvas prototype to archive after user-provided final file |
| Hera | Intelligence | Labyrinth with Minotaur; escape without combat. | HTML direction accepted in conversation | Manual canvas prototype to archive after user-provided final file |
| Zeus | Spirituality | Storm Charge: hold-to-charge Sky/Earth/Oath, release grace, call thunder when all signs exceed threshold. | HTML direction accepted in conversation | Manual canvas prototype to archive after user-provided final file |

**Out of scope:**
- Angular implementation.
- Creating final DB config schema.
- Marking UI tasks as complete.
- Hardcoding final balance/difficulty curves.

**Data/source rules:**
- Each minigame difficulty must later be driven by trial definition/config and tested stat + runtime helpers where applicable.
- Frontend must not hardcode final difficulty curves as authority.
- Combat/Ares uses DB-owned live combat session / Walking Dead manifest, not frontend-authoritative combat.

**UI/SCSS rules:**
- Archive accepted HTML prototypes under `docs/ui-ux/prototypes/` only after user accepts the exact file.
- Each prototype must include `VISUAL REFERENCE ONLY` header.
- No placeholder packs.

**Acceptance criteria:**
- All nine trial directions are listed in a table.
- Prototype status is explicit.
- Future Codex task can identify which prototype direction to consult and which entries still need production mapping/spec.

**Verification/smoke:**
- Docs-only review.
- Confirm filenames/paths with user before status docs update.

**Required Codex report:**
- reused:
- checked but not reused:
- new component/state/helper added:
- prototype map updated:
- source references added:
- copied from prototype: yes/no:

## UI-TRIALS-3 — Manual Trial Runtime And Difficulty Configuration Contract

**Goal:**  
Dopisać UI/UX task określający, jakie parametry manual triali muszą pochodzić z runtime config/read modelu zamiast z komponentów Angular.

**Scope:**
- Opisać common config categories:
  - tested stat key,
  - god key/label,
  - target difficulty,
  - allowed mistakes/fail threshold,
  - timer / duration / action window,
  - minigame-specific parameters,
  - auto-resolve chance,
  - accessibility/reduced-motion flags where relevant.
- Opisać minigame-specific examples:
  - Apollo: grid size, path length, tile lifetime, mistakes allowed.
  - Hephaestus: heat safe range, charge/strain rates, progress target.
  - Hermes: seal count, preview time, shuffle swaps, shuffle speed, mistakes allowed.
  - Athena: omen count, insight tokens, target range, reveal quality.
  - Aphrodite: window width, dial speed, arc speed, faux pas limit.
  - Zeus: charge rate, leak rate, release grace, threshold, ritual window, thunder calls.

**Out of scope:**
- Final DB schema.
- Formula implementation.
- Angular implementation.

**Data/source rules:**
- Angular may render values returned by read model/RPC.
- Angular must not be authority for durable success/failure.
- Missing config/read model must be dependency/blocker.

**UI/SCSS rules:**
- UI may show player-facing simplified labels, but technical config keys are secondary/admin/debug only.

**Acceptance criteria:**
- The backlog has a shared parameter taxonomy for trial minigames.
- Codex cannot reasonably hardcode minigame thresholds in Angular without violating the task.
- Open DB/RPC dependencies are explicit.

**Verification/smoke:**
- Documentation-only: no build.

**Required Codex report:**
- config parameters documented:
- DB/RPC dependencies identified:
- hardcoded values avoided:

---

## UI-TRIALS-4 — Trial Report / Result Integration Boundary

**Goal:**  
Utrwalić, że manual trial minigames kończą się durable result/report flow, a nie lokalnym ekranem sukcesu bez źródła danych.

**Scope:**
- Document expected flow:
  1. active exploration step yields trial/challenge attempt;
  2. player enters manual trial host;
  3. minigame submits result through canonical RPC/domain workflow;
  4. backend resolves success/failure and rewards;
  5. player sees completed report/result screen;
  6. report uses durable snapshot/read model.
- Include states:
  - ongoing manual trial,
  - auto-resolve selected,
  - success,
  - failure,
  - trial did not manifest,
  - missing/expired attempt.

**Out of scope:**
- Report renderer implementation.
- Reward formula/backend implementation.
- Public sharing policy.

**Data/source rules:**
- Rewards must come from reward profile/result read model.
- Item references must use shared item popover contract when details exist, safe label otherwise.
- Reports use snapshot/read model; do not recompute from live hero state.

**UI/SCSS rules:**
- Use report/result surface patterns and badges.
- No fake rewards.
- No local reward card style if global report reward/list pattern exists.

**Acceptance criteria:**
- Minigames have a defined handoff into reports/results.
- Missing report/reward read models are dependencies, not fake UI.
- Trial did-not-manifest and failed states are not presented as ordinary success.

**Verification/smoke:**
- Documentation-only unless implemented.
- Future visual smoke: success/failure/not-manifested.

**Required Codex report:**
- result source:
- reward source:
- report handoff:
- missing dependencies:

---

## UI-TRIALS-5 — Combat Trial / Ares Strength Direction

**Goal:**  
Dopisać trial direction dla Strength jako combat-based Trial of Ares, oparty o istniejący combat module/prototypy, bez tworzenia osobnej mechaniki klikowej.

**Scope:**
- Document that Strength trial can use combat screen/module direction.
- The combat minigame remains governed by combat runtime/Walking Dead action manifests where applicable.
- Trial provider interprets combat result as trial success/failure and reward eligibility.

**Out of scope:**
- New combat system.
- PvP-specific report logic.
- Reward implementation.

**Data/source rules:**
- Combatants and combat state from DB/RPC live combat/session or result snapshot.
- Trial success/failure from backend trial/combat integration.
- Combat itself does not grant trial rewards directly.

**UI/SCSS rules:**
- Use shared combat UI direction.
- Combat log must be readable and full where report requires it.
- No defender/private equipment leak in PvP contexts.

**Acceptance criteria:**
- Ares/Strength has a clear trial mapping.
- It reuses combat direction and does not invent another timing minigame.
- Trial/report handoff is explicit.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- combat source:
- trial source:
- report/result source:

---

## UI-TRIALS-6 — Artemis Dexterity Prototype Direction: Harpy Hunt

**Goal:**  
Dopisać zaakceptowany kierunek Dexterity Trial jako safe-motion aiming/hunting minigame.

**Scope:**
- Document visual/mechanical direction:
  - target creatures crossing field,
  - cursor/reticle control,
  - required hits in limited time or limited attempts,
  - difficulty via target speed/count/size, reticle jitter, time window.
- Note accessibility and photosensitive safety constraints.

**Out of scope:**
- Production physics/animation implementation.
- Asset creation.
- Final mobile design.

**Data/source rules:**
- Runtime parameters from trial config/read model.
- Success/failure through backend attempt submit workflow.

**UI/SCSS rules:**
- No rapid flash/strobe.
- Prefer smooth motion and reduced-motion mode.
- If using canvas/SVG later, renderer host must still preserve global shell/pattern rules.

**Acceptance criteria:**
- Artemis/Dexterity has a documented prototype direction.
- Difficulty knobs are explicit.
- Safety constraints are explicit.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- safety constraints:
- mobile concerns:

---

## UI-TRIALS-7 — Apollo Agility Prototype Direction: Path of Light

**Goal:**  
Dopisać zaakceptowany kierunek Agility Trial jako step-through fading path minigame.

**Scope:**
- Document visual/mechanical direction:
  - grid of light tiles,
  - active tile and optional next-tile preview,
  - hero marker,
  - tile lifetime / mistakes / path length,
  - success after completing path,
  - failure after mistakes or timeout.

**Out of scope:**
- Production implementation.
- Final mobile layout.

**Data/source rules:**
- Grid size, path length, tile lifetime, preview availability, mistakes from runtime config.
- Submission/result through canonical trial workflow.

**UI/SCSS rules:**
- No unsafe flashing; fading/opacity changes must be calm.
- Reduced-motion mode should remain possible.

**Acceptance criteria:**
- Apollo/Agility direction is documented and distinguishable from combat/Aphrodite timing.
- Difficulty knobs are explicit.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- accessibility constraints:

---

## UI-TRIALS-8 — Hephaestus Endurance Prototype Direction: Divine Forge

**Goal:**  
Dopisać zaakceptowany kierunek Endurance Trial jako process-control forge minigame.

**Scope:**
- Document mechanics:
  - Heat,
  - Strain,
  - Progress,
  - Strike,
  - Bellows,
  - Quench.
- Endurance affects tolerance and stability:
  - wider safe heat range,
  - lower strain gain,
  - slower heat decay,
  - higher strain limit / grace.

**Out of scope:**
- Final balance.
- Production implementation.

**Data/source rules:**
- Parameters from trial config/read model.
- Final success/failure through backend workflow.

**UI/SCSS rules:**
- Visual fire/forge effects must be safe and non-strobing.
- No rapid clicking requirement.

**Acceptance criteria:**
- Hephaestus/Endurance has a clear non-combat, non-timing process-control identity.
- Difficulty knobs are explicit.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- success/failure source:
- safety constraints:

---

## UI-TRIALS-9 — Hermes Cunning Prototype Direction: Shifting Seals

**Goal:**  
Dopisać zaakceptowany kierunek Cunning Trial jako procedural shell-game/seal-tracking minigame bez bazy zagadek.

**Scope:**
- Document mechanics:
  - 4 seals by default,
  - reveal true seal,
  - shuffle/seal swaps,
  - visible labels are position labels, not hidden identity,
  - choose after shuffle,
  - mistakes reduce trust.
- Difficulty knobs:
  - seal count,
  - preview time,
  - shuffle speed,
  - swap count,
  - false motion/fake swaps,
  - mistakes allowed.

**Out of scope:**
- Text riddle/clue database.
- Production implementation.

**Data/source rules:**
- Parameters from runtime config.
- Result through canonical trial workflow.

**UI/SCSS rules:**
- No persistent highlight after preview.
- Smooth non-flashing motion.
- Reduced-motion alternative must be considered.

**Acceptance criteria:**
- Hermes/Cunning does not require authored clue/riddle content.
- Prototype direction is procedural and balanceable.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- no-riddle-content confirmed:
- accessibility constraints:

---

## UI-TRIALS-10 — Hera Intelligence Prototype Direction: Labyrinth With Minotaur

**Goal:**  
Dopisać kierunek Intelligence Trial jako labirynt z Minotaurem, bez walki.

**Scope:**
- Document mechanics:
  - generated or configured maze,
  - player must reach exit,
  - Minotaur moves through maze,
  - fail if Minotaur catches player or player cannot exit in time/steps,
  - no combat resolution inside this trial.
- Intelligence/difficulty affects:
  - maze size,
  - visibility/fog/revealed tiles,
  - Minotaur speed/pathing intelligence,
  - allowed time/steps,
  - hint/reveal strength.

**Out of scope:**
- Production maze algorithm.
- Combat with Minotaur.
- Final visual art.

**Data/source rules:**
- Maze seed/config and difficulty from runtime config/read model where possible.
- Result through canonical trial workflow.

**UI/SCSS rules:**
- Use trial host; maze renderer is contained inside minigame slot.
- No image dependency required for MVP prototype.
- Mobile layout is a known risk and follow-up.

**Acceptance criteria:**
- Hera/Intelligence has a documented non-riddle puzzle direction.
- No authored riddle database required.
- No combat fallback.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- maze runtime dependencies:
- no-combat confirmed:
- mobile concerns:

---

## UI-TRIALS-11 — Athena Wisdom Prototype Direction: Scales of Judgment

**Goal:**  
Dopisać zaakceptowany kierunek Wisdom Trial jako procedural omen-judgment under incomplete information.

**Scope:**
- Document mechanics:
  - 8 omens by default,
  - hidden weights,
  - limited Insight tokens,
  - select exact number of omens,
  - target judgment range,
  - qualitative reveals: strongly favorable, slightly favorable, uncertain, harmful,
  - no exact current sum during active choice.
- Difficulty knobs:
  - omen count,
  - selected count,
  - insight tokens,
  - target range width,
  - reveal precision,
  - attempts allowed.

**Out of scope:**
- Riddle database.
- Production implementation.
- Exact balancing generator.

**Data/source rules:**
- Omen set/weights may be generated by backend/runtime config, not Angular authority.
- Result through canonical trial workflow.

**UI/SCSS rules:**
- Qualitative feedback only during active trial.
- Do not show exact `Current judgment` sum before final judgment.

**Acceptance criteria:**
- Athena/Wisdom is not a fixed mapping puzzle.
- Generator/balancing needs are explicit.
- Player feedback remains useful but not solved by arithmetic display.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- qualitative labels:
- exact values hidden:
- generator dependencies:

---

## UI-TRIALS-12 — Aphrodite Charisma Prototype Direction: The Graces’ Court

**Goal:**  
Dopisać zaakceptowany kierunek Charisma Trial jako timing/turn-taking minigame with moving receptive arcs.

**Scope:**
- Document mechanics:
  - three Graces as presentation model,
  - active Grace rotates,
  - player responds when pointer overlaps moving receptive arc,
  - correct timing builds Influence,
  - mistakes create Faux Pas,
  - moving arc rotates against pointer.
- Difficulty knobs:
  - receptive arc width,
  - pointer speed,
  - arc speed,
  - number of required responses,
  - faux pas limit,
  - number of active circles/Graces.

**Out of scope:**
- Dialogue/persuasion text database.
- Flashing lure effects.
- Production implementation.

**Data/source rules:**
- Runtime parameters from config/read model.
- Result through canonical trial workflow.

**UI/SCSS rules:**
- No flashing/strobe/rapid contrast flicker.
- Smooth motion and reduced-motion support required.
- Use trial host.

**Acceptance criteria:**
- Aphrodite/Charisma is not another scale-balancing mechanic.
- It has clear difficulty knobs.
- It avoids dialogue authoring burden.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- runtime knobs:
- safety constraints:
- reduced-motion behavior:

---

## UI-TRIALS-13 — Zeus Spirituality Prototype Direction: Storm Charge

**Goal:**  
Dopisać zaakceptowany kierunek Spirituality Trial jako hold-to-charge ritual control minigame.

**Scope:**
- Document mechanics:
  - three pillars/signs: Sky, Earth, Oath,
  - player holds each sign button to charge,
  - released signs keep charge for release grace/debounce period,
  - after grace they leak charge,
  - Call Thunder works when all three exceed threshold,
  - 3 thunder calls as accepted prototype threshold,
  - wrong call creates Wrath,
  - ritual window/timer can fail the attempt.
- Difficulty knobs:
  - charge rate,
  - leak rate,
  - release grace duration,
  - threshold height,
  - ritual window length,
  - wrath/fail limit.

**Out of scope:**
- Original three-auto-alignment version.
- Rapid clicking.
- Flash/strobe lightning effects.
- Final mobile solution.

**Data/source rules:**
- Runtime parameters from config/read model.
- Result through canonical trial workflow.
- Frontend may animate charge but durable success/failure is backend-owned.

**UI/SCSS rules:**
- No rapid clicking requirement.
- Smooth charge/leak animation.
- No lightning flash/strobe; use soft glow only.
- Mobile layout is a required future follow-up because vertical stacking may be hard during active play.

**Acceptance criteria:**
- Zeus/Spirituality has a distinct sustained-control identity.
- 3 thunder calls are documented as accepted prototype threshold.
- Release grace is documented as required for playability.
- Difficulty knobs are explicit.

**Verification/smoke:**
- Documentation-only unless implemented.
- Future visual smoke: blessed and low-spirituality modes.

**Required Codex report:**
- runtime knobs:
- release grace behavior:
- mobile concerns:
- safety constraints:

---

# UI-REPORTS-ADD — Report/result prototype integration follow-ups

## UI-REPORTS-ADD-1 — Trial Result Report Variants

**Goal:**  
Dopisać brakujące backlog entries dla trial report variants wypracowanych podczas prototypowania.

**Scope:**
- Document player-facing report variants:
  - completed/passed trial,
  - failed trial,
  - trial did not manifest,
  - ongoing manual trial placeholder/host link,
  - trial with embedded combat/minigame result summary.
- Report should be linear/readable, not dashboard-like.
- Rewards should show EXP, drachmas/resources and item references from durable reward snapshot.

**Out of scope:**
- Recomputing rewards client-side.
- Full report sharing policy.
- Combat renderer implementation.

**Data/source rules:**
- Reports use durable report/result snapshot/read model.
- Item references use shared item popover contract when available.
- Missing data is omitted or shown as diagnostic, not faked.

**UI/SCSS rules:**
- Use shared report/card/badge/list patterns.
- No fake participants unless source data exists.
- Technical sequence/debug visible only in debug/admin context.

**Acceptance criteria:**
- Trial report variants are described in backlog.
- Reward display rules are explicit.
- Not-manifested state is distinct from failure/success.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- report source:
- reward source:
- item reference source:
- debug fields omitted:

---

## UI-REPORTS-ADD-2 — PvP / Combat Report Perspective Variants

**Goal:**  
Dopisać backlog entry dla combat/PvP report perspective handling.

**Scope:**
- Document variants:
  - I attacked and won,
  - I attacked and lost,
  - I defended and won,
  - I defended and lost.
- Outcome color/status should be viewer-relative when product permits it.
- Combat log should be chronological from fight start downward.
- Combat log should be full in report, no hidden scroll for required report content.
- Critical hits, misses and evades should use readable semantic emphasis.

**Out of scope:**
- PvP backend consequence implementation.
- Private equipment leakage.
- Public share policy.

**Data/source rules:**
- Completed reports use snapshot, not live state.
- Defender/private equipment must not leak unless snapshot policy allows.
- PvP rewards/resources from PvP consequence snapshot, not ordinary reward profile.

**UI/SCSS rules:**
- Use report/list/status patterns.
- No combat log in one compressed line when turns/actions need separation.
- No local combat badge system.

**Acceptance criteria:**
- Perspective variants are explicit.
- Viewer-relative success/failure color rule is documented as desired if feasible.
- Full chronological combat log requirement is documented.

**Verification/smoke:**
- Documentation-only unless implemented.

**Required Codex report:**
- viewer perspective source:
- snapshot source:
- omitted private fields:

---

# UI-ONBOARDING — Account Entry Shell And Hero Creation

Cel: zabezpieczyć zaakceptowane decyzje projektowe dla account/public shell, wejścia do gry i tworzenia postaci, tak aby Codex nie zrobił ponownie wizardu `Step 1 of 4`, nie wymieszał server selection z originami i nie potraktował stat allocation jako account onboarding.

Flow summary:

- Account-side creation flow has two screens only:
  1. **Account Entry Shell** — `Enter the game` albo `Create new hero` / join eligible world.
  2. **Hero Creation** — hero name + origin carousel + `Create hero`.
- After `Create hero`, the player is already inside the in-game shell.
- Stat Allocation is the default first in-game location after creation, not a third onboarding step and not a forced tutorial lock.

## UI-ONBOARDING-ADD-1 — Account Entry Shell information architecture

**Goal:**  
Zdefiniować i wdrożyć account/public shell dla zalogowanego użytkownika przed wejściem w konkretny server+hero game shell.

**Scope:**

- Account/public shell ma inne boczne menu niż in-game shell.
- Minimalne menu account shell:
  - `Enter the game`;
  - `Create new hero` / `Join new world`;
  - account-related options such as account settings, notifications, sign out.
- Shell pokazuje account identity, ale nie udaje aktywnego hero contextu, dopóki hero/server nie zostaną wybrane.
- Shell musi jasno odróżniać:
  - account context;
  - selected server context;
  - active hero context;
  - no active hero yet.
- Dla większych ekranów użyć istniejącego layout/shell patternu, o ile istnieje, zamiast tworzyć osobny lokalny shell.

**Out of scope:**

- In-game sidebar/dashboard redesign.
- Hero creation mutation.
- Stat allocation redesign.
- Direct DB writes.
- Status docs update.

**Data/source rules:**

- Account/user identity comes from auth/account context.
- Server/hero state comes from existing selected/current server + active hero read layers or dedicated start-flow read model.
- Sandbox/test privileges must come from access/membership/staff read layer.
- Do not infer sandbox privileges client-side.

**UI/SCSS rules:**

- Use account/public shell as its own route/layout area, not the in-game shell.
- Use global page/card/sidebar/nav patterns where available.
- Do not copy canvas sidebar/topbar CSS.
- If a missing account-shell pattern is discovered, report it as shared/layout follow-up.

**Dependencies/blockers:**

- Missing account/server/hero read model.
- Missing access layer for sandbox/test privileges.
- Missing route boundary between account shell and in-game shell.

**Acceptance criteria:**

- Account shell does not show in-game navigation as if a hero were active.
- `Enter the game` and `Create new hero` are distinct flows.
- User can switch between these account-shell sections without logging out.
- Existing hero flow leads toward in-game dashboard context.
- New hero flow leads toward server eligibility / hero creation context.
- No `Step 1 of 4` or wizard language appears in account shell.

**Verification/smoke:**

- `npx tsc --noEmit`
- `npm run build`
- Route smoke for account entry route if implemented.
- Manual smoke:
  - authenticated account with existing hero;
  - authenticated account with no hero on an eligible server;
  - sandbox/test account with multiple heroes where representative data exists.

---

## UI-ONBOARDING-ADD-2 — Enter The Game existing-hero selector

**Goal:**  
Utworzyć account-shell section `Enter the game`, która pokazuje tylko istniejące grywalne hero contexty i prowadzi do dashboard/game shell.

**Scope:**

- Show server/hero selector for contexts where the logged-in account already has a playable hero.
- A combined server+hero select is acceptable.
- For standard servers, one normal hero per account/server is expected.
- Sandbox/test servers may show multiple heroes for privileged users.
- Selected context detail should show:
  - server name/kind/status;
  - hero name;
  - safe hero summary, e.g. level/rank if available;
  - next route: dashboard/game shell.
- CTA: `Enter dashboard` / `Enter the game`.
- On enter, set/refresh selected server and active hero context, then route into the in-game shell.

**Out of scope:**

- Hero creation.
- Origin editing.
- Stat allocation route for existing heroes.
- Player profile redesign.

**Data/source rules:**

- Existing hero contexts must come from DB/RPC/read model.
- Do not assume one global hero per account.
- Do not assume `hero.id === auth.uid()`.
- Player-facing payload must not expose account ids, staff-only data or raw internal row ids unless already part of safe route state.

**UI/SCSS rules:**

- Prefer compact select/dropdown plus detail card over a large grid.
- Use global form/select wrappers and card/summary-row patterns.
- Do not create permanent local badge/card systems.

**Dependencies/blockers:**

- Missing read model for account-accessible hero contexts.
- Missing active hero context setter/reloader.
- Missing dashboard route or route guard behavior.

**Acceptance criteria:**

- Existing hero on selected server routes to dashboard/game shell by default.
- Existing hero does not route back to stat allocation unless the user explicitly chooses that in-game route later.
- Sandbox/test multi-hero user can select another hero where permissions allow.
- Selected server and active hero remain explicit.
- Stale responses from context switch do not overwrite current selection.

**Verification/smoke:**

- `npx tsc --noEmit`
- focused active-context specs if added
- `npm run build`
- Manual smoke:
  - one existing standard hero;
  - multiple server contexts;
  - sandbox/test multi-hero context if data exists.

---

## UI-ONBOARDING-ADD-3 — Create New Hero / Join New World server eligibility selector

**Goal:**  
Utworzyć account-shell section `Create new hero` / `Join new world`, która pozwala wybrać serwer kwalifikujący się do stworzenia postaci i pokazuje creation availability oraz district A capacity.

**Scope:**

- Use a compact server select/dropdown, not a large server card grid by default.
- Detail card under select must show:
  - server name;
  - server kind, e.g. `standard`, `sandbox/test`;
  - server status;
  - hero state for current user;
  - creation availability;
  - visible district A starting-estate capacity/free slots for standard servers;
  - next route.
- Eligible standard server with no hero and free district A slots routes to Hero Creation.
- Full standard server can be shown as blocked/unavailable or included as explanatory disabled option.
- Sandbox/test server can show privileged creation / hero selector behavior where access permits.
- CTA should be visually prominent near the selected server details, not hidden only in a distant footer if the final layout allows it.

**Out of scope:**

- Hero name form.
- Origin selection.
- Estate address preview.
- Direct creation mutation.
- Final server marketing/lore page.

**Data/source rules:**

- Server availability must account for whether the selected standard server can provide a free district A starting address.
- Capacity/free-slot display comes from DB/RPC/read model.
- Angular must not guess capacity or assign addresses.
- Player does not choose or preview exact starting estate address before creation.

**UI/SCSS rules:**

- Use PrimeNG/select wrapper or approved form pattern for server selection.
- Use shared summary rows for server facts.
- Use status badges/pills for availability.
- No copied `mb-*` class names from prototype.

**Dependencies/blockers:**

- Missing server eligibility read model with district A capacity/free slots.
- Missing route to Hero Creation.
- Missing sandbox/test privilege read model.

**Acceptance criteria:**

- Server selector is compact and readable.
- District A free starting slots are visible for standard server creation state.
- Full standard server cannot proceed to hero creation.
- Eligible server proceeds to Hero Creation screen.
- Existing hero state is not mixed with origin/name form on this screen.

**Verification/smoke:**

- `npx tsc --noEmit`
- `npm run build`
- Manual smoke:
  - eligible standard server;
  - standard server full/no free district A starts;
  - server with existing hero;
  - sandbox/test if data exists.

---

## UI-ONBOARDING-ADD-4 — Hero Creation screen: name + origin carousel

**Goal:**  
Wdrożyć Hero Creation screen jako drugi i ostatni account-side creation screen: readonly server context, hero name, origin carousel, creation summary and `Create hero`.

**Scope:**

- Screen opens only after an eligible server has already been selected.
- Show readonly selected server context, including creation open and district A availability summary.
- Show hero name field.
- Show origin selection as a visual carousel, not four static cards only.
- Canonical prototype origins:
  - `Spartanin` / Spartan;
  - `Ateńczyk` / Athenian;
  - `Kreteńczyk` / Cretan;
  - `Koryntianin` / Corinthian.
- Carousel should include:
  - large central active artwork;
  - previous/next navigation;
  - quick origin tabs or dots;
  - selected origin summary;
  - bonus/lore display area.
- Use origin artwork assets through a production asset registry/read model, not hardcoded asset paths in feature code.
- Origin bonus display must render concrete DB-backed bonus rows when available.
- Known design note: Koryntianin / Corinthian has `+10 Luck`, but production must still read it from canonical origin bonus data rather than hardcoding Angular constants.

**Out of scope:**

- Designing final origin balance values.
- Direct hero table writes.
- Editing origin after creation.
- Stat allocation UI redesign.
- Implementing image generation or changing assets.

**Data/source rules:**

- Origin labels, descriptions, lore, helper text, artwork keys and bonuses are DB/admin-configurable content in production.
- Do not hardcode final origin content as the long-term source of truth.
- Origin bonuses should flow through canonical bonus model/read model, e.g. `entity_bonuses(entity_type = origin)` / resolved bonus read model where available.
- If origin content/read model does not include exact bonuses/artwork keys, report a DB/content blocker or implement only a read-only placeholder surface if explicitly scoped.
- Hero name uniqueness is per server and must be validated by backend/RPC on create; optional frontend precheck is not authoritative.

**UI/SCSS rules:**

- Prototype carousel motion is visual direction only; do not copy canvas JS/CSS.
- Production should use Angular component/state with accessible controls.
- Carousel must support keyboard path and reduced motion.
- Origin artwork must have alt text or accessible label.
- Use global cards/summary rows/badges/buttons/select/input wrappers.
- Local SCSS only for constrained carousel layout if no shared pattern exists; report why.

**Dependencies/blockers:**

- Missing DB/RPC origin read model with lore/bonus/artwork content.
- Missing canonical hero creation RPC/workflow.
- Missing asset registry convention for origin artwork.
- Missing Reactive Forms/form factory pattern for creation form.

**Acceptance criteria:**

- Hero Creation contains only selected server context, hero name, origin carousel and create actions.
- It does not show server list as a new choice.
- It does not present stat allocation as account-onboarding step.
- Selecting origins updates main artwork, details, bonuses and summary.
- `Create hero` remains disabled/invalid when hero name is empty.
- Exact origin bonus values are not hardcoded in Angular.
- Koryntianin `+10 Luck`, if displayed, comes from the DB/read model or is clearly marked as prototype-only placeholder in non-production scope.
- Create action uses canonical backend workflow when implemented.

**Verification/smoke:**

- `npx tsc --noEmit`
- focused form/state/component specs if added
- `npm run build`
- Manual smoke:
  - type hero name;
  - cycle carousel left/right;
  - select each origin through quick tab/dot;
  - view DB-backed bonuses;
  - submit with valid name/origin;
  - submit with duplicate name shows backend error;
  - full server cannot reach this screen except as blocked route guard case.

---

## UI-ONBOARDING-ADD-5 — Hero Creation canonical workflow and post-create handoff

**Goal:**  
Ensure the UI handoff from Hero Creation to gameplay matches Epic X: one backend workflow creates the hero and routes into in-game stat allocation as the default first location.

**Scope:**

- Use canonical DB/RPC/domain workflow for hero creation.
- Payload should include only approved input:
  - selected server id;
  - hero name;
  - selected origin id/key as required by RPC.
- Backend workflow owns:
  - hero row creation;
  - origin assignment;
  - 1000 Character Points;
  - random free district A estate assignment;
  - any resource/audit/onboarding side effects;
  - duplicate-name and server-full validation.
- After success:
  - refresh selected/current server if needed;
  - refresh active hero context;
  - enter in-game shell;
  - default route to stat allocation.
- Later entries with existing hero route to dashboard, not stat allocation.

**Out of scope:**

- DB migration or RPC creation in a pure UI task.
- Angular fallback creation through direct `.insert()` / `.update()` / `.upsert()`.
- Changing stat allocation save behavior.
- Forcing player to spend all 1000 CP immediately.

**Data/source rules:**

- If canonical creation RPC is missing from generated types/schema, stop and report DB/RPC blocker.
- Do not patch generated `database.types.ts`.
- Do not create temporary manual interfaces hiding missing generated RPC contract unless explicitly approved as a spike.
- All durable effects are backend-owned.

**UI/SCSS rules:**

- Submit/loading/success/error states must be explicit.
- Backend validation errors must be readable, especially duplicate name and full server.
- Stale guard required if selected server/origin/name changes during async submit.

**Dependencies/blockers:**

- Missing canonical creation RPC/domain service.
- Missing active hero reload path after creation.
- Missing stat allocation route.
- Missing error mapping for duplicate name/full server.

**Acceptance criteria:**

- No direct table writes to `hero`, origin assignment, `hero_stats`, Character Points, estate/resources/audit/onboarding tables.
- Successful creation refreshes active hero and routes to in-game stat allocation.
- Existing hero refresh/re-entry routes to dashboard.
- Duplicate name and full server errors are surfaced without corrupting UI state.
- Player can leave stat allocation later.

**Verification/smoke:**

- `npx tsc --noEmit`
- focused submit/routing/state specs if added
- `npm run build`
- static grep:
  - no `.insert(` / `.update(` / `.upsert(` in hero creation feature path for durable workflow tables;
  - no `ngModel` in new/touched form;
  - no hardcoded origin bonus constants as production source.
- Manual smoke:
  - successful new hero;
  - duplicate name;
  - server full between selection and submit;
  - refresh after creation routes to dashboard on later entry;
  - stat allocation can be left.

---

## UI-ONBOARDING-ADD-6 — Origin content and artwork registry/read-model follow-up

**Goal:**  
Define the content/read-model requirements for production origin carousel implementation so Codex does not hardcode origin lore, artwork paths or bonuses.

**Scope:**

- Audit current DB/read models for origin content:
  - origin label/name;
  - description/lore/helper text;
  - artwork key/path/registry reference;
  - resolved bonuses from canonical bonus system;
  - active/sort order.
- Decide whether artwork keys live in DB content metadata, asset registry, or a small app-side mapping keyed by DB-owned origin key.
- Ensure canonical origins are represented:
  - Spartan / Spartanin;
  - Athenian / Ateńczyk;
  - Cretan / Kreteńczyk;
  - Corinthian / Koryntianin.
- Confirm exact origin bonuses are visible from a read model before production carousel uses them.
- Produce a blocker list for missing content/data, not a frontend-hardcoded substitute.

**Out of scope:**

- Creating/changing DB schema unless the user explicitly asks for DB/migrator work.
- Final balance design.
- Asset generation.
- Updating generated database types.

**Data/source rules:**

- Prefer current schema/dump and `database-current.md` over legacy concept docs.
- Origin bonuses should use canonical bonus model, not legacy hardcoded presentation.
- If DB contains legacy `origin_bonuses` but app target is `entity_bonuses`, report transitional status clearly.

**UI/SCSS rules:**

- This task may be documentation/audit-only if content contracts are missing.
- No prototype CSS changes required.

**Dependencies/blockers:**

- Missing origin artwork content source.
- Missing resolved bonus read model.
- Missing admin/content route to edit origin lore/bonus presentation.

**Acceptance criteria:**

- Report identifies the current source of origin names, descriptions, artwork and bonuses.
- Report states whether Hero Creation carousel can be implemented without hardcoding permanent content.
- Missing content is listed as DB/content/admin blocker.
- If implementation proceeds, it consumes DB/read-model content and safe asset keys.

**Verification/smoke:**

- No build required if audit-only.
- If code changes are made: `npx tsc --noEmit`, `npm run build`.

---

## UI-ONBOARDING-ADD-7 — Archive accepted onboarding prototypes and production mapping

**Goal:**  
Add the accepted account entry and hero creation carousel prototypes to the UI/UX prototype archive/mapping so future Codex work uses them as visual reference only.

**Scope:**

- Archive accepted prototypes, using final names agreed by user:
  - Account Entry Shell / server+hero context selector prototype;
  - Hero Creation Origin Carousel prototype.
- Add mapping entries to prototype-to-production mapping:
  - account/public shell;
  - enter game existing-hero selector;
  - create new hero server eligibility selector;
  - hero creation origin carousel;
  - origin artwork/content read model;
  - post-create route into stat allocation.
- Each mapping entry must state:
  - production pattern target;
  - missing shared/global pattern if any;
  - local layout-only exception if any;
  - DB/RPC/read-model blocker if any.

**Out of scope:**

- Angular implementation.
- Copying prototype CSS/JS.
- Marking task complete in status docs.

**Data/source rules:**

- Archive entries must not claim DB/RPC exists if it does not.
- Prototype is visual reference only.
- Use current decisions for flow semantics.

**UI/SCSS rules:**

- Include standard `VISUAL REFERENCE ONLY` header in archived prototype HTML.
- Do not archive placeholder screens invented without user acceptance.

**Acceptance criteria:**

- UI/UX backlog points to the accepted prototypes.
- Prototype-production mapping prevents copying canvas classes/CSS.
- Future Codex task can identify which prototype to consult and which production patterns to use.

**Verification/smoke:**

- Docs-only review.
- Confirm filenames/paths with user before status docs update.

---

## UI-ONBOARDING-ADD-8 — Mobile/responsive check for account entry and hero creation carousel

**Goal:**  
Zapisać i później sprawdzić minimalne mobile/tablet constraints dla account entry i Hero Creation carousel, bez pełnego mobile redesignu.

**Scope:**

- Account Entry Shell:
  - sidebar may stack above content on narrow screens;
  - select/dropdown remains reachable;
  - CTA remains visible without horizontal scroll.
- Hero Creation carousel:
  - origin artwork and details stack on mobile;
  - carousel arrows/tabs are large enough for touch;
  - no hover-only critical information;
  - reduced motion supported;
  - page can scroll vertically, but the create action remains reachable.
- Stat allocation handoff:
  - after creation, mobile user should not be trapped in a confusing route state.

**Out of scope:**

- Full mobile redesign.
- Rewriting in-game shell navigation.
- Native app gestures.

**Data/source rules:**

- No DB changes.

**UI/SCSS rules:**

- Use responsive global utilities/patterns where available.
- Feature-local responsive CSS only for carousel geometry if no shared pattern exists.
- Report any unavoidable local SCSS.

**Acceptance criteria:**

- No horizontal scroll for primary controls at mobile width.
- Keyboard and touch paths exist for origin selection.
- Reduced motion does not break selection.
- CTA remains reachable.

**Verification/smoke:**

- Browser responsive smoke at desktop/tablet/mobile widths.
- Keyboard smoke for carousel controls.
- Reduced-motion smoke where practical.

# Appendix A — New task template

## UI-AREA-N — Task title

Goal:

Scope:

Out of scope:

Data/source rules:

Acceptance criteria:

Required Codex report:

- reused:
- checked but not reused:
- new component/state/helper added:
- scope kept minimal:
- not added intentionally:
- global tokens used:
- shared/vendor components used:
- global/shared SCSS classes used:
- local SCSS added:
- why local SCSS was necessary:
- copied from prototype: yes/no
