import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CurrentEstateAddressReadModel,
  EmptyEstateAddressOption,
  EstateDistrictCapacityReadModel,
} from '../../../core/domain/estate/estate-address.model';
import { HeroPvpDailyAttackState } from '../../../core/domain/pvp/pvp.model';
import { ActiveHeroState } from '../../../core/interfaces/hero/active-hero.interface';
import { VICINITY_ADDRESS_PAGE_SIZE } from '../../../core/configs/vicinity.config';
import { BuildingJobs } from '../../../core/services/buildings/building-jobs';
import type { HeroEstateRuntimeStateReadModel } from '../../../core/services/buildings/building-jobs-read-model';
import { ActiveHero } from '../../../core/services/hero/active-hero';
import { PlayerPvp } from '../../../core/services/pvp/player-pvp';
import type {
  VicinityAddressRange,
  VicinityAddressRow,
  VicinityBrowserRangeResult,
  VicinityBrowserSelectionSnapshot,
} from '../../../core/types/vicinity.types';
import { getErrorMessage } from '../../../core/utils/error-message';
import { toEmptyAddressOption } from './vicinity-address-range';
import {
  createBrowserSelectionSnapshot,
  matchesBrowserSelection,
} from './vicinity-state-guards';
import { VicinityBrowserRangeLoader } from './vicinity-browser-range-loader';
import { VicinityRelocationRunner } from './vicinity-relocation-runner';

@Injectable()
export class VicinityPageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly browserRangeLoader = inject(VicinityBrowserRangeLoader);
  private readonly buildingJobs = inject(BuildingJobs);
  private readonly playerPvp = inject(PlayerPvp);
  private readonly relocationRunner = inject(VicinityRelocationRunner);

  readonly isLoading = signal(true);
  readonly isDailyAttackLoading = signal(false);
  readonly isEstateRuntimeLoading = signal(false);
  readonly isRelocating = signal(false);
  readonly error = signal<string | null>(null);
  readonly relocationError = signal<string | null>(null);
  readonly relocationSuccess = signal<string | null>(null);
  readonly currentAddress = signal<CurrentEstateAddressReadModel | null>(null);
  readonly districts = signal<EstateDistrictCapacityReadModel[]>([]);
  readonly vicinityRange = signal<VicinityAddressRange | null>(null);
  readonly selectedDistrictCode = signal<string | null>(null);
  readonly focusAddressNumber = signal(1);
  readonly dailyAttackState = signal<HeroPvpDailyAttackState | null>(null);
  readonly dailyAttackError = signal<string | null>(null);
  readonly estateRuntimeState = signal<HeroEstateRuntimeStateReadModel | null>(null);
  readonly estateRuntimeError = signal<string | null>(null);
  readonly selectedTarget = signal<EmptyEstateAddressOption | null>(null);
  readonly destructiveConfirmed = signal(false);

  readonly currentAddressLabel = computed(
    () => this.currentAddress()?.addressLabel ?? 'Niedostępny',
  );
  readonly currentHeroName = computed(
    () => this.activeHero.state()?.hero?.name ?? this.activeHero.state()?.heroRow?.name ?? 'Bohater',
  );
  readonly selectedDistrict = computed(() => {
    const code = this.selectedDistrictCode();
    return this.districts().find((district) => district.districtCode === code) ?? null;
  });
  readonly rangeLabel = computed(() => this.vicinityRange()?.rangeLabel ?? null);
  readonly rows = computed(() => this.vicinityRange()?.rows ?? []);
  readonly visibleRows = computed(() => this.rows());
  readonly dailyAttackLabel = computed(() => {
    const state = this.dailyAttackState();

    if (!state) {
      return 'Brak danych z backendu';
    }

    return `${state.remainingDailyAttacks}/${state.dailyAttackLimit}`;
  });
  readonly attackProtectionLabel = computed(() => {
    const state = this.estateRuntimeState();

    return state?.attackProtectionActive && state.attackProtectionExpiresAt
      ? `do ${formatTimeLabel(state.attackProtectionExpiresAt)}`
      : 'Brak aktywnej ochrony';
  });
  readonly siegeProtectionLabel = computed(() => {
    const state = this.estateRuntimeState();

    return state?.siegeProtectionActive
      && state.siegeProtectionExpiresAt
      && state.siegeProtectionSource !== 'not_modeled'
      ? `do ${formatTimeLabel(state.siegeProtectionExpiresAt)}`
      : 'Brak aktywnej ochrony';
  });
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
  readonly canRelocate = computed(
    () => !!this.selectedTarget() && this.destructiveConfirmed() && !this.isRelocating(),
  );
  private loadRequestId = 0;
  private dailyAttackRequestId = 0;
  private estateRuntimeRequestId = 0;

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

        this.error.set(getErrorMessage(error, 'Nie udało się wczytać adresów w okolicy.'));
        this.vicinityRange.set(null);
        this.currentAddress.set(null);
        this.isLoading.set(false);
      },
    });
  }

  loadDailyAttackState(): void {
    const requestId = ++this.dailyAttackRequestId;
    const requestContextKey = toContextKey(this.activeHero.state());

    this.isDailyAttackLoading.set(true);
    this.dailyAttackError.set(null);

    if (!requestContextKey) {
      this.dailyAttackState.set(null);
      this.dailyAttackError.set('Brak aktywnego bohatera do wczytania dziennych ataków.');
      this.isDailyAttackLoading.set(false);
      return;
    }

    this.playerPvp.getDailyAttackState().subscribe({
      next: (state) => {
        if (requestId !== this.dailyAttackRequestId || requestContextKey !== toContextKey(this.activeHero.state())) {
          return;
        }

        this.dailyAttackState.set(state);
        this.isDailyAttackLoading.set(false);
      },
      error: (error: unknown) => {
        if (requestId !== this.dailyAttackRequestId || requestContextKey !== toContextKey(this.activeHero.state())) {
          return;
        }

        this.dailyAttackState.set(null);
        this.dailyAttackError.set(
          getErrorMessage(error, 'Nie udało się wczytać dziennej liczby ataków.'),
        );
        this.isDailyAttackLoading.set(false);
      },
    });
  }

  loadEstateRuntimeState(): void {
    const requestId = ++this.estateRuntimeRequestId;
    const requestContextKey = toContextKey(this.activeHero.state());
    const heroId = this.activeHero.state()?.heroId ?? null;

    this.isEstateRuntimeLoading.set(true);
    this.estateRuntimeError.set(null);

    if (!requestContextKey || !heroId) {
      this.estateRuntimeState.set(null);
      this.estateRuntimeError.set('Brak aktywnego bohatera do wczytania ochrony posiadłości.');
      this.isEstateRuntimeLoading.set(false);
      return;
    }

    this.buildingJobs.getHeroEstateRuntimeState(heroId).subscribe({
      next: (state) => {
        if (requestId !== this.estateRuntimeRequestId || requestContextKey !== toContextKey(this.activeHero.state())) {
          return;
        }

        this.estateRuntimeState.set(state);
        this.isEstateRuntimeLoading.set(false);
      },
      error: (error: unknown) => {
        if (requestId !== this.estateRuntimeRequestId || requestContextKey !== toContextKey(this.activeHero.state())) {
          return;
        }

        this.estateRuntimeState.set(null);
        this.estateRuntimeError.set(
          getErrorMessage(error, 'Nie udało się wczytać ochrony posiadłości.'),
        );
        this.isEstateRuntimeLoading.set(false);
      },
    });
  }

  setSelectedDistrictCode(value: string): void {
    if (this.isRelocating()) {
      return;
    }

    const district = this.districts().find((entry) => entry.districtCode === value);

    if (!district) {
      this.error.set(`Dzielnica posiadłości "${value}" nie jest aktywna.`);
      return;
    }

    const currentAddress = this.currentAddress();
    const focusAddressNumber =
      currentAddress?.districtCode === district.districtCode
        ? currentAddress.addressNumber
        : 1;

    this.selectedDistrictCode.set(district.districtCode);
    this.focusAddressNumber.set(focusAddressNumber);
    this.selectedTarget.set(null);
    this.destructiveConfirmed.set(false);
    this.reloadSelectedRange();
  }

  focusAddress(input: { districtCode: string; addressNumber: number }): boolean {
    if (this.isRelocating()) {
      return false;
    }

    const district = this.districts().find(
      (entry) => entry.districtCode === input.districtCode,
    );

    if (!district || !Number.isInteger(input.addressNumber) || input.addressNumber < 1) {
      return false;
    }

    this.selectedDistrictCode.set(district.districtCode);
    this.focusAddressNumber.set(Math.min(input.addressNumber, district.addressCapacity));
    this.selectedTarget.set(null);
    this.destructiveConfirmed.set(false);
    this.reloadSelectedRange();

    return true;
  }

  focusCurrentAddress(): boolean {
    if (this.isRelocating()) {
      return false;
    }

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
    this.applyAddressPageStart(pageStart);

    return true;
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

  changeAddressPage(event: { first?: number | null }): void {
    if (this.isRelocating()) {
      return;
    }

    const first = Number.isInteger(event.first) ? Number(event.first) : 0;
    this.applyAddressPageStart(first + 1);
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

        this.error.set(getErrorMessage(error, 'Nie udało się wczytać adresów w okolicy.'));
        this.vicinityRange.set(null);
        this.isLoading.set(false);
      },
    });
  }

  private applyAddressPageStart(fromAddressNumber: number): void {
    const district = this.selectedDistrict();

    if (!district) {
      return;
    }

    const maxStart = Math.max(1, district.addressCapacity - VICINITY_ADDRESS_PAGE_SIZE + 1);
    const pageStart = Math.min(Math.max(1, fromAddressNumber), maxStart);
    const focusAddressNumber = Math.min(
      district.addressCapacity,
      pageStart + Math.floor((VICINITY_ADDRESS_PAGE_SIZE - 1) / 2),
    );

    this.focusAddressNumber.set(focusAddressNumber);
    this.selectedTarget.set(null);
    this.destructiveConfirmed.set(false);
    this.reloadSelectedRange();
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

function toContextKey(state: Pick<ActiveHeroState, 'serverId' | 'heroId'> | null): string | null {
  return state?.heroId && state.serverId
    ? `${state.serverId}:${state.heroId}`
    : null;
}

function formatTimeLabel(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 8);
  }

  return [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ].map((part) => String(part).padStart(2, '0')).join(':');
}
