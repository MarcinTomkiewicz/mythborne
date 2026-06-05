import { AuctionPageContext } from '../domain/trade/player-auction.model';
import { HeroRow } from '../types/domain-row.types';
import { Json } from '../types/database.types';
import {
  read,
  requiredBoolean,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';
import {
  optionalString,
  optionalNumeric,
  requireContractVersion,
  requiredRecordArray,
  withOptionalFields,
} from './auction-contract-mapper-common';

export interface AuctionPageContextIdentity {
  heroId: string;
  serverId: string;
}

export function mapAuctionPageContext(
  value: Json,
  identity: AuctionPageContextIdentity,
): AuctionPageContext {
  const root = requiredRecord(value, 'get_auction_page_context');
  const hero = mapContextHero(requiredRecord(
    read(root, 'hero'),
    'get_auction_page_context.hero',
  ));

  validateContextIdentity(hero, identity);

  return {
    contractVersion: requireContractVersion(
      root,
      'auction_page_context_v1',
      'get_auction_page_context',
    ),
    hero,
    summary: mapSummary(
      requiredRecord(read(root, 'summary'), 'get_auction_page_context.summary'),
    ),
    constraints: mapConstraints(
      requiredRecord(read(root, 'constraints'), 'get_auction_page_context.constraints'),
    ),
    navigation: mapNavigation(
      requiredRecord(read(root, 'navigation'), 'get_auction_page_context.navigation'),
    ),
  };
}

function mapContextHero(hero: Record<string, Json | undefined>): HeroRow {
  requiredText(read(hero, 'id'), 'get_auction_page_context.hero.id');
  requiredText(read(hero, 'server_id'), 'get_auction_page_context.hero.server_id');

  return hero as unknown as HeroRow;
}

function validateContextIdentity(
  hero: HeroRow,
  identity: AuctionPageContextIdentity,
): void {
  if (hero.id !== identity.heroId) {
    throw new Error('get_auction_page_context returned a different hero id.');
  }

  if (hero.server_id !== identity.serverId) {
    throw new Error('get_auction_page_context returned a different server id.');
  }
}

function mapSummary(summary: Record<string, Json | undefined>): AuctionPageContext['summary'] {
  return withOptionalFields<AuctionPageContext['summary']>({
    characterPoints: requiredNumber(read(summary, 'characterPoints'), 'summary.characterPoints'),
    characterPointsDisplayValue: requiredText(
      read(summary, 'characterPointsDisplayValue'),
      'summary.characterPointsDisplayValue',
    ),
    availableCharacterPoints: requiredNumber(
      read(summary, 'availableCharacterPoints'),
      'summary.availableCharacterPoints',
    ),
    availableCharacterPointsDisplayValue: requiredText(
      read(summary, 'availableCharacterPointsDisplayValue'),
      'summary.availableCharacterPointsDisplayValue',
    ),
    lockedCharacterPoints: requiredNumber(
      read(summary, 'lockedCharacterPoints'),
      'summary.lockedCharacterPoints',
    ),
    lockedCharacterPointsDisplayValue: requiredText(
      read(summary, 'lockedCharacterPointsDisplayValue'),
      'summary.lockedCharacterPointsDisplayValue',
    ),
    activeBidCount: requiredNumber(read(summary, 'activeBidCount'), 'summary.activeBidCount'),
    myListingCount: requiredNumber(read(summary, 'myListingCount'), 'summary.myListingCount'),
    activeListingCount: requiredNumber(
      read(summary, 'activeListingCount'),
      'summary.activeListingCount',
    ),
    activeTradeSlotCount: requiredNumber(
      read(summary, 'activeTradeSlotCount'),
      'summary.activeTradeSlotCount',
    ),
    tradeSlotLimit: requiredNumber(read(summary, 'tradeSlotLimit'), 'summary.tradeSlotLimit'),
    hasFreeTradeSlot: requiredBoolean(
      read(summary, 'hasFreeTradeSlot'),
      'summary.hasFreeTradeSlot',
    ),
    canUseAuction: requiredBoolean(read(summary, 'canUseAuction'), 'summary.canUseAuction'),
    canCreateAuction: requiredBoolean(
      read(summary, 'canCreateAuction'),
      'summary.canCreateAuction',
    ),
    createAuctionBlockerKey: optionalString(summary, 'createAuctionBlockerKey'),
    createAuctionBlockerLabel: optionalString(summary, 'createAuctionBlockerLabel'),
  });
}

function mapConstraints(
  constraints: Record<string, Json | undefined>,
): AuctionPageContext['constraints'] {
  const currencyKey = requiredText(read(constraints, 'currencyKey'), 'constraints.currencyKey');
  const currencyShortLabel = requiredText(
    read(constraints, 'currencyShortLabel'),
    'constraints.currencyShortLabel',
  );
  const currencyLabel = requiredText(read(constraints, 'currencyLabel'), 'constraints.currencyLabel');
  const listingItemCount = requiredNumber(
    read(constraints, 'listingItemCount'),
    'constraints.listingItemCount',
  );

  if (currencyKey !== 'character_points') {
    throw new Error(`constraints.currencyKey has unsupported value: ${currencyKey}.`);
  }

  if (currencyShortLabel !== 'PP') {
    throw new Error(`constraints.currencyShortLabel has unsupported value: ${currencyShortLabel}.`);
  }

  if (currencyLabel !== 'Punkty Postaci') {
    throw new Error(`constraints.currencyLabel has unsupported value: ${currencyLabel}.`);
  }

  if (listingItemCount !== 1) {
    throw new Error(`constraints.listingItemCount has unsupported value: ${listingItemCount}.`);
  }

  return {
    currencyKey: 'character_points',
    currencyLabel: 'Punkty Postaci',
    currencyShortLabel: 'PP',
    listingItemCount: 1,
    auctionDurationHours: requiredNumber(
      read(constraints, 'auctionDurationHours'),
      'constraints.auctionDurationHours',
    ),
    minBidIncrementCharacterPoints: requiredNumber(
      read(constraints, 'minBidIncrementCharacterPoints'),
      'constraints.minBidIncrementCharacterPoints',
    ),
    minStartingBidCharacterPoints: requiredNumber(
      read(constraints, 'minStartingBidCharacterPoints'),
      'constraints.minStartingBidCharacterPoints',
    ),
    minBuyNowCharacterPoints: requiredNumber(
      read(constraints, 'minBuyNowCharacterPoints'),
      'constraints.minBuyNowCharacterPoints',
    ),
  };
}

function mapNavigation(
  navigation: Record<string, Json | undefined>,
): AuctionPageContext['navigation'] {
  return {
    defaultTabKey: requiredAuctionTabKey(
      read(navigation, 'defaultTabKey'),
      'navigation.defaultTabKey',
    ),
    tabs: requiredRecordArray(read(navigation, 'tabs'), 'navigation.tabs').map((row, index) =>
      withOptionalFields({
        key: requiredAuctionTabKey(read(row, 'key'), `navigation.tabs[${index}].key`),
        labelKey: requiredText(read(row, 'labelKey'), `navigation.tabs[${index}].labelKey`),
        count: optionalNumeric(row, 'count'),
      }),
    ),
  };
}

function requiredAuctionTabKey(
  value: Json | undefined,
  field: string,
): AuctionPageContext['navigation']['defaultTabKey'] {
  const key = requiredText(value, field);

  if (key !== 'browse' && key !== 'myListings' && key !== 'myBids' && key !== 'create') {
    throw new Error(`${field} has unsupported auction tab key: ${key}.`);
  }

  return key;
}
