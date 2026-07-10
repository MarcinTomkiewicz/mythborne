---
name: mythsworn-codex-executor
description: Wykonuj pojedyncze taski implementacyjne i poprawki po Review Gate w repozytorium Mythsworn. Używaj przy pracy Codexa nad Angular/TypeScript/HTML/SCSS, integracją z gotowym DB/RPC contract, refaktorem lub surgical repair. Stosuj AGENTS.md, zatrzymuj się przy brakującym kontrakcie, usuwaj zastępowany kod, audytuj całe dotknięte pliki i kończ krótkim completion receipt zamiast review memo.
---

# Mythsworn Codex Executor

## Zasada nadrzędna

Wykonaj jeden bieżący task w granicach jego scope. Nie projektuj brakującej architektury ani DB/RPC contract podczas implementacji. Nie wydawaj sobie werdyktu review ani zgody na commit.

Zawsze zastosuj root `AGENTS.md` oraz najbliższy `AGENTS.md` dla dotkniętego katalogu. Przeczytaj [references/execution-modes.md](references/execution-modes.md), gdy task jest poprawką po review, refaktorem lub ma niejasny zakres.

## Przebieg

1. Ustal jeden cel, acceptance, out of scope i oczekiwany runtime result.
2. Wykonaj cichy preflight wymagany przez `AGENTS.md`: dirty tree, task-relevant sources, current files, reuse candidates i blockers.
3. Wybierz tryb:
   - `implementation` dla nowej, zamkniętej funkcji o gotowych kontraktach;
   - `surgical repair` dla komentarza reviewowego, regresji albo usuwania złej ścieżki.
4. Zatrzymaj się przed edycją, jeśli brakuje DB/RPC/read-model/generated type, decyzji UX albo innego authoritative input. Zgłoś dokładny blocker; nie twórz fallbacku.
5. Zaimplementuj minimalną kompletną ścieżkę, używając istniejącej logiki przed dodaniem nowej.
6. Usuń kod zastępowany przez task: stare flow, compatibility alias, workaround, fallback, martwy import, stale spec i transitional wrapper.
7. Wykonaj pełny touched-file audit zgodnie z `AGENTS.md`; dług jakości w dotkniętym pliku nie jest przyszłym follow-upem.
8. Uruchom `npm run codex:guard`, wymagane static checks oraz weryfikację z `AGENTS.md`.
9. Zwróć krótki completion receipt. Nie kopiuj zasad, preflightu ani historii taska.

## Granice

- Nie rozszerzaj scope pod pozorem cleanupu plików, których task nie dotyka.
- Nie dodawaj nowej warstwy, helpera, mappera, serwisu, modelu, typu, komponentu ani configu bez sprawdzenia istniejącego ownership i konkretnego uzasadnienia.
- Nie zostawiaj Codexowi ani użytkownikowi alternatyw implementacyjnych. Jeśli decyzja jest złożona i niezamknięta, zatrzymaj task.
- Nie edytuj `database.types.ts`, live DB, status docs ani unrelated backlogu.
- Nie traktuj builda, speców ani route `200` jako manualnego smoke.
- Nie wykonuj commita bez jawnej instrukcji użytkownika i pozytywnej decyzji zewnętrznego Review Gate.

## Tryb poprawki po review

Traktuj `Comment for Codex` jako zamkniętą listę wymaganych poprawek bieżącej paczki, nie jako zaproszenie do nowego taska. Napraw wskazane elementy jedną wybraną ścieżką, usuń przyczynę i obejścia, ponownie zweryfikuj całą paczkę i nie dodawaj nowych feature'ów.
