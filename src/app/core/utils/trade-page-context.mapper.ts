import {
  TradeHeaderSummaryCountMetric,
  TradeHeaderSummarySlotMetric,
  TradePageContext,
} from '../domain/trade/player-trade.model';
import { HeroRow } from '../types/domain-row.types';
import { Json } from '../types/database.types';
import {
  read,
  requiredBoolean,
  requiredNumber,
  optionalText,
  requiredRecord,
  requiredText,
} from './json-read';

export interface TradePageContextIdentity {
  heroId: string;
  serverId: string;
}

export function mapTradePageContext(
  value: Json,
  identity: TradePageContextIdentity,
): TradePageContext {
  const root = requiredRecord(value, 'get_trade_page_context');
  const hero = mapContextHero(requiredRecord(
    read(root, 'hero'),
    'get_trade_page_context.hero',
  ));

  validateContextIdentity(hero, identity);

  const context: TradePageContext = {
    contractVersion: requireTradeContextVersion(root),
    hero,
    headerSummary: mapHeaderSummary(
      requiredRecord(read(root, 'headerSummary'), 'get_trade_page_context.headerSummary'),
    ),
    canUseTrade: requiredBoolean(read(root, 'canUseTrade'), 'canUseTrade'),
    canCreateOffer: requiredBoolean(read(root, 'canCreateOffer'), 'canCreateOffer'),
    tradeBlockerKey: optionalText(read(root, 'tradeBlockerKey')) ?? null,
    tradeBlockerLabel: optionalText(read(root, 'tradeBlockerLabel')) ?? null,
    createOfferBlockerKey: optionalText(read(root, 'createOfferBlockerKey')) ?? null,
    createOfferBlockerLabel: optionalText(read(root, 'createOfferBlockerLabel')) ?? null,
    constraints: mapConstraints(
      requiredRecord(read(root, 'constraints'), 'get_trade_page_context.constraints'),
    ),
  };

  if (!context.canUseTrade && !context.tradeBlockerLabel) {
    throw new Error(
      'get_trade_page_context.tradeBlockerLabel is required when canUseTrade is false.',
    );
  }

  return context;
}

function requireTradeContextVersion(root: Record<string, Json | undefined>): 'trade_page_context_v1' {
  const version = requiredText(
    read(root, 'contractVersion'),
    'get_trade_page_context.contractVersion',
  );

  if (version !== 'trade_page_context_v1') {
    throw new Error(`get_trade_page_context has unsupported contract version: ${version}.`);
  }

  return version;
}

function mapContextHero(hero: Record<string, Json | undefined>): HeroRow {
  requiredText(read(hero, 'id'), 'get_trade_page_context.hero.id');
  requiredText(read(hero, 'server_id'), 'get_trade_page_context.hero.server_id');

  return hero as unknown as HeroRow;
}

function validateContextIdentity(hero: HeroRow, identity: TradePageContextIdentity): void {
  if (hero.id !== identity.heroId) {
    throw new Error('get_trade_page_context returned a different hero id.');
  }

  if (hero.server_id !== identity.serverId) {
    throw new Error('get_trade_page_context returned a different server id.');
  }
}

function mapHeaderSummary(
  summary: Record<string, Json | undefined>,
): TradePageContext['headerSummary'] {
  return {
    availableCharacterPoints: mapCountMetric(
      requiredRecord(
        read(summary, 'availableCharacterPoints'),
        'headerSummary.availableCharacterPoints',
      ),
      'headerSummary.availableCharacterPoints',
    ),
    lockedCharacterPoints: mapCountMetric(
      requiredRecord(
        read(summary, 'lockedCharacterPoints'),
        'headerSummary.lockedCharacterPoints',
      ),
      'headerSummary.lockedCharacterPoints',
    ),
    activeOffers: mapSlotMetric(
      requiredRecord(read(summary, 'activeOffers'), 'headerSummary.activeOffers'),
      'headerSummary.activeOffers',
    ),
    pendingOffers: mapCountMetric(
      requiredRecord(read(summary, 'pendingOffers'), 'headerSummary.pendingOffers'),
      'headerSummary.pendingOffers',
    ),
  };
}

function mapCountMetric(
  metric: Record<string, Json | undefined>,
  field: string,
): TradeHeaderSummaryCountMetric {
  return {
    label: requiredText(read(metric, 'label'), `${field}.label`),
    value: requiredNumber(read(metric, 'value'), `${field}.value`),
    displayValue: requiredText(read(metric, 'displayValue'), `${field}.displayValue`),
  };
}

function mapSlotMetric(
  metric: Record<string, Json | undefined>,
  field: string,
): TradeHeaderSummarySlotMetric {
  return {
    label: requiredText(read(metric, 'label'), `${field}.label`),
    used: requiredNumber(read(metric, 'used'), `${field}.used`),
    limit: requiredNumber(read(metric, 'limit'), `${field}.limit`),
    displayValue: requiredText(read(metric, 'displayValue'), `${field}.displayValue`),
  };
}

function mapConstraints(
  constraints: Record<string, Json | undefined>,
): TradePageContext['constraints'] {
  const currencyKey = requiredText(read(constraints, 'currencyKey'), 'constraints.currencyKey');
  const currencyLabel = requiredText(read(constraints, 'currencyLabel'), 'constraints.currencyLabel');
  const currencyShortLabel = requiredText(
    read(constraints, 'currencyShortLabel'),
    'constraints.currencyShortLabel',
  );

  if (currencyKey !== 'character_points') {
    throw new Error(`constraints.currencyKey has unsupported value: ${currencyKey}.`);
  }

  if (currencyLabel !== 'Punkty Postaci') {
    throw new Error(`constraints.currencyLabel has unsupported value: ${currencyLabel}.`);
  }

  if (currencyShortLabel !== 'PP') {
    throw new Error(`constraints.currencyShortLabel has unsupported value: ${currencyShortLabel}.`);
  }

  return {
    currencyKey,
    currencyLabel,
    currencyShortLabel,
    maxItemsPerSide: requiredNumber(
      read(constraints, 'maxItemsPerSide'),
      'constraints.maxItemsPerSide',
    ),
    offerExpirationHours: requiredNumber(
      read(constraints, 'offerExpirationHours'),
      'constraints.offerExpirationHours',
    ),
  };
}
