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
export type GetAuctionPageCopyRpcArgs =
  Database['public']['Functions']['get_auction_page_copy']['Args'];
export type GetAuctionPageCopyRpcResult =
  Database['public']['Functions']['get_auction_page_copy']['Returns'];
export type GetAuctionPageContextRpcArgs =
  Database['public']['Functions']['get_auction_page_context']['Args'];
export type GetAuctionPageContextRpcResult =
  Database['public']['Functions']['get_auction_page_context']['Returns'];
export type SearchAuctionListingsPageRpcArgs =
  Database['public']['Functions']['search_auction_listings_page']['Args'];
export type SearchAuctionListingsPageRpcResult =
  Database['public']['Functions']['search_auction_listings_page']['Returns'];
export type GetAuctionListingsPageRpcArgs =
  Database['public']['Functions']['get_auction_listings_page']['Args'];
export type GetAuctionListingsPageRpcResult =
  Database['public']['Functions']['get_auction_listings_page']['Returns'];
export type GetAuctionBidsPageRpcArgs =
  Database['public']['Functions']['get_auction_bids_page']['Args'];
export type GetAuctionBidsPageRpcResult =
  Database['public']['Functions']['get_auction_bids_page']['Returns'];
export type GetAuctionCreateContextRpcArgs =
  Database['public']['Functions']['get_auction_create_context']['Args'];
export type GetAuctionCreateContextRpcResult =
  Database['public']['Functions']['get_auction_create_context']['Returns'];

export type PlayerAuctionListingIdRpcResult =
  Database['public']['Functions']['create_player_auction_listing']['Returns'];
export type PlayerAuctionBidIdRpcResult =
  Database['public']['Functions']['place_player_auction_bid']['Returns'];
export type PlayerAuctionTransactionIdRpcResult =
  Database['public']['Functions']['buy_now_player_auction']['Returns'];
export type ClosePlayerAuctionListingRpcResult =
  Database['public']['Functions']['close_player_auction_listing']['Returns'] | null;
