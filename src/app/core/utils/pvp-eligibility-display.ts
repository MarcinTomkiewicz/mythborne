import { UiMetadataEntryReadModel } from '../domain/admin-ui-metadata.model';
import { PvpActionCopy } from '../domain/pvp/pvp-action-copy.model';
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
  copy: PvpActionCopy['eligibility'];
}

const METADATA_REASON_KEY_PREFIXES = [
  'eligibility_reason.',
  'block_reason.',
  'target_eligibility.',
] as const;

export function pvpEligibilityDisplay(
  context: PvpEligibilityDisplayContext,
): PvpEligibilityDisplay {
  if (context.eligibility.canStart) {
    return {
      statusLabel: context.copy.statusLabels.available,
      reasonLabel: null,
      reasonDetail: null,
      rawReasonKey: null,
      isPlayerSafeReason: false,
    };
  }

  const reasonKey = normalizeReasonKey(context.eligibility.blockReason)
    ?? inferredAttackReasonKey(context);

  if (!reasonKey) {
    return unavailableDisplay(context, null, null);
  }

  const metadata = findReasonMetadata(context.metadataEntries, reasonKey);
  const isPlayerSafeReason = isPlayerSafeEligibilityReason(reasonKey, metadata);

  return {
    ...unavailableDisplay(context, reasonKey, metadata?.label ?? null),
    reasonDetail: metadata?.description
      ?? metadata?.helperText
      ?? metadata?.impactSummary
      ?? copyReasonDetail(context, reasonKey),
    isPlayerSafeReason,
  };
}

function unavailableDisplay(
  context: PvpEligibilityDisplayContext,
  reasonKey: string | null,
  reasonLabel: string | null,
): PvpEligibilityDisplay {
  return {
    statusLabel: context.copy.statusLabels.unavailable,
    reasonLabel: reasonLabel ?? context.copy.statusLabels.actionUnavailable,
    reasonDetail: null,
    rawReasonKey: reasonKey,
    isPlayerSafeReason: false,
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

function copyReasonDetail(
  context: PvpEligibilityDisplayContext,
  reasonKey: string,
): string | null {
  if (isAttackerBusyReason(reasonKey)) {
    return context.copy.disabledReasonTooltips.attackerBusy;
  }

  if (isTargetProtectedReason(reasonKey)) {
    return context.copy.disabledReasonTooltips.targetProtected;
  }

  if (isTargetBelowRangeReason(reasonKey)) {
    return context.copy.disabledReasonTooltips.targetLevelTooLow;
  }

  if (isTargetAboveRangeReason(reasonKey)) {
    return context.copy.disabledReasonTooltips.targetLevelTooHigh;
  }

  if (isSameGuildReason(reasonKey)) {
    return context.copy.disabledReasonTooltips.sameGuild;
  }

  if (isActionUnavailableReason(reasonKey)) {
    return context.copy.disabledReasonTooltips.actionUnavailable;
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
