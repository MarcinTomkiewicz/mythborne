import {
  GuildArmoryCurrentItemStatusKey,
  GuildArmoryItem,
  GuildArmoryLoan,
  GuildArmoryReadModel,
} from '../domain/guild/guild-armory.model';
import {
  GetHeroGuildArmoryItemRowsRpcRow,
  GetHeroGuildArmoryLoanRowsRpcRow,
} from '../types/guild-rpc.types';

export function mapGuildArmoryReadModel(
  itemRows: GetHeroGuildArmoryItemRowsRpcRow[],
  loanRows: GetHeroGuildArmoryLoanRowsRpcRow[],
): GuildArmoryReadModel {
  return {
    items: itemRows.map(mapGuildArmoryItem),
    loans: loanRows.map(mapGuildArmoryLoan),
  };
}

export function mapGuildArmoryItem(
  row: GetHeroGuildArmoryItemRowsRpcRow,
): GuildArmoryItem {
  return {
    guildId: row.guild_id,
    armoryItemId: row.armory_item_id,
    itemId: row.item_id,
    itemName: row.item_name,
    itemStatus: row.item_status,
    baseTypeKey: row.base_type_key,
    generationQualityKey: row.generation_quality_key,
    qualityLabel: row.quality_label,
    armoryStatusKey: currentItemStatus(row.armory_status_key),
    ownerHeroId: row.owner_hero_id,
    ownerHeroName: row.owner_hero_name,
    depositedAt: row.deposited_at,
    loanId: nullableText(row.loan_id),
    loanStatusKey: nullableText(row.loan_status_key),
    borrowerHeroId: nullableText(row.borrower_hero_id),
    borrowerHeroName: nullableText(row.borrower_hero_name),
    borrowedAt: nullableText(row.borrowed_at),
    canBorrow: row.can_borrow,
    canReturn: row.can_return,
    canForceReturn: row.can_force_return,
    canWithdraw: row.can_withdraw,
    canRemove: row.can_remove,
  };
}

export function mapGuildArmoryLoan(
  row: GetHeroGuildArmoryLoanRowsRpcRow,
): GuildArmoryLoan {
  return {
    guildId: row.guild_id,
    armoryItemId: row.armory_item_id,
    itemId: row.item_id,
    itemName: row.item_name,
    loanId: row.loan_id,
    loanStatusKey: row.loan_status_key,
    ownerHeroId: row.owner_hero_id,
    ownerHeroName: row.owner_hero_name,
    borrowerHeroId: row.borrower_hero_id,
    borrowerHeroName: row.borrower_hero_name,
    borrowedAt: row.borrowed_at,
    dueAt: nullableText(row.due_at),
    endedAt: nullableText(row.ended_at),
    reason: nullableText(row.reason),
    statusReason: nullableText(row.status_reason),
    canReturn: row.can_return,
    canForceReturn: row.can_force_return,
  };
}

function currentItemStatus(value: string): GuildArmoryCurrentItemStatusKey {
  if (value === 'available' || value === 'borrowed') {
    return value;
  }

  throw new Error(`Unexpected current guild armory item status: ${value}.`);
}

function nullableText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}
