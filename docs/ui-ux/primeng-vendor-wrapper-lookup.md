# PrimeNG Vendor Wrapper Lookup Order

Status: UI-CORE-12 draft for review  
Scope: documentation only; no wrapper code changes

This document defines how UI tasks must use PrimeNG and project vendor wrappers before adding local styles. Use it with:

- `docs/ui-ux/mythsworn-style-contract.md`;
- `docs/ui-ux/global-scss-shared-inventory.md`;
- `docs/ui-ux/local-scss-budget-checklist.md`;
- `docs/ui-ux/prototype-production-mapping.md`.

## Required Lookup Order

Before styling a PrimeNG-based UI element:

1. Use the PrimeNG component in Angular with its normal API.
2. Check the existing global wrapper in `src/scss/vendors/*`.
3. If the visual need is reusable, extend the global wrapper or add a global pattern.
4. Use global utilities only for host/layout composition around the PrimeNG component.
5. Use feature-local SCSS only as a documented exception.

Feature-local PrimeNG internals are blocked by default:

- no local `.p-*` skins;
- no local `::ng-deep`;
- no copied prototype CSS/class names;
- no duplicate focus/hover/disabled styling outside the wrapper.

## Wrapper Usage Map

| need | wrapper / file | use first | status | notes |
|---|---|---|---|---|
| Buttons and icon buttons | `_p-buttons.scss` | PrimeNG `p-button` | production-ready | Use before local button classes. Icon-only controls still need accessible labels/tooltips. |
| Text inputs | `_p-inputtext.scss` | PrimeNG input text | production-ready | Pair with `_p-labels.scss` and form message wrappers. |
| Textareas | `_p-textarea.scss` | PrimeNG textarea | production-ready | Do not locally restyle textarea internals. |
| Select/dropdown | `_p-select.scss` | PrimeNG select | needs usage audit | Real wrapper exists, but broad `:where(.mg-form, form, .mg-card form, div)` scope is risky to change without audit. |
| Autocomplete | `_p-autocomplete.scss` | PrimeNG autocomplete | production-ready | Prefer for search/select-as-you-type controls. |
| Date/time input | `_p-datepicker.scss` | PrimeNG datepicker | production-ready | Use wrapper before local calendar skins. |
| Password | `_p-password.scss` | PrimeNG password | production-ready | Auth/forms only. |
| Slider | `_p-slider.scss` | PrimeNG slider | production-ready | Use for numeric ranges when PrimeNG slider is appropriate. |
| Labels/messages/autofill | `_p-labels.scss`, `_p-form-messages.scss`, `_p-forms.autofill.scss` | PrimeNG/form field markup | production-ready | Keeps form states consistent. |
| Data table | `_p-table.scss` | PrimeNG table | production-ready, context pending | Preferred basis for dense tables where UI-CORE-14 chooses table. |
| Paginator | `_p-paginator.scss` | PrimeNG paginator | production-ready, context pending | Preferred basis for paginated lists/tables where UI-CORE-14 chooses pagination. |
| Tabs | `_p-tabs.scss` | PrimeNG tabs | production-ready | Use for in-page tabbed content; route navigation may still be route links. |
| Stepper | `_p-stepper.scss` | PrimeNG stepper | production-ready | Use for workflow steps when data/state warrants it. |
| Accordion | `_p-accordion.scss` | PrimeNG accordion | production-ready | Use for collapsible details, not critical hidden-only state. |
| Popover | `_p-popover.scss` | PrimeNG popover | production-ready | Basis for item popover and action menus. Domain content must be DB/read-model backed. |
| Tooltip | `_tooltip.scss` | PrimeNG tooltip | production-ready | Good for short explanations; not for critical-only instructions. |
| Dialog | `_p-dialogs.scss` | PrimeNG dialog | production-ready | Use for modal workflows; stale guards remain in state code. |
| Drawer | `_p-drawer.scss` | PrimeNG drawer | production-ready | Use for side panels where appropriate. |
| Confirm dialog/popup | `_p-confirmdialog.scss`, `_p-confirmpopup.scss` | PrimeNG confirmation | production-ready | Use for explicit confirmation, not as permission enforcement. |
| Toast | `_p-toasts.scss` | PrimeNG toast with `mg-toast` classes | production-ready | Operational feedback only; durable state remains DB-backed. |
| Breadcrumbs | `_p-breadcrumbs.scss` | PrimeNG breadcrumbs | production-ready | Use only where IA needs hierarchy. |
| File upload | `_p_fileupload.scss` | PrimeNG file upload | production-ready | Use where upload workflow exists. |
| Custom Prime icons | `_p-custom-icons.scss`, `_primeicons-local.scss` | PrimeIcons / custom icon classes | needs audit | UI-CORE-10 should define final icon/brand registry. |

## Specific Findings

### Select

`_p-select.scss` is the current wrapper for PrimeNG select. It includes a broad `:where(.mg-form, form, .mg-card form, div)` selector. Treat it as active production styling, but do not broaden or rewrite it without a usage audit because `div` makes the selector effectively global.

Future work should prefer one of:

- leave the current wrapper as-is when only consuming select;
- tighten scope in a dedicated wrapper modernization task with visual smoke;
- add a global form/select pattern if repeated select composition needs structure.

### Toasts

`_p-toasts.scss` defines `mg-toast` plus semantic variants:

| app severity intent | toast class |
|---|---|
| info / neutral operational update | `mg-toast mg-toast--info` |
| success | `mg-toast mg-toast--success` |
| warning / warn | wrapper gap: no dedicated `mg-toast--warn` exists yet |
| error / danger | `mg-toast mg-toast--danger` |
| special/system/arcane context | `mg-toast mg-toast--arcane` |

Temporary rule for warnings: use `mg-toast mg-toast--info` with explicit warning text in the summary/detail, or avoid toast and render inline warning state when the message is action-critical. Do not invent `mg-toast--warn` in feature code. Add a global wrapper variant in `_p-toasts.scss` only through a dedicated wrapper/style task with visual smoke.

Do not use toasts as durable notifications or reports. Persistent notifications remain DB-backed through notification services and bell/archive UI.

### Popover And Tooltip

`_p-popover.scss` and `_tooltip.scss` are the preferred basis for:

- item popovers;
- compact action menus;
- explainability snippets;
- short hover/focus descriptions.

Item popover content still needs a DB-backed shared component contract. Tooltip content must not be the only place where critical state or required action is explained.

### Table And Paginator

`_p-table.scss` and `_p-paginator.scss` are the preferred basis when a screen uses dense tables or pagination. They do not decide table vs list by themselves. UI-CORE-14 still owns the table/list/paginator decision per context.

Do not build a local paginator or local table skin unless UI-CORE-14 or a task-specific acceptance criterion explicitly justifies it.

### Icons

`_primeicons-local.scss` loads PrimeIcons locally. `_p-custom-icons.scss` maps custom SVG masks from `src/scss/abstracts/_custom-icons.scss`.

Current rule:

- use PrimeIcons/custom icon classes already available;
- do not treat empty `src/scss/base/_icons.scss` as an icon system;
- do not copy emoji/text initials from prototypes as final icon assets;
- defer broad icon/brand registry decisions to UI-CORE-10.

## Local Override Exception Template

If a task needs local PrimeNG styling, the report must include:

```md
PrimeNG local override:
- component:
- wrapper checked:
- why wrapper/global pattern cannot handle it:
- selector scope:
- planned follow-up:
- visual smoke required:
```

Without that justification, local `.p-*` or `::ng-deep` styling should be treated as a review failure.

## Wrappers Needing Follow-Up

| wrapper | follow-up |
|---|---|
| `_p-select.scss` | Usage audit for broad selector scope before any modernization. |
| `_p-custom-icons.scss` / `_primeicons-local.scss` | UI-CORE-10 icon/brand registry decision. |
| `_p-table.scss` / `_p-paginator.scss` | UI-CORE-14 table/list/pagination decision per context. |
| `_p-popover.scss` / `_tooltip.scss` | UI-CORE-6 item popover contract and explainability usage rules. |
| `_p-toasts.scss` | Add/review `mg-toast--warn` if warning toasts become a repeated need; keep severity mapping aligned with notification/toast presentation rules. |
