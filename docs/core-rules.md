# Mythsworn — Core Architecture Rules

Status: draft for review — corrected after pre-refactor review  
Scope: frontend architecture rules for `src/app/core`; no runtime code changes by this document  
Purpose: define what belongs in `core`, where it belongs, and when feature-local logic must stay feature-local.

Use with: `AGENTS.md`, `project-structure.md`, `current-decisions.md`, `project-context.md`, `database-current.md`, generated `database.types.ts`, `app-architecture-rules.md`, and the relevant refactor backlog task.

---

## 1. Core principle

`src/app/core` is the home for shared technical and cross-feature logic.

Feature folders must not create their own copy of the same generic mechanism if it already exists in `core`.

Good feature-local code:

- domain-specific state and labels;
- route/page composition;
- small components used only by one feature;
- adapters that translate a feature-specific DB/RPC contract into a feature view model.

Bad feature-local code:

- duplicated request state helpers;
- duplicated stale guards;
- duplicated RPC result normalizers;
- duplicated JSON readers;
- duplicated dictionary-to-option helpers;
- duplicated generic validators;
- duplicated generic form factories;
- duplicated generic status/display primitives.

Core refactor principle:

> Extract reusable mechanics, not feature semantics.

`core` should make repeated technical work easier. It must not hide the meaning of PvP, Exploration, Combat, Trade, Reports, Notifications, Admin or any other domain inside vague universal helpers.

---

## 2. Core placement matrix

| Folder | Belongs here | Does not belong here |
|---|---|---|
| `core/config` | Shared configuration objects, global helper config, workflow config namespaces. | DB/gameplay balance values, route pages, feature-only constants, mutable runtime state. |
| `core/config/forms` | Shared form field config definitions and repeated typed form config blocks. | Form state, component logic, one-off page-only form definitions unless explicitly shared. |
| `core/constants` | Shared technical constants and stable frontend/runtime contract keys. | DB dictionaries, balance values, labels from DB/read models, one-feature constants. |
| `core/domain` | Domain models, read models, domain-specific mappers, value objects and DB/RPC adapters. | Pure generic utilities, Angular components, route state, form factories. |
| `core/enums` | Shared frontend-only enums that are not directly generated DB enum types. | Duplicates of generated DB enum unions, labels, feature-only unions. |
| `core/factories` | Reusable factories for forms, payloads, initial objects and repeated builders. | Stateful services, API calls, feature-only component builders. |
| `core/factories/forms` | Reactive Form factory functions and shared form initialization helpers. | Validators, domain mappers, component state. |
| `core/guards` | Angular route guards and shared access/context guards. | Component stale guards, DB authority checks, feature-only disabled-state helpers. |
| `core/interfaces` | Stable shared interface contracts, if this folder remains part of the architecture. | One-off component props, generated DB row aliases, shapes better placed in `types` or `domain`. |
| `core/services` | Shared services, RPC/domain operation services, loaders, stateful facades, workflow services. | Pure stateless helpers, model definitions, component-only state. |
| `core/types` | Shared technical TypeScript types, helper types and generic utility types. | Domain read models, form-specific types, component-local types. |
| `core/types/forms` | Shared form value/control/DTO types. | Form factories, validators, component-local form declarations. |
| `core/utils` | Pure, stateless, testable helpers with no Angular injection and no side effects. | Services, IO, stateful logic, DB/RPC operations, feature semantics. |
| `core/validators` | Reusable validators, especially Reactive Forms validators and shared validation helpers. | DB authority checks, feature-only business rules, UI error display mapping. |
| generated DB/Supabase types | Generated database type contracts. | Manual edits, domain models, UI view models. |

---

## 3. Types, interfaces and domain models

Use this rule of thumb:

- `core/domain/...` for gameplay/domain models and read models.
- `core/types/...` for generic TypeScript helper types and shared technical types.
- `core/types/forms/...` for form value/control types.
- `core/interfaces/...` only for stable shared interface contracts if keeping the folder is still useful.

Do not create a new interface just to satisfy an old `IWhatever` naming habit.

Do not rename every existing interface just for naming consistency. Rename only in an accepted refactor slice.

Inventory must classify current `interfaces` vs `types` usage before broad moves. Existing inconsistent naming is not itself permission for a broad rename.

---

## 4. Utils rules

A `core/utils` helper must be:

- pure;
- stateless;
- testable;
- reusable across at least two domains or clearly generic;
- free of Angular service injection;
- free of Supabase calls;
- free of durable gameplay/economy mutation logic.

Good utils:

- JSON object/array/string/number guards;
- nullable text/number/date normalization;
- generic option sorting;
- dictionary entry to option mapping;
- display formatting from already-authoritative values;
- small request id/string helpers.

Bad utils:

- `mapCombatAndExplorationThing(...)`;
- feature-specific PvP target meaning;
- hidden DB fallback labels;
- local gameplay eligibility logic;
- RPC calls;
- services disguised as functions.

If a helper is only used by one feature and contains feature meaning, keep it feature-local until another feature needs the same mechanic.

---

## 5. Mappers and read models

Target direction:

- domain/read-model mappers should usually live with their domain under `core/domain/...`;
- mapper primitives may live in `core/utils` when they are pure, generic normalization helpers;
- existing mapper files outside `core/domain` may be `legacy_or_transitional` and must be classified by inventory before moves.

Mapper rules:

- map generated DB/RPC rows to explicit domain/read models;
- do not expose raw generated DB rows as long-term UI models;
- do not compute durable gameplay authority in Angular;
- do not hardcode DB dictionary labels when a read model provides labels;
- use small generic utils only for primitive normalization;
- keep domain mapper names meaningful to the domain.

Do not collapse unrelated domain mappers into one generic mapper just because their code shape looks similar.

Allowed extraction examples:

- `readJsonObject(...)`;
- `normalizeNullableText(...)`;
- `toDictionaryOption(...)`;
- `formatMaybeNumber(...)`.

Blocked early extraction examples:

- `mapAnyGameplayResult(...)`;
- `resolveUniversalStatus(...)`;
- `mapCombatExplorationPvpThing(...)`.

---

## 6. Services, state and workflows

Use `core/services` for shared services, loaders, RPC operation wrappers and cross-feature workflow/facade logic.

Feature-local state is allowed when:

- it is used by one route/feature;
- it contains domain-specific selection or composition;
- moving it to core would make it less understandable.

Shared/core state or workflow helpers are preferred when multiple features duplicate the same mechanics:

- request loading/error/data states;
- stale success/error guards;
- action runner lifecycle;
- idempotent request id handling;
- reload-after-mutation pattern;
- selected server / active hero dependent guard mechanics.

Do not create a universal gameplay workflow service. Extract narrow mechanics only.

---

## 7. Forms, factories and validators

Default form architecture:

- Reactive Forms;
- form value/control types in `core/types/forms`;
- reusable form factories in `core/factories/forms`;
- reusable validators in `core/validators`;
- shared form field config in `core/config/forms`;
- component code remains thin.

Rules:

- Do not add new `ngModel` in new or touched code.
- Do not add `FormsModule` only to support new `ngModel`.
- Signal Forms are allowed only after an explicit accepted technical decision or isolated spike. Until then, Reactive Forms remain the stable default.
- If a touched file already contains `ngModel`, remove it within scope when reasonable, or report an explicit follow-up if conversion is too large.
- Feature-local forms may stay feature-local when unique. Repeated form construction patterns should move to factories/configs.
- Validators that are generic should live in `core/validators`; feature-only business validation may stay feature-local.

---

## 8. Constants and DB-backed data

Use `core/constants` only for stable frontend/runtime constants.

Do not put these in constants:

- DB dictionary labels;
- gameplay balance values;
- formulas;
- config values;
- status descriptions that should come from DB metadata;
- reward, item, combat, PvP or admin dictionary labels.

If the UI needs labels/options and a DB dictionary/read model exists, use the DB source. If it is missing, report a dependency instead of adding a permanent constant fallback.

---

## 9. Feature-local vs core decision test

Before moving code into `core`, ask:

1. Is it used by two or more domains/features?
2. Is it free of feature-specific meaning?
3. Is it pure or clearly a shared service/workflow?
4. Would a future feature reasonably search for it in `core`?
5. Can it be named without using a specific feature name?
6. Are existing tests/build enough to protect the move?

If the answer is mostly no, keep it feature-local.

Before keeping duplicated code feature-local, ask:

1. Is there already a matching `core` helper?
2. Is the difference semantic or only naming?
3. Did we check current inventory and grep usage?
4. Can the duplicate be replaced by a smaller core primitive while preserving domain mapper readability?

---

## 10. Refactor report requirements

Codex chat reports must stay short. Full evidence belongs in the relevant inventory or candidate-map file, not in the chat response.

Any Codex task touching shared code, `core`, or feature-local duplicates must report this summary in chat:

```md
Core architecture:
- core rules read:
- inventory/candidate map checked:
- placement decision:
- moved to core:
- kept feature-local:
- duplicate mechanics removed:
- duplicate mechanics intentionally kept:
- new helper/service/factory/validator added:
- why existing core did not fit:
- tests/specs updated:
```

The related inventory/candidate-map file should contain the full path/symbol/usages/confidence evidence.
