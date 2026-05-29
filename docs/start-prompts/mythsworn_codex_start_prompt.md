# Mythsworn — Codex starter

Pracujemy nad projektem **Mythsworn**.

Twoim zadaniem jest wykonać dokładnie wskazany task w istniejącym repozytorium. Nie jesteś od „upiększania” zakresu, nie jesteś od dopisywania alternatywnej architektury i nie jesteś od maskowania problemów fallbackami.

## Zanim edytujesz

Przeczytaj, jeśli są dostępne:

* `AGENTS.md`;
* `mythborne_codex_review_standards.md`;
* `mythsworn_codex_ui_review_standards.md`, jeśli task dotyczy UI;
* aktualny task/backlog;
* task-relevant project docs.

Wykonaj dla siebie krótki preflight:

* `git status --short`;
* sprawdź istniejące pliki i wzorce;
* sprawdź, czy jest blocker;
* sprawdź, co można usunąć zamiast dopisywać.

Nie zatrzymuj się po preflight, jeśli nie ma blockera albo nieoczekiwanego dirty tree. Preflight nie jest osobnym deliverable.

## Zasady pracy

Implementuj tylko bieżący task.

Nie rób:

* unrelated refactorów;
* nowych helperów/services/mappers/models/components, jeśli istniejący kod da się sensownie użyć albo rozszerzyć;
* fallbacków maskujących brak DB/RPC/generated types;
* lokalnych resolverów, compatibility engines, fake runtime;
* direct write do workflow/gameplay/economy/config/audit tables;
* edycji `database.types.ts`;
* status docs bez wyraźnej prośby użytkownika.

Normalny kontekst gracza to:

`authenticated user -> selected/current server -> active hero -> hero-owned data`

Nigdy nie zakładaj `hero.id === auth.uid()`.

## Reuse

Reuse oznacza realne użycie istniejącej logiki, nie samo użycie komponentu z edytowanej strony.

Przed dodaniem nowej logiki sprawdź:

* `core/utils`;
* `core/factories`;
* `core/validators`;
* form configi i `FormFieldConfig`;
* domain models/mappers;
* `core/constants`;
* existing services/RPC helpers;
* state/workflow patterns;
* shared UI wrappers tylko tam, gdzie chodzi o UI pattern.

Jeżeli dodajesz coś nowego, w raporcie napisz krótko, dlaczego istniejący wzorzec nie wystarczył.

## Cleanup jest częścią taska

Przy zmianach w istniejących plikach nie tylko dopisuj kod.

Po implementacji usuń z dotkniętych plików:

* martwy kod;
* nieużywane importy;
* nieużywane helpery;
* zastąpione transitional/compatibility ścieżki;
* lokalne typy, które powinny być w `core/types`, `core/interfaces` albo domenie;
* stare fallbacki, jeśli task wprowadza właściwą ścieżkę.

Nie zostawiaj starego flow obok nowego flow, jeśli nowe flow je zastępuje.

Jeżeli task naprawia granicę domenową, cleanup oznacza usunięcie złej odpowiedzialności, nie przeniesienie jej w inne miejsce.

Nie twórz wrappera nad zepsutym mechanizmem, jeśli task wymaga usunięcia zepsutego mechanizmu.

## Preferencja diffu

Preferuj mały, czytelny diff.

Jeżeli da się osiągnąć cel przez usunięcie kodu, zrób to zamiast dodawać kolejną warstwę.

Akceptowalny jest net negative diff, jeśli usuwa dług i zachowuje funkcjonalność.

Większy dodatek jest OK tylko wtedy, gdy task realnie wprowadza nową funkcję albo brakowało właściwej warstwy domenowej.

## Specy i testy

Nie dodawaj nowych speców jako domyślnej odpowiedzi.

Jeżeli istniejący spec przestaje przechodzić dlatego, że task usuwa starą ścieżkę albo zmienia zaakceptowane zachowanie, usuń albo popraw tylko ten spec, jeśli nadal testuje realną wartość.

Nie pisz testów, które tylko potwierdzają mock zgodny z mockiem.

Preferowana weryfikacja:

* `npx tsc --noEmit`;
* `npm run build`;
* `git diff --check`;
* focused test tylko wtedy, gdy realnie sprawdza zmienione zachowanie;
* statyczne grepy, jeśli pasują do taska;
* manual smoke tylko jeśli masz realną sesję/dane/środowisko.

Nie udawaj browser/manual smoke. Jeśli go nie wykonałeś, podaj checklistę dla użytkownika albo `N/A`.

## UI

Dla tasków UI:

* accepted prototype to visual-anchor contract, nie luźna inspiracja;
* używaj istniejących utilities/patterns/wrappers;
* nie kopiuj prototype CSS, `mb-*`, raw gradientów, palette values;
* nie przepisuj utilities do SCSS;
* nie twórz lokalnego pseudo-design-systemu;
* `muted-text` tylko dla labeli/helperów/metadanych, nie dla ważnych wartości, statusów, nazw, outcome’ów albo rang;
* komponenty mają być cienkie.

## Blocker

Zatrzymaj się i zgłoś blocker, jeśli:

* brakuje DB/RPC/table/enum/generated type contract;
* generated types są stale lub niezgodne;
* task wymaga edycji `database.types.ts`;
* trzeba by direct-write’ować critical workflow/gameplay tables;
* brakuje authoritative read model;
* dirty tree ma nieoczekiwane zmiany;
* UI task wymaga obowiązkowego prototype/guidance, którego nie ma;
* weryfikacja failuje przez bieżącą zmianę.

Blocker ma być krótki:

* co blokuje;
* gdzie;
* czego brakuje;
* co jest potrzebne od Migratora/użytkownika;
* czy coś zostało zmienione przed blockerem.

Nie wymyślaj obejścia.

## Raport końcowy

Raport maksymalnie 20 linijek.

Format:

```md
AGENTS/Review Standards: read

Preflight:
- dirty tree:
- sources checked:
- blocker: yes/no

Changed:
- ...

Removed / cleanup:
- ...

Not changed:
- ...

Reuse:
- reused:
- checked but not reused:
- new:

Verification:
- ...

Manual smoke:
- done / user-side checklist / N/A

Blockers/risks:
- ...

Status docs:
- touched / not touched
```

Nie pisz epopei. Nie streszczaj historii projektu. Nie podawaj nowego formatu raportu, jeśli task tego nie wymaga.
