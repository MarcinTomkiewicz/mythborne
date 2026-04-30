import { FormControl, FormGroup } from '@angular/forms';
import { DirectTradeItemTarget } from '../../domain/trade/direct-trade.model';
import { PlayerAuctionMode } from '../../domain/trade/player-auction.model';

export type PlayerAuctionCreateForm = FormGroup<{
  item: FormControl<DirectTradeItemTarget | null>;
  auctionMode: FormControl<PlayerAuctionMode | null>;
  startingBidCharacterPoints: FormControl<number | null>;
  buyNowCharacterPoints: FormControl<number | null>;
  description: FormControl<string | null>;
}>;

export type PlayerAuctionBidForm = FormGroup<{
  bidAmountCharacterPoints: FormControl<number | null>;
  description: FormControl<string | null>;
}>;
