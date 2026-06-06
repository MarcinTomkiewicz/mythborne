import { Component, input } from '@angular/core';
import { AuctionPageCopy } from '../../../core/domain/trade/player-auction.model';

@Component({
  selector: 'app-auction-rules-panel',
  standalone: true,
  templateUrl: './auction-rules-panel.html',
})
export class AuctionRulesPanel {
  readonly rules = input.required<AuctionPageCopy['rules']>();
}
