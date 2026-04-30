import { Database } from './database.types';

export type CreatePlayerDirectTradeOfferRpcArgs =
  Database['public']['Functions']['create_player_direct_trade_offer']['Args'];
export type RespondPlayerDirectTradeOfferRpcArgs =
  Database['public']['Functions']['respond_player_direct_trade_offer']['Args'];
export type ConfirmPlayerDirectTradeOfferRpcArgs =
  Database['public']['Functions']['confirm_player_direct_trade_offer']['Args'];
export type CancelPlayerDirectTradeOfferRpcArgs =
  Database['public']['Functions']['cancel_player_direct_trade_offer']['Args'];
export type RejectPlayerDirectTradeOfferRpcArgs =
  Database['public']['Functions']['reject_player_direct_trade_offer']['Args'];

export type DirectTradeOfferIdRpcResult =
  Database['public']['Functions']['create_player_direct_trade_offer']['Returns'];
