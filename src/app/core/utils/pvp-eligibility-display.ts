import { UiMetadataEntryReadModel } from '../domain/admin-ui-metadata.model';
import {
  PvpActionEligibility,
  PvpAttackEligibility,
} from '../domain/pvp/pvp.model';

export interface PvpEligibilityDisplay {
  statusLabel: string;
  reasonLabel: string | null;
  reasonDetail: string | null;
  rawReasonKey: string | null;
  isPlayerSafeReason: boolean;
}

export type PvpEligibilityActionKind = 'attack' | 'spy';

export interface PvpEligibilityDisplayContext {
  actionKind: PvpEligibilityActionKind;
  eligibility: PvpActionEligibility | PvpAttackEligibility;
  targetLevel: number;
  metadataEntries: readonly UiMetadataEntryReadModel[];
}

const METADATA_REASON_KEY_PREFIXES = [
  'eligibility_reason.',
  'block_reason.',
  'target_eligibility.',
] as const;

const FALLBACK_REASON_LABELS: Record<string, string> = {
  action_unavailable: 'Akcja niedostępna',
  action_kind_inactive: 'Akcja niedostępna',
  action_kind_unavailable: 'Akcja niedostępna',
  active_target_protection: 'Cel chroniony',
  attacker_blocking_activity: 'Bohater jest zajęty',
  attacker_busy: 'Bohater jest zajęty',
  attacker_has_active_activity: 'Bohater jest zajęty',
  attacker_has_blocking_activity: 'Bohater jest zajęty',
  below_level_range: 'Cel poniżej zakresu poziomu',
  pvp_action_unavailable: 'Akcja niedostępna',
  same_guild: 'Cel z twojej gildii',
  target_above_attack_level_range: 'Cel powyżej zakresu poziomu',
  target_above_level_range: 'Cel powyżej zakresu poziomu',
  target_below_attack_level_range: 'Cel poniżej zakresu poziomu',
  target_below_level_range: 'Cel poniżej zakresu poziomu',
  target_level_above_range: 'Cel powyżej zakresu poziomu',
  target_level_below_range: 'Cel poniżej zakresu poziomu',
  target_protected: 'Cel chroniony',
  target_too_high: 'Cel powyżej zakresu poziomu',
  target_too_low: 'Cel poniżej zakresu poziomu',
  target_guild_member: 'Cel z twojej gildii',
  target_in_same_guild: 'Cel z twojej gildii',
  target_is_guild_member: 'Cel z twojej gildii',
  target_under_protection: 'Cel chroniony',
  target_same_guild: 'Cel z twojej gildii',
};

export function pvpEligibilityDisplay(
  context: PvpEligibilityDisplayContext,
): PvpEligibilityDisplay {
  if (context.eligibility.canStart) {
    return {
      statusLabel: 'dostępny',
      reasonLabel: null,
      reasonDetail: null,
      rawReasonKey: null,
      isPlayerSafeReason: false,
    };
  }

  const reasonKey = normalizeReasonKey(context.eligibility.blockReason)
    ?? inferredAttackReasonKey(context);

  if (!reasonKey) {
    return {
      statusLabel: 'niedostępny',
      reasonLabel: 'Akcja niedostępna',
      reasonDetail: null,
      rawReasonKey: null,
      isPlayerSafeReason: false,
    };
  }

  const metadata = findReasonMetadata(context.metadataEntries, reasonKey);
  const isPlayerSafeReason = isPlayerSafeEligibilityReason(reasonKey, metadata);

  return {
    statusLabel: 'niedostępny',
    reasonLabel: metadata?.label ?? FALLBACK_REASON_LABELS[reasonKey] ?? 'Akcja niedostępna',
    reasonDetail: metadata?.description
      ?? metadata?.helperText
      ?? metadata?.impactSummary
      ?? fallbackReasonDetail(context, reasonKey),
    rawReasonKey: reasonKey,
    isPlayerSafeReason,
  };
}

function findReasonMetadata(
  entries: readonly UiMetadataEntryReadModel[],
  reasonKey: string,
): UiMetadataEntryReadModel | null {
  return entries.find((entry) =>
    entry.isActive
    && (
      entry.key === reasonKey
      || METADATA_REASON_KEY_PREFIXES.some((prefix) => entry.key === `${prefix}${reasonKey}`)
    )
  ) ?? null;
}

function fallbackReasonDetail(
  context: PvpEligibilityDisplayContext,
  reasonKey: string,
): string | null {
  if (isAttackerBusyReason(reasonKey)) {
    return 'Twój bohater ma już aktywną czynność blokującą kolejną akcję.';
  }

  if (isTargetProtectedReason(reasonKey)) {
    return 'Cel jest obecnie chroniony przed atakami.';
  }

  if (isTargetBelowRangeReason(reasonKey) && isAttackEligibility(context.eligibility)) {
    return `Poziom celu ${context.targetLevel} jest poniżej twojego zakresu ataku ${context.eligibility.minTargetLevel}-${context.eligibility.maxTargetLevel}.`;
  }

  if (isTargetAboveRangeReason(reasonKey) && isAttackEligibility(context.eligibility)) {
    return `Poziom celu ${context.targetLevel} jest powyżej twojego zakresu ataku ${context.eligibility.minTargetLevel}-${context.eligibility.maxTargetLevel}.`;
  }

  if (isSameGuildReason(reasonKey)) {
    return 'Nie możesz rozpocząć tej akcji przeciwko członkowi swojej gildii.';
  }

  if (isActionUnavailableReason(reasonKey)) {
    return `${actionLabel(context.actionKind)} jest niedostępny dla tego celu.`;
  }

  return null;
}

function inferredAttackReasonKey(
  context: PvpEligibilityDisplayContext,
): string | null {
  if (context.actionKind !== 'attack' || !isAttackEligibility(context.eligibility)) {
    return null;
  }

  if (context.eligibility.attackerHasBlockingActivity) {
    return 'attacker_busy';
  }

  if (context.targetLevel < context.eligibility.minTargetLevel) {
    return 'target_below_level_range';
  }

  if (context.targetLevel > context.eligibility.maxTargetLevel) {
    return 'target_above_level_range';
  }

  return null;
}

function isAttackEligibility(
  eligibility: PvpActionEligibility | PvpAttackEligibility,
): eligibility is PvpAttackEligibility {
  return 'minTargetLevel' in eligibility
    && 'maxTargetLevel' in eligibility
    && 'attackerHasBlockingActivity' in eligibility;
}

function normalizeReasonKey(value: string | null | undefined): string | null {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  return trimmed.length > 0 ? trimmed : null;
}

function isActionUnavailableReason(reasonKey: string): boolean {
  return reasonKey === 'action_unavailable'
    || reasonKey === 'action_kind_inactive'
    || reasonKey === 'action_kind_unavailable'
    || reasonKey === 'pvp_action_unavailable';
}

function isAttackerBusyReason(reasonKey: string): boolean {
  return reasonKey === 'attacker_busy'
    || reasonKey === 'attacker_blocking_activity'
    || reasonKey === 'attacker_has_active_activity'
    || reasonKey === 'attacker_has_blocking_activity';
}

function isTargetProtectedReason(reasonKey: string): boolean {
  return reasonKey === 'active_target_protection'
    || reasonKey === 'target_protected'
    || reasonKey === 'target_under_protection';
}

function isTargetBelowRangeReason(reasonKey: string): boolean {
  return reasonKey === 'below_level_range'
    || reasonKey === 'target_below_attack_level_range'
    || reasonKey === 'target_below_level_range'
    || reasonKey === 'target_level_below_range'
    || reasonKey === 'target_too_low';
}

function isTargetAboveRangeReason(reasonKey: string): boolean {
  return reasonKey === 'target_above_attack_level_range'
    || reasonKey === 'target_above_level_range'
    || reasonKey === 'target_level_above_range'
    || reasonKey === 'target_too_high';
}

function isSameGuildReason(reasonKey: string): boolean {
  return reasonKey === 'same_guild'
    || reasonKey === 'target_same_guild'
    || reasonKey === 'target_in_same_guild'
    || reasonKey === 'target_guild_member'
    || reasonKey === 'target_is_guild_member';
}

function isPlayerSafeEligibilityReason(
  reasonKey: string,
  metadata: UiMetadataEntryReadModel | null,
): boolean {
  return metadata !== null
    || isTargetProtectedReason(reasonKey)
    || isTargetBelowRangeReason(reasonKey)
    || isTargetAboveRangeReason(reasonKey)
    || isSameGuildReason(reasonKey);
}

function actionLabel(actionKind: PvpEligibilityActionKind): string {
  return actionKind === 'attack' ? 'Atak' : 'Szpieg';
}
