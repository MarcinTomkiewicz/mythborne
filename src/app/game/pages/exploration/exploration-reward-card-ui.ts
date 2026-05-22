import {
  ExplorationChallengeRewardReadModel,
  RewardGrantEntryReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
import { ItemReadModel } from '../../../core/domain/item/item.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { resourceAmountLabel } from '../../../core/utils/resource-display';

export function rewardDisplay(
  reward: ExplorationChallengeRewardReadModel | null,
) {
  if (!reward) {
    return null;
  }

  return {
    items: reward.items,
    entries: reward.entries.filter((entry) => !isItemEntry(entry) && !isHiddenReportEntry(entry)),
    emptyMessage: emptyRewardMessage(reward),
  };
}

export function rewardEntryLabel(entry: RewardGrantEntryReadModel): string {
  const backendDisplay = rewardEntryDisplayValue(entry);

  if (backendDisplay) {
    return backendDisplay;
  }

  switch (entry.entryKind) {
    case 'experience':
    case 'exp':
      return `${entry.amount ?? 0} ${experienceLabel(entry.amount ?? 0)}`;
    case 'resource':
      return resourceAmountLabel(entry.resourceType, entry.amount);
    case 'effect':
      return 'Nagroda efektu';
    default:
      return `Wpis nagrody${entry.amount === null ? '' : `: ${entry.amount}`}`;
  }
}

export function rewardEntryAmount(entry: RewardGrantEntryReadModel): number | null {
  return entry.amount;
}

export function rewardEntryName(entry: RewardGrantEntryReadModel): string {
  const backendDisplay = rewardEntryDisplayValue(entry);

  if (backendDisplay) {
    return stripEntryAmount(backendDisplay, entry.amount);
  }

  switch (entry.entryKind) {
    case 'experience':
    case 'exp':
      return experienceLabel(entry.amount ?? 0);
    case 'resource':
      return entry.resourceType?.trim() || 'zasobu';
    case 'effect':
      return 'efekt';
    default:
      return 'nagrody';
  }
}

function rewardEntryDisplayValue(entry: RewardGrantEntryReadModel): string | null {
  const metadata = jsonRecord(entry.metadataJson);

  return optionalText(read(
    metadata,
    'displayValue',
    'display_value',
    'playerSummary',
    'player_summary',
    'summary',
    'label',
  ))?.trim() || null;
}

function stripEntryAmount(value: string, amount: number | null): string {
  if (amount === null) {
    return value;
  }

  const amountPrefix = `${amount}`;

  return value.startsWith(amountPrefix)
    ? value.slice(amountPrefix.length).trim()
    : value;
}

function experienceLabel(amount: number): string {
  const absolute = Math.abs(amount);
  const lastTwo = absolute % 100;
  const last = absolute % 10;

  if (absolute === 1) {
    return 'punkt doświadczenia';
  }

  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return 'punkty doświadczenia';
  }

  return 'punktów doświadczenia';
}

export function rewardEntryDetails(entry: RewardGrantEntryReadModel): string | null {
  if (entry.effectDefinitionId) {
    return 'Szczegóły efektu nie są dostępne w tym podsumowaniu.';
  }

  if (entry.resourceType) {
    return optionalText(read(
      jsonRecord(entry.metadataJson),
      'helperText',
      'helper_text',
      'description',
      'summary',
    ));
  }

  return null;
}

export function rewardItemLabel(item: ItemReadModel): string {
  return item.name;
}

export function rewardItemDetails(item: ItemReadModel): string {
  const metadata = jsonRecord(item.metadataJson);
  const quality = optionalText(read(metadata, 'qualityLabel'));
  const base = optionalText(read(metadata, 'baseName'));
  const prefix = optionalText(read(metadata, 'prefixName'));
  const suffix = optionalText(read(metadata, 'suffixName'));

  return [
    item.drachmaValue !== null ? `Wartość ${item.drachmaValue}` : null,
    quality ? `Jakość ${quality}` : null,
    base ? `Baza ${base}` : null,
    prefix ? `Prefix ${prefix}` : null,
    suffix ? `Suffix ${suffix}` : null,
  ].filter(Boolean).join(' - ') || 'Szczegóły przedmiotu są dostępne w podglądzie.';
}

export function isItemEntry(entry: RewardGrantEntryReadModel): boolean {
  return (
    entry.entryKind === 'item' ||
    entry.entryKind === 'generated_item' ||
    entry.entryKind === 'item_generation'
  );
}

function isHiddenReportEntry(entry: RewardGrantEntryReadModel): boolean {
  return entry.entryKind === 'character_points' || entry.entryKind === 'hero_points';
}

function emptyRewardMessage(reward: ExplorationChallengeRewardReadModel): string {
  if (reward.noRewardReasonHelperText?.trim()) {
    return reward.noRewardReasonHelperText.trim();
  }

  if (reward.noRewardReasonLabel?.trim()) {
    return reward.noRewardReasonLabel.trim();
  }

  return hasGrantedReward(reward)
    ? 'Szczegóły nagrody nie są dostępne w tym podsumowaniu.'
    : 'Brak nagrody do pokazania.';
}

function hasGrantedReward(reward: ExplorationChallengeRewardReadModel): boolean {
  return Boolean(reward.rewardGrantId) && reward.rewardGrant?.status !== 'failed';
}
