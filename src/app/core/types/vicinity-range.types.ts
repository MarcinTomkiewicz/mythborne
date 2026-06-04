import type {
  CurrentEstateAddressReadModel,
  EstateAddressIdentity,
} from '../domain/estate/estate-address.model';
import type {
  PlayerVicinityAddressCapacityReadModel,
  PlayerVicinityPageContextReadModel,
} from '../domain/vicinity/player-vicinity-page-context.model';

export type VicinityAddressRowKind = 'self' | 'occupied' | 'empty';

export interface VicinityAddressRow extends EstateAddressIdentity {
  kind: VicinityAddressRowKind;
  isSelectable: boolean;
  occupantLabel: string;
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
}

export interface VicinityAddressRange {
  district: PlayerVicinityAddressCapacityReadModel;
  focusAddressNumber: number;
  fromAddressNumber: number;
  toAddressNumber: number;
  rangeLabel: string;
  rows: VicinityAddressRow[];
}

export interface VicinityBrowserRangeResult {
  context: PlayerVicinityPageContextReadModel;
  currentAddress: CurrentEstateAddressReadModel;
  districts: PlayerVicinityAddressCapacityReadModel[];
  selectedDistrictCode: string;
  focusAddressNumber: number;
  range: VicinityAddressRange;
}

export interface VicinityBrowserSelectionSnapshot {
  selectedDistrictCode: string | null;
  focusAddressNumber: number;
}

export interface VicinityAddressSearch {
  districtCode: string;
  addressNumber: number;
}
