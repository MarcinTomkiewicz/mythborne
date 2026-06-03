import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CurrentEstateAddressReadModel,
  EstateDistrictCapacityReadModel,
} from '../../../../core/domain/estate/estate-address.model';
import { VICINITY_ADDRESS_PAGE_SIZE } from '../../../../core/configs/vicinity.config';
import type {
  VicinityAddressRange,
  VicinityBrowserRangeResult,
  VicinityBrowserSelectionSnapshot,
} from '../../../../core/types/vicinity.types';
import { getErrorMessage } from '../../../../core/utils/error-message';
import {
  createBrowserSelectionSnapshot,
  matchesBrowserSelection,
} from '../utils/vicinity-state-guards';
import { VicinityBrowserRangeLoader } from './vicinity-browser-range-loader';

@Injectable()
export class VicinityRangeState {
  private readonly browserRangeLoader = inject(VicinityBrowserRangeLoader);
  private loadRequestId = 0;

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentAddress = signal<CurrentEstateAddressReadModel | null>(null);
  readonly districts = signal<EstateDistrictCapacityReadModel[]>([]);
  readonly vicinityRange = signal<VicinityAddressRange | null>(null);
  readonly selectedDistrictCode = signal<string | null>(null);
  readonly focusAddressNumber = signal(1);
  readonly currentAddressLabel = computed(
    () => this.currentAddress()?.addressLabel ?? 'Niedostępny',
  );
  readonly selectedDistrict = computed(() => {
    const code = this.selectedDistrictCode();
    return this.districts().find((district) => district.districtCode === code) ?? null;
  });
  readonly rows = computed(() => this.vicinityRange()?.rows ?? []);
  readonly visibleRows = computed(() => this.rows());
  readonly addressPageLabel = computed(() => {
    const range = this.vicinityRange();

    if (!range) {
      return 'Strona niedostępna';
    }

    const pageNumber = Math.floor((range.fromAddressNumber - 1) / VICINITY_ADDRESS_PAGE_SIZE) + 1;
    const pageCount = Math.max(1, Math.ceil(range.district.addressCapacity / VICINITY_ADDRESS_PAGE_SIZE));

    return `Strona ${pageNumber} z ${pageCount}`;
  });
  readonly addressPageOptions = computed(() => {
    const total = this.addressPaginatorTotal();
    const pageCount = Math.max(1, Math.ceil(total / VICINITY_ADDRESS_PAGE_SIZE));

    return Array.from({ length: pageCount }, (_, index) => ({
      label: String(index + 1),
      value: index * VICINITY_ADDRESS_PAGE_SIZE,
    }));
  });
  readonly addressRangeSummary = computed(() => {
    const range = this.vicinityRange();

    return range
      ? `${range.rangeLabel} z ${range.district.addressCapacity}`
      : 'Zakres niedostępny';
  });
  readonly addressPaginatorFirst = computed(
    () => Math.max(0, (this.vicinityRange()?.fromAddressNumber ?? 1) - 1),
  );
  readonly addressPaginatorTotal = computed(
    () => this.selectedDistrict()?.addressCapacity ?? 0,
  );

  loadData(): void {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.error.set(null);

    this.loadBrowserRange().subscribe({
      next: (result) => {
        if (!this.isCurrentLoadRequest(requestId)) {
          return;
        }

        this.applyBrowserRangeResult(result);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.isCurrentLoadRequest(requestId)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Nie udało się wczytać adresów w okolicy.'));
        this.vicinityRange.set(null);
        this.currentAddress.set(null);
        this.isLoading.set(false);
      },
    });
  }

  setSelectedDistrictCode(value: string): boolean {
    const district = this.districts().find((entry) => entry.districtCode === value);

    if (!district) {
      this.error.set(`Dzielnica posiadłości "${value}" nie jest aktywna.`);
      return false;
    }

    const currentAddress = this.currentAddress();
    const focusAddressNumber =
      currentAddress?.districtCode === district.districtCode
        ? currentAddress.addressNumber
        : 1;

    this.selectedDistrictCode.set(district.districtCode);
    this.focusAddressNumber.set(focusAddressNumber);
    this.reloadSelectedRange();

    return true;
  }

  focusAddress(input: { districtCode: string; addressNumber: number }): boolean {
    const district = this.districts().find(
      (entry) => entry.districtCode === input.districtCode,
    );

    if (!district || !Number.isInteger(input.addressNumber) || input.addressNumber < 1) {
      return false;
    }

    this.selectedDistrictCode.set(district.districtCode);
    this.focusAddressNumber.set(Math.min(input.addressNumber, district.addressCapacity));
    this.reloadSelectedRange();

    return true;
  }

  focusCurrentAddress(): boolean {
    const currentAddress = this.currentAddress();

    if (!currentAddress) {
      return false;
    }

    const district = this.districts().find(
      (entry) => entry.districtCode === currentAddress.districtCode,
    );

    if (!district) {
      return false;
    }

    const pageStart =
      Math.floor((currentAddress.addressNumber - 1) / VICINITY_ADDRESS_PAGE_SIZE)
      * VICINITY_ADDRESS_PAGE_SIZE
      + 1;

    this.selectedDistrictCode.set(district.districtCode);
    return this.applyAddressPageStart(pageStart);
  }

  changeAddressPage(event: { first?: number | null }): boolean {
    const first = Number.isInteger(event.first) ? Number(event.first) : 0;
    return this.applyAddressPageStart(first + 1);
  }

  reloadSelectedRange(): void {
    const requestId = ++this.loadRequestId;
    const snapshot = this.currentBrowserSelectionSnapshot();

    this.isLoading.set(true);
    this.error.set(null);

    this.loadBrowserRange({ useExistingSelection: true }).subscribe({
      next: (result) => {
        if (!this.isCurrentLoadRequest(requestId) || !this.isCurrentBrowserSelection(snapshot)) {
          return;
        }

        this.applyBrowserRangeResult(result);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        if (!this.isCurrentLoadRequest(requestId) || !this.isCurrentBrowserSelection(snapshot)) {
          return;
        }

        this.error.set(getErrorMessage(error, 'Nie udało się wczytać adresów w okolicy.'));
        this.vicinityRange.set(null);
        this.isLoading.set(false);
      },
    });
  }

  private applyAddressPageStart(fromAddressNumber: number): boolean {
    const district = this.selectedDistrict();

    if (!district) {
      return false;
    }

    const maxStart = Math.max(1, district.addressCapacity - VICINITY_ADDRESS_PAGE_SIZE + 1);
    const pageStart = Math.min(Math.max(1, fromAddressNumber), maxStart);
    const focusAddressNumber = Math.min(
      district.addressCapacity,
      pageStart + Math.floor((VICINITY_ADDRESS_PAGE_SIZE - 1) / 2),
    );

    this.focusAddressNumber.set(focusAddressNumber);
    this.reloadSelectedRange();

    return true;
  }

  private loadBrowserRange(options: { useExistingSelection?: boolean } = {}) {
    return this.browserRangeLoader.load({
      selectedDistrictCode: this.selectedDistrictCode(),
      focusAddressNumber: this.focusAddressNumber(),
      useExistingSelection: options.useExistingSelection,
    });
  }

  private applyBrowserRangeResult(result: VicinityBrowserRangeResult): void {
    this.districts.set(result.districts);
    this.selectedDistrictCode.set(result.selectedDistrictCode);
    this.focusAddressNumber.set(result.focusAddressNumber);
    this.vicinityRange.set(result.range);
    this.currentAddress.set(result.currentAddress);
  }

  private currentBrowserSelectionSnapshot(): VicinityBrowserSelectionSnapshot {
    return createBrowserSelectionSnapshot({
      selectedDistrictCode: this.selectedDistrictCode(),
      focusAddressNumber: this.focusAddressNumber(),
    });
  }

  private isCurrentBrowserSelection(snapshot: VicinityBrowserSelectionSnapshot): boolean {
    return matchesBrowserSelection(this.currentBrowserSelectionSnapshot(), snapshot);
  }

  private isCurrentLoadRequest(requestId: number): boolean {
    return requestId === this.loadRequestId;
  }
}
