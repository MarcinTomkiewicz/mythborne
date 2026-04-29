# UI/UX Notes

Updated: 2026-04-29

This file tracks non-blocking UI/UX findings discovered during backlog work. These notes do not block a functional task unless the user promotes a note to acceptance criteria.

Canonical notes file is `ui-ux-notes.md`. Do not create or maintain a separate `ux-ui-notes.md` file.

Future Codex smoke tests should explain what the tested action means in gameplay/admin terms, not only the click path.

## Quick Wins

Small improvements that can usually be handled inside the next touched slice without schema/design work.

- `/admin/config-change-sets`: operational create/add/ready/apply/cancel feedback should use toasts, while inline form or RPC errors should use PrimeNG `Message`.
- `/admin/config-change-sets`: stale success/error state should be cleared when selecting another change set, starting a new draft, adding an entry, or running workflow actions.
- Root `App` should stay a thin global shell. Route/layout-heavy UI such as sidebar, topbar, gameplay notices and admin/game shells should stay behind lazy route shells so PrimeNG modules used there do not inflate the root initial bundle.
- Moderator scope UI must explain each scope in human terms and must not expose only raw scope keys.
- Moderation action UI must always require a reason.
- Operator/admin moderation history UI should make clear that warning/restriction/suspension/ban history is server-scoped.

## DB Metadata Needed

Findings where Angular should not hardcode a permanent explanation/list because a DB dictionary/read model is or should be the source.

- `/admin/config-change-sets`: target for draft value entries is derived from `config_definitions.governance_scope`; keep it as readonly display, not a real user choice.
- Admin/config/staff UI must show human-readable labels/descriptions and predicted gameplay impact where possible, not only keys/JSON/config values.
- Staff assignment UI must show staff-disqualifying history warnings, especially bans and severe suspensions.
- Future anti-abuse decision UI should label `add_anti_abuse_sanction_item` as linking an evidence/context item, not confiscating or returning an item.
- Moderation action UI should auto-fill source references from the place of wrongdoing where possible, e.g. trade transaction id, auction id, report id, message id later.
- Source reference does not replace reason.

## Redesign Needed

Findings that likely need workflow, DB/domain contract, permission model, or information-architecture work rather than a local UI patch.

- `/admin/config-change-sets`: sandbox/test draft cleanup may need a later admin UX, but G4 does not require delete/edit support for historical bad draft data.
- Real item confiscation/return needs a separate DB/domain workflow and should not be implied by sanction item linking.
- User/staff management UI must disable or hide candidates who already have a hero on the selected standard server. Backend/RPC still enforces this.
- Sandbox/test servers are exceptions: staff/testers may have heroes there to test gameplay, sanctions and moderation flows.
- Player-facing punishment messages need separate UX later.
