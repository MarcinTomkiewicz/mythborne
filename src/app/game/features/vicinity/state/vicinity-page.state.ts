import { computed, inject, Injectable } from '@angular/core';
import { ActiveHero } from '../../../../core/services/hero/active-hero';
import { VicinityAddressRow } from '../../../../core/types/vicinity.types';
import { VicinityHeaderSummaryState } from './vicinity-header-summary.state';
import { VicinityRangeState } from './vicinity-range.state';
import { VicinityRelocationState } from './vicinity-relocation.state';

@Injectable()
export class VicinityPageState {
  private readonly activeHero = inject(ActiveHero);
  private readonly range = inject(VicinityRangeState);
  private readonly summary = inject(VicinityHeaderSummaryState);
  private readonly relocation = inject(VicinityRelocationState);

  readonly isLoading = this.range.isLoading;
  readonly error = this.range.error;
  readonly currentAddress = this.range.currentAddress;
  readonly context = this.range.context;
  readonly copyJson = this.range.copyJson;
  readonly currentEstate = this.range.currentEstate;
  readonly estateRuntimeState = this.range.estateRuntimeState;
  readonly districts = this.range.districts;
  readonly vicinityRange = this.range.vicinityRange;
  readonly selectedDistrictCode = this.range.selectedDistrictCode;
  readonly currentAddressDisplay = this.range.currentAddressDisplay;
  readonly visibleRows = this.range.visibleRows;
  readonly addressPageLabel = this.range.addressPageLabel;
  readonly addressPageOptions = this.range.addressPageOptions;
  readonly addressRangeSummary = this.range.addressRangeSummary;
  readonly addressPaginatorFirst = this.range.addressPaginatorFirst;
  readonly addressPaginatorTotal = this.range.addressPaginatorTotal;
  readonly isDailyAttackLoading = this.summary.isDailyAttackLoading;
  readonly isEstateRuntimeLoading = this.summary.isEstateRuntimeLoading;
  readonly dailyAttackError = this.summary.dailyAttackError;
  readonly estateRuntimeError = this.summary.estateRuntimeError;
  readonly headerSummaryRows = this.summary.headerSummaryRows;
  readonly isRelocating = this.relocation.isRelocating;
  readonly relocationError = this.relocation.relocationError;
  readonly relocationSuccess = this.relocation.relocationSuccess;
  readonly selectedTarget = this.relocation.selectedTarget;
  readonly destructiveConfirmed = this.relocation.destructiveConfirmed;
  readonly canRelocate = this.relocation.canRelocate;
  readonly errorLabel = computed(() => this.copyJson()?.page.errorLabel ?? '');
  readonly pageDescription = computed(() => this.copyJson()?.helper.emptyAddressGeneration ?? '');
  readonly currentHeroName = computed(
    () => this.activeHero.state()?.hero?.name ?? this.activeHero.state()?.heroRow?.name ?? '',
  );
  readonly addressListColumnLabels = computed(() => {
    const copy = this.copyJson();

    return copy
      ? [
          copy.labels.address,
          copy.addressList.columnHero,
          copy.addressList.columnLevel,
          copy.addressList.columnAttack,
          copy.addressList.columnSpy,
          copy.addressList.columnActions,
        ]
      : [];
  });
  readonly currentEstateRankValue = computed(() => {
    const estateRank = this.currentEstate()?.estateRank;

    return typeof estateRank === 'number'
      ? String(estateRank)
      : '';
  });

  loadData(): void {
    this.range.loadData();
  }

  loadDailyAttackState(): void {
    this.summary.loadDailyAttackState();
  }

  loadEstateRuntimeState(): void {
    this.summary.loadEstateRuntimeState();
  }

  setSelectedDistrictCode(value: string): void {
    if (this.isRelocating()) {
      return;
    }

    if (this.range.setSelectedDistrictCode(value)) {
      this.relocation.clearSelection();
    }
  }

  focusAddress(input: { districtCode: string; addressNumber: number }): boolean {
    if (this.isRelocating()) {
      return false;
    }

    const focused = this.range.focusAddress(input);

    if (focused) {
      this.relocation.clearSelection();
    }

    return focused;
  }

  focusCurrentAddress(): boolean {
    if (this.isRelocating()) {
      return false;
    }

    const focused = this.range.focusCurrentAddress();

    if (focused) {
      this.relocation.clearSelection();
    }

    return focused;
  }

  changeAddressPage(event: { first?: number | null }): void {
    if (this.isRelocating()) {
      return;
    }

    if (this.range.changeAddressPage(event)) {
      this.relocation.clearSelection();
    }
  }

  selectRow(row: VicinityAddressRow): void {
    this.relocation.selectRow(row);
  }

  setDestructiveConfirmed(value: boolean): void {
    this.relocation.setDestructiveConfirmed(value);
  }

  relocate(): void {
    this.relocation.relocate({
      onSuccess: () => this.range.loadData(),
    });
  }
}
