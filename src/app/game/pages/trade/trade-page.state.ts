import { computed, Injectable, inject } from '@angular/core';
import { GamePageSummaryRow } from '../../../core/interfaces/game-page-summary-row.interface';
import { TradeOverviewState } from './trade-overview.state';

@Injectable()
export class TradePageState {
  readonly overview = inject(TradeOverviewState);
  readonly tradeUnavailableTitle = computed(() => {
    const copy = this.overview.copy();
    const context = this.overview.context();

    if (!copy || context?.canUseTrade !== false) {
      return null;
    }

    return copy.blocked.tradeUnavailableTitle;
  });
  readonly tradeUnavailableMessage = computed(() => {
    const context = this.overview.context();

    if (context?.canUseTrade !== false) {
      return null;
    }

    return context.tradeBlockerLabel;
  });
  readonly headerSummaryRows = computed<readonly GamePageSummaryRow[]>(() => {
    const summary = this.overview.context()?.headerSummary;

    if (!summary) {
      return [];
    }

    return [
      {
        key: 'availableCharacterPoints',
        label: summary.availableCharacterPoints.label,
        value: summary.availableCharacterPoints.displayValue,
      },
      {
        key: 'lockedCharacterPoints',
        label: summary.lockedCharacterPoints.label,
        value: summary.lockedCharacterPoints.displayValue,
      },
      {
        key: 'activeOffers',
        label: summary.activeOffers.label,
        value: summary.activeOffers.displayValue,
      },
      {
        key: 'pendingOffers',
        label: summary.pendingOffers.label,
        value: summary.pendingOffers.displayValue,
      },
    ];
  });

  loadData(): void {
    this.overview.loadData();
  }
}
