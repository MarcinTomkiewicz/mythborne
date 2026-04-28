# UI/UX Notes

Updated: 2026-04-28

This file tracks non-blocking UI/UX findings discovered during backlog work. These notes do not block a functional task unless the user promotes a note to acceptance criteria.

## Config Governance

- `/admin/config-change-sets`: target for draft value entries is derived from `config_definitions.governance_scope`; keep it as readonly display, not a real user choice.
- `/admin/config-change-sets`: operational create/add/ready/apply/cancel feedback should use toasts, while inline form or RPC errors should use PrimeNG `Message`.
- `/admin/config-change-sets`: stale success/error state should be cleared when selecting another change set, starting a new draft, adding an entry, or running workflow actions.
- `/admin/config-change-sets`: sandbox/test draft cleanup may need a later admin UX, but G4 does not require delete/edit support for historical bad draft data.

