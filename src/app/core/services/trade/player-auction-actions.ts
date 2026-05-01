import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  CreatePlayerAuctionListingInput,
  PlacePlayerAuctionBidInput,
  PlayerAuctionBuyNowInput,
  PlayerAuctionBidResult,
  PlayerAuctionBuyNowResult,
  PlayerAuctionCancelListingResult,
  PlayerAuctionCloseResult,
  PlayerAuctionCreateListingResult,
  PlayerAuctionListingActionInput,
} from '../../domain/trade/player-auction.model';
import {
  ClosePlayerAuctionListingRpcResult,
  PlayerAuctionBidIdRpcResult,
  PlayerAuctionListingIdRpcResult,
  PlayerAuctionTransactionIdRpcResult,
} from '../../types/player-auction-rpc.types';
import {
  toBuyNowPlayerAuctionRpcArgs,
  toCancelPlayerAuctionListingRpcArgs,
  toClosePlayerAuctionListingRpcArgs,
  toCreatePlayerAuctionListingRpcArgs,
  toPlacePlayerAuctionBidRpcArgs,
} from '../../utils/player-auction-rpc';
import { trimText } from '../../utils/normalize-text';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class PlayerAuctionActions {
  private readonly backend = inject(Backend);

  // Auction lifecycle audit is DB-owned by the canonical RPCs/triggers.
  // Do not add frontend AuditWriter calls in this mutation boundary.
  createListing(
    input: CreatePlayerAuctionListingInput,
  ): Observable<PlayerAuctionCreateListingResult> {
    return this.backend
      .rpc<PlayerAuctionListingIdRpcResult>(
        RPC.create_player_auction_listing,
        toCreatePlayerAuctionListingRpcArgs(input),
      )
      .pipe(map((listingId) => ({ listingId: requiredResultText(listingId, 'listingId') })));
  }

  placeBid(input: PlacePlayerAuctionBidInput): Observable<PlayerAuctionBidResult> {
    return this.backend
      .rpc<PlayerAuctionBidIdRpcResult>(
        RPC.place_player_auction_bid,
        toPlacePlayerAuctionBidRpcArgs(input),
      )
      .pipe(map((bidId) => ({ bidId: requiredResultText(bidId, 'bidId') })));
  }

  buyNow(input: PlayerAuctionBuyNowInput): Observable<PlayerAuctionBuyNowResult> {
    return this.backend
      .rpc<PlayerAuctionTransactionIdRpcResult>(
        RPC.buy_now_player_auction,
        toBuyNowPlayerAuctionRpcArgs(input),
      )
      .pipe(
        map((transactionId) => ({
          transactionId: requiredResultText(transactionId, 'transactionId'),
        })),
      );
  }

  closeListing(
    input: PlayerAuctionListingActionInput,
  ): Observable<PlayerAuctionCloseResult> {
    return this.backend
      .rpc<ClosePlayerAuctionListingRpcResult>(
        RPC.close_player_auction_listing,
        toClosePlayerAuctionListingRpcArgs(input),
      )
      .pipe(
        map((transactionId) => ({
          transactionId: transactionId === null ? null : requiredResultText(transactionId, 'transactionId'),
        })),
      );
  }

  cancelListing(
    input: PlayerAuctionListingActionInput,
  ): Observable<PlayerAuctionCancelListingResult> {
    return this.backend
      .rpc<PlayerAuctionListingIdRpcResult>(
        RPC.cancel_player_auction_listing,
        toCancelPlayerAuctionListingRpcArgs(input),
      )
      .pipe(map((listingId) => ({ listingId: requiredResultText(listingId, 'listingId') })));
  }
}

function requiredResultText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for player auction workflow.`);
  }

  return normalized;
}
