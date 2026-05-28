import { EstateDistrictCapacityReadModel } from '../../../../core/domain/estate/estate-address.model';
import type { VicinityBrowserSelectionSnapshot } from '../../../../core/types/vicinity.types';

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
