import { Database } from './database.types';

export type CreatePlayerAuctionListingRpcArgs =
  Database['public']['Functions']['create_player_auction_listing']['Args'];
export type PlacePlayerAuctionBidRpcArgs =
  Database['public']['Functions']['place_player_auction_bid']['Args'];
export type BuyNowPlayerAuctionRpcArgs =
  Database['public']['Functions']['buy_now_player_auction']['Args'];
export type ClosePlayerAuctionListingRpcArgs =
  Database['public']['Functions']['close_player_auction_listing']['Args'];
export type CancelPlayerAuctionListingRpcArgs =
  Database['public']['Functions']['cancel_player_auction_listing']['Args'];

export type PlayerAuctionListingIdRpcResult =
  Database['public']['Functions']['create_player_auction_listing']['Returns'];
export type PlayerAuctionBidIdRpcResult =
  Database['public']['Functions']['place_player_auction_bid']['Returns'];
export type PlayerAuctionTransactionIdRpcResult =
  Database['public']['Functions']['buy_now_player_auction']['Returns'];
export type ClosePlayerAuctionListingRpcResult =
  Database['public']['Functions']['close_player_auction_listing']['Returns'] | null;
