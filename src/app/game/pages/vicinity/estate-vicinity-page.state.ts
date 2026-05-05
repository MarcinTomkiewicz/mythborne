import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CurrentEstateAddressReadModel,
  EmptyEstateAddressOption,
  EstateDistrictCapacityReadModel,
} from '../../../core/domain/estate/estate-address.model';
import { getErrorMessage } from '../../../core/utils/error-message';
import {
  toEmptyAddressOption,
  VicinityAddressRange,
  VicinityAddressRow,
} from './vicinity-address-range';
import {
  createBrowserSelectionSnapshot,
  matchesBrowserSelection,
  VicinityBrowserRangeResult,
  VicinityBrowserSelectionSnapshot,
} from './vicinity-state-guards';
import { VicinityBrowserRangeLoader } from './vicinity-browser-range-loader';
import { VicinityRelocationRunner } from './vicinity-relocation-runner';

type AddressKindFilter = 'all' | 'empty' | 'occupied';

@Injectable()
export class EstateVicinityPageState {
  private readonly browserRangeLoader = inject(VicinityBrowserRangeLoader);
  private readonly relocationRunner = inject(VicinityRelocationRunner);

  readonly isLoading = signal(true);
  readonly isRelocating = signal(false);
  readonly error = signal<string | null>(null);
  readonly relocationError = signal<string | null>(null);
  readonly relocationSuccess = signal<string | null>(null);
  readonly currentAddress = signal<CurrentEstateAddressReadModel | null>(null);
  readonly districts = signal<EstateDistrictCapacityReadModel[]>([]);
  readonly vicinityRange = signal<VicinityAddressRange | null>(null);
  readonly selectedDistrictCode = signal<string | null>(null);
  readonly centerAddressNumber = signal(1);
  readonly centerAddressInput = signal('1');
  readonly kindFilter = signal<AddressKindFilter>('all');
  readonly selectedTarget = signal<EmptyEstateAddressOption | null>(null);
  readonly destructiveConfirmed = signal(false);

  readonly currentAddressLabel = computed(
    () => this.currentAddress()?.addressLabel ?? 'Unavailable',
  );
  readonly currentDistrictLabel = computed(() => {
    const address = this.currentAddress();
    if (!address) {
      return 'Unavailable';
    }

    return address.districtName
      ? `${address.districtName} (${address.districtCode})`
      : `District ${address.districtCode}`;
  });
  readonly selectedDistrict = computed(() => {
    const code = this.selectedDistrictCode();
    return this.districts().find((district) => district.districtCode === code) ?? null;
  });
  readonly selectedDistrictCapacityLabel = computed(() => {
    const district = this.selectedDistrict();
    return district ? `${district.addressCapacity} addresses` : 'Unavailable';
  });
  readonly rangeLabel = computed(() => this.vicinityRange()?.rangeLabel ?? null);
  readonly rows = computed(() => this.vicinityRange()?.rows ?? []);
  readonly visibleRows = computed(() => {
    const filter = this.kindFilter();
    const rows = this.rows();

    if (filter === 'empty') {
      return rows.filter((row) => row.kind === 'empty');
    }

    if (filter === 'occupied') {
      return rows.filter((row) => row.kind === 'occupied' || row.kind === 'self');
    }

    return rows;
  });
  readonly selectedTargetLabel = computed(
    () => this.selectedTarget()?.addressLabel ?? 'None',
  );
  readonly canRelocate = computed(
    () => !!this.selectedTarget() && this.destructiveConfirmed() && !this.isRelocating(),
  );
  private loadRequestId = 0;

  loadData(): void {
    const requestId = ++this.loadRequestId;

    this.isLoading.set(true);
    this.error.set(null);
    this.relocationError.set(null);

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

        this.error.set(getErrorMessage(error, 'Failed to load vicinity addresses.'));
        this.vicinityRange.set(null);
        this.currentAddress.set(null);
        this.isLoading.set(false);
      },
    });
  }

  setSelectedDistrictCode(value: string): void {
    if (this.isRelocating()) {
      return;
    }

    const district = this.districts().find((entry) => entry.districtCode === value);

    if (!district) {
      this.error.set(`Estate district "${value}" is not active.`);
      return;
    }

    const currentAddress = this.currentAddress();
    const centerAddressNumber =
      currentAddress?.districtCode === district.districtCode
        ? currentAddress.addressNumber
        : 1;

    this.selectedDistrictCode.set(district.districtCode);
    this.centerAddressNumber.set(centerAddressNumber);
    this.centerAddressInput.set(String(centerAddressNumber));
    this.selectedTarget.set(null);
    this.destructiveConfirmed.set(false);
    this.reloadSelectedRange();
  }

  setCenterAddressInput(value: string): void {
    this.centerAddressInput.set(value);
  }

  applyCenterAddress(): void {
    if (this.isRelocating()) {
      return;
    }

    const district = this.selectedDistrict();

    if (!district) {
      this.error.set('Choose an active estate district.');
      return;
    }

    const value = Number(this.centerAddressInput());

    if (!Number.isInteger(value) || value < 1) {
      this.error.set('Address number must be a positive integer.');
      return;
    }

    const centerAddressNumber = Math.min(value, district.addressCapacity);

    this.centerAddressNumber.set(centerAddressNumber);
    this.centerAddressInput.set(String(centerAddressNumber));
    this.selectedTarget.set(null);
    this.destructiveConfirmed.set(false);
    this.reloadSelectedRange();
  }

  setKindFilter(value: string): void {
    if (this.isRelocating()) {
      return;
    }

    if (value === 'empty' || value === 'occupied') {
      this.kindFilter.set(value);
      return;
    }

    this.kindFilter.set('all');
  }

  selectRow(row: VicinityAddressRow): void {
    if (this.isRelocating()) {
      return;
    }

    const target = toEmptyAddressOption(row);

    if (!target) {
      return;
    }

    this.selectedTarget.set(target);
    this.destructiveConfirmed.set(false);
    this.relocationError.set(null);
    this.relocationSuccess.set(null);
  }

  setDestructiveConfirmed(value: boolean): void {
    if (this.isRelocating()) {
      return;
    }

    this.destructiveConfirmed.set(value);
  }

  relocate(): void {
    this.relocationRunner.relocate({
      target: this.selectedTarget(),
      destructiveConfirmed: this.destructiveConfirmed(),
      currentTarget: () => this.selectedTarget(),
      loadBrowserRange: () => this.loadBrowserRange(),
      applyBrowserRangeResult: (result) => this.applyBrowserRangeResult(result),
      setIsRelocating: (value) => this.isRelocating.set(value),
      setRelocationError: (value) => this.relocationError.set(value),
      setRelocationSuccess: (value) => this.relocationSuccess.set(value),
      setSelectedTarget: (value) => this.selectedTarget.set(value),
      setDestructiveConfirmed: (value) => this.destructiveConfirmed.set(value),
    });
  }

  private reloadSelectedRange(): void {
    const requestId = ++this.loadRequestId;
    const snapshot = this.currentBrowserSelectionSnapshot();

    this.isLoading.set(true);
    this.error.set(null);
    this.relocationError.set(null);

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

        this.error.set(getErrorMessage(error, 'Failed to load vicinity addresses.'));
        this.vicinityRange.set(null);
        this.isLoading.set(false);
      },
    });
  }

  private loadBrowserRange(options: { useExistingSelection?: boolean } = {}) {
    return this.browserRangeLoader.load({
      selectedDistrictCode: this.selectedDistrictCode(),
      centerAddressNumber: this.centerAddressNumber(),
      useExistingSelection: options.useExistingSelection,
    });
  }

  private applyBrowserRangeResult(result: VicinityBrowserRangeResult): void {
    this.districts.set(result.districts);
    this.selectedDistrictCode.set(result.selectedDistrictCode);
    this.centerAddressNumber.set(result.centerAddressNumber);
    this.centerAddressInput.set(String(result.centerAddressNumber));
    this.vicinityRange.set(result.range);
    this.currentAddress.set(result.currentAddress);
  }

  private currentBrowserSelectionSnapshot(): VicinityBrowserSelectionSnapshot {
    return createBrowserSelectionSnapshot({
      selectedDistrictCode: this.selectedDistrictCode(),
      centerAddressNumber: this.centerAddressNumber(),
    });
  }

  private isCurrentBrowserSelection(snapshot: VicinityBrowserSelectionSnapshot): boolean {
    return matchesBrowserSelection(this.currentBrowserSelectionSnapshot(), snapshot);
  }

  private isCurrentLoadRequest(requestId: number): boolean {
    return requestId === this.loadRequestId;
  }
}
