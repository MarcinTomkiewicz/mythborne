import { Json } from '../../types/database.types';

export type DashboardWorldStateTone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'golden';

export type DashboardWorldStateActionKey =
  | 'open_vicinity'
  | 'open_estate'
  | 'open_exploration';

export type DashboardWorldStateKey =
  | 'active_state'
  | 'vicinity'
  | 'active_job'
  | 'trials_left'
  | 'attacks_left'
  | 'active_effect'
  | 'prestige_rank';

export interface DashboardPersistentStateRow {
  key: DashboardWorldStateKey;
  label: string;
  value: Json;
  displayValue: string;
  tone: DashboardWorldStateTone;
  sortOrder: number;
  actionKey?: DashboardWorldStateActionKey | null;
  source?: string;
}
