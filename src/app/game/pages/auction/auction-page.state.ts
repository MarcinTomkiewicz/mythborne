import { computed, Injectable, inject } from '@angular/core';
import { MENU_LOGGED_IN_GROUPS } from '../../../core/config/menu-config';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { AuctionOverviewState } from './auction-overview.state';

@Injectable()
export class AuctionPageState {
  readonly overview = inject(AuctionOverviewState);
  readonly directTradeLabel = routeLabel('/game/trade');
  readonly auctionLabel = routeLabel('/game/auction');
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

function routeLabel(route: string): string {
  for (const group of MENU_LOGGED_IN_GROUPS) {
    const item = group.items.find((entry) => entry.kind === 'link' && entry.route === route);

    if (item?.kind === 'link' && item.label) {
      return item.label;
    }
  }

  throw new Error(`Missing menu label for ${route}.`);
}
