import { TradePageCopy } from '../domain/trade/player-trade.model';
import { Json } from '../types/database.types';
import { read, requiredRecord, requiredText } from './json-read';

export function mapTradePageCopy(value: Json): TradePageCopy {
  const root = requiredRecord(value, 'get_trade_page_copy');

  return {
    contractVersion: requireTradeCopyVersion(root),
    header: mapHeader(requiredRecord(read(root, 'header'), 'get_trade_page_copy.header')),
    blocked: mapBlocked(requiredRecord(read(root, 'blocked'), 'get_trade_page_copy.blocked')),
  };
}

function requireTradeCopyVersion(root: Record<string, Json | undefined>): 'trade_page_copy_v1' {
  const version = requiredText(read(root, 'contractVersion'), 'get_trade_page_copy.contractVersion');

  if (version !== 'trade_page_copy_v1') {
    throw new Error(`get_trade_page_copy has unsupported contract version: ${version}.`);
  }

  return version;
}

function mapHeader(header: Record<string, Json | undefined>): TradePageCopy['header'] {
  return {
    eyebrow: requiredText(read(header, 'eyebrow'), 'header.eyebrow'),
    title: requiredText(read(header, 'title'), 'header.title'),
    intro: requiredText(read(header, 'intro'), 'header.intro'),
  };
}

function mapBlocked(blocked: Record<string, Json | undefined>): TradePageCopy['blocked'] {
  return {
    tradeUnavailableTitle: requiredText(
      read(blocked, 'tradeUnavailableTitle'),
      'blocked.tradeUnavailableTitle',
    ),
    tradeUnavailableText: requiredText(
      read(blocked, 'tradeUnavailableText'),
      'blocked.tradeUnavailableText',
    ),
    noFreeSlotTitle: requiredText(read(blocked, 'noFreeSlotTitle'), 'blocked.noFreeSlotTitle'),
    noFreeSlotText: requiredText(read(blocked, 'noFreeSlotText'), 'blocked.noFreeSlotText'),
  };
}
