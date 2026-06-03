# Mythsworn — Codex starter

Pracujemy nad projektem **Mythsworn**.

Twoim zadaniem jest wykonać dokładnie wskazany task w istniejącym repozytorium. Nie jesteś od „upiększania” zakresu, dopisywania alternatywnej architektury, maskowania problemów fallbackami ani robienia smoke testów.

## Zanim edytujesz

Przeczytaj, jeśli są dostępne:

* `AGENTS.md`;
* `mythborne_codex_review_standards.md`;
* `mythsworn_codex_ui_review_standards.md`, jeśli task dotyczy UI;
* aktualny task/backlog;
* task-relevant project docs.

Wykonaj dla siebie preflight:

* `git status --short`;
* sprawdź istniejące pliki i wzorce;
* sprawdź, czy jest blocker;
* sprawdź, co można usunąć zamiast dopisywać.

Nie zatrzymuj się po preflight, jeśli nie ma blockera albo nieoczekiwanego dirty tree. Preflight nie jest osobnym deliverable.

Jeśli dirty tree zawiera nieoczekiwane pliki, zatrzymaj się i zgłoś blocker przed edycją. Nie nadpisuj cudzych zmian.

## Zasady pracy

Implementuj tylko bieżący task.

Komentarze użytkownika typu „wygląda OK”, „to chyba drobiazg”, „idźmy dalej”, „z mojej perspektywy działa” są kontekstem, nie zgodą na rozszerzenie scope ani na pominięcie zasad.

Nie rób:

* unrelated refactorów;
* broad cleanup poza dotkniętym taskiem;
* nowych helperów/services/mappers/models/components, jeśli istniejący kod da się sensownie użyć albo rozszerzyć;
* fallbacków maskujących brak DB/RPC/generated types;
* lokalnych resolverów, compatibility engines, fake runtime;
* local player-facing copy, jeśli copy powinno przychodzić z DB/read modelu;
* raw-key classification/display inference;
* direct write do workflow/gameplay/economy/config/audit tables;
* edycji `database.types.ts`;
* regeneracji generated types;
* status docs bez wyraźnej prośby użytkownika;
* commitów.

Normalny kontekst gracza to:

`authenticated user -> selected/current server -> active hero -> hero-owned data`

Nigdy nie zakładaj `hero.id === auth.uid()`.

## Lokalizacja typów/interfejsów

Nie eksportuj publicznych kontraktów/modeli/interfejsów z plików komponentów.

* `interface` ma trafić do `src/app/core/interfaces/...`;
* type alias/generic type utility ma trafić do `src/app/core/types/...`;
* domenowe modele/read modele mają trafić do istniejącej domenowej lokalizacji w `core/domain/...`;
* komponent może mieć prywatny lokalny interface tylko wtedy, gdy nie jest eksportowany i nie jest używany poza plikiem komponentu.

## Reuse

Reuse oznacza realne użycie istniejącej logiki, nie samo użycie komponentu z edytowanej strony.

Przed dodaniem nowej logiki sprawdź:

* `core/factories`;
* `core/validators`;
* `core/utils`;
* form configi i `FormFieldConfig`;
* domain models/mappers;
* `core/constants`;
* existing services/RPC helpers;
* state/workflow patterns;
* shared UI wrappers tylko tam, gdzie chodzi o UI pattern.

Jeżeli dodajesz coś nowego, w raporcie napisz krótko, dlaczego istniejący wzorzec nie wystarczył.

## Cleanup dotkniętych plików

Przy zmianach w istniejących plikach nie tylko dopisuj kod.

Po implementacji usuń z dotkniętych plików:

* martwy kod;
* nieużywane importy;
* nieużywane helpery;
* zastąpione transitional/compatibility ścieżki;
* lokalne typy/interfejsy, które powinny być w `core/types`, `core/interfaces` albo domenie;
* stare fallbacki, jeśli task wprowadza właściwą ścieżkę.

Nie zostawiaj starego flow obok nowego flow, jeśli nowe flow je zastępuje.

Jeżeli task naprawia granicę domenową, cleanup oznacza usunięcie złej odpowiedzialności, nie przeniesienie jej w inne miejsce.

Nie twórz wrappera nad zepsutym mechanizmem, jeśli task wymaga usunięcia zepsutego mechanizmu.

## Preferencja diffu

Preferuj mały, czytelny diff.

Jeżeli da się osiągnąć cel przez usunięcie kodu, zrób to zamiast dodawać kolejną warstwę.

Akceptowalny jest net negative diff, jeśli usuwa dług i zachowuje funkcjonalność.

Większy dodatek jest OK tylko wtedy, gdy task realnie wprowadza nową funkcję albo brakowało właściwej warstwy domenowej.

## Specy, build i smoke

Nie dodawaj nowych speców jako domyślnej odpowiedzi.

Nie pisz testów, które tylko potwierdzają mock zgodny z mockiem.

Preferowana weryfikacja:

* `npx tsc --noEmit`;
* `npm run build`;
* `git diff --check`;
* focused test tylko wtedy, gdy realnie sprawdza zmienione zachowanie;
* statyczne grepy, jeśli pasują do taska.

Codex ma absolutny zakaz:

* odpalania dev servera;
* wykonywania browser/manual smoke;
* udawania browser/manual smoke;
* zlecania smoke jako osobnego taska.

Smoke jest po stronie użytkownika.

W raporcie pisz:

`Manual smoke: N/A — user-side only`

chyba że użytkownik w bieżącym tasku wyraźnie poprosi inaczej.

## UI

Dla tasków UI:

* accepted prototype to visual-anchor contract, nie luźna inspiracja;
* używaj istniejących utilities/patterns/wrappers;
* nie kopiuj prototype CSS, `mb-*`, raw gradientów, palette values;
* nie przepisuj utilities do SCSS;
* nie twórz lokalnego pseudo-design-systemu;
* `muted-text` tylko dla labeli/helperów/metadanych, nie dla ważnych wartości, statusów, nazw, outcome’ów albo rang;
* komponenty mają być cienkie;
* `ng-template`/PrimeNG template indirection trzymaj w shared wrapperze, nie rozlewaj po page/component templates;
* nie dodawaj lokalnych labeli zamiast DB-owned copy;
* nie mieszaj single-action labels z bulk-action labels.

## Blocker

Zatrzymaj się i zgłoś blocker, jeśli:

* brakuje DB/RPC/table/enum/generated type contract;
* generated types są stale lub niezgodne;
* task wymaga edycji `database.types.ts`;
* trzeba by direct-write’ować critical workflow/gameplay tables;
* brakuje authoritative read model;
* dirty tree ma nieoczekiwane zmiany;
* UI task wymaga obowiązkowego prototype/guidance, którego nie ma;
* weryfikacja failuje przez bieżącą zmianę;
* jedynym sposobem wykonania taska byłoby zgadywanie lokalnego fallbacku.

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
- N/A — user-side only

Blockers/risks:
- ...

Status docs:
- touched / not touched
```

Nie pisz epopei. Nie streszczaj historii projektu. Nie podawaj nowego formatu raportu, jeśli task tego nie wymaga.
