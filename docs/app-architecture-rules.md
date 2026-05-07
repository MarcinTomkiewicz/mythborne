# Mythsworn — App Architecture Rules

Status: draft for review — corrected after pre-refactor review  
Scope: frontend top-level application structure under `src/app`; no runtime code changes by this document  
Purpose: define feature ownership, route/page/component placement and app-level boundaries for the Mythsworn frontend architecture refactor.

This file complements `core-rules.md`.

It is not a UI/UX visual style guide. It describes where code belongs, not how screens should look.

Use with: `project-structure.md`, `AGENTS.md`, `core-rules.md`, `current-decisions.md`, `project-context.md`, `database-current.md`, and the relevant refactor backlog task.

---

## 1. Top-level principle

Top-level `src/app` folders are ownership boundaries.

- `auth` owns authentication and account-entry flows.
- `admin` owns operator/admin/staff tools.
- `game` owns player-facing gameplay systems.
- `hero` owns character identity, dashboard, stats and progression surfaces.
- `layout` owns application/game/admin shell components.
- `shared` owns reusable presentational components.
- `public` owns unauthenticated public pages.
- `core` owns shared technical/domain logic.

Do not add new logic to a folder just because similar logic already exists there. If the existing folder placement is wrong, classify it as a placement issue instead of expanding the mistake.

---

## 2. Top-level ownership matrix

| Folder | Belongs here | Does not belong here |
|---|---|---|
| `auth` | Login, registration, account entry, authentication-only pages/components and auth-specific flow composition. | Gameplay, hero progression, admin tools, server gameplay management. |
| `admin` | Admin/operator/staff tooling, balance/config/content management, diagnostics, sandbox/test tools, moderation, server operations. | Normal player gameplay flow, player dashboard, player exploration/combat/armory/trade as primary runtime. |
| `game` | Player-facing gameplay: exploration, combat, armory, mansion/vicinity, PvP, trade/auction, reports, notifications archive where player-facing. | Admin configurators, pure hero profile/stat allocation if owned by `hero`, public marketing pages. |
| `hero` | Character dashboard, profile, attributes/stats, progression, character identity and hero-centric personal surfaces. | Core gameplay systems such as exploration/PvP/trade, admin tools, public pages. |
| `layout` | Shell, sidebar, topbar, notification bells, membership/staff blocked notices, global route wrappers. | Feature business logic, domain workflows, DB/RPC mutation logic. |
| `shared` | Reusable presentational components that are domain-light or receive display-ready models. | Stateful gameplay workflows, services, route pages, domain authority. |
| `public` | Unauthenticated public/marketing/lore/how-to-play/about/home/report entry pages. | Logged-in gameplay, admin tooling, private hero data. |
| `core` | Shared services, domain/read models, utilities, factories, validators, constants, technical types, cross-feature logic. | Route pages, Angular visual components, feature-specific UI composition. |
| PrimeNG/theme setup folders | PrimeNG preset/theme setup and app-wide UI integration only. | Feature-local PrimeNG styling, gameplay logic. |
| assets/static folders | Static assets referenced by approved production paths. | Feature logic, DB-backed content that should come from read models. |

---

## 3. Pages vs components

Rules:

- `pages` are route-level entry points.
- `components` are reusable or page-local building blocks.
- Route guards/resolvers/access logic should not be hidden inside visual components.
- Large page components should push reusable UI pieces into `components` and shared mechanics into `core`.
- Components used across multiple feature areas belong in `shared`, not duplicated under each feature.

A folder containing only `pages` and no components is not automatically wrong. It becomes a refactor candidate only when route pages are large, repeated, or contain reusable component/workflow logic.

---

## 4. Admin vs player-facing gameplay

Admin may contain:

- balance/config/formula/content editors;
- diagnostics and debug panels;
- sandbox/test tools;
- read-only previews;
- moderation and anti-abuse flows;
- server operations.

Admin must not become the primary home of normal player gameplay.

If normal gameplay can only be performed in `admin`, classify it as `player_flow_in_admin_risk`.

If an admin page previews gameplay logic, it must be clear that it is preview/diagnostic/admin tooling, not the player route.

---

## 5. Game vs hero boundary

Use `hero` for:

- dashboard;
- profile;
- attributes/stat allocation;
- progression;
- character identity and personal hero overview.

Use `game` for:

- exploration;
- combat;
- armory/equipment as gameplay inventory;
- mansion/estate/vicinity;
- PvP;
- trade/auction/market gameplay;
- reports and gameplay result surfaces;
- quests/future gameplay loops.

Ambiguous examples:

- `equipment`: if it is only character profile display, `hero` may own it; if it is gameplay armory/equip/loadout, `game` should own it.
- `estate`: if it is passive profile info, `hero` may display it; if it is building/vicinity/mansion gameplay, `game` should own it.
- `reports`: gameplay result reports are usually `game`; public report sharing may have a public route and a shared report-content component.

---

## 6. Naming and duplicate route concepts

Canonical naming should follow current project decisions and current route ownership, not legacy folder names.

Rules:

- Prefer `vicinity` over `neighborhood` for the current estate/vicinity/PvP target area if current decisions/backlog use `vicinity`.
- Distinguish `trade`, `auction`, and generic `market` clearly.
- Do not keep both `market` and `trade` as active concepts unless they have distinct accepted purposes.
- Do not create empty future folders as authority for future ownership.
- Do not rename routes or folders during discovery. Rename only in an accepted refactor task with route compatibility review.

---

## 7. Empty, placeholder and legacy folders

Empty folders are not proof of future architecture.

Inventory should classify empty or near-empty folders as one of:

- `intentional_placeholder`;
- `legacy_placeholder`;
- `future_feature_slot`;
- `unknown_empty_folder`;
- `remove_candidate_later`.

Do not delete empty folders during discovery. Report them and wait for user review.

---

## 8. Shared, layout and core boundaries

Use `shared` for visual/presentational components that receive display-ready inputs and do not own durable workflows.

Use `layout` for shell-level components and app/game/admin wrappers.

Use `core` for technical/domain logic, services, mappers, factories, validators, types and utilities.

Do not put stateful domain workflows in `shared` only because multiple screens render them.

Do not put visual Angular components in `core`.

---

## 9. SSR / prerender and private dynamic routes

Private, user-specific or session-specific dynamic routes must not be prerendered as static public routes.

When a refactor touches routes or route ownership, Codex must check the current server route / SSR / prerender configuration where applicable, especially for:

- private report/result detail routes;
- combat/session/attempt detail routes;
- notification/detail routes;
- trade/auction/private history detail routes;
- PvP result/spy result routes;
- any route depending on authenticated user, selected server, active hero or private DB/RPC ownership.

If a route is private/dynamic and current server route config would prerender it incorrectly, report a blocker or candidate fix. Do not silently move or rename such routes.

---

## 10. App structure inventory classifications

Use these labels during app-structure inventory:

| Label | Meaning |
|---|---|
| `correct_owner` | Folder/file appears to belong to current owner. |
| `misplaced_candidate` | Likely belongs elsewhere. |
| `duplicate_route_concept` | Two folders/routes appear to represent same concept. |
| `legacy_placeholder` | Empty/old placeholder with no current evidence. |
| `unknown_empty_folder` | Empty folder with unclear purpose. |
| `promote_to_core_candidate` | Shared technical/domain logic currently in feature folder. |
| `promote_to_shared_candidate` | Reusable presentational component currently feature-local. |
| `keep_feature_local` | Domain-specific feature composition should stay local. |
| `player_flow_in_admin_risk` | Looks like normal gameplay is only/primarily in admin. |
| `admin_tool_in_player_route_risk` | Admin/debug/config tool appears in player-facing route. |
| `private_route_prerender_risk` | Private/user-specific dynamic route may be prerendered incorrectly. |
| `needs_user_decision` | Ownership cannot be decided from code/docs alone. |

---

## 11. Movement rules

Do not move files broadly in discovery tasks.

Before moving a file:

1. confirm target owner by these rules;
2. check imports and route ownership;
3. check tests/specs;
4. check SSR/prerender/server route config for private dynamic routes when relevant;
5. preserve public route behavior unless route rename is explicitly accepted;
6. keep one small slice per task;
7. report compatibility aliases or redirects needed;
8. run typecheck/build and focused specs where applicable.

---

## 12. Refactor report requirements

Codex chat reports must stay short. Full evidence belongs in the relevant inventory or candidate-map file.

Any Codex task touching app structure should summarize:

```md
App architecture:
- app architecture rules read:
- inventory/candidate map checked:
- placement decision:
- moved files/routes:
- kept in place:
- empty/legacy folders touched:
- duplicate route concepts touched:
- private route/prerender check:
- tests/specs updated:
```
