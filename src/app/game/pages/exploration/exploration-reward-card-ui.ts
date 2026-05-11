import {
  ExplorationChallengeRewardReadModel,
  RewardGrantEntryReadModel,
} from '../../../core/domain/exploration/exploration-reward.model';
import { ItemReadModel } from '../../../core/domain/item/item.model';
import { jsonRecord, optionalText, read } from '../../../core/utils/json-read';
import { humanizeKey } from '../../../core/utils/normalize-text';
import { resourceAmountLabel } from '../../../core/utils/resource-display';

export type RewardItemKind = 'item' | 'generated_item' | 'item_generation';

export interface RewardDisplay {
  title: string;
  summary: string;
  badge: string;
  facts: Array<{ label: string; value: string }>;
  items: ItemReadModel[];
  entries: RewardGrantEntryReadModel[];
  hiddenMessages: string[];
  emptyMessage: string;
}

export function rewardDisplay(
  reward: ExplorationChallengeRewardReadModel | null,
): RewardDisplay | null {
  if (!reward) {
    return null;
  }

  const items = reward.items;
  const entries = reward.entries.filter((entry) => !isItemEntry(entry));
  const hiddenMessages = reward.entries
    .filter((entry) => isItemEntry(entry) && !entry.itemId)
    .map(() => 'Wpis losowania przedmiotu nie utworzył itemu.');

  return {
    title: rewardTitle(reward),
    summary: rewardSummary(reward, entries.length, items.length),
    badge: rewardBadge(reward),
    facts: rewardFacts(reward),
    items,
    entries,
    hiddenMessages,
    emptyMessage: emptyRewardMessage(reward),
  };
}

export function rewardEntryLabel(entry: RewardGrantEntryReadModel): string {
  switch (entry.entryKind) {
    case 'experience':
    case 'exp':
      return `${entry.amount ?? 0} EXP`;
    case 'character_points':
    case 'hero_points':
      return `${entry.amount ?? 0} Punktów Postaci`;
    case 'resource':
      return resourceAmountLabel(entry.resourceType, entry.amount);
    case 'effect':
      return 'Nagroda efektu';
    default:
      return `${humanizeKey(entry.entryKind, 'Reward')}${entry.amount === null ? '' : `: ${entry.amount}`}`;
  }
}

export function rewardEntryDetails(entry: RewardGrantEntryReadModel): string | null {
  if (entry.effectDefinitionId) {
    return 'Effect details unavailable from DB read model.';
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
  return `Przedmiot: ${item.name} (${item.id})`;
}

export function rewardItemDetails(item: ItemReadModel): string {
  const metadata = jsonRecord(item.metadataJson);
  const quality = optionalText(read(metadata, 'qualityLabel')) ?? item.generationQualityKey ?? 'N/D';
  const base = optionalText(read(metadata, 'baseName')) ?? item.generationBaseId ?? 'N/D';
  const prefix = optionalText(read(metadata, 'prefixName')) ?? item.prefixAffixId ?? 'N/D';
  const suffix = optionalText(read(metadata, 'suffixName')) ?? item.suffixAffixId ?? 'N/D';

  return [
    `Wartość ${item.drachmaValue ?? 'N/D'}`,
    `Jakość ${quality}`,
    `Baza ${base}`,
    `Prefix ${prefix}`,
    `Suffix ${suffix}`,
  ].join(' - ');
}

export function isItemEntry(entry: RewardGrantEntryReadModel): boolean {
  return (
    entry.entryKind === 'item' ||
    entry.entryKind === 'generated_item' ||
    entry.entryKind === 'item_generation'
  );
}

function rewardTitle(reward: ExplorationChallengeRewardReadModel): string {
  if (reward.rewardSourceKind !== 'challenge_attempt' && reward.stepId) {
    return reward.rewardSourceLabel?.trim().toLowerCase() === 'resource encounter reward'
      ? 'Nagroda za Resource Encounter'
      : 'Nagroda za wynik eksploracji';
  }

  return 'Nagroda za challenge';
}

function rewardBadge(reward: ExplorationChallengeRewardReadModel): string {
  if (reward.rewardGrantId && reward.rewardGrant?.status !== 'failed') {
    return 'Nagroda przyznana';
  }

  return reward.rewardStatusKey === 'not_granted' ? 'Brak nagrody' : 'Nagroda nieprzyznana';
}

function rewardFacts(reward: ExplorationChallengeRewardReadModel): Array<{ label: string; value: string }> {
  const facts = [{ label: 'Status nagrody', value: rewardBadge(reward) }];

  if (reward.rewardSourceKind === 'challenge_attempt' && reward.success !== null) {
    facts.unshift({ label: 'Wynik', value: reward.success ? 'Sukces' : 'Porażka' });
  }

  if (reward.completedAt) {
    facts.push({ label: reward.stepId && reward.rewardSourceKind !== 'challenge_attempt' ? 'Rozwiązano' : 'Ukończono', value: reward.completedAt });
  }

  return facts;
}

function rewardSummary(
  reward: ExplorationChallengeRewardReadModel,
  entryCount: number,
  itemCount: number,
): string {
  if (!hasGrantedReward(reward)) {
    return reward.rewardSourceKind === 'challenge_attempt'
      ? 'Ostatni ukończony challenge nie przyznał nagrody.'
      : 'Ten wynik eksploracji nie przyznał nagrody.';
  }

  if (!entryCount && !itemCount) {
    return emptyRewardMessage(reward);
  }

  const parts = [
    entryCount ? `${entryCount} wpis${entryCount === 1 ? '' : 'y'} nagrody` : null,
    itemCount ? `${itemCount} przedmiot${itemCount === 1 ? '' : 'y'}` : null,
  ].filter(Boolean);

  return `Przyznano ${parts.join(' i ')}.`;
}

function emptyRewardMessage(reward: ExplorationChallengeRewardReadModel): string {
  if (reward.noRewardReasonKey === 'no_reward_profile') {
    return 'Brak skonfigurowanej nagrody dla tego wyniku.';
  }

  if (hasGrantedReward(reward)) {
    return 'Nagroda została przyznana, ale szczegóły nagrody nie są dostępne.';
  }

  return reward.rewardSourceKind === 'challenge_attempt'
    ? 'Ten challenge nie przyznał nagrody.'
    : 'Ten wynik eksploracji nie przyznał nagrody.';
}

function hasGrantedReward(reward: ExplorationChallengeRewardReadModel): boolean {
  return Boolean(reward.rewardGrantId) && reward.rewardGrant?.status !== 'failed';
}
