import { computed, inject, Injectable, signal } from '@angular/core';
import { VICINITY_ADDRESS_PAGE_SIZE } from '../../../../core/configs/vicinity.config';
import { CurrentEstateAddressReadModel } from '../../../../core/domain/estate/estate-address.model';
import {
  PlayerVicinityAddressCapacityReadModel,
  PlayerVicinityPageContextReadModel,
} from '../../../../core/domain/vicinity/player-vicinity-page-context.model';
import type {
  VicinityAddressRange,
  VicinityBrowserRangeResult,
  VicinityBrowserSelectionSnapshot,
} from '../../../../core/types/vicinity.types';
import { getErrorMessage } from '../../../../core/utils/error-message';
import { replaceTemplateTokens } from '../../../../core/utils/token-template';
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
  readonly context = signal<PlayerVicinityPageContextReadModel | null>(null);
  readonly currentAddress = signal<CurrentEstateAddressReadModel | null>(null);
  readonly districts = signal<PlayerVicinityAddressCapacityReadModel[]>([]);
  readonly vicinityRange = signal<VicinityAddressRange | null>(null);
  readonly selectedDistrictCode = signal<string | null>(null);
  readonly focusAddressNumber = signal(1);
  readonly copyJson = computed(() => this.context()?.copyJson ?? null);
  readonly currentAddressDisplay = computed(
    () => this.currentAddress()?.addressLabel ?? this.copyJson()?.summary.backendDataUnavailableLabel ?? '',
  );
  readonly selectedDistrict = computed(() => {
    const code = this.selectedDistrictCode();
    return this.districts().find((district) => district.districtCode === code) ?? null;
  });
  readonly currentEstate = computed(() => this.context()?.currentEstate ?? null);
  readonly estateRuntimeState = computed(() => this.context()?.estateRuntimeState ?? null);
  readonly rows = computed(() => this.vicinityRange()?.rows ?? []);
  readonly visibleRows = computed(() => this.rows());
  readonly addressPageLabel = computed(() => {
    const range = this.vicinityRange();
    const copy = this.copyJson();

    if (!range || !copy) {
      return copy?.pagination.pageUnavailableLabel ?? '';
    }

    const districtStart = range.district.addressNumberStart;
    const pageNumber =
      Math.floor((range.fromAddressNumber - districtStart) / VICINITY_ADDRESS_PAGE_SIZE) + 1;
    const pageCount = Math.max(
      1,
      Math.ceil(range.district.addressCapacity / VICINITY_ADDRESS_PAGE_SIZE),
    );

    return replaceTemplateTokens(copy.pagination.pageLabelTemplate, {
      pageNumber,
      pageCount,
    });
  });
  readonly addressPageOptions = computed(() => {
    const total = this.addressPaginatorTotal();
    const pageCount = Math.max(1, Math.ceil(total / VICINITY_ADDRESS_PAGE_SIZE));
    const copy = this.copyJson();
    const pageLabelTemplate = copy?.pagination.pageLabelTemplate;
    const unavailableLabel = copy?.pagination.pageUnavailableLabel ?? '';

    return Array.from({ length: pageCount }, (_, index) => ({
      label: pageLabelTemplate
        ? replaceTemplateTokens(pageLabelTemplate, {
            pageNumber: index + 1,
            pageCount,
          })
        : unavailableLabel,
      value: index * VICINITY_ADDRESS_PAGE_SIZE,
    }));
  });
  readonly addressRangeSummary = computed(() => {
    const range = this.vicinityRange();
    const copy = this.copyJson();

    return range && copy
      ? replaceTemplateTokens(copy.pagination.rangeSummaryTemplate, {
          rangeLabel: range.rangeLabel,
          addressCapacity: range.district.addressCapacity,
        })
      : copy?.pagination.rangeUnavailableLabel ?? '';
  });
  readonly addressPaginatorFirst = computed(() => {
    const range = this.vicinityRange();

    return range
      ? Math.max(0, range.fromAddressNumber - range.district.addressNumberStart)
      : 0;
  });
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

        this.error.set(getErrorMessage(error, this.copyJson()?.page.errorLabel ?? ''));
        this.vicinityRange.set(null);
        this.currentAddress.set(null);
        this.context.set(null);
        this.isLoading.set(false);
      },
    });
  }

  setSelectedDistrictCode(value: string): boolean {
    const district = this.districts().find((entry) => entry.districtCode === value);

    if (!district) {
      const copy = this.copyJson();
      this.error.set(
        copy
          ? replaceTemplateTokens(copy.errors.inactiveDistrictTemplate, {
              districtCode: value,
            })
          : '',
      );
      return false;
    }

    const currentAddress = this.currentAddress();
    const focusAddressNumber =
      currentAddress?.districtCode === district.districtCode
        ? currentAddress.addressNumber
        : district.addressNumberStart;

    this.selectedDistrictCode.set(district.districtCode);
    this.focusAddressNumber.set(focusAddressNumber);
    this.reloadSelectedRange();

    return true;
  }

  focusAddress(input: { districtCode: string; addressNumber: number }): boolean {
    const district = this.districts().find(
      (entry) => entry.districtCode === input.districtCode,
    );

    if (!district || !Number.isInteger(input.addressNumber)) {
      return false;
    }

    this.selectedDistrictCode.set(district.districtCode);
    this.focusAddressNumber.set(
      clampAddressNumber(input.addressNumber, district),
    );
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

    const districtStart = district.addressNumberStart;
    const pageStart =
      Math.floor(
        (currentAddress.addressNumber - districtStart) / VICINITY_ADDRESS_PAGE_SIZE,
      )
      * VICINITY_ADDRESS_PAGE_SIZE
      + districtStart;

    this.selectedDistrictCode.set(district.districtCode);
    return this.applyAddressPageStart(pageStart);
  }

  changeAddressPage(event: { first?: number | null }): boolean {
    const first = Number.isInteger(event.first) ? Number(event.first) : 0;
    const districtStart = this.selectedDistrict()?.addressNumberStart ?? 1;

    return this.applyAddressPageStart(districtStart + first);
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

        this.error.set(getErrorMessage(error, this.copyJson()?.page.errorLabel ?? ''));
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

    const districtStart = district.addressNumberStart;
    const districtEnd = district.addressNumberEnd;
    const maxStart = Math.max(
      districtStart,
      districtEnd - VICINITY_ADDRESS_PAGE_SIZE + 1,
    );
    const pageStart = Math.min(Math.max(districtStart, fromAddressNumber), maxStart);
    const focusAddressNumber = Math.min(
      districtEnd,
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
    this.context.set(result.context);
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

function clampAddressNumber(
  addressNumber: number,
  district: PlayerVicinityAddressCapacityReadModel,
): number {
  return Math.min(
    Math.max(district.addressNumberStart, addressNumber),
    district.addressNumberEnd,
  );
}
