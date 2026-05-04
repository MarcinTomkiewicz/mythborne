import {
  CurrentEstateAddressReadModel,
  EstateDistrictCapacityReadModel,
} from '../../../core/domain/estate/estate-address.model';
import { VicinityAddressRange } from './vicinity-address-range';

export interface VicinityBrowserRangeResult {
  currentAddress: CurrentEstateAddressReadModel;
  districts: EstateDistrictCapacityReadModel[];
  selectedDistrictCode: string;
  centerAddressNumber: number;
  range: VicinityAddressRange;
}

export interface VicinityBrowserSelectionSnapshot {
  selectedDistrictCode: string | null;
  centerAddressNumber: number;
}

export interface VicinityRelocationSnapshot {
  districtCode: string;
  addressNumber: number;
}

export function createBrowserSelectionSnapshot(input: {
  selectedDistrictCode: string | null;
  centerAddressNumber: number;
}): VicinityBrowserSelectionSnapshot {
  return {
    selectedDistrictCode: input.selectedDistrictCode,
    centerAddressNumber: input.centerAddressNumber,
  };
}

export function matchesBrowserSelection(
  current: VicinityBrowserSelectionSnapshot,
  snapshot: VicinityBrowserSelectionSnapshot,
): boolean {
  return (
    current.selectedDistrictCode === snapshot.selectedDistrictCode &&
    current.centerAddressNumber === snapshot.centerAddressNumber
  );
}

export function createRelocationSnapshot(input: {
  districtCode: string;
  addressNumber: number;
}): VicinityRelocationSnapshot {
  return {
    districtCode: input.districtCode,
    addressNumber: input.addressNumber,
  };
}

export function matchesRelocationSnapshot(
  current: VicinityRelocationSnapshot | null,
  snapshot: VicinityRelocationSnapshot,
): boolean {
  return (
    current?.districtCode === snapshot.districtCode &&
    current.addressNumber === snapshot.addressNumber
  );
}

export function findVicinityDistrict(
  districts: readonly EstateDistrictCapacityReadModel[],
  districtCode: string | null,
): EstateDistrictCapacityReadModel {
  const district = districts.find((entry) => entry.districtCode === districtCode);

  if (!district) {
    throw new Error(`Estate district "${districtCode ?? 'unknown'}" is not active.`);
  }

  return district;
}
