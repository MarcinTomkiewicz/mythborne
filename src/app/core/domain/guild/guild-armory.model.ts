import { ItemStatus } from '../item/item.model';
import {
  GuildArmoryAccessStatusKey,
  GuildArmoryItemStatusKey,
  GuildArmoryLoanStatusKey,
} from '../../types/guild-rpc.types';

export type GuildArmoryCurrentItemStatusKey = 'available' | 'borrowed';

export interface GuildArmoryItem {
  guildId: string;
  armoryItemId: string;
  itemId: string;
  itemName: string;
  itemStatus: ItemStatus;
  baseTypeKey: string;
  generationQualityKey: string;
  qualityLabel: string;
  armoryStatusKey: GuildArmoryCurrentItemStatusKey;
  ownerHeroId: string;
  ownerHeroName: string;
  depositedAt: string;
  loanId: string | null;
  loanStatusKey: GuildArmoryLoanStatusKey | null;
  borrowerHeroId: string | null;
  borrowerHeroName: string | null;
  borrowedAt: string | null;
  canBorrow: boolean;
  canReturn: boolean;
  canForceReturn: boolean;
  canWithdraw: boolean;
  canRemove: boolean;
}

export interface GuildArmoryLoan {
  guildId: string;
  armoryItemId: string;
  itemId: string;
  itemName: string;
  loanId: string;
  loanStatusKey: GuildArmoryLoanStatusKey;
  ownerHeroId: string;
  ownerHeroName: string;
  borrowerHeroId: string;
  borrowerHeroName: string;
  borrowedAt: string;
  dueAt: string | null;
  endedAt: string | null;
  reason: string | null;
  statusReason: string | null;
  canReturn: boolean;
  canForceReturn: boolean;
}

export interface GuildArmoryReadModel {
  items: GuildArmoryItem[];
  loans: GuildArmoryLoan[];
}

export interface DepositGuildArmoryItemInput {
  itemId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface GuildArmoryItemActionInput {
  armoryItemId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface GuildArmoryLoanActionInput {
  loanId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface SetGuildArmoryMemberAccessInput {
  memberHeroId: string;
  statusKey: GuildArmoryAccessStatusKey;
  reason: string;
  requestId?: string | null;
}

export interface GuildArmoryItemOperationResult {
  kind: 'deposit' | 'withdraw' | 'remove';
  guildId: string;
  armoryItemId: string;
  itemId: string;
  ownerHeroId: string;
  statusKey: GuildArmoryItemStatusKey;
}

export interface GuildArmoryBorrowResult {
  kind: 'borrow';
  guildId: string;
  armoryItemId: string;
  itemId: string;
  ownerHeroId: string;
  borrowerHeroId: string;
  loanId: string;
  armoryStatusKey: GuildArmoryItemStatusKey;
  loanStatusKey: GuildArmoryLoanStatusKey;
}

export interface GuildArmoryLoanOperationResult {
  kind: 'return' | 'force-return';
  guildId: string;
  armoryItemId: string;
  itemId: string;
  loanId: string;
  armoryStatusKey: GuildArmoryItemStatusKey;
  loanStatusKey: GuildArmoryLoanStatusKey;
}

export interface GuildArmoryAccessLockState {
  accessLockId: string;
  guildId: string;
  memberHeroId: string;
  statusKey: GuildArmoryAccessStatusKey;
}

export type GuildArmoryOperationResult =
  | GuildArmoryItemOperationResult
  | GuildArmoryBorrowResult
  | GuildArmoryLoanOperationResult
  | GuildArmoryAccessLockState;
