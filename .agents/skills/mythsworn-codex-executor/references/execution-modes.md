# Tryby wykonawcze

## Implementation

Użyj, gdy goal, authority, kontrakty i acceptance są zamknięte.

- Implementuj najmniejszą kompletną ścieżkę runtime.
- Reuse istniejące services, state patterns, mappers, utilities, wrappers i form configs.
- Nie twórz architektury „na przyszłość”.
- Zatrzymaj się przy pierwszym brakującym authoritative contract.
- Po implementacji wykonaj pełny quality pass całych dotkniętych plików, nie tylko diffu.

## Surgical repair

Użyj dla poprawek po Review Gate, regresji i usuwania workarounds.

- Najpierw potwierdź root cause w aktualnym kodzie.
- Zmień minimalny potrzebny zakres.
- Usuń workaround, starą ścieżkę i martwy kod zamiast przykrywać je kolejną warstwą.
- Nie dodawaj nowych abstrakcji, jeśli naprawa może użyć canonical path.
- Ponownie przeanalizuj każdy symbol i template block w całej paczce; poprawka jednego review comment nie zwalnia z quality gate.
- Jeśli naprawa wymaga wyjścia poza bieżącą paczkę lub znacząco zwiększa diff, zatrzymaj się i nazwij powód przed rozszerzeniem scope.

## Quality pass

Dla każdego dotkniętego produkcyjnego `.ts`:

- zinwentaryzuj każdą klasę, interface/type/enum, funkcję, metodę, member, parametr, lokalną zmienną, constant i helper;
- przejdź przez body każdej funkcji/metody statement po statement;
- oceń nazwę, rolę, mutowalność, lifecycle, side effects, error handling, reuse, duplication i ownership;
- usuń lub popraw każdy problem przed raportem końcowym.

Dla każdego dotkniętego produkcyjnego `.html`:

- przeczytaj cały plik;
- usuń feature-local `ng-template`, `ng-container`, `ngTemplateOutlet`, `pTemplate` i template context composition;
- zastąp template indirection dedykowanym shared componentem z jawnym kontraktem;
- sprawdź repeated markup, raw copy, utility soup i utracone znaczenie wizualne.

Nie raportuj ledgera jako substytutu pracy. Ledger służy do znalezienia i naprawienia długu przed uruchomieniem guarda.

## Blocker handoff

Gdy brakuje inputu, raportuj:

- dokładny brakujący kontrakt lub decyzję;
- plik/flow blokowany przez brak;
- właściwego wykonawcę: użytkownik, Task Architect, Migrator DB/RPC albo designer;
- pracę wykonaną przed blockerem;
- potwierdzenie, że nie dodano fallbacku ani nie dotknięto status docs.

## Completion receipt

Stosuj krótki format wymagany przez `AGENTS.md`. Raportuj realne wyniki komend. Dla manualnego smoke użyj wyłącznie `not run`, `pending`, `user-side`, `not applicable` albo rzeczywiście potwierdzonego wyniku użytkownika.
