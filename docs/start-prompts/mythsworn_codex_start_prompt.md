Cześć. Pracujemy nad projektem Mythsworn.

Najpierw przeczytaj `AGENTS.md` oraz `mythborne_codex_review_standards.md`, jeśli istnieją. Potem pracuj zgodnie z bieżącym taskiem i aktualnymi plikami projektu. Jeśli któryś z wymaganych plików nie istnieje, odnotuj to w raporcie końcowym, ale nie zatrzymuj pracy, chyba że brak pliku realnie blokuje task.

Twoim zadaniem jest implementować dokładnie wskazany task w istniejącym repozytorium. Pracuj małymi, kontrolowanymi zmianami:
- realizuj tylko bieżący task;
- nie rób unrelated refactorów;
- nie rozbudowuj architektury bez potrzeby;
- nie twórz nowych helperów, services, mapperów, modeli, typów ani komponentów, jeśli istniejący kod da się sensownie użyć albo rozszerzyć;
- nie maskuj problemów fallbackami;
- jeśli brakuje kontraktu DB/RPC/generated types albo innego wymaganego źródła prawdy, zgłoś blocker zamiast wymyślać zamiennik.

Przed rozpoczęciem edycji kodu wykonaj krótki preflight dla siebie:
- sprawdź `git status --short`;
- sprawdź właściwe dokumenty i źródła dla taska;
- sprawdź istniejące wzorce do reuse;
- ustal, czy jest blocker.

Reuse oznacza przede wszystkim ponowne użycie istniejącej logiki: metod, helperów, utilsów, mapperów, validators, factories, form configów, serwisów RPC, state patterns i shared workflow patterns. Samo użycie komponentu/klasy, która naturalnie należy do edytowanej strony, nie jest wystarczającym dowodem reuse. Przed dopisaniem nowej logiki sprawdź zwłaszcza:
- `core/factories`;
- `core/validators`;
- `core/utils`;
- form configi i `FormFieldConfig`;
- istniejące domain models/mappers;
- `core/constants`;
- istniejące services/RPC helpers;
- shared/admin/game UI wrappers dopiero tam, gdzie chodzi o UI pattern.

Nie zatrzymuj się po preflight, jeśli nie ma blockera albo nieoczekiwanego dirty tree. Preflight ma być początkiem pracy, nie osobnym zadaniem do akceptacji. Wynik preflightu uwzględnij dopiero w raporcie końcowym.

Stosuj Clean Code, DRY, KISS, Separation of Concerns, Single Responsibility, reuse istniejących core/shared patterns, cienkie komponenty oraz jawne modele i mappery zamiast raw DB rows w UI.

Przy zmianach w istniejących produkcyjnych plikach nie tylko dodawaj kod. Po implementacji zrób cleanup dotkniętych plików:
- usuń martwy kod;
- usuń nieużywane importy;
- usuń zbędne helpery;
- usuń lokalne typy/interfejsy i przenieś je do odpowiedniego katalogu w core/types lub core/interfaces;
- usuń defensywne lub transitional rzeczy, które task zastępuje.

Nie bój się ciąć. Produkcyjny diff ma być możliwie mały. Jeśli dodajesz kod, szukaj równoważnego cleanupu. Preferuj minimalny net positive albo net negative, o ile nie pogarsza to czytelności. Jeśli task wymaga większego dodatku, wydziel mały komponent/service/model zgodnie z istniejącą architekturą zamiast pompować oversized file.

Nie aktualizuj status docs, chyba że użytkownik osobno o to poprosi albo potwierdzi wykonanie taska.

Po implementacji uruchom weryfikację zgodną z `AGENTS.md`, review standards i zakresem taska. Nie udawaj manual/browser smoke, jeśli nie masz realnej sesji, danych albo środowiska — wtedy podaj checklistę dla użytkownika.

Raport końcowy maksymalnie 20 linijek. Tylko:

- `AGENTS/Review Standards: read`
- `Preflight`
- `Changed`
- `Not changed`
- `Cleanup`
- `Verification`
- `Static checks`
- `Reuse`
- `Manual smoke: user-side checklist / N/A`
- `Blockers/risks`
- `Status docs: touched/not touched`

W `Reuse` nie wymieniaj klas/komponentów tylko dlatego, że były częścią edytowanej strony. Napisz krótko:
- `reused:` konkretne metody/helpery/utils/mappers/factories/validators/services/patterns użyte ponownie;
- `checked but not reused:` konkretne istniejące rzeczy sprawdzone i powód odrzucenia;
- `new:` nowe helpery/state/services/mappers/components i dlaczego istniejący wzorzec nie wystarczył.

Nie pisz epopei. Nie streszczaj oczywistości. Jeśli jesteś zablokowany, napisz krótko: co blokuje, czego brakuje i jaki kontrakt/plik jest potrzebny.