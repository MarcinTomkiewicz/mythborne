import type { VicinityRowActionConfig } from '../types/vicinity.types';

export const VICINITY_ROW_ACTION_CONFIGS: readonly VicinityRowActionConfig[] = [
  {
    kind: 'spy',
    icon: 'pi pi-eye',
    label: 'Szpieguj',
    severity: 'secondary',
    availability: 'spy',
    primaryWhenAvailable: true,
  },
  {
    kind: 'attack',
    icon: 'pi pi-bolt',
    label: 'Atak',
    severity: 'danger',
    availability: 'attack',
    primaryWhenAvailable: true,
  },
  {
    kind: 'siege',
    icon: 'pi pi-building',
    label: 'Oblężenie',
    severity: 'secondary',
    availability: 'never',
    primaryWhenAvailable: false,
  },
];
