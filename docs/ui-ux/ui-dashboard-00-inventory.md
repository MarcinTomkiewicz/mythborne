# UI-DASHBOARD-00 - Dashboard Source And Implementation Inventory

Status: implementation inventory
Date: 2026-05-12

## Current Dashboard Files

- `src/app/hero/pages/dashboard/dashboard.ts`
- `src/app/hero/pages/dashboard/dashboard.html`
- `src/app/core/services/hero/dashboard-page.facade.ts`
- `src/app/core/services/hero/dashboard-page.facade.spec.ts`
- `src/app/core/services/hero/hero-dashboard-runtime-stats.ts`
- `src/app/core/services/hero/hero-dashboard-runtime-stats.spec.ts`

## Available Real Data Sources

| Dashboard need | Current source | Use now? | Notes |
|---|---|---:|---|
| active hero identity | `Hero.getHeroData()` via `DashboardPageFacade` | yes | Existing dashboard source; active hero selection is handled by `Hero`/`ActiveHero` services. |
| level / XP progress | `Hero.getHeroExperienceProgress()` | yes | Canonical threshold read path; no hardcoded XP max needed. |
| Character Points | `Hero.getHeroData()` | yes | Current and lifetime values are available. |
| recent CP ledger | `CharacterPointHistory.getActiveHeroHistory({ limit: 5 })` | yes | Real history, not a fake task queue. |
| base stat values | `get_hero_dashboard_runtime_stats.stats_json` through `HeroDashboardRuntimeStats` | yes | Labels come from `StatsService.getStats()`. |
| derived combat/runtime stats | `get_hero_dashboard_runtime_stats` through `HeroDashboardRuntimeStats` | yes | Player-safe rows for damage, defense, Luck, crit/evasion and attack count. |
| origin identity/art | `Origins.getOriginWithBonuses(hero.origin_id)` | partial | Existing origin read path; fallback avatar must not become a fake portrait system. |
| selected server / estate address | shell/topbar sources only | defer | Dashboard-specific card should wait for a scoped source pass. |
| equipment preview | `HeroEquipment.getCurrentEquipment()` exists | defer | UI-DASHBOARD-07 should confirm slot/item display contract before implementation. |
| active exploration state | exploration state services exist | defer | Needs UI-DASHBOARD-10 source matrix before rendering persistent state. |
| active estate building job | estate/mansion runtime exists | defer | Needs UI-DASHBOARD-10/13 source matrix before rendering persistent state. |
| notifications/reports attention | notification/report services exist | defer | Needs UI-DASHBOARD-10/14 source matrix and player-only filtering. |

## Current Obsolete/Fake Dashboard Content

- Hardcoded `Guild: None` badge/detail row.
- Fake equipment preview based on local placeholder slots.
- Important values/errors inherited `muted-text` from row containers.

## Prototype Anchors Implementable Now

- Hero identity block using existing hero/origin/level/CP data.
- Compact base stats and derived stats using DB-owned runtime stats.
- Real CP progression/history summary.
- Cleaner player-facing hierarchy without duplicated sidebar navigation.

## Blocked Or Deferred Anchors

- Real equipment preview until UI-DASHBOARD-07 confirms current loadout read shape and slot display.
- Estate/vicinity context until UI-DASHBOARD-09 scopes active estate/address source.
- Persistent state widgets until UI-DASHBOARD-10 maps durable sources and stale-clear rules.
- Full dashboard visual prototype alignment until the data-backed slices above are implemented.
