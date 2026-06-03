# Onboarding Origin Content Read Model Audit

Status: UI-ONBOARDING-ADD-6 accepted documentation/audit  
Scope: origin content/read-model requirements for Hero Creation carousel

## DB-Backed Origin Content

`docs/database-current.md` defines `get_start_flow_origin_options()` as the canonical account-side origin read model. It returns origin id, key, label, description, sort order, active status, `bonuses_json` and `bonus_summary_text` from `origin` plus canonical `entity_bonuses(entity_type = origin)` display data.

Angular currently consumes that read model through `StartFlow.getOriginOptions()` and `mapStartFlowOriginOption(...)`. The current UI gets:

- name/label: DB-backed `origin_label`;
- description/helper copy: DB-backed `origin_description`;
- active/sort order: DB-backed `is_active` and `sort_order`;
- bonuses: DB-backed `bonuses_json` plus display-ready `bonus_summary_text`.

## App-Side Artwork Convention

Artwork is not currently DB-backed. `mapStartFlowOriginOption(...)` resolves image URLs through the app-side convention `/images/origins/${origin_key.toLowerCase()}.png`, keyed by the DB-owned `origin_key`.

That convention is acceptable only as a transitional asset lookup. It must not be treated as origin lore/content authority, and it does not satisfy the future admin-configurable artwork/content requirement.

## Decisions

Origin labels, descriptions, sort order and bonus display should continue to come from `get_start_flow_origin_options()`. Exact bonuses must not be hardcoded in Angular, including the prototype note for Corinthian Luck.

Until a DB content field or asset registry is added, production code may use only the existing app-side artwork convention keyed by DB-owned `origin_key`.

The canonical prototype origin set is: Spartan / Spartanin, Athenian / Ateńczyk, Cretan / Kreteńczyk, Corinthian / Koryntianin. Generated types and the read-model contract confirm the fields that can expose those rows, but they do not prove live seed completeness. Missing canonical rows are a DB/content seed blocker, not an Angular fallback task.

## Blockers / Follow-Ups

- DB/content: confirm live `origin` seed rows for the four canonical origins.
- DB/content or registry: add a durable artwork key/path source if artwork must become admin-configurable.
- Admin/content UI: no dedicated accepted route was found for editing origin lore/artwork/bonus presentation.
- Legacy cleanup: `origin_bonuses` still exists in generated types as transitional schema debt, but new origin display should use `entity_bonuses` through the start-flow read model.
