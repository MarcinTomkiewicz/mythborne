# Custom Icon And Brand Asset Registry

Status: UI-CORE-10 draft for review  
Scope: documentation only; no Angular, SCSS, DB/RPC, generated-type or asset changes

This document is the production registry contract for custom icons and brand assets. It builds on UI-CORE-5, which mapped immediate prototype placeholders, and adds final registry rules for brand mark, wordmark and banner slots.

Use with:

- `docs/ui-ux/icon-placeholder-mapping.md`;
- `docs/ui-ux/primeng-vendor-wrapper-lookup.md`;
- `docs/ui-ux/legacy-mg-scss-modernization-plan.md`;
- `docs/ui-ux/prototype-production-mapping.md`.

## Current Icon Sources

| source | role | status | rule |
|---|---|---|---|
| `src/scss/abstracts/_custom-icons.scss` | Custom key to SVG filename map. | production source | Add custom icons here only through reviewed global icon work. |
| `src/scss/vendors/_p-custom-icons.scss` | Generates `.pi.pi-<custom-key>` using SVG masks and `currentColor`. | production source | Feature templates should use generated `pi pi-<key>` classes, not direct `/icons/*.svg` refs. |
| `src/scss/vendors/_primeicons-local.scss` | Local PrimeIcons font definitions. | production source | Use semantic PrimeIcons when a custom key is missing and the icon meaning is clear. |
| `public/icons/*.svg` | Custom icon assets consumed by `_custom-icons.scss`. | production assets | Assets are exposed through registry keys. |
| `src/assets/icons/*.svg` | Legacy menu/image icons. | legacy-compatible | Existing direct menu image usage may stay; do not expand as the new icon system without review. |
| `public/favicon.svg`, `public/favicon-96x96.png`, `public/apple-touch-icon.png`, web app manifest PNGs | App/browser icons. | production app-shell assets | These are not the in-app wordmark/banner registry. |
| `src/scss/base/_icons.scss` | Empty placeholder. | not an API | Do not build on it until a dedicated icon SCSS task gives it purpose. |

## Rendering Contract

Custom registry icon:

```html
<i class="pi pi-shop-bag" aria-hidden="true"></i>
```

PrimeIcon:

```html
<i class="pi pi-server" aria-hidden="true"></i>
```

Rules:

- icon-only controls need visible text, `aria-label`, `aria-labelledby`, or equivalent accessible name;
- tooltip may supplement the label but must not be the only accessible name;
- icons inherit color through `currentColor` in the custom mask wrapper;
- do not embed SVG paths or base64 assets in templates;
- do not hardcode external icon URLs;
- do not use emoji as final production icons.

## Current Custom Icon Keys

Current keys from `_custom-icons.scss`:

`overlord`, `shop-bag`, `cash`, `d20`, `moon-bats`, `sun-eclipse`, `direction-sign`, `teacher`, `read`, `uprising`, `evil-book`, `send-message`, `message-away`, `blacksmith`, `shield-bash`, `d10`, `stairs-goal`, `call-me`, `chest`, `wizard`, `tied-scroll`, `danger-orc`, `biohazard`, `success-eagle`, `expand`, `contract`, `scroll-quill`, `teleport`, `horus`, `closed-eye`, `soul`, `mona-lisa`, `vacuum-cleaner`, `quill`, `demolish`, `creation`, `interdiction`, `trail`, `lever`, `point-left`, `point-right`, `add-plus`, `done-it`, `show-down`, `marble`, `workforce`, `wood`, `sundial`.

Known public icon assets not currently exposed by the custom registry include:

`embrassed-energy.svg`, `gamepad-cross.svg`, `relic-left.svg`, `relic-right.svg`, `stone-tablet.svg`.

Do not use unregistered assets directly from feature templates. If one is needed, add a reviewed registry key first.

## Placeholder Mapping

UI-CORE-5 remains the source for current prototype placeholder mapping:

| placeholder | production target |
|---|---|
| `AU` | `pi pi-shop-bag` |
| `PV` | `pi pi-shield-bash` |
| `ES` | `pi pi-building` until custom estate/mansion key exists |
| `TR` | `pi pi-contract` |
| `EX` | `pi pi-trail` |
| `CG` | `pi pi-cog` |
| `AA` | `pi pi-interdiction` |
| `SM` | `pi pi-server` until custom server-management key exists |

If a future DB metadata/dictionary row provides icon keys, the UI should validate them against this registry or a future DB-backed registry contract instead of silently rendering arbitrary classes.

## Brand Asset Slots

| slot | current asset/source | status | rule |
|---|---|---|---|
| App/favicon mark | `public/favicon.svg`, favicon PNGs, web app manifest PNGs | exists | Browser/app install asset only; not enough for final in-app brand system. |
| In-app logo mark | CSS/text `M` fallback in accepted prototypes; existing shell text `Mythsworn` | missing dedicated asset/key | Preserve visible `M` direction/fallback until a real asset exists. |
| Wordmark | none found as a dedicated asset | missing | Use text `Mythsworn`/`Myth Sworn` according to accepted naming decision; do not invent image wordmark. |
| Banner/hero brand asset | none found | missing | Do not use prototype gradients as a brand banner. A future asset task must provide real path(s). |
| Admin brand variant | none found | missing | Use shell text/layout; do not create separate local admin logo. |

## Brand Rules

- The accepted `M` mark direction must not disappear from shell work.
- Until a dedicated `brand-mark-m` asset or custom icon key exists, use a CSS/text fallback or existing shell text rather than inventing an asset.
- Do not copy prototype `.mb-brand`, `.mb-brand-mark`, gradients, palette values or CSS into Angular.
- Do not embed a generated raster/logo asset without explicit asset review.
- Do not switch between `Mythsworn` and `Myth Sworn` casually inside production UI; use the current production shell naming unless a naming decision updates it.
- Brand mark, wordmark and banner assets are not DB/RPC gameplay content. Future DB metadata may reference icon keys, but this task does not design that DB contract.

## Missing Keys / Assets

| missing key/asset | needed for | temporary rule |
|---|---|---|
| `brand-mark-m` | in-app shell mark | Keep CSS/text `M` fallback; report missing asset. |
| `brand-wordmark` | image wordmark | Use text title; report missing asset. |
| `brand-banner` | immersive page/hero brand use | Do not use until real asset exists. |
| `estate` / `mansion` | estate navigation/building context | Use `pi pi-building` or existing legacy menu icon where already used. |
| `server-management` | admin/server management | Use `pi pi-server`. |
| `item-kind-*` | item popover/cards | UI-CORE-6/10 dependency; no emoji/prototype initials as final icons. |
| `trial-*` / deity/minigame keys | trial minigame renderers | Needs accepted asset/registry review. |

## Adding Icons Later

When a future task adds icons:

1. Add the SVG asset under `public/icons/`.
2. Add one semantic key in `_custom-icons.scss`.
3. Use `pi pi-<key>` in Angular.
4. Verify currentColor rendering on dark/light theme.
5. Provide accessible labels for icon-only controls.
6. Do not add a random external icon library for a single gap.

## Review Checklist

Future icon/brand tasks must report:

- icons reused:
- PrimeIcons reused:
- custom icon keys reused:
- icon keys missing:
- brand assets used:
- brand assets missing:
- new icons added:
- direct SVG refs added: no:
- emoji final icons: no:
- copied from prototype: no:
- accessible name checked:
