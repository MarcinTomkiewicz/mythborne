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
  action_unavailable: 'Action unavailable',
  action_kind_inactive: 'Action unavailable',
  action_kind_unavailable: 'Action unavailable',
  active_target_protection: 'Target protected',
  attacker_blocking_activity: 'Attacker busy',
  attacker_busy: 'Attacker busy',
  attacker_has_active_activity: 'Attacker busy',
  attacker_has_blocking_activity: 'Attacker busy',
  below_level_range: 'Target below level range',
  pvp_action_unavailable: 'Action unavailable',
  target_above_attack_level_range: 'Target above level range',
  target_above_level_range: 'Target above level range',
  target_below_attack_level_range: 'Target below level range',
  target_below_level_range: 'Target below level range',
  target_level_above_range: 'Target above level range',
  target_level_below_range: 'Target below level range',
  target_protected: 'Target protected',
  target_too_high: 'Target above level range',
  target_too_low: 'Target below level range',
  target_under_protection: 'Target protected',
};

export function pvpEligibilityDisplay(
  context: PvpEligibilityDisplayContext,
): PvpEligibilityDisplay {
  if (context.eligibility.canStart) {
    return {
      statusLabel: 'Available',
      reasonLabel: null,
      reasonDetail: null,
      rawReasonKey: null,
    };
  }

  const reasonKey = normalizeReasonKey(context.eligibility.blockReason)
    ?? inferredAttackReasonKey(context);

  if (!reasonKey) {
    return {
      statusLabel: 'Unavailable',
      reasonLabel: 'Action unavailable',
      reasonDetail: null,
      rawReasonKey: null,
    };
  }

  const metadata = findReasonMetadata(context.metadataEntries, reasonKey);

  return {
    statusLabel: 'Unavailable',
    reasonLabel: metadata?.label ?? FALLBACK_REASON_LABELS[reasonKey] ?? 'Action unavailable',
    reasonDetail: metadata?.description
      ?? metadata?.helperText
      ?? metadata?.impactSummary
      ?? fallbackReasonDetail(context, reasonKey),
    rawReasonKey: reasonKey,
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
    return 'Your hero already has a blocking runtime activity.';
  }

  if (isTargetProtectedReason(reasonKey)) {
    return 'The target is currently protected from incoming attacks.';
  }

  if (isTargetBelowRangeReason(reasonKey) && isAttackEligibility(context.eligibility)) {
    return `Target level ${context.targetLevel} is below your attack range ${context.eligibility.minTargetLevel}-${context.eligibility.maxTargetLevel}.`;
  }

  if (isTargetAboveRangeReason(reasonKey) && isAttackEligibility(context.eligibility)) {
    return `Target level ${context.targetLevel} is above your attack range ${context.eligibility.minTargetLevel}-${context.eligibility.maxTargetLevel}.`;
  }

  if (isActionUnavailableReason(reasonKey)) {
    return `${actionLabel(context.actionKind)} is not available for this target.`;
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

function actionLabel(actionKind: PvpEligibilityActionKind): string {
  return actionKind === 'attack' ? 'Attack' : 'Spy';
}
