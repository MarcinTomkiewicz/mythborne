# B1 Identity Assumptions Audit

Date: 2026-04-26

Scope: audit old assumptions that `hero.id === auth.uid()` after the server/hero migration.

This is a report-only task. No broad refactor is included here.

## Summary

The frontend has already moved several hero-owned gameplay reads through `Hero` service and then uses `hero.id` for stats, derived stats, resources, estate address, combat snapshot and armory-derived data.

The remaining high-risk assumptions are:

- old onboarding/RLS SQL policies still compare `hero.id` or hero-owned `hero_id` directly to `auth.uid()`;
- character creation still passes the account id as the new hero id;
- active hero loading is still user-only and not selected-server-aware, so it is not ready for multiple servers or sandbox multi-hero flows.

## Findings

### B1-1: Onboarding RLS assumes account id equals hero id

File: `database/onboarding/001_character_creation_policies.sql`

Patterns:

- `hero.id = auth.uid()`:
  - lines 38, 45, 52, 53
- `hero_stats.hero_id = auth.uid()`:
  - lines 60, 67, 74, 75
- `hero_derived.hero_id = auth.uid()`:
  - lines 82, 89, 96, 97
- `hero_resources.hero_id = auth.uid()`:
  - lines 104, 111, 118, 119
- `estates.hero_id = auth.uid()`:
  - lines 126, 133, 140, 141
- estate building policies join through `estates.hero_id = auth.uid()`:
  - lines 153, 167, 181, 189

Impact:

- These policies are incompatible with the current model where `auth.uid()` is account id and `hero.id` is character id.
- They can block valid rows where `hero.user_id = auth.uid()` but `hero.id != auth.uid()`.
- They also do not include `server_id` / selected server context.

Likely fix direction:

- Replace hero-owned policy checks with `exists` checks through `hero.user_id = auth.uid()`.
- Add server-aware checks where server membership/access is required.
- Keep `user_data.id = auth.uid()` policies; those are account-owned and are not the problematic hero assumption.

### B1-2: Character creation still sets `hero.id` from account id

Files:

- `src/app/core/services/hero/create-character-page.facade.ts`
- `src/app/core/services/hero/create-hero.ts`

Patterns:

- `create-character-page.facade.ts:159` saves account data and returns `user.id`.
- `create-character-page.facade.ts:164-173` treats that returned `user.id` as `heroId`, passes it into `createHero(...)`, and then into `assignFreeEstate(...)`.
- `create-hero.ts:18-34` accepts `heroId` and writes it as `hero.id`.
- `create-hero.ts:45-54` uses that same id for starting stats, derived stats and resources.

Impact:

- New heroes are still created with `hero.id = user.id`, preserving the old equality by construction.
- This blocks the intended model where one account may have multiple heroes across servers and multiple sandbox heroes for privileged users.

Likely fix direction:

- Generate a real hero id inside hero creation or let the database default generate it.
- Treat account id only as `hero.user_id`.
- Return the created hero row/id from `createHero(...)`.
- Pass the created hero id into estate/stat/resource initialization.

### B1-3: Active hero loading is not selected-server-aware

Files:

- `src/app/core/services/auth/auth.ts`
- `src/app/core/services/hero/hero.ts`

Patterns:

- `auth.ts:58`, `auth.ts:143`, `auth.ts:158-162` load the first hero by `userId` only.
- `hero.ts:28-36` also loads hero by `userId` only.
- `hero.ts:56-186` correctly uses the loaded `hero.id` for hero-owned tables after that, but the source hero may be ambiguous.

Impact:

- This no longer directly assumes `hero.id === auth.uid()`, but it is still incompatible with the full target flow: user -> selected server -> active hero.
- On accounts with more than one hero, it may select the wrong hero.
- Sandbox multi-hero testing cannot work correctly through this path.

Likely fix direction:

- B2 should introduce selected/current server resolution.
- B3 should introduce active hero resolution by `user_id + server_id`, plus a sandbox-friendly selection mechanism for privileged users.
- Existing `Hero` service methods should consume active hero context instead of doing their own user-only lookup.

### B1-4: Default server selection is a temporary shortcut

File: `src/app/core/services/hero/create-hero.ts`

Patterns:

- `create-hero.ts:198-214` loads the first `game_servers` row by `created_at` and uses it as default.

Impact:

- This is not an equality assumption, but it is part of the same migration risk.
- It can create heroes on the wrong server once multiple servers exist.

Likely fix direction:

- Replace with B2 selected server resolver.
- Character creation should use the selected/eligible server, not the first row.

### B1-5: Estate/building, combat and armory currently depend on `Hero` service

Files:

- `src/app/core/services/buildings/buildings.ts`
- `src/app/core/services/combat/combat-page.facade.ts`
- `src/app/core/services/items/armory-page.facade.ts`

Patterns:

- `buildings.ts:43` loads hero through `Hero.getHeroData()`.
- `buildings.ts:65-82` uses `hero.estate_id` to load estate and estate buildings.
- `combat-page.facade.ts:118-120` loads hero, base stats and derived stats through `Hero` service.
- `armory-page.facade.ts:11` loads derived stats through `Hero` service.

Impact:

- No direct `auth.uid() === hero.id` assumption was found here.
- These areas inherit the ambiguity from `Hero.getHeroData()` until B2/B3 provide selected server and active hero context.

Likely fix direction:

- After B3, these should depend on active hero context rather than user-only hero lookup.

## No Direct Old Assumption Found

No direct frontend Supabase `.eq('hero_id', auth.uid())` pattern was found in:

- combat page/facade,
- armory facade,
- item generation admin/catalog services,
- building mansion view beyond the inherited `Hero` service dependency,
- admin balance/config pages inspected through search.

## Recommended Task Split

1. B2: add selected/current server resolver.
2. B3: add active hero resolver using `user_id + server_id`, with a path for sandbox multi-hero selection later.
3. B4: migrate stats/resources/progression to active hero context.
4. B5: migrate estate/building/item/combat reads to active hero context.
5. Add a database/RLS task before relying on non-equal hero ids in production:
   - update onboarding policies,
   - add/validate server-aware hero ownership policies,
   - verify character creation works when `hero.id != auth.uid()`.

## Acceptance Criteria Check

- Report lists exact files/patterns to fix: yes.
- No broad refactor included: yes.
