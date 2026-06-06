import { computed, effect, Injectable, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuctionListingsFilters } from '../../../core/domain/trade/player-auction.model';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { AuctionOverviewState } from './auction-overview.state';

@Injectable()
export class AuctionPageState {
  readonly overview = inject(AuctionOverviewState);
  readonly filterForm = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    auctionMode: new FormControl<string | null>(null),
    baseTypeKey: new FormControl<string | null>(null),
    sortKey: new FormControl<string | null>(null),
  });
  readonly auctionModeOptions = computed(() =>
    this.overview.copy()?.filterOptions.auctionModes.map((option) => ({
      label: option.label,
      value: option.key,
    })) ?? [],
  );
  readonly sortOptions = computed(() =>
    this.overview.copy()?.filterOptions.sortOptions.map((option) => ({
      label: option.label,
      value: option.key,
    })) ?? [],
  );
  readonly baseTypeOptions = computed(() =>
    this.overview.copy()?.filterOptions.baseTypeOptions.map((option) => ({
      label: option.label,
      value: option.key,
    })) ?? [],
  );
  readonly auctionUnavailableMessage = computed(() => {
    const summary = this.overview.context()?.summary;

    if (!summary || summary.canUseAuction) {
      return null;
    }

    return summary.createAuctionBlockerLabel ?? null;
  });
  readonly headerSummaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const copy = this.overview.copy();
    const context = this.overview.context();

    if (!copy || !context) {
      return [];
    }

    return [
      {
        key: 'availableCharacterPoints',
        label: copy.summary.availableCharacterPoints,
        value: context.summary.availableCharacterPointsDisplayValue,
      },
      {
        key: 'lockedCharacterPoints',
        label: copy.summary.lockedCharacterPoints,
        value: context.summary.lockedCharacterPointsDisplayValue,
      },
      {
        key: 'activeBids',
        label: copy.summary.activeBids,
        value: context.summary.activeBidCount,
      },
      {
        key: 'myListings',
        label: copy.summary.myListings,
        value: context.summary.myListingCount,
      },
    ];
  });

  constructor() {
    effect(() => {
      const copy = this.overview.copy();
      const appliedFilters = this.overview.listingsPage()?.appliedFilters;

      if (!copy || !appliedFilters) {
        return;
      }

      this.filterForm.setValue(
        {
          query: appliedFilters.query ?? '',
          auctionMode: copy.filterOptions.auctionModes.find((option) =>
            option.key === appliedFilters.auctionMode
          )?.key ?? null,
          baseTypeKey: copy.filterOptions.baseTypeOptions.find((option) =>
            option.key === appliedFilters.baseTypeKey
          )?.key ?? null,
          sortKey: copy.filterOptions.sortOptions.find((option) =>
            option.key === appliedFilters.sortKey
          )?.key ?? null,
        },
        { emitEvent: false },
      );
    });
  }

  loadData(): void {
    this.overview.loadData();
  }

  applyFilters(): void {
    const copy = this.overview.copy();
    const value = this.filterForm.getRawValue();
    const filters: AuctionListingsFilters = {};

    if (!copy) {
      return;
    }

    const auctionMode = copy.filterOptions.auctionModes.find((option) =>
      option.key === value.auctionMode
    )?.key;
    const baseTypeKey = copy.filterOptions.baseTypeOptions.find((option) =>
      option.key === value.baseTypeKey
    )?.key;
    const sortKey = copy.filterOptions.sortOptions.find((option) =>
      option.key === value.sortKey
    )?.key;

    if (auctionMode) {
      filters.auctionMode = auctionMode;
    }

    if (baseTypeKey) {
      filters.baseTypeKey = baseTypeKey;
    }

    if (sortKey) {
      filters.sortKey = sortKey;
    }

    this.overview.searchListings(value.query, filters);
  }

  changeListingsPage(event: { first?: number | null; rows?: number | null }): void {
    this.overview.changeListingsPage(event);
  }

  selectBaseType(value: string | null): void {
    if (this.filterForm.controls.baseTypeKey.value === value) {
      return;
    }

    this.filterForm.controls.baseTypeKey.setValue(value);
    this.applyFilters();
  }
}
