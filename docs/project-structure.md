# Project Structure

This document captures the intended project split for `mythos-hunter-2-0` so the structure stays stable across future changes.

## Feature Areas

- `src/app/public`
  Public-facing pages such as about the game, lore, instructions, onboarding copy, and marketing-style content that should be accessible without authentication.
- `src/app/auth`
  Authentication flows and screens only: login, registration, account entry steps, and auth-specific UI composition.
- `src/app/admin`
  Browser-based management of the game world, balancing, content, and operational tooling for admins or game masters.
- `src/app/hero`
  Everything centered on the player character and player-facing progression: dashboard, stats, profile, character growth, and account-adjacent player pages.
- `src/app/game`
  Core gameplay systems and feature flows: hunts, quests, buildings, items, economy, trade, PVP, and other world interactions.
- `src/app/layout`
  Shared application shell pieces such as navigation, sidebar, and structural wrappers.
- `src/app/shared`
  Reusable presentational components that are not tied to one feature area.

## Core Rule

`src/app/core` is the single place for shared technical and cross-feature logic. It should contain:

- services
- interfaces and types
- domain models and mappers
- configs and constants
- enums
- interceptors
- utils and helpers
- pipes
- validators
- loaders
- factories
- other reusable infrastructure

Feature folders should primarily contain pages, feature components, route definitions, and feature-local composition. If logic needs to be reused or represents shared domain behavior, it belongs in `core`.

## Pages vs Components

- `pages`
  Route-level entry points. A page is the component loaded directly by the router for a URL.
- `components`
  Reusable or page-local building blocks used inside pages or layout shells.
- `layout/components`
  Shared shell elements such as sidebar, topbar, and wrappers. Layout has no router entry points, so `pages` are usually unnecessary there.

Every page is technically an Angular component, but the distinction is architectural, not technical. We keep it because it makes route ownership and reuse obvious.

For consistency:

- `public`, `auth`, `hero`, `game`, `admin` should use `pages` for route entries and `components` for internal UI pieces.
- `layout` should keep `components`.
- `core` should not contain route pages.

## Domain Notes

The current game concept points to these broad gameplay buckets:

- hero creation, progression, origins, and stat systems
- hunts, encounters, and combat loops
- items, quality, bonuses, and equipment
- estates, buildings, and production
- resources, economy, drachmas, and trade
- public lore, rules, and onboarding content

These buckets should guide future module placement so the app stays easy to navigate as the game grows.

## Planned Domain Coverage

The current directory plan is intended to cover the game at a full-system level, including the complex item pipeline.

- Itemization
  UI lives mainly under `game/pages/armory`, `game/pages/crafting`, and admin catalog pages.
  Shared models and rules live under `core/domain/item`, `core/domain/equipment`, `core/interfaces/item`, `core/services/items`, and `core/factories/item-generation`.
- Character and progression
  UI lives under `hero/pages/*`.
  Shared rules and persistence stay in `core/domain/hero`, `core/services/hero`, `core/domain/origin`, and related stats services.
- World systems
  Quests, monsters, combat, buildings, estates, resources, and market systems map to the corresponding `core/domain/*` and `core/services/*` folders plus route pages in `game` and operational pages in `admin`.
