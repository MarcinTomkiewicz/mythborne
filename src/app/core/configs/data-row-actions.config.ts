import type { DataRowActionConfig } from '../types/data-row.types';

export const DATA_ROW_ACTION_CONFIGS = [
  {
    kind: 'spy',
    icon: 'pi pi-spy',
    severity: 'secondary',
    availability: 'spy',
    primaryWhenAvailable: true,
  },
  {
    kind: 'attack',
    icon: 'pi pi-bolt',
    severity: 'danger',
    availability: 'attack',
    primaryWhenAvailable: true,
  },
  {
    kind: 'siege',
    icon: 'pi pi-siege',
    severity: 'secondary',
    availability: 'never',
    primaryWhenAvailable: false,
  },
] as const satisfies readonly DataRowActionConfig[];
