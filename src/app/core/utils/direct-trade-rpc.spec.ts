import {
  toCancelPlayerDirectTradeOfferRpcArgs,
  toConfirmPlayerDirectTradeOfferRpcArgs,
  toCreatePlayerDirectTradeOfferRpcArgs,
  toRejectPlayerDirectTradeOfferRpcArgs,
  toRespondPlayerDirectTradeOfferRpcArgs,
} from './direct-trade-rpc';

describe('direct trade rpc mappers', () => {
  it('maps create offer args to the public direct trade workflow contract', () => {
    expect(
      toCreatePlayerDirectTradeOfferRpcArgs({
        creatorHeroId: ' hero-1 ',
        targetHeroId: ' hero-2 ',
        creatorCharacterPoints: 25,
        creatorItemIds: [' item-1 ', 'item-1', ' item-2 '],
        description: ' fair trade ',
      }),
    ).toEqual({
      p_creator_hero_id: 'hero-1',
      p_target_hero_id: 'hero-2',
      p_creator_character_points: 25,
      p_creator_item_ids: ['item-1', 'item-2'],
      p_description: 'fair trade',
    });
  });

  it('maps target response args without creator-side fields', () => {
    expect(
      toRespondPlayerDirectTradeOfferRpcArgs({
        offerId: ' offer-1 ',
        targetCharacterPoints: 10,
        targetItemIds: [' item-3 '],
        description: ' accepted with item ',
      }),
    ).toEqual({
      p_offer_id: 'offer-1',
      p_target_character_points: 10,
      p_target_item_ids: ['item-3'],
      p_description: 'accepted with item',
    });
  });

  it('maps confirm, cancel and reject action args', () => {
    expect(
      toConfirmPlayerDirectTradeOfferRpcArgs({
        offerId: ' offer-1 ',
        description: ' final confirmation ',
      }),
    ).toEqual({
      p_offer_id: 'offer-1',
      p_description: 'final confirmation',
    });
    expect(
      toCancelPlayerDirectTradeOfferRpcArgs({
        offerId: ' offer-1 ',
        statusReason: ' changed mind ',
      }),
    ).toEqual({
      p_offer_id: 'offer-1',
      p_status_reason: 'changed mind',
    });
    expect(
      toRejectPlayerDirectTradeOfferRpcArgs({
        offerId: ' offer-1 ',
        statusReason: ' not interested ',
      }),
    ).toEqual({
      p_offer_id: 'offer-1',
      p_status_reason: 'not interested',
    });
  });

  it('requires identifiers and valid non-negative integer Character Points', () => {
    expect(() =>
      toCreatePlayerDirectTradeOfferRpcArgs({
        creatorHeroId: '',
        targetHeroId: 'hero-2',
      }),
    ).toThrowError('creatorHeroId is required for direct trade workflow.');
    expect(() =>
      toCreatePlayerDirectTradeOfferRpcArgs({
        creatorHeroId: 'hero-1',
        targetHeroId: 'hero-2',
        creatorCharacterPoints: -1,
      }),
    ).toThrowError('p_creator_character_points must be a non-negative integer.');
    expect(() =>
      toRespondPlayerDirectTradeOfferRpcArgs({
        offerId: 'offer-1',
        targetCharacterPoints: 1.5,
      }),
    ).toThrowError('p_target_character_points must be a non-negative integer.');
  });
});
