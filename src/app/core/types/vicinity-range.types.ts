import type {
  CurrentEstateAddressReadModel,
  EstateAddressIdentity,
  EstateDistrictCapacityReadModel,
} from '../domain/estate/estate-address.model';

export type VicinityAddressRowKind = 'self' | 'occupied' | 'empty';

export interface VicinityAddressRow extends EstateAddressIdentity {
  kind: VicinityAddressRowKind;
  isSelectable: boolean;
  occupantLabel: string;
}

export interface VicinityAddressRange {
  district: EstateDistrictCapacityReadModel;
  focusAddressNumber: number;
  fromAddressNumber: number;
  toAddressNumber: number;
  rangeLabel: string;
  rows: VicinityAddressRow[];
}

export interface VicinityBrowserRangeResult {
  currentAddress: CurrentEstateAddressReadModel;
  districts: EstateDistrictCapacityReadModel[];
  selectedDistrictCode: string;
  focusAddressNumber: number;
  range: VicinityAddressRange;
}

export interface VicinityBrowserSelectionSnapshot {
  selectedDistrictCode: string | null;
  focusAddressNumber: number;
}

export interface VicinityRelocationSnapshot {
  districtCode: string;
  addressNumber: number;
}

export interface VicinityAddressSearch {
  districtCode: string;
  addressNumber: number;
}
