import { computed, Injectable, inject } from '@angular/core';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { AuctionOverviewState } from './auction-overview.state';

@Injectable()
export class AuctionPageState {
  readonly overview = inject(AuctionOverviewState);
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
  readonly errorMessage = computed(() => {
    const error = this.overview.error();

    if (!error) {
      return null;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  });

  loadData(): void {
    this.overview.loadData();
  }
}
