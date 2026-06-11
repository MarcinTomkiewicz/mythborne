import type { PvpTargetCandidate } from '../domain/pvp/pvp.model';
import type { PvpEligibilityDisplay } from '../utils/pvp-eligibility-display';
import type { VicinityRowAction } from './vicinity-action.types';

export type VicinityListRowKind = 'self' | 'empty' | 'occupied';
export type VicinityAddressListVariant = 'vicinity' | 'ranking';

export interface VicinityListMetricCell {
  key: string;
  value: string;
}

export interface VicinityListRowBase {
  key: string;
  kind: VicinityListRowKind;
  addressLabel: string;
  districtCode: string;
  districtLabel: string;
  address: string;
  displayLabel: string;
  isOccupied: boolean;
  isCurrentHeroEstate: boolean;
  occupancyStatusKey: 'empty' | 'current' | 'occupied' | string;
  occupancyLabel: string;
  estateId?: string;
  serverId?: string;
  heroId?: string;
  estateRank?: number;
  occupantLabel: string;
  candidate: PvpTargetCandidate | null;
  attackDisplay: PvpEligibilityDisplay | null;
  spyDisplay: PvpEligibilityDisplay | null;
  statusLabel: string | null;
  statusIndicatorIcon: string | null;
  statusIndicatorAriaLabel: string | null;
  isDangerState: boolean;
  detailLabel: string;
  levelDisplay: string;
  attackTravelDisplay: string;
  spyTravelDisplay: string;
  metricCells: readonly VicinityListMetricCell[];
  protectionDisplay: string | null;
  playerSafeAttackReason: PvpEligibilityDisplay | null;
  playerSafeSpyReason: PvpEligibilityDisplay | null;
  actions: VicinityRowAction[];
}

export interface VicinityAddressListRow extends VicinityListRowBase {
  addressNumber: number;
}

export interface VicinityRankingListRow extends VicinityListRowBase {
  addressNumber?: undefined;
}

export type VicinityListRow = VicinityAddressListRow | VicinityRankingListRow;
