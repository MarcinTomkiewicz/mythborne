# Mythborne — standardy review Codexa

## Format oczekiwanego review

Preferowany format odpowiedzi asystenta po raporcie Codexa:

1. Decyzja: `AKCEPTACJA`, `AKCEPTACJA WARUNKOWA`, `BLOCKER`, albo `DO DOPRECYZOWANIA`.
2. Krótki komentarz dlaczego.
3. Konkretne uwagi do przekazania Codexowi.
4. Osobno: co zostaje jako pending manual smoke, jeśli faktycznie nie da się tego sprawdzić bez danych/sesji.

Jeśli użytkownik prosi: „daj sam review comment”, nie dodawać tabel, długiej analizy ani sekcji dla użytkownika. Dać gotowy komentarz do Codexa.

## Obowiązkowy shared/reuse check dla Codexa

Codex ma w każdym raporcie dla większego UI/workflow dopisać:

- `reused:` — jakie istniejące komponenty/state/helpers/services wykorzystał,
- `checked but not reused:` — co sprawdził, ale świadomie odrzucił i dlaczego,
- `new component/state/helper added:` — co dodał i dlaczego nie pasował istniejący wzorzec.

To nie ma być ozdobnik. Review powinno sprawdzać, czy deklaracja jest wiarygodna. Jeśli Codex tworzy kolejny podobny action-card, state, autocomplete, JSON preview, metadata display albo status form, trzeba zapytać, czy nie istnieje już shared/pattern do reuse.

## Checklist: architektura i pliki

- Interfejsy, typy i form types nie mogą lądować w komponentach.
- Domenowe modele: `core/domain/...`.
- Typy formularzy: `core/types/forms/...`.
- Generyczne typy: `core/types/...`.
- Mappery/utils: `core/utils/...`, jeśli są czyste i testowalne.
- Workflow/state: `core/services/...` albo dedykowane state/workflow class, jeśli logika jest większa niż cienki helper.
- Komponenty UI mają być możliwie cienkie.
- Duży HTML/TS komponent jest sygnałem ostrzegawczym; szczególnie 250–400+ linii w kodzie produkcyjnym.
- Długie test fixtures są mniej groźne, ale jeśli utrudniają review, wydzielić fixtures/factories.

## Checklist: RPC i DB

- Czy workflow idzie przez canonical RPC?
- Czy nie ma direct `create/update/upsert/insert` do tabel workflow?
- Czy payload wysyła tylko pola właściwe dla danej akcji?
- Czy status-only action nie przepisuje verdict/operator notes?
- Czy verdict-only action nie interpoluje verdict reason do status reason?
- Czy service nie używa legacy RPC, jeśli projekt zdecydował o dedicated service?
- Czy server scope jest jawny i nie ma globalnego fallbacku?
- Czy po RPC wynik jest mapowany do jawnego modelu domenowego?
- Czy błędy „no row” / missing result są jasne?

## Checklist: DB-backed dictionaries

- Label typów ma pochodzić z DB dictionary.
- Raw key pokazujemy najwyżej jako secondary metadata: `Type key: ...`.
- Inactive/deprecated typy muszą być dociągane przez referenced lookup.
- Dla historii/prior records nie wolno zakładać, że current active dictionaries wystarczą.
- Fallback do raw key jest dopuszczalny dopiero gdy DB label nie istnieje.
- Dictionary-backed labels/descriptions są szczególnie ważne dla: sanction types, report types, declaration types, signal types.

## Checklist: stale guards

Każdy async UI workflow musi mieć guard na success i error path, jeśli zależy od:

- selected server,
- route `caseId`,
- case context,
- selected target,
- selected sanction,
- selected penalty,
- selected item,
- access/gate.

Przykładowe wymagania:

- stary success nie może nadpisać current state,
- stary error nie może pokazać błędu po zmianie kontekstu,
- loading powinien się kończyć tylko dla aktualnego requestu,
- zmiana contextu powinna czyścić stale form state i feedback,
- jeśli selected entity zmieni się w trakcie requestu, response ma być ignorowany.

## Checklist: UI/UX i smoke

- Search/filter nie może być UUID-only.
- Admin/operator musi mieć wygodne wyszukiwanie po hero/account/email/name/item/technical id, zależnie od domeny.
- Smoke test jest po to, żeby wykrywać realne UX blockery.
- Jeśli użytkownik zgłasza w smoke, że nie da się wykonać potrzebnej pracy, to jest blocker.
- Do późniejszego manual smoke odkładamy tylko to, czego nie da się teraz sprawdzić z powodu braku realnych danych, zalogowanej sesji albo gameplayu.
- Nie akceptować „zrobione” tylko dlatego, że route smoke daje 200.
- Route smoke `200` to minimum, nie pełny smoke.

## Checklist: player/staff privacy

- Player-facing modele nie mogą wystawiać staff-only pól typu `adminNotes`, `operatorNotes`, `statusReason`, `verdictReason`, global account ids itd.
- Staff-facing modele mogą zawierać staff-only context, ale muszą być gated i server-scoped.
- Jeśli pole jest global/user id, sprawdzić, czy model player-facing nie leakuję go przypadkiem.

## Checklist: Angular/PrimeNG patterns

- Reactive forms zamiast `ngModel` / `FormsModule`.
- Unikać deprecated PrimeNG API.
- Nie używać `p-message text` starego stylu.
- Uważać na `className`, niekontrolowane `[class]` i łamanie standardów stylowania projektu.
- Długie powtarzalne sekcje HTML rozbijać na mniejsze komponenty albo shared display components.
- `muted-text` tylko dla labeli, opisów pomocniczych i metadata, nie dla decyzji/reason/notes.
- JSON preview tylko collapsed i shared, jeśli naprawdę diagnostycznie potrzebne.

## Checklist: statusy i dokumentacja

- Jeśli użytkownik mówi, żeby nie aktualizować MD/statusów przed akceptacją, Codex nie ma tego robić.
- Po akceptacji można dopiero uaktualniać statusy/backlog/MD zgodnie z zakresem.
- W raportach trzeba jasno pisać, czy MD/statusy ruszono.

## Stała uwaga reviewerska do Codexa

Przy każdej większej paczce zmian pamiętaj o dopisaniu:

> Upewnij się, że przed dodaniem nowych komponentów, state classes, helperów albo wrapperów sprawdziłeś istniejące shared komponenty i wzorce w projekcie. W raporcie podaj `reused`, `checked but not reused` i `new component/state/helper added`. To jest stały wymóg review, nie opcjonalna notatka.

## Przykładowy krótki review comment dla Codexa

```
Hxx wymaga poprawki przed akceptacją.

Blocker: [konkretny problem]. To nie jest follow-up, bo [dlaczego blokuje realny workflow / łamie ustalony standard].

Popraw:
- ...
- ...
- ...

Dodaj testy na:
- ...
- ...

W raporcie potwierdź też shared/reuse check: co reuse’owałeś, co sprawdziłeś i świadomie odrzuciłeś, oraz czy nie ruszałeś MD/statusów przed akceptacją.
```

