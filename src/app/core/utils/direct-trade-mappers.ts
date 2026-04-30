import {
  DirectTradeOfferItemReadModel,
  DirectTradeOfferReadModel,
  DirectTradeParticipantLabel,
  DirectTradeTransactionItemReadModel,
  DirectTradeTransactionReadModel,
} from '../domain/trade/direct-trade.model';
import { Row } from '../types/supabase.types';

export function mapDirectTradeOffer(
  row: Row<'player_trade_offers'>,
  context: {
    items: readonly DirectTradeOfferItemReadModel[];
    participantLabels: ReadonlyMap<string, DirectTradeParticipantLabel>;
  },
): DirectTradeOfferReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    status: row.status,
    description: row.description,
    creator: participantLabel(row.creator_hero_id, context.participantLabels),
    target: participantLabel(row.target_hero_id, context.participantLabels),
    creatorCharacterPoints: row.creator_character_points,
    targetCharacterPoints: row.target_character_points,
    expiresAt: row.expires_at,
    acceptedByCreatorAt: row.accepted_by_creator_at,
    acceptedByTargetAt: row.accepted_by_target_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    rejectedAt: row.rejected_at,
    failedAt: row.failed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: context.items.filter((item) => item.offerId === row.id),
  };
}

export function mapDirectTradeOfferItem(
  row: Row<'player_trade_offer_items'>,
  itemById: ReadonlyMap<string, Row<'items'>>,
): DirectTradeOfferItemReadModel {
  const item = itemById.get(row.item_id) ?? null;

  return {
    id: row.id,
    offerId: row.offer_id,
    itemId: row.item_id,
    itemName: item?.name ?? null,
    itemStatus: item?.status ?? null,
    itemDrachmaValue: item?.drachma_value ?? null,
    offeredByHeroId: row.offered_by_hero_id,
    side: row.side,
    createdAt: row.created_at,
  };
}

export function mapDirectTradeTransaction(
  row: Row<'player_trade_transactions'>,
  context: {
    items: readonly DirectTradeTransactionItemReadModel[];
    participantLabels: ReadonlyMap<string, DirectTradeParticipantLabel>;
  },
): DirectTradeTransactionReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    offerId: row.offer_id,
    auctionListingId: row.auction_listing_id,
    transactionType: row.transaction_type,
    status: row.status,
    description: row.description,
    creator: participantLabel(row.creator_hero_id, context.participantLabels),
    target: participantLabel(row.target_hero_id, context.participantLabels),
    creatorCharacterPoints: row.creator_character_points,
    targetCharacterPoints: row.target_character_points,
    completedAt: row.completed_at,
    reversedAt: row.reversed_at,
    failedAt: row.failed_at,
    createdAt: row.created_at,
    items: context.items.filter((item) => item.transactionId === row.id),
  };
}

export function mapDirectTradeTransactionItem(
  row: Row<'player_trade_transaction_items'>,
): DirectTradeTransactionItemReadModel {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    serverId: row.server_id,
    itemId: row.item_id,
    itemName: row.item_name_snapshot,
    itemDrachmaValue: row.item_drachma_value_snapshot,
    fromHeroId: row.from_hero_id,
    toHeroId: row.to_hero_id,
    generationBaseName: row.generation_base_name_snapshot,
    generationQualityLabel: row.generation_quality_label_snapshot,
    prefixAffixName: row.prefix_affix_name_snapshot,
    suffixAffixName: row.suffix_affix_name_snapshot,
    createdAt: row.created_at,
  };
}

export function mapDirectTradeParticipantLabels(
  rows: readonly Pick<Row<'hero'>, 'id' | 'name'>[],
): ReadonlyMap<string, DirectTradeParticipantLabel> {
  return new Map(
    rows.map((row) => [
      row.id,
      {
        heroId: row.id,
        heroName: row.name,
      },
    ]),
  );
}

function participantLabel(
  heroId: string | null,
  labels: ReadonlyMap<string, DirectTradeParticipantLabel>,
): DirectTradeParticipantLabel {
  if (!heroId) {
    return {
      heroId: null,
      heroName: null,
    };
  }

  return labels.get(heroId) ?? { heroId, heroName: null };
}
