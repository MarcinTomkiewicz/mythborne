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
