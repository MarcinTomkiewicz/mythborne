import type { PvpTargetCandidate } from '../domain/pvp/pvp.model';
import type { PvpRankingRow } from '../domain/pvp/pvp-ranking.model';
import type { PvpEligibilityDisplay } from '../utils/pvp-eligibility-display';

export type DataRowActionKind = 'spy' | 'attack' | 'siege' | 'claimEstate';
export type DataRowActionAvailability = 'spy' | 'attack' | 'never';
export type DataRowKind = 'self' | 'empty' | 'occupied';
export type DataRowListVariant = 'address' | 'ranking';

export interface DataRowActionConfig {
  kind: DataRowActionKind;
  icon: string;
  severity: 'danger' | 'secondary';
  availability: DataRowActionAvailability;
  primaryWhenAvailable: boolean;
}

export interface DataRowAction {
  kind: DataRowActionKind;
  icon: string;
  label: string;
  tooltip: string;
  severity: 'danger' | 'secondary';
  disabled: boolean;
  primary: boolean;
  pending: boolean;
}

export interface DataRowActionEvent<Row> {
  row: Row;
  actionKind: DataRowActionKind;
}

export interface DataRowMetricCell {
  key: string;
  value: string;
}

export interface DataRowFeedback {
  message: string | null;
  className: string;
}

export interface DataRowBase {
  key: string;
  kind: DataRowKind;
  leadingLabel: string;
  title: string;
  statusLabel: string | null;
  statusIndicatorIcon: string | null;
  statusIndicatorAriaLabel: string | null;
  isDangerState: boolean;
  subtitle: string;
  metricCells: readonly DataRowMetricCell[];
  actions: DataRowAction[];
}

export interface AddressDataRow extends DataRowBase {
  districtCode: string;
  districtLabel: string;
  address: string;
  addressNumber: number;
  displayLabel: string;
  isOccupied: boolean;
  isCurrentHeroEstate: boolean;
  occupancyStatusKey: 'empty' | 'current' | 'occupied' | string;
  occupancyLabel: string;
  estateId?: string;
  serverId?: string;
  heroId?: string;
  estateRank?: number;
  candidate: PvpTargetCandidate | null;
  attackDisplay: PvpEligibilityDisplay | null;
  spyDisplay: PvpEligibilityDisplay | null;
  levelDisplay: string;
  attackTravelDisplay: string;
  spyTravelDisplay: string;
  protectionDisplay: string | null;
  playerSafeAttackReason: PvpEligibilityDisplay | null;
  playerSafeSpyReason: PvpEligibilityDisplay | null;
}

export interface RankingDataRow extends DataRowBase {
  addressNumber?: undefined;
  rankingRow: PvpRankingRow;
}

export type DataRow = AddressDataRow | RankingDataRow;
