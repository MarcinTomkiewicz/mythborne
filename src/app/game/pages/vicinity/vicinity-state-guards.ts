import { EstateDistrictCapacityReadModel } from '../../../core/domain/estate/estate-address.model';
import type {
  VicinityBrowserSelectionSnapshot,
  VicinityRelocationSnapshot,
} from '../../../core/types/vicinity.types';

export function createBrowserSelectionSnapshot(input: {
  selectedDistrictCode: string | null;
  focusAddressNumber: number;
}): VicinityBrowserSelectionSnapshot {
  return {
    selectedDistrictCode: input.selectedDistrictCode,
    focusAddressNumber: input.focusAddressNumber,
  };
}

export function matchesBrowserSelection(
  current: VicinityBrowserSelectionSnapshot,
  snapshot: VicinityBrowserSelectionSnapshot,
): boolean {
  return (
    current.selectedDistrictCode === snapshot.selectedDistrictCode &&
    current.focusAddressNumber === snapshot.focusAddressNumber
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
