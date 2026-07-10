# Tryby wykonawcze

## Implementation

Użyj, gdy goal, authority, kontrakty i acceptance są zamknięte.

- Implementuj najmniejszą kompletną ścieżkę runtime.
- Reuse istniejące services, state patterns, mappers, utilities, wrappers i form configs.
- Nie twórz architektury „na przyszłość”.
- Zatrzymaj się przy pierwszym brakującym authoritative contract.

## Surgical repair

Użyj dla poprawek po Review Gate, regresji i usuwania workarounds.

- Najpierw potwierdź root cause w aktualnym kodzie.
- Zmień minimalny potrzebny zakres.
- Usuń workaround, starą ścieżkę i martwy kod zamiast przykrywać je kolejną warstwą.
- Nie dodawaj nowych abstrakcji, jeśli naprawa może użyć canonical path.
- Jeśli naprawa wymaga wyjścia poza bieżącą paczkę lub znacząco zwiększa diff, zatrzymaj się i nazwij powód przed rozszerzeniem scope.

## Blocker handoff

Gdy brakuje inputu, raportuj:

- dokładny brakujący kontrakt lub decyzję;
- plik/flow blokowany przez brak;
- właściwego wykonawcę: użytkownik, Task Architect, Migrator DB/RPC albo designer;
- pracę wykonaną przed blockerem;
- potwierdzenie, że nie dodano fallbacku ani nie dotknięto status docs.

## Completion receipt

Stosuj krótki format wymagany przez `AGENTS.md`. Raportuj realne wyniki komend. Dla manualnego smoke użyj wyłącznie `not run`, `pending`, `user-side`, `not applicable` albo rzeczywiście potwierdzonego wyniku użytkownika.
