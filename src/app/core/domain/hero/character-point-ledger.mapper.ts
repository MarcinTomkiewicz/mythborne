import {
  CharacterPointHistoryEntryType,
  CharacterPointHistoryReadModel,
} from '../../types/hero.types';
import { Row } from '../../types/supabase.types';
import { nonNegativeInteger, roundedNumber } from '../../utils/number';

export const CHARACTER_POINT_REASON_EXPERIENCE_GAIN = 'experience_gain';
export const CHARACTER_POINT_REASON_PENALTY_PAYMENT = 'penalty_payment';

export function mapCharacterPointLedgerEntry(
  row: Row<'character_point_ledger'>,
): CharacterPointHistoryReadModel {
  const amountDelta = roundedNumber(row.amount_delta);

  return {
    id: row.id,
    heroId: row.hero_id,
    serverId: row.server_id,
    reason: row.reason,
    entryType: classifyCharacterPointEntry(row.reason, amountDelta),
    reasonLabel: characterPointReasonLabel(row.reason),
    amountDelta,
    amountLabel: signedCharacterPoints(amountDelta),
    balanceAfter: nonNegativeInteger(row.balance_after),
    createdAt: row.created_at,
  };
}

function classifyCharacterPointEntry(
  reason: string,
  amountDelta: number,
): CharacterPointHistoryEntryType {
  if (reason === CHARACTER_POINT_REASON_EXPERIENCE_GAIN) {
    return 'xp_gain';
  }

  if (reason === CHARACTER_POINT_REASON_PENALTY_PAYMENT) {
    return 'penalty_payment';
  }

  if (reason === 'admin_adjustment' || reason === 'system_correction' || reason === 'refund') {
    return 'adjustment';
  }

  if (amountDelta < 0) {
    return 'spend';
  }

  if (amountDelta > 0) {
    return 'receive';
  }

  return 'unknown';
}

function characterPointReasonLabel(reason: string): string {
  switch (reason) {
    case CHARACTER_POINT_REASON_EXPERIENCE_GAIN:
      return 'XP-derived Character Points';
    case 'stat_upgrade':
      return 'Stat allocation spend';
    case 'direct_trade_spent':
      return 'Direct trade spend';
    case 'direct_trade_received':
      return 'Direct trade received';
    case 'auction_purchase_spent':
      return 'Auction purchase spend';
    case 'auction_sale_received':
      return 'Auction sale received';
    case 'anti_abuse_penalty':
      return 'Character Point penalty';
    case CHARACTER_POINT_REASON_PENALTY_PAYMENT:
      return 'Penalty sink payment';
    case 'refund':
      return 'Refund';
    case 'admin_adjustment':
      return 'Admin adjustment';
    case 'system_correction':
      return 'System correction';
    case 'migration_hero_derived_hp':
      return 'Legacy migration';
    default:
      return reason.replaceAll('_', ' ');
  }
}

function signedCharacterPoints(value: number): string {
  return `${value > 0 ? '+' : ''}${value} Character Points`;
}
