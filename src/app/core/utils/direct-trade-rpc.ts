import {
  CreateDirectTradeOfferInput,
  DirectTradeOfferActionInput,
  RespondDirectTradeOfferInput,
} from '../domain/trade/direct-trade.model';
import {
  CancelPlayerDirectTradeOfferRpcArgs,
  ConfirmPlayerDirectTradeOfferRpcArgs,
  CreatePlayerDirectTradeOfferRpcArgs,
  RejectPlayerDirectTradeOfferRpcArgs,
  RespondPlayerDirectTradeOfferRpcArgs,
} from '../types/direct-trade-rpc.types';
import { trimText, trimToNull } from './normalize-text';

export function toCreatePlayerDirectTradeOfferRpcArgs(
  input: CreateDirectTradeOfferInput,
): CreatePlayerDirectTradeOfferRpcArgs {
  const args: CreatePlayerDirectTradeOfferRpcArgs = {
    p_creator_hero_id: requiredText(input.creatorHeroId, 'creatorHeroId'),
    p_target_hero_id: requiredText(input.targetHeroId, 'targetHeroId'),
  };

  addOptionalNumber(args, 'p_creator_character_points', input.creatorCharacterPoints);
  addOptionalText(args, 'p_description', input.description);
  addOptionalTextArray(args, 'p_creator_item_ids', input.creatorItemIds);

  return args;
}

export function toRespondPlayerDirectTradeOfferRpcArgs(
  input: RespondDirectTradeOfferInput,
): RespondPlayerDirectTradeOfferRpcArgs {
  const args: RespondPlayerDirectTradeOfferRpcArgs = {
    p_offer_id: requiredText(input.offerId, 'offerId'),
  };

  addOptionalNumber(args, 'p_target_character_points', input.targetCharacterPoints);
  addOptionalText(args, 'p_description', input.description);
  addOptionalTextArray(args, 'p_target_item_ids', input.targetItemIds);

  return args;
}

export function toConfirmPlayerDirectTradeOfferRpcArgs(
  input: DirectTradeOfferActionInput,
): ConfirmPlayerDirectTradeOfferRpcArgs {
  const args: ConfirmPlayerDirectTradeOfferRpcArgs = {
    p_offer_id: requiredText(input.offerId, 'offerId'),
  };

  addOptionalText(args, 'p_description', input.description);

  return args;
}

export function toCancelPlayerDirectTradeOfferRpcArgs(
  input: DirectTradeOfferActionInput,
): CancelPlayerDirectTradeOfferRpcArgs {
  const args: CancelPlayerDirectTradeOfferRpcArgs = {
    p_offer_id: requiredText(input.offerId, 'offerId'),
  };

  addOptionalText(args, 'p_status_reason', input.statusReason);

  return args;
}

export function toRejectPlayerDirectTradeOfferRpcArgs(
  input: DirectTradeOfferActionInput,
): RejectPlayerDirectTradeOfferRpcArgs {
  const args: RejectPlayerDirectTradeOfferRpcArgs = {
    p_offer_id: requiredText(input.offerId, 'offerId'),
  };

  addOptionalText(args, 'p_status_reason', input.statusReason);

  return args;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for direct trade workflow.`);
  }

  return normalized;
}

function addOptionalText<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as T[K];
  }
}

function addOptionalTextArray<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  values: readonly string[] | null | undefined,
): void {
  const normalized = [...new Set((values ?? []).map(trimText).filter(Boolean))];

  if (normalized.length) {
    target[key] = normalized as T[K];
  }
}

function addOptionalNumber<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: number | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }

  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new Error(`${String(key)} must be a non-negative integer.`);
  }

  target[key] = normalized as T[K];
}
