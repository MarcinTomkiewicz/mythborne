import { Bonus } from '../domain/bonus/bonus.model';
import {
  ItemAffixDefinition,
  ItemBaseDefinition,
  ItemQualityDefinition,
} from '../domain/item/item-generation.model';
import { UpgradeCandidate } from '../types/item-generation-rules.types';

export function bucketWeight(index: number, luck: number, totalBuckets: number): number {
  const reversedIndex = totalBuckets - index;
  return reversedIndex * reversedIndex * (1 + (luck / 100) * index * 0.55);
}

export function qualityWeight(quality: ItemQualityDefinition, luck: number): number {
  switch (quality.key) {
    case 'normal':
      return Math.max(18, quality.weight - luck * 0.45);
    case 'quality':
      return quality.weight + luck * 0.28;
    case 'outstanding':
      return quality.weight + luck * 0.17;
  }
}

export function baseWeight(base: ItemBaseDefinition, budget: number, luck: number): number {
  const fitRatio = base.baseValue / Math.max(budget, 1);
  return (1 + fitRatio * 4.5) * (1 + (luck / 100) * (base.baseValue / 1000));
}

export function affixWeight(
  affix: ItemAffixDefinition,
  budget: number,
  luck: number
): number {
  const fitRatio = affix.goldValue / Math.max(budget, 1);
  return (1 + fitRatio * 5) * (1 + (luck / 100) * (affix.goldValue / 250));
}

export function upgradeWeight(
  candidate: UpgradeCandidate,
  remainingBudget: number,
  luck: number
): number {
  const kindWeight =
    candidate.target === 'suffix' ? 1.35 : candidate.target === 'base' ? 1.15 : 0.9;
  return (1 + (candidate.deltaValue / Math.max(remainingBudget, 1)) * 7) *
    kindWeight *
    (1 + (luck / 100) * 0.8);
}

export function rollWeighted<T>(items: T[], weights: number[]): { value: T; roll: number } {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;

  for (let index = 0; index < items.length; index++) {
    roll -= weights[index];

    if (roll <= 0) {
      return { value: items[index], roll };
    }
  }

  return { value: items[items.length - 1], roll };
}

export function aggregateBonuses(bonuses: Bonus[]): Bonus[] {
  const map = new Map<string, Bonus>();

  for (const bonus of bonuses) {
    const key = `${bonus.target}:${bonus.type}`;
    const existing = map.get(key);
    existing ? (existing.value += bonus.value) : map.set(key, { ...bonus });
  }

  return Array.from(map.values());
}

export function composeItemName(
  quality: ItemQualityDefinition,
  base: ItemBaseDefinition,
  prefix: ItemAffixDefinition | null,
  suffix: ItemAffixDefinition | null
): string {
  return [
    quality.key === 'normal' ? null : quality.label,
    prefix?.name ?? null,
    base.name,
    suffix?.name ?? null,
  ]
    .filter(Boolean)
    .join(' ');
}
