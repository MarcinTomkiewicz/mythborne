import { Row } from '../../types/supabase.types';
import {
  DirectTradeItemTarget,
  DirectTradeTransactionItemReadModel,
  DirectTradeTransactionStatus,
} from './direct-trade.model';

export type PlayerAuctionMode = Row<'player_auction_listings'>['auction_mode'];
export type PlayerAuctionStatus = Row<'player_auction_listings'>['status'];
export type PlayerAuctionBidStatus = Row<'player_auction_bids'>['status'];

export interface PlayerAuctionListInput {
  serverId: string;
  heroId: string;
}

export interface PlayerAuctionParticipantLabel {
  heroId: string | null;
  heroName: string | null;
}

export interface PlayerAuctionItemLabel {
  itemId: string;
  itemName: string | null;
  itemStatus: Row<'items'>['status'] | null;
  drachmaValue: number | null;
}

export interface PlayerAuctionBidReadModel {
  id: string;
  listingId: string;
  bidder: PlayerAuctionParticipantLabel;
  amountCharacterPoints: number;
  status: PlayerAuctionBidStatus;
  cancelledAt: string | null;
  refundedAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

export interface PlayerAuctionListingReadModel {
  id: string;
  serverId: string;
  seller: PlayerAuctionParticipantLabel;
  item: PlayerAuctionItemLabel;
  auctionMode: PlayerAuctionMode;
  status: PlayerAuctionStatus;
  startingBidCharacterPoints: number | null;
  buyNowCharacterPoints: number | null;
  currentBidCharacterPoints: number | null;
  currentHighestBidder: PlayerAuctionParticipantLabel;
  description: string | null;
  startsAt: string | null;
  endsAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
  bids: PlayerAuctionBidReadModel[];
}

export interface PlayerAuctionTransactionReadModel {
  id: string;
  serverId: string;
  auctionListingId: string | null;
  status: DirectTradeTransactionStatus;
  description: string | null;
  seller: PlayerAuctionParticipantLabel;
  buyer: PlayerAuctionParticipantLabel;
  sellerCharacterPoints: number;
  buyerCharacterPoints: number;
  completedAt: string | null;
  reversedAt: string | null;
  failedAt: string | null;
  createdAt: string;
  items: DirectTradeTransactionItemReadModel[];
}

export interface PlayerAuctionOverviewReadModel {
  listings: PlayerAuctionListingReadModel[];
  transactions: PlayerAuctionTransactionReadModel[];
}

export interface PlayerAuctionCreateListingResult {
  listingId: string;
}

export interface PlayerAuctionCancelListingResult {
  listingId: string;
}

export interface PlayerAuctionBidResult {
  bidId: string;
}

export interface PlayerAuctionBuyNowResult {
  transactionId: string;
}

export interface PlayerAuctionCloseResult {
  transactionId: string | null;
}

export interface CreatePlayerAuctionListingInput {
  sellerHeroId: string;
  itemId: string;
  auctionMode: PlayerAuctionMode;
  startingBidCharacterPoints?: number | null;
  buyNowCharacterPoints?: number | null;
  description?: string | null;
}

export interface PlacePlayerAuctionBidInput {
  auctionListingId: string;
  bidderHeroId: string;
  amountCharacterPoints: number;
}

export interface PlayerAuctionListingActionInput {
  auctionListingId: string;
  description?: string | null;
  statusReason?: string | null;
}

export interface PlayerAuctionBuyNowInput {
  auctionListingId: string;
  buyerHeroId: string;
  description?: string | null;
}

export type PlayerAuctionItemTarget = DirectTradeItemTarget;
