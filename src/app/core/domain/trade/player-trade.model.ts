import { HeroRow } from '../../types/domain-row.types';

export interface TradePageCopy {
  contractVersion: 'trade_page_copy_v1';
  header: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  blocked: {
    tradeUnavailableTitle: string;
    tradeUnavailableText: string;
    noFreeSlotTitle: string;
    noFreeSlotText: string;
  };
}

export interface TradeHeaderSummaryMetric {
  label: string;
  displayValue: string;
}

export interface TradeHeaderSummarySlotMetric extends TradeHeaderSummaryMetric {
  used: number;
  limit: number;
}

export interface TradeHeaderSummaryCountMetric extends TradeHeaderSummaryMetric {
  value: number;
}

export interface TradePageContext {
  contractVersion: 'trade_page_context_v1';
  hero: HeroRow;
  headerSummary: {
    availableCharacterPoints: TradeHeaderSummaryCountMetric;
    lockedCharacterPoints: TradeHeaderSummaryCountMetric;
    activeOffers: TradeHeaderSummarySlotMetric;
    pendingOffers: TradeHeaderSummaryCountMetric;
  };
  canUseTrade: boolean;
  canCreateOffer: boolean;
  tradeBlockerKey: string | null;
  tradeBlockerLabel: string | null;
  createOfferBlockerKey: string | null;
  createOfferBlockerLabel: string | null;
  constraints: {
    currencyKey: 'character_points';
    currencyLabel: 'Punkty Postaci';
    currencyShortLabel: 'PP';
    maxItemsPerSide: number;
    offerExpirationHours: number;
  };
}
