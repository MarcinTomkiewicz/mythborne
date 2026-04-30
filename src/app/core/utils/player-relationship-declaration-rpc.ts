import {
  CreatePlayerRelationshipDeclarationInput,
  CreatedPlayerRelationshipDeclaration,
  PlayerRelationshipDeclarationItemInput,
  PlayerRelationshipDeclarationParticipantInput,
  PlayerRelationshipDeclarationTradeInput,
} from '../domain/anti-abuse/player-relationship-declaration-submit.model';
import { Json } from '../types/database.types';
import {
  CreatePlayerRelationshipDeclarationRpcArgs,
  CreatePlayerRelationshipDeclarationRpcRow,
} from '../types/anti-abuse-decision-rpc.types';
import { trimText, trimToNull } from './normalize-text';

export function toCreatePlayerRelationshipDeclarationRpcArgs(
  input: CreatePlayerRelationshipDeclarationInput,
): CreatePlayerRelationshipDeclarationRpcArgs {
  const args: CreatePlayerRelationshipDeclarationRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
    p_declaration_type_key: requiredText(
      input.declarationTypeKey,
      'declarationTypeKey',
    ),
    p_title: requiredText(input.title, 'title'),
    p_description: requiredText(input.description, 'description'),
    p_created_by_hero_id: requiredText(input.createdByHeroId, 'createdByHeroId'),
  };

  addOptionalNonNegativeInteger(
    args,
    'p_amount_character_points',
    input.amountCharacterPoints,
  );
  addOptionalText(args, 'p_starts_at', input.startsAt);
  addOptionalText(args, 'p_expires_at', input.expiresAt);
  addOptionalText(args, 'p_request_id', input.requestId);
  addOptionalJson(args, 'p_participants_json', participantRows(input.participants));
  addOptionalJson(args, 'p_items_json', itemRows(input.items));
  addOptionalJson(args, 'p_trades_json', tradeRows(input.trades));

  return args;
}

export function mapCreatedPlayerRelationshipDeclaration(
  row: CreatePlayerRelationshipDeclarationRpcRow,
): CreatedPlayerRelationshipDeclaration {
  return {
    declarationId: requiredText(row.declaration_id, 'declarationId'),
  };
}

function participantRows(
  participants: readonly PlayerRelationshipDeclarationParticipantInput[] | null | undefined,
): Json[] {
  return (participants ?? [])
    .map((participant) => {
      const heroId = trimToNull(participant.heroId);
      const userId = trimToNull(participant.userId);

      if (!heroId && !userId) {
        return null;
      }

      return {
        heroId,
        userId,
        roleKey: requiredText(participant.roleKey, 'participant.roleKey'),
        reason: trimToNull(participant.reason),
        description: trimToNull(participant.description),
      };
    })
    .filter(isNotNull) as Json[];
}

function itemRows(
  items: readonly PlayerRelationshipDeclarationItemInput[] | null | undefined,
): Json[] {
  return (items ?? [])
    .map((item) => {
      const itemId = trimToNull(item.itemId);
      const itemNameSnapshot = trimToNull(item.itemNameSnapshot);

      if (!itemId && !itemNameSnapshot) {
        return null;
      }

      return {
        itemId,
        itemNameSnapshot,
        roleKey: trimText(item.roleKey) || 'related',
        reason: trimToNull(item.reason),
        description: trimToNull(item.description),
      };
    })
    .filter(isNotNull) as Json[];
}

function tradeRows(
  trades: readonly PlayerRelationshipDeclarationTradeInput[] | null | undefined,
): Json[] {
  return (trades ?? [])
    .map((trade) => {
      const tradeId = trimToNull(trade.tradeId);
      const tradeReference = trimToNull(trade.tradeReference);

      if (!tradeId && !tradeReference) {
        return null;
      }

      return {
        tradeId,
        tradeReference,
        roleKey: trimText(trade.roleKey) || 'related',
        reason: trimToNull(trade.reason),
        description: trimToNull(trade.description),
      };
    })
    .filter(isNotNull) as Json[];
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for relationship declaration submission.`);
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

function addOptionalNonNegativeInteger<
  T extends Record<string, unknown>,
  K extends keyof T,
>(target: T, key: K, value: number | null | undefined): void {
  if (value === null || value === undefined) {
    return;
  }

  const normalized = Number(value);

  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new Error(
      `${String(key)} must be a non-negative integer for relationship declaration submission.`,
    );
  }

  target[key] = normalized as T[K];
}

function addOptionalJson<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: Json[],
): void {
  if (value.length > 0) {
    target[key] = value as T[K];
  }
}
