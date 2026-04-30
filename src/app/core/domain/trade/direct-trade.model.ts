import { Row } from '../../types/supabase.types';

export type DirectTradeOfferStatus = Row<'player_trade_offers'>['status'];
export type DirectTradeSide = Row<'player_trade_offer_items'>['side'];
export type DirectTradeTransactionStatus = Row<'player_trade_transactions'>['status'];
export type DirectTradeTransactionType =
  Row<'player_trade_transactions'>['transaction_type'];

export interface DirectTradeListInput {
  serverId: string;
  heroId: string;
}

export interface DirectTradeParticipantLabel {
  heroId: string | null;
  heroName: string | null;
}

export interface DirectTradeOfferItemReadModel {
  id: string;
  offerId: string;
  itemId: string;
  itemName: string | null;
  itemStatus: Row<'items'>['status'] | null;
  itemDrachmaValue: number | null;
  offeredByHeroId: string;
  side: DirectTradeSide;
  createdAt: string;
}

export interface DirectTradeOfferReadModel {
  id: string;
  serverId: string;
  status: DirectTradeOfferStatus;
  description: string | null;
  creator: DirectTradeParticipantLabel;
  target: DirectTradeParticipantLabel;
  creatorCharacterPoints: number;
  targetCharacterPoints: number;
  expiresAt: string | null;
  acceptedByCreatorAt: string | null;
  acceptedByTargetAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  rejectedAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: DirectTradeOfferItemReadModel[];
}

export interface DirectTradeTransactionItemReadModel {
  id: string;
  transactionId: string;
  serverId: string;
  itemId: string | null;
  itemName: string | null;
  itemDrachmaValue: number | null;
  fromHeroId: string | null;
  toHeroId: string | null;
  generationBaseName: string | null;
  generationQualityLabel: string | null;
  prefixAffixName: string | null;
  suffixAffixName: string | null;
  createdAt: string;
}

export interface DirectTradeTransactionReadModel {
  id: string;
  serverId: string;
  offerId: string | null;
  auctionListingId: string | null;
  transactionType: DirectTradeTransactionType;
  status: DirectTradeTransactionStatus;
  description: string | null;
  creator: DirectTradeParticipantLabel;
  target: DirectTradeParticipantLabel;
  creatorCharacterPoints: number;
  targetCharacterPoints: number;
  completedAt: string | null;
  reversedAt: string | null;
  failedAt: string | null;
  createdAt: string;
  items: DirectTradeTransactionItemReadModel[];
}

export interface DirectTradeOverviewReadModel {
  offers: DirectTradeOfferReadModel[];
  transactions: DirectTradeTransactionReadModel[];
}
