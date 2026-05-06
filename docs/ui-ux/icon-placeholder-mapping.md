# Icon Placeholder And Game Icons Mapping Contract

Status: UI-CORE-5 draft for review  
Scope: documentation only; no icon assets or SCSS changes

This document defines how UI tasks should use current icon assets and how prototype text placeholders map to production icon classes. It does not replace UI-CORE-10, which should later define the broader custom icon and brand asset registry.

Use with:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/primeng-vendor-wrapper-lookup.md`;
- `docs/ui-ux/prototype-production-mapping.md`.

## Existing Icon Sources

| source | use | status | notes |
|---|---|---|---|
| `src/scss/abstracts/_custom-icons.scss` | Custom icon key to SVG filename registry. | production source | Generates `pi pi-<key>` through `_p-custom-icons.scss`. |
| `src/scss/vendors/_p-custom-icons.scss` | Custom SVG mask class generation. | production source | Uses `currentColor`; icons recolor via text color. |
| `src/scss/vendors/_primeicons-local.scss` | Local PrimeIcons font definitions. | production source | PrimeIcons can be used as `pi pi-<name>`. |
| `public/icons/*.svg` | Custom icon SVG files used by the registry. | production assets | Only registry keys expose them as `pi pi-<key>`. |
| `src/assets/icons/*.svg` | Legacy menu image icons. | legacy-compatible | Existing menu uses direct image paths; do not expand as the new pattern without review. |
| `src/scss/base/_icons.scss` | Empty placeholder. | not a real icon API | Do not use as an icon system. |

## Rendering Strategy

Custom icons:

- use `<i class="pi pi-<custom-key>"></i>`;
- are generated from `_custom-icons.scss`;
- use SVG masks from `/icons/<file>.svg`;
- inherit color through `currentColor`;
- scale from `.pi--svg` width/height.

PrimeIcons:

- use `<i class="pi pi-<prime-key>"></i>`;
- come from `_primeicons-local.scss`;
- should be preferred when a good semantic icon already exists.

Icon-only controls must have an accessible name through visible text, `aria-label`, `aria-labelledby`, or an equivalent accessible label. Tooltip may supplement the control, but must not be the only accessible name and must not be the only place for critical instructions.

## Placeholder Mapping

Prototype placeholders are not final production icons. Use this mapping as the first production target when converting prototype areas.

| placeholder | meaning | preferred production icon | source | status / note |
|---|---|---|---|---|
| `AU` | Auction House | `pi pi-shop-bag` | custom registry | Available, maps to `shop.svg`. |
| `PV` | PvP / combat-facing target selection | `pi pi-shield-bash` | custom registry | Available, maps to `shield-bash.svg`. |
| `ES` | Estate / Mansion / buildings | `pi pi-building` | PrimeIcons | Available as PrimeIcon. Custom estate key is missing. |
| `TR` | Direct Trade / trade workflow | `pi pi-contract` | custom registry | Available, maps to `contract.svg`. |
| `EX` | Exploration / pathing | `pi pi-trail` | custom registry | Available, maps to `trail.svg`. |
| `CG` | Config Governance | `pi pi-cog` | PrimeIcons | Available as PrimeIcon. `pi pi-contract` may be used for legal/document context, but `cog` is clearer for config. |
| `AA` | Anti-abuse | `pi pi-interdiction` | custom registry | Available, maps to `interdiction.svg`. |
| `SM` | Server Management | `pi pi-server` | PrimeIcons | Available as PrimeIcon. Custom server-management key is missing. |

## Existing Custom Icon Keys

Current custom keys from `_custom-icons.scss`:

`overlord`, `shop-bag`, `cash`, `d20`, `moon-bats`, `sun-eclipse`, `direction-sign`, `teacher`, `read`, `uprising`, `evil-book`, `send-message`, `message-away`, `blacksmith`, `shield-bash`, `d10`, `stairs-goal`, `call-me`, `chest`, `wizard`, `tied-scroll`, `danger-orc`, `biohazard`, `success-eagle`, `expand`, `contract`, `scroll-quill`, `teleport`, `horus`, `closed-eye`, `soul`, `mona-lisa`, `vacuum-cleaner`, `quill`, `demolish`, `creation`, `interdiction`, `trail`, `lever`, `point-left`, `point-right`, `add-plus`, `done-it`, `show-down`, `marble`, `workforce`, `wood`, `sundial`.

## Missing Icon Keys

These are gaps discovered during UI-CORE-5:

| missing key | needed for | temporary allowed icon |
|---|---|---|
| `estate` or `mansion` | Estate/Mansion navigation and building context. | `pi pi-building` or existing legacy menu SVG until UI-CORE-10. |
| `server-management` | Admin server management scope. | `pi pi-server`. |
| `brand-mythsworn` / `brand-mark-m` | Shell brand mark. | Existing styled `M` mark direction; do not remove. |
| item-kind keys | Item popover/cards by slot/kind. | Text placeholder only in prototype; production should wait for UI-CORE-6/10 or DB metadata. |
| trial deity/minigame keys | Trial minigame pages. | Text placeholder only until accepted icon keys/assets exist. |

If an icon key is missing, report the missing key instead of importing a random icon library or copying emoji from a prototype.

## Brand Mark Rule

The accepted Mythsworn `M` mark direction must not disappear from the shell. There is not yet a dedicated `brand-mythsworn` asset/key in the custom icon registry. Until UI-CORE-10 decides the final brand registry, keep the existing shell brand visible and treat prototype `M` artwork as visual reference only.

## Fallback Rules

Allowed:

- PrimeIcon class already present in `_primeicons-local.scss`;
- custom icon key already present in `_custom-icons.scss`;
- existing legacy menu SVG where already used;
- text placeholder only inside prototype/docs or as a temporary explicit missing-icon diagnostic.

Blocked:

- emoji as final icons;
- prototype initials as final icons;
- hardcoded external icon URLs;
- adding a random icon library;
- directly referencing `/icons/*.svg` from feature templates when a registry key should exist;
- silently substituting an unrelated icon without reporting the missing key.

## Review Checklist

Future UI tasks using icons must report:

- icon classes reused;
- custom icon keys reused;
- PrimeIcons reused;
- missing icon keys;
- new icons added: yes/no;
- whether the icon-only control has an accessible name;
- copied from prototype: no.
