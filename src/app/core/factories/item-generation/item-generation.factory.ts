import { Injectable } from '@angular/core';
import { Bonus } from '../../domain/bonus/bonus.model';
import {
  GeneratedItemPart,
  GeneratedItemResult,
  ItemAffixDefinition,
  ItemBaseDefinition,
  ItemGenerationCatalog,
  ItemGenerationStep,
  ItemQualityDefinition,
} from '../../domain/item/item-generation.model';

type UpgradeTarget = 'base' | 'prefix' | 'suffix';

interface UpgradeCandidate {
  target: UpgradeTarget;
  label: string;
  deltaValue: number;
  base?: ItemBaseDefinition;
  prefix?: ItemAffixDefinition | null;
  suffix?: ItemAffixDefinition | null;
}

@Injectable({ providedIn: 'root' })
export class ItemGenerationFactory {
  generate(luck: number, catalog: ItemGenerationCatalog): GeneratedItemResult {
    const sanitizedLuck = Math.max(0, Math.min(100, Math.round(luck)));
    const process: ItemGenerationStep[] = [];

    const bucketRoll = this.rollWeighted(
      catalog.budgetBuckets,
      catalog.budgetBuckets.map((_, index) =>
        this.bucketWeight(index, sanitizedLuck, catalog.budgetBuckets.length)
      )
    );
    const bucketValue = bucketRoll.value;
    process.push({
      title: 'Budget bucket',
      detail: `Luck ${sanitizedLuck} rolled bucket ${bucketValue} drachms.`,
    });

    const qualityWeights = catalog.qualities.map((quality) =>
      this.qualityWeight(quality, sanitizedLuck)
    );
    const qualityRoll = this.rollWeighted(catalog.qualities, qualityWeights);
    const quality = qualityRoll.value;
    process.push({
      title: 'Quality roll',
      detail: `${quality.label} selected with multiplier x${quality.multiplier.toFixed(1)}.`,
    });

    const baseBudget = Math.max(
      1,
      Math.floor(bucketValue / quality.multiplier)
    );
    process.push({
      title: 'Base budget',
      detail: `Bucket ${bucketValue} / quality x${quality.multiplier.toFixed(1)} = ${baseBudget} drachms available before quality.`,
    });

    const baseCandidates = catalog.bases.filter(
      (item) => item.baseValue <= baseBudget
    );
    const selectedBasePool =
      baseCandidates.length > 0 ? baseCandidates : [catalog.bases[0]];
    const baseRoll = this.rollWeighted(
      selectedBasePool,
      selectedBasePool.map((base) => this.baseWeight(base, baseBudget, sanitizedLuck))
    );
    let base = baseRoll.value;
    let remainingBudget = Math.max(0, baseBudget - base.baseValue);
    process.push({
      title: 'Base item',
      detail: `${base.name} selected for ${base.baseValue} drachms. Remaining pre-quality budget: ${remainingBudget}.`,
    });

    const prefixChance = Math.min(0.18 + sanitizedLuck * 0.003, 0.42);
    const prefixRoll = Math.random();
    let prefix: ItemAffixDefinition | null = null;

    if (prefixRoll <= prefixChance) {
      prefix = this.pickAffix(catalog.prefixes, remainingBudget, sanitizedLuck);

      if (prefix) {
        remainingBudget = Math.max(0, remainingBudget - prefix.goldValue);
        process.push({
          title: 'Prefix roll',
          detail: `Roll ${prefixRoll.toFixed(2)} passed ${Math.round(prefixChance * 100)}% chance. Prefix ${prefix.name} added for ${prefix.goldValue} drachms.`,
        });
      } else {
        process.push({
          title: 'Prefix roll',
          detail: `Roll ${prefixRoll.toFixed(2)} passed, but no affordable prefix fit the remaining budget.`,
        });
      }
    } else {
      process.push({
        title: 'Prefix roll',
        detail: `Roll ${prefixRoll.toFixed(2)} missed ${Math.round(prefixChance * 100)}% chance. No prefix added.`,
      });
    }

    const suffixChance = Math.min(0.32 + sanitizedLuck * 0.0038, 0.7);
    const suffixRoll = Math.random();
    let suffix: ItemAffixDefinition | null = null;

    if (suffixRoll <= suffixChance) {
      suffix = this.pickAffix(catalog.suffixes, remainingBudget, sanitizedLuck);

      if (suffix) {
        remainingBudget = Math.max(0, remainingBudget - suffix.goldValue);
        process.push({
          title: 'Suffix roll',
          detail: `Roll ${suffixRoll.toFixed(2)} passed ${Math.round(suffixChance * 100)}% chance. Suffix ${suffix.name} added for ${suffix.goldValue} drachms.`,
        });
      } else {
        process.push({
          title: 'Suffix roll',
          detail: `Roll ${suffixRoll.toFixed(2)} passed, but no affordable suffix fit the remaining budget.`,
        });
      }
    } else {
      process.push({
        title: 'Suffix roll',
        detail: `Roll ${suffixRoll.toFixed(2)} missed ${Math.round(suffixChance * 100)}% chance. No suffix added.`,
      });
    }

    const upgradeResult = this.tryUpgradeToBucket({
      catalog,
      base,
      prefix,
      suffix,
      remainingBudget,
      luck: sanitizedLuck,
      process,
    });

    base = upgradeResult.base;
    prefix = upgradeResult.prefix;
    suffix = upgradeResult.suffix;
    remainingBudget = upgradeResult.remainingBudget;

    const preQualityValue =
      base.baseValue + (prefix?.goldValue ?? 0) + (suffix?.goldValue ?? 0);
    const finalValue = Math.round(preQualityValue * quality.multiplier);
    process.push({
      title: 'Final value',
      detail: `(${base.baseValue} + ${prefix?.goldValue ?? 0} + ${suffix?.goldValue ?? 0}) x ${quality.multiplier.toFixed(1)} = ${finalValue} drachms.`,
    });

    const parts: GeneratedItemPart[] = [
      { label: 'Base item', bonuses: base.bonuses },
      ...(prefix ? [{ label: `Prefix: ${prefix.name}`, bonuses: prefix.bonuses }] : []),
      ...(suffix ? [{ label: `Suffix: ${suffix.name}`, bonuses: suffix.bonuses }] : []),
    ];

    return {
      displayName: this.composeItemName(quality, base, prefix, suffix),
      bucketValue,
      luck: sanitizedLuck,
      quality,
      base,
      prefix,
      suffix,
      baseBudget,
      preQualityValue,
      finalValue,
      remainingBudget,
      combinedBonuses: this.aggregateBonuses(parts.flatMap((part) => part.bonuses)),
      parts,
      process,
    };
  }

  private tryUpgradeToBucket(params: {
    catalog: ItemGenerationCatalog;
    base: ItemBaseDefinition;
    prefix: ItemAffixDefinition | null;
    suffix: ItemAffixDefinition | null;
    remainingBudget: number;
    luck: number;
    process: ItemGenerationStep[];
  }): {
    base: ItemBaseDefinition;
    prefix: ItemAffixDefinition | null;
    suffix: ItemAffixDefinition | null;
    remainingBudget: number;
  } {
    const { catalog, luck, process } = params;
    let { base, prefix, suffix, remainingBudget } = params;

    if (remainingBudget <= 0) {
      process.push({
        title: 'Upgrade pass',
        detail: 'No spare budget remained after the base and affix rolls.',
      });
      return { base, prefix, suffix, remainingBudget };
    }

    const currentPreQualityValue =
      base.baseValue + (prefix?.goldValue ?? 0) + (suffix?.goldValue ?? 0);
    const budgetPressureBonus = Math.min(
      (remainingBudget / Math.max(currentPreQualityValue, 1)) * 0.08,
      0.16
    );
    const upgradeChance = Math.min(
      0.05 +
        luck * 0.0018 +
        (prefix ? 0 : 0.07) +
        (suffix ? 0 : 0.1) +
        (prefix || suffix ? 0 : 0.05) +
        budgetPressureBonus,
      0.58
    );
    const upgradeRoll = Math.random();

    if (upgradeRoll > upgradeChance) {
      process.push({
        title: 'Upgrade pass',
        detail: `Roll ${upgradeRoll.toFixed(2)} missed ${Math.round(upgradeChance * 100)}% chance. The spare ${remainingBudget} drachms were not used.`,
      });
      return { base, prefix, suffix, remainingBudget };
    }

    const candidates = this.getUpgradeCandidates({
      catalog,
      base,
      prefix,
      suffix,
      remainingBudget,
    });

    if (candidates.length === 0) {
      process.push({
        title: 'Upgrade pass',
        detail: `Roll ${upgradeRoll.toFixed(2)} passed, but there was no legal way to improve one part within the remaining ${remainingBudget} drachms.`,
      });
      return { base, prefix, suffix, remainingBudget };
    }

    const pickedUpgrade = this.rollWeighted(
      candidates,
      candidates.map((candidate) =>
        this.upgradeWeight(candidate, remainingBudget, luck)
      )
    ).value;

    base = pickedUpgrade.base ?? base;
    prefix = pickedUpgrade.prefix ?? prefix;
    suffix = pickedUpgrade.suffix ?? suffix;
    remainingBudget = Math.max(0, remainingBudget - pickedUpgrade.deltaValue);

    process.push({
      title: 'Upgrade pass',
      detail: `Roll ${upgradeRoll.toFixed(2)} passed ${Math.round(upgradeChance * 100)}% chance. ${pickedUpgrade.label} used ${pickedUpgrade.deltaValue} extra drachms. Remaining spare budget: ${remainingBudget}.`,
    });

    return { base, prefix, suffix, remainingBudget };
  }

  private bucketWeight(index: number, luck: number, totalBuckets: number): number {
    const reversedIndex = totalBuckets - index;
    const baseWeight = reversedIndex * reversedIndex;
    const luckBonus = 1 + (luck / 100) * index * 0.55;
    return baseWeight * luckBonus;
  }

  private qualityWeight(
    quality: ItemQualityDefinition,
    luck: number
  ): number {
    switch (quality.key) {
      case 'normal':
        return Math.max(18, quality.weight - luck * 0.45);
      case 'quality':
        return quality.weight + luck * 0.28;
      case 'outstanding':
        return quality.weight + luck * 0.17;
    }
  }

  private baseWeight(
    base: ItemBaseDefinition,
    budget: number,
    luck: number
  ): number {
    const fitRatio = base.baseValue / Math.max(budget, 1);
    const closeness = 1 + fitRatio * 4.5;
    const luckBias = 1 + (luck / 100) * (base.baseValue / 1000);
    return closeness * luckBias;
  }

  private pickAffix(
    affixes: ItemAffixDefinition[],
    remainingBudget: number,
    luck: number
  ): ItemAffixDefinition | null {
    const candidates = affixes.filter(
      (affix) => affix.goldValue <= remainingBudget
    );

    if (candidates.length === 0) {
      return null;
    }

    return this.rollWeighted(
      candidates,
      candidates.map((affix) => this.affixWeight(affix, remainingBudget, luck))
    ).value;
  }

  private affixWeight(
    affix: ItemAffixDefinition,
    budget: number,
    luck: number
  ): number {
    const fitRatio = affix.goldValue / Math.max(budget, 1);
    const rarityBias = 1 + fitRatio * 5;
    const luckBias = 1 + (luck / 100) * (affix.goldValue / 250);
    return rarityBias * luckBias;
  }

  private getUpgradeCandidates(params: {
    catalog: ItemGenerationCatalog;
    base: ItemBaseDefinition;
    prefix: ItemAffixDefinition | null;
    suffix: ItemAffixDefinition | null;
    remainingBudget: number;
  }): UpgradeCandidate[] {
    const { catalog, base, prefix, suffix, remainingBudget } = params;

    const baseCandidates = catalog.bases
      .filter(
        (candidate) =>
          candidate.slot === base.slot &&
          candidate.baseValue > base.baseValue &&
          candidate.baseValue - base.baseValue <= remainingBudget
      )
      .map((candidate) => ({
        target: 'base' as const,
        label: `Base upgraded from ${base.name} to ${candidate.name}.`,
        deltaValue: candidate.baseValue - base.baseValue,
        base: candidate,
      }));

    const prefixCandidates = this.getAffixUpgradeCandidates({
      affixes: catalog.prefixes,
      currentAffix: prefix,
      remainingBudget,
      target: 'prefix',
      emptyLabel: 'Prefix added during upgrade pass.',
      replaceLabel: (candidate) =>
        `Prefix upgraded to ${candidate.name}.`,
    });

    const suffixCandidates = this.getAffixUpgradeCandidates({
      affixes: catalog.suffixes,
      currentAffix: suffix,
      remainingBudget,
      target: 'suffix',
      emptyLabel: 'Suffix added during upgrade pass.',
      replaceLabel: (candidate) =>
        `Suffix upgraded to ${candidate.name}.`,
    });

    return [...baseCandidates, ...prefixCandidates, ...suffixCandidates];
  }

  private getAffixUpgradeCandidates(params: {
    affixes: ItemAffixDefinition[];
    currentAffix: ItemAffixDefinition | null;
    remainingBudget: number;
    target: 'prefix' | 'suffix';
    emptyLabel: string;
    replaceLabel: (candidate: ItemAffixDefinition) => string;
  }): UpgradeCandidate[] {
    const {
      affixes,
      currentAffix,
      remainingBudget,
      target,
      emptyLabel,
      replaceLabel,
    } = params;

    return affixes
      .filter((candidate) => {
        if (!currentAffix) {
          return candidate.goldValue <= remainingBudget;
        }

        return (
          candidate.goldValue > currentAffix.goldValue &&
          candidate.goldValue - currentAffix.goldValue <= remainingBudget
        );
      })
      .map((candidate) => {
        const deltaValue = currentAffix
          ? candidate.goldValue - currentAffix.goldValue
          : candidate.goldValue;

        return {
          target,
          label: currentAffix ? replaceLabel(candidate) : emptyLabel.replace('.', `: ${candidate.name}.`),
          deltaValue,
          prefix: target === 'prefix' ? candidate : undefined,
          suffix: target === 'suffix' ? candidate : undefined,
        };
      });
  }

  private upgradeWeight(
    candidate: UpgradeCandidate,
    remainingBudget: number,
    luck: number
  ): number {
    const fitRatio = candidate.deltaValue / Math.max(remainingBudget, 1);
    const fitWeight = 1 + fitRatio * 7;
    const kindWeight =
      candidate.target === 'suffix'
        ? 1.35
        : candidate.target === 'base'
          ? 1.15
          : 0.9;
    const luckWeight = 1 + (luck / 100) * 0.8;

    return fitWeight * kindWeight * luckWeight;
  }

  private rollWeighted<T>(items: T[], weights: number[]): { value: T; roll: number } {
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

  private aggregateBonuses(bonuses: Bonus[]): Bonus[] {
    const map = new Map<string, Bonus>();

    for (const bonus of bonuses) {
      const key = `${bonus.target}:${bonus.type}`;
      const existing = map.get(key);

      if (existing) {
        existing.value += bonus.value;
      } else {
        map.set(key, { ...bonus });
      }
    }

    return Array.from(map.values());
  }

  private composeItemName(
    quality: ItemQualityDefinition,
    base: ItemBaseDefinition,
    prefix: ItemAffixDefinition | null,
    suffix: ItemAffixDefinition | null
  ): string {
    const parts = [
      quality.key === 'normal' ? null : quality.label,
      prefix?.name ?? null,
      base.name,
      suffix?.name ?? null,
    ].filter(Boolean);

    return parts.join(' ');
  }
}
