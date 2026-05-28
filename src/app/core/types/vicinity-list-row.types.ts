import type { PvpTargetCandidate } from '../domain/pvp/pvp.model';
import type { PvpEligibilityDisplay } from '../utils/pvp-eligibility-display';
import type { VicinityRowAction } from './vicinity-action.types';

export type VicinityListRowKind = 'self' | 'empty' | 'occupied';

export interface VicinityListRow {
  key: string;
  kind: VicinityListRowKind;
  addressLabel: string;
  districtCode: string;
  addressNumber: number;
  occupantLabel: string;
  candidate: PvpTargetCandidate | null;
  attackDisplay: PvpEligibilityDisplay | null;
  spyDisplay: PvpEligibilityDisplay | null;
  statusLabel: string | null;
  actions: VicinityRowAction[];
}
